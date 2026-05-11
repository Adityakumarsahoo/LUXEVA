import mongoose from 'mongoose'

const categorySectionSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true, index: true },
    key: { type: String, required: true },
    type: { type: String, default: 'slider' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
    ctaLabel: { type: String, default: '' },
    ctaUrl: { type: String, default: '' },
    layout: {
      style: { type: String, default: 'grid' },
      columns: { type: Number, default: 4 },
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
)

categorySectionSchema.index({ category: 1, sortOrder: 1, key: 1 })

const categorySectionModel =
  mongoose.models.categorySection || mongoose.model('categorySection', categorySectionSchema)

export default categorySectionModel
