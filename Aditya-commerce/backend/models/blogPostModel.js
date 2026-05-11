import mongoose from 'mongoose'

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    category: { type: String, default: 'General' },
    tags: { type: [String], default: [] },
    authorName: { type: String, default: 'Editorial' },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

blogPostSchema.index({ category: 1, publishedAt: -1 })
blogPostSchema.index({ featured: 1, trending: 1, publishedAt: -1 })

const blogPostModel = mongoose.models.blogPost || mongoose.model('blogPost', blogPostSchema)

export default blogPostModel
