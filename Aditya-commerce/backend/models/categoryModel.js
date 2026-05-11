import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'category', default: null },
    level: { type: Number, default: 0 },
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    navGroup: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    banner: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    promoImages: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    productMatch: {
      category: { type: [String], default: [] },
      subCategory: { type: [String], default: [] },
      search: { type: [String], default: [] },
    },
  },
  { timestamps: true }
)

categorySchema.index({ parent: 1, sortOrder: 1, name: 1 })
categorySchema.index({ isActive: 1, featured: 1 })

const categoryModel = mongoose.models.category || mongoose.model('category', categorySchema)

export default categoryModel
