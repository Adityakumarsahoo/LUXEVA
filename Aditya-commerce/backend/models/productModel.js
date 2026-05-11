import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    seedKey: { type: String, unique: true, sparse: true },
    isDefault: { type: Boolean, default: false },
    sellerId: { type: String, default: '' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, default: '' },
    price: { type: Number, required: true },
    mrp: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    brand: { type: String, default: '' },
    image: { type: Array, required: true, default: [] },
    videos: { type: Array, default: [] },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    gender: { type: String, default: '' },
    fashionCategory: { type: String, default: '' },
    mainCategory: { type: String, default: '' },
    section: { type: String, default: '' },
    categorySlug: { type: String, default: '' },
    sectionLabel: { type: String, default: '' },
    categoryLabel: { type: String, default: '' },
    collectionType: { type: Array, default: [] },
    colors: { type: Array, default: [] },
    tags: { type: Array, default: [] },
    featured: { type: Boolean, default: false },
    recommended: { type: Boolean, default: false },
    sizes: { type: Array, required: true },
    variants: { type: Array, default: [] },
    attributes: { type: Object, default: {} },
    seo: { type: Object, default: {} },
    bestseller: { type: Boolean },
    date: { type: Number, required: true },
    stockQuantity: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    deliveryEnabled: { type: Boolean, default: true },
    deliveryPincodes: { type: Array, default: [] },
    rating: { type: Number },
    reviews: { type: Number }
})

const productModel = mongoose.models.product || mongoose.model('product', productSchema)

export default productModel
