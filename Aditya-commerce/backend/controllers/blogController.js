import blogPostModel from '../models/blogPostModel.js'

const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const listBlogPosts = async (req, res) => {
  try {
    const limit = Math.min(60, Math.max(1, Number(req.query?.limit || 18)))
    const page = Math.max(1, Number(req.query?.page || 1))
    const search = String(req.query?.search || '').trim()
    const category = String(req.query?.category || '').trim()
    const featured = String(req.query?.featured || '') === 'true'
    const trending = String(req.query?.trending || '') === 'true'

    const query = { published: true }
    if (category) query.category = category
    if (featured) query.featured = true
    if (trending) query.trending = true
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i')
      query.$or = [{ title: rx }, { excerpt: rx }, { category: rx }, { tags: rx }, { authorName: rx }]
    }

    const total = await blogPostModel.countDocuments(query)
    const posts = await blogPostModel
      .find(query)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title slug excerpt coverImage category tags authorName featured trending publishedAt createdAt')
      .lean()

    res.json({ success: true, posts, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to load blog posts' })
  }
}

const getBlogPostBySlug = async (req, res) => {
  try {
    const slug = String(req.params?.slug || '').trim()
    if (!slug) return res.json({ success: false, message: 'slug is required' })
    const post = await blogPostModel.findOne({ slug, published: true }).lean()
    if (!post) return res.json({ success: false, message: 'Post not found' })
    res.json({ success: true, post })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to load blog post' })
  }
}

const listAdminBlogPosts = async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query?.limit || 80)))
    const posts = await blogPostModel.find({}).sort({ createdAt: -1 }).limit(limit).lean()
    res.json({ success: true, posts })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to load posts' })
  }
}

const createBlogPost = async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim()
    const slug = String(req.body?.slug || '').trim()
    if (!title) return res.json({ success: false, message: 'Title is required' })
    if (!slug) return res.json({ success: false, message: 'Slug is required' })

    const payload = {
      title,
      slug,
      excerpt: String(req.body?.excerpt || '').trim(),
      content: String(req.body?.content || '').trim(),
      coverImage: String(req.body?.coverImage || '').trim(),
      category: String(req.body?.category || 'General').trim() || 'General',
      tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
      authorName: String(req.body?.authorName || 'Editorial').trim() || 'Editorial',
      featured: Boolean(req.body?.featured),
      trending: Boolean(req.body?.trending),
      published: req.body?.published !== false,
      publishedAt: req.body?.publishedAt ? new Date(req.body.publishedAt) : new Date(),
    }

    const post = await blogPostModel.create(payload)
    res.json({ success: true, post })
  } catch (error) {
    const msg = String(error?.message || '')
    if (msg.toLowerCase().includes('duplicate')) return res.json({ success: false, message: 'Slug already exists' })
    console.log(error)
    res.json({ success: false, message: 'Failed to create post' })
  }
}

const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })

    const patch = {}
    for (const k of ['title', 'slug', 'excerpt', 'content', 'coverImage', 'category', 'authorName']) {
      if (req.body?.[k] !== undefined) patch[k] = String(req.body[k] || '').trim()
    }
    if (req.body?.tags !== undefined) patch.tags = Array.isArray(req.body.tags) ? req.body.tags : []
    if (req.body?.featured !== undefined) patch.featured = Boolean(req.body.featured)
    if (req.body?.trending !== undefined) patch.trending = Boolean(req.body.trending)
    if (req.body?.published !== undefined) patch.published = Boolean(req.body.published)
    if (req.body?.publishedAt !== undefined) patch.publishedAt = new Date(req.body.publishedAt)

    const post = await blogPostModel.findByIdAndUpdate(id, patch, { new: true })
    if (!post) return res.json({ success: false, message: 'Post not found' })
    res.json({ success: true, post })
  } catch (error) {
    const msg = String(error?.message || '')
    if (msg.toLowerCase().includes('duplicate')) return res.json({ success: false, message: 'Slug already exists' })
    console.log(error)
    res.json({ success: false, message: 'Failed to update post' })
  }
}

const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })
    await blogPostModel.findByIdAndDelete(id)
    res.json({ success: true, message: 'Deleted' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to delete post' })
  }
}

export { listBlogPosts, getBlogPostBySlug, listAdminBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost }

