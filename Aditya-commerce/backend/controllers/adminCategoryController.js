import categoryModel from '../models/categoryModel.js'
import categorySectionModel from '../models/categorySectionModel.js'

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[%]/g, 'pct')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const normalizeList = (value) => {
  if (value === undefined || value === null) return []
  if (Array.isArray(value)) return value.map((v) => String(v || '').trim()).filter(Boolean)
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.map((v) => String(v || '').trim()).filter(Boolean)
  } catch {}
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

const computeSlug = async ({ name, segment, parentId, parentSlug }) => {
  const seg = slugify(segment || name)
  if (!seg) return ''

  let parent = null
  if (parentId) parent = await categoryModel.findById(parentId).lean()
  else if (parentSlug) parent = await categoryModel.findOne({ slug: String(parentSlug).trim().toLowerCase() }).lean()

  const slug = parent?.slug ? `${parent.slug}/${seg}` : seg
  return { slug, parent }
}

const buildTree = (items) => {
  const byId = new Map()
  const roots = []
  for (const raw of items) byId.set(String(raw._id), { ...raw, children: [] })
  for (const node of byId.values()) {
    const parentId = node.parent ? String(node.parent) : ''
    if (parentId && byId.has(parentId)) byId.get(parentId).children.push(node)
    else roots.push(node)
  }
  const sortRec = (list) => {
    list.sort((a, b) => {
      const ao = Number(a.sortOrder || 0)
      const bo = Number(b.sortOrder || 0)
      if (ao !== bo) return ao - bo
      return String(a.name || '').localeCompare(String(b.name || ''))
    })
    for (const n of list) sortRec(n.children || [])
  }
  sortRec(roots)
  return roots
}

