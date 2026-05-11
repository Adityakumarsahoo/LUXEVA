import categoryModel from '../models/categoryModel.js'
import categorySectionModel from '../models/categorySectionModel.js'

const normalizePath = (value) =>
  String(value || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase()

const buildTree = (items) => {
  const byId = new Map()
  const roots = []

  for (const raw of items) {
    const node = { ...raw, children: [] }
    byId.set(String(node._id), node)
  }

  for (const node of byId.values()) {
    const parentId = node.parent ? String(node.parent) : ''
    if (parentId && byId.has(parentId)) {
      byId.get(parentId).children.push(node)
    } else {
      roots.push(node)
    }
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

export const listCategoryTree = async (req, res) => {
  try {
    const items = await categoryModel
      .find({ isActive: true })
      .select('name slug parent level icon title description thumbnail banner gallery promoImages featured isActive sortOrder')
      .lean()
    res.json({ success: true, categories: buildTree(items) })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const resolveCategoryPath = async (req, res) => {
  try {
    const path = normalizePath(req.query.path)
    if (!path) return res.json({ success: false, message: 'path is required' })

    const category = await categoryModel.findOne({ slug: path, isActive: true }).lean()
    if (!category) return res.json({ success: false, message: 'Category not found' })

    const children = await categoryModel
      .find({ parent: category._id, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean()

    const sections = await categorySectionModel
      .find({ category: category._id, isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean()

    res.json({ success: true, category, children, sections })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}