export const adminListCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({}).sort({ sortOrder: 1, name: 1 }).lean()
    res.json({ success: true, categories })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const adminCategoryTree = async (req, res) => {
  try {
    const categories = await categoryModel.find({}).lean()
    res.json({ success: true, categories: buildTree(categories) })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const adminCreateCategory = async (req, res) => {
  try {
    const {
      name,
      segment,
      parentId,
      parentSlug,
      icon,
      sortOrder,
      isActive,
      featured,
      title,
      description,
      productMatchCategory,
      productMatchSubCategory,
      productMatchSearch,
    } = req.body

    const finalName = String(name || '').trim()
    if (!finalName) return res.json({ success: false, message: 'name is required' })

    const computed = await computeSlug({ name: finalName, segment, parentId, parentSlug })
    const fullSlug = computed.slug
    if (!fullSlug) return res.json({ success: false, message: 'slug is required' })

    const parent = computed.parent
    const level = parent ? Number(parent.level || 0) + 1 : 0

    const created = await categoryModel.create({
      name: finalName,
      slug: fullSlug,
      parent: parent ? parent._id : null,
      level,
      icon: String(icon || ''),
      title: String(title || ''),
      description: String(description || ''),
      featured: String(featured) === 'true' || featured === true,
      sortOrder: Number(sortOrder || 0),
      isActive: isActive === undefined ? true : String(isActive) === 'true' || isActive === true,
      productMatch: {
        category: normalizeList(productMatchCategory),
        subCategory: normalizeList(productMatchSubCategory),
        search: normalizeList(productMatchSearch),
      },
    })

    res.json({ success: true, message: 'Category created', category: created })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const adminUpdateCategory = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })

    const existing = await categoryModel.findById(id).lean()
    if (!existing) return res.json({ success: false, message: 'Category not found' })

    const patch = {}
    if (req.body.name !== undefined) patch.name = String(req.body.name || '').trim()
    if (req.body.icon !== undefined) patch.icon = String(req.body.icon || '')
    if (req.body.title !== undefined) patch.title = String(req.body.title || '')
    if (req.body.description !== undefined) patch.description = String(req.body.description || '')
    if (req.body.sortOrder !== undefined) patch.sortOrder = Number(req.body.sortOrder || 0)
    if (req.body.isActive !== undefined) patch.isActive = String(req.body.isActive) === 'true' || req.body.isActive === true
    if (req.body.featured !== undefined) patch.featured = String(req.body.featured) === 'true' || req.body.featured === true

    const wantsSlugChange = req.body.segment !== undefined || req.body.parentId !== undefined || req.body.parentSlug !== undefined
    if (wantsSlugChange) {
      const computed = await computeSlug({
        name: patch.name || existing.name,
        segment: req.body.segment,
        parentId: req.body.parentId,
        parentSlug: req.body.parentSlug,
      })
      if (!computed.slug) return res.json({ success: false, message: 'invalid slug' })
      patch.slug = computed.slug
      patch.parent = computed.parent ? computed.parent._id : null
      patch.level = computed.parent ? Number(computed.parent.level || 0) + 1 : 0

      if (computed.slug !== existing.slug) {
        const rx = new RegExp(`^${escapeRegex(existing.slug)}(?:/|$)`, 'i')
        const descendants = await categoryModel.find({ slug: rx }).select('_id slug').lean()
        const updates = []
        for (const d of descendants) {
          const dSlug = String(d.slug || '')
          if (dSlug.toLowerCase() === String(existing.slug).toLowerCase()) continue
          const suffix = dSlug.slice(existing.slug.length).replace(/^\/+/, '')
          const nextSlug = suffix ? `${computed.slug}/${suffix}` : computed.slug
          updates.push({ updateOne: { filter: { _id: d._id }, update: { $set: { slug: nextSlug } } } })
        }
        if (updates.length) await categoryModel.bulkWrite(updates, { ordered: false })
      }
    }

    if (
      req.body.productMatchCategory !== undefined ||
      req.body.productMatchSubCategory !== undefined ||
      req.body.productMatchSearch !== undefined
    ) {
      patch.productMatch = {
        category:
          req.body.productMatchCategory !== undefined ? normalizeList(req.body.productMatchCategory) : existing.productMatch?.category || [],
        subCategory:
          req.body.productMatchSubCategory !== undefined
            ? normalizeList(req.body.productMatchSubCategory)
            : existing.productMatch?.subCategory || [],
        search:
          req.body.productMatchSearch !== undefined ? normalizeList(req.body.productMatchSearch) : existing.productMatch?.search || [],
      }
    }

    await categoryModel.findByIdAndUpdate(id, { $set: patch })
    res.json({ success: true, message: 'Category updated' })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const adminDeleteCategory = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })

    const root = await categoryModel.findById(id).select('_id slug').lean()
    if (!root) return res.json({ success: false, message: 'Category not found' })

    const rx = new RegExp(`^${escapeRegex(root.slug)}(?:/|$)`, 'i')
    const nodes = await categoryModel.find({ slug: rx }).select('_id').lean()
    const ids = nodes.map((n) => n._id)

    await categorySectionModel.deleteMany({ category: { $in: ids } })
    await categoryModel.deleteMany({ _id: { $in: ids } })

    res.json({ success: true, message: 'Category deleted' })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

const fileToUrl = (file) => {
  if (!file) return ''
  const filename = String(file.filename || '').trim()
  if (!filename) return ''
  return `/uploads/categories/${filename}`
}

export const adminUploadCategoryImages = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })

    const existing = await categoryModel.findById(id).lean()
    if (!existing) return res.json({ success: false, message: 'Category not found' })

    const next = {}
    const thumb = req.files?.thumbnail?.[0]
    const banner = req.files?.banner?.[0]
    const gallery = req.files?.gallery || []
    const promoImages = req.files?.promoImages || []

    if (thumb) next.thumbnail = fileToUrl(thumb)
    if (banner) next.banner = fileToUrl(banner)
    if (gallery.length) next.gallery = [...(existing.gallery || []), ...gallery.map(fileToUrl).filter(Boolean)]
    if (promoImages.length) next.promoImages = [...(existing.promoImages || []), ...promoImages.map(fileToUrl).filter(Boolean)]

    await categoryModel.findByIdAndUpdate(id, { $set: next })
    res.json({ success: true, message: 'Images updated' })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const adminListSections = async (req, res) => {
  try {
    const { categoryId } = req.query
    if (!categoryId) return res.json({ success: false, message: 'categoryId is required' })
    const sections = await categorySectionModel.find({ category: categoryId }).sort({ sortOrder: 1, createdAt: 1 }).lean()
    res.json({ success: true, sections })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const adminCreateSection = async (req, res) => {
  try {
    const { categoryId, type, title, subtitle, description, sortOrder, isActive, layoutStyle, layoutColumns, ctaLabel, ctaUrl } = req.body
    if (!categoryId) return res.json({ success: false, message: 'categoryId is required' })

    const key = slugify(title || type || 'section') || `section-${Date.now().toString(36)}`
    const created = await categorySectionModel.create({
      category: categoryId,
      key,
      type: String(type || 'slider'),
      title: String(title || ''),
      subtitle: String(subtitle || ''),
      description: String(description || ''),
      images: normalizeList(req.body.images),
      ctaLabel: String(ctaLabel || ''),
      ctaUrl: String(ctaUrl || ''),
      layout: {
        style: String(layoutStyle || 'grid'),
        columns: Number(layoutColumns || 4),
      },
      sortOrder: Number(sortOrder || 0),
      isActive: isActive === undefined ? true : String(isActive) === 'true' || isActive === true,
    })
    res.json({ success: true, message: 'Section created', section: created })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const adminUpdateSection = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })

    const patch = {}
    if (req.body.type !== undefined) patch.type = String(req.body.type || 'slider')
    if (req.body.title !== undefined) patch.title = String(req.body.title || '')
    if (req.body.subtitle !== undefined) patch.subtitle = String(req.body.subtitle || '')
    if (req.body.description !== undefined) patch.description = String(req.body.description || '')
    if (req.body.sortOrder !== undefined) patch.sortOrder = Number(req.body.sortOrder || 0)
    if (req.body.isActive !== undefined) patch.isActive = String(req.body.isActive) === 'true' || req.body.isActive === true
    if (req.body.images !== undefined) patch.images = normalizeList(req.body.images)
    if (req.body.ctaLabel !== undefined) patch.ctaLabel = String(req.body.ctaLabel || '')
    if (req.body.ctaUrl !== undefined) patch.ctaUrl = String(req.body.ctaUrl || '')

    if (req.body.layoutStyle !== undefined || req.body.layoutColumns !== undefined) {
      const existing = await categorySectionModel.findById(id).lean()
      patch.layout = {
        style: req.body.layoutStyle !== undefined ? String(req.body.layoutStyle || 'grid') : existing?.layout?.style || 'grid',
        columns: req.body.layoutColumns !== undefined ? Number(req.body.layoutColumns || 4) : Number(existing?.layout?.columns || 4),
      }
    }

    await categorySectionModel.findByIdAndUpdate(id, { $set: patch })
    res.json({ success: true, message: 'Section updated' })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const adminDeleteSection = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })
    await categorySectionModel.findByIdAndDelete(id)
    res.json({ success: true, message: 'Section deleted' })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const adminUploadSectionImages = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })
    const existing = await categorySectionModel.findById(id).lean()
    if (!existing) return res.json({ success: false, message: 'Section not found' })

    const files = req.files?.images || []
    const urls = files.map(fileToUrl).filter(Boolean)
    if (!urls.length) return res.json({ success: false, message: 'No images uploaded' })

    await categorySectionModel.findByIdAndUpdate(id, { $set: { images: [...(existing.images || []), ...urls] } })
    res.json({ success: true, message: 'Section images updated' })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}
