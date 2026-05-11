import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js'

const normalizeKey = (value) => String(value || '').trim().toLowerCase()

const FASHION_CANONICAL = {
  clothing: 'Clothing',
  footwear: 'Footwear',
  accessories: 'Accessories',
  'ethnic-wear': 'Ethnic Wear',
  'western-wear': 'Western Wear',
  beauty: 'Beauty',
  boys: 'Boys',
  girls: 'Girls',
  'baby-care': 'Baby Care',
}

const toFashionLabel = (value) => {
  const k = normalizeKey(value).replace(/\s+/g, '-')
  if (!k) return ''
  if (FASHION_CANONICAL[k]) return FASHION_CANONICAL[k]
  if (FASHION_CANONICAL[normalizeKey(value)]) return FASHION_CANONICAL[normalizeKey(value)]
  return ''
}

const parseJsonArray = (value, fallback = []) => {
  if (value === undefined || value === null || value === '') return fallback
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const parseJsonStringArray = (value, fallback = []) => {
  const arr = parseJsonArray(value, fallback)
  return (arr || []).map((v) => String(v || '').trim()).filter(Boolean)
}

const parseJsonObject = (value, fallback = {}) => {
  if (value === undefined || value === null || value === '') return fallback
  if (value && typeof value === 'object' && !Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const uploadFiles = async (files) => {
  const images = files.filter(Boolean)
  if (!images.length) return []
  return Promise.all(
    images.map(async (item) => {
      const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' })
      return result.secure_url
    })
  )
}

const listMyProducts = async (req, res) => {
  try {
    const sellerId = req.user?.id
    const products = await productModel.find({ sellerId: String(sellerId) }).sort({ date: -1 })
    res.json({ success: true, products })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const addMyProduct = async (req, res) => {
  try {
    const sellerId = req.user?.id
    const {
      name,
      description,
      price,
      mrp,
      discountPercent,
      brand,
      slug,
      seo,
      attributes,
      variants,
      category,
      subCategory,
      sizes,
      bestseller,
      imageUrls,
      videoUrls,
      stockQuantity,
      inStock,
      isAvailable,
    } = req.body

    const image1 = req.files?.image1 && req.files.image1[0]
    const image2 = req.files?.image2 && req.files.image2[0]
    const image3 = req.files?.image3 && req.files.image3[0]
    const image4 = req.files?.image4 && req.files.image4[0]

    let imagesUrl = await uploadFiles([image1, image2, image3, image4])
    const urlImages = parseJsonArray(imageUrls, []).filter(Boolean)
    const urlVideos = parseJsonArray(videoUrls, []).filter(Boolean)
    imagesUrl = [...imagesUrl, ...urlImages]

    const attributesObj = attributes !== undefined ? parseJsonObject(attributes, {}) : {}
    const mainCategory = String(req.body.mainCategory || '').trim().toLowerCase()
    const section = String(req.body.section || '').trim().toLowerCase()
    const categorySlug = String(req.body.categorySlug || '').trim().toLowerCase()
    const sectionLabel = String(req.body.sectionLabel || '').trim()
    const categoryLabel = String(req.body.categoryLabel || '').trim()

    let finalCategory = category
    let finalSubCategory = subCategory
    if (mainCategory === 'fashion' && sectionLabel && categoryLabel) {
      finalCategory = sectionLabel
      finalSubCategory = categoryLabel
    } else if (mainCategory === 'electronics' && categoryLabel) {
      finalCategory = 'Electronics'
      finalSubCategory = categoryLabel
    } else if (mainCategory === 'home-kitchen' && categoryLabel) {
      finalCategory = 'Home'
      finalSubCategory = categoryLabel
    } else if (mainCategory === 'lifestyle' && categoryLabel) {
      finalCategory = 'Lifestyle'
      finalSubCategory = categoryLabel
    }

    if (mainCategory) attributesObj.mainCategory = attributesObj.mainCategory || mainCategory
    if (section) attributesObj.section = attributesObj.section || section
    if (categorySlug) attributesObj.categorySlug = attributesObj.categorySlug || categorySlug

    const derivedGenderRaw = String(attributesObj?.gender || req.body.gender || '').trim()
    const derivedGender = derivedGenderRaw ? derivedGenderRaw : ['Men', 'Women', 'Kids', 'Unisex'].includes(String(finalCategory)) ? String(finalCategory) : ''

    const derivedFashionRaw = String(attributesObj?.fashionCategory || req.body.fashionCategory || '').trim()
    const derivedFashionFromSub = toFashionLabel(finalSubCategory)
    const derivedFashion = derivedFashionRaw || derivedFashionFromSub
    const derivedGenderFinal = mainCategory === 'fashion' ? derivedGender : ''
    if (mainCategory !== 'fashion') {
      delete attributesObj.gender
      delete attributesObj.fashionCategory
    } else {
      attributesObj.gender = derivedGenderFinal
      if (derivedFashion) attributesObj.fashionCategory = derivedFashion
    }

    const collectionType = parseJsonStringArray(req.body.collectionType, [])
    const colors = parseJsonStringArray(req.body.colors, [])
    const tags = parseJsonStringArray(req.body.tags, [])
    const featured = String(req.body.featured || '').toLowerCase() === 'true' || req.body.featured === true
    const recommended = String(req.body.recommended || '').toLowerCase() === 'true' || req.body.recommended === true

    const productData = {
      sellerId: String(sellerId),
      isDefault: false,
      name,
      description,
      category: finalCategory,
      price: Number(price),
      mrp: mrp !== undefined ? Number(mrp) : undefined,
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : undefined,
      brand: brand !== undefined ? String(brand) : undefined,
      slug: slug !== undefined ? String(slug) : undefined,
      seo: seo !== undefined ? parseJsonObject(seo, {}) : undefined,
      attributes: attributesObj,
      variants: variants !== undefined ? parseJsonArray(variants, []) : undefined,
      subCategory: finalSubCategory,
      gender: derivedGenderFinal,
      fashionCategory: mainCategory === 'fashion' ? derivedFashion : '',
      mainCategory,
      section,
      categorySlug,
      sectionLabel,
      categoryLabel,
      collectionType,
      colors,
      tags,
      featured,
      recommended,
      bestseller: String(bestseller) === 'true' || bestseller === true,
      sizes: parseJsonArray(sizes, ['M']),
      image: imagesUrl,
      videos: urlVideos,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 0,
      inStock: inStock !== undefined ? String(inStock) === 'true' : true,
      isAvailable: isAvailable !== undefined ? String(isAvailable) === 'true' : true,
      date: Date.now(),
    }

    const product = new productModel(productData)
    await product.save()
    res.json({ success: true, message: 'Product Added', product })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const updateMyProduct = async (req, res) => {
  try {
    const sellerId = req.user?.id
    const {
      id,
      name,
      description,
      price,
      mrp,
      discountPercent,
      brand,
      slug,
      seo,
      attributes,
      variants,
      category,
      subCategory,
      sizes,
      bestseller,
      imageUrls,
      videoUrls,
      stockQuantity,
      inStock,
      isAvailable,
      replaceImages,
    } = req.body
    if (!id) return res.json({ success: false, message: 'Product id is required' })

    const existing = await productModel.findById(id)
    if (!existing) return res.json({ success: false, message: 'Product not found' })
    if (String(existing.sellerId || '') !== String(sellerId || '')) return res.json({ success: false, message: 'Not Authorized' })

    const image1 = req.files?.image1 && req.files.image1[0]
    const image2 = req.files?.image2 && req.files.image2[0]
    const image3 = req.files?.image3 && req.files.image3[0]
    const image4 = req.files?.image4 && req.files.image4[0]

    const uploadedUrls = await uploadFiles([image1, image2, image3, image4])
    const urlImages = parseJsonArray(imageUrls, []).filter(Boolean)
    const urlVideos = parseJsonArray(videoUrls, []).filter(Boolean)
    const shouldReplace = String(replaceImages) === 'true'
    const nextImages = shouldReplace ? [...uploadedUrls, ...urlImages] : [...(existing.image || []), ...uploadedUrls, ...urlImages]

    const nextAttributes =
      attributes !== undefined ? parseJsonObject(attributes, existing.attributes || {}) : (existing.attributes || {})
    const nextMainCategory = String(req.body.mainCategory !== undefined ? req.body.mainCategory : (existing.mainCategory || '')).trim().toLowerCase()
    const nextSection = String(req.body.section !== undefined ? req.body.section : (existing.section || '')).trim().toLowerCase()
    const nextCategorySlug = String(req.body.categorySlug !== undefined ? req.body.categorySlug : (existing.categorySlug || '')).trim().toLowerCase()
    const nextSectionLabel = String(req.body.sectionLabel !== undefined ? req.body.sectionLabel : (existing.sectionLabel || '')).trim()
    const nextCategoryLabel = String(req.body.categoryLabel !== undefined ? req.body.categoryLabel : (existing.categoryLabel || '')).trim()

    let nextCategory = category !== undefined ? category : existing.category
    let nextSubCategory = subCategory !== undefined ? subCategory : existing.subCategory
    if (nextMainCategory === 'fashion' && nextSectionLabel && nextCategoryLabel) {
      nextCategory = nextSectionLabel
      nextSubCategory = nextCategoryLabel
    } else if (nextMainCategory === 'electronics' && nextCategoryLabel) {
      nextCategory = 'Electronics'
      nextSubCategory = nextCategoryLabel
    } else if (nextMainCategory === 'home-kitchen' && nextCategoryLabel) {
      nextCategory = 'Home'
      nextSubCategory = nextCategoryLabel
    } else if (nextMainCategory === 'lifestyle' && nextCategoryLabel) {
      nextCategory = 'Lifestyle'
      nextSubCategory = nextCategoryLabel
    }

    if (nextMainCategory) nextAttributes.mainCategory = nextAttributes.mainCategory || nextMainCategory
    if (nextSection) nextAttributes.section = nextAttributes.section || nextSection
    if (nextCategorySlug) nextAttributes.categorySlug = nextAttributes.categorySlug || nextCategorySlug

    const derivedGenderRaw = String(nextAttributes?.gender || req.body.gender || '').trim()
    const derivedGender = derivedGenderRaw ? derivedGenderRaw : ['Men', 'Women', 'Kids', 'Unisex'].includes(String(nextCategory)) ? String(nextCategory) : ''

    const derivedFashionRaw = String(nextAttributes?.fashionCategory || req.body.fashionCategory || '').trim()
    const derivedFashionFromSub = toFashionLabel(nextSubCategory)
    const derivedFashion = derivedFashionRaw || derivedFashionFromSub
    const derivedGenderFinal = nextMainCategory === 'fashion' ? derivedGender : ''
    const derivedFashionFinal = nextMainCategory === 'fashion' ? derivedFashion : ''
    if (nextMainCategory !== 'fashion') {
      delete nextAttributes.gender
      delete nextAttributes.fashionCategory
    } else {
      nextAttributes.gender = derivedGenderFinal
      if (derivedFashionFinal) nextAttributes.fashionCategory = derivedFashionFinal
    }

    const collectionType = req.body.collectionType !== undefined ? parseJsonStringArray(req.body.collectionType, []) : (existing.collectionType || [])
    const colors = req.body.colors !== undefined ? parseJsonStringArray(req.body.colors, []) : (existing.colors || [])
    const tags = req.body.tags !== undefined ? parseJsonStringArray(req.body.tags, []) : (existing.tags || [])
    const featured = req.body.featured !== undefined ? (String(req.body.featured || '').toLowerCase() === 'true' || req.body.featured === true) : Boolean(existing.featured)
    const recommended = req.body.recommended !== undefined ? (String(req.body.recommended || '').toLowerCase() === 'true' || req.body.recommended === true) : Boolean(existing.recommended)

    const patch = {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(mrp !== undefined ? { mrp: Number(mrp) } : {}),
      ...(discountPercent !== undefined ? { discountPercent: Number(discountPercent) } : {}),
      ...(brand !== undefined ? { brand: String(brand) } : {}),
      ...(slug !== undefined ? { slug: String(slug) } : {}),
      ...(seo !== undefined ? { seo: parseJsonObject(seo, existing.seo || {}) } : {}),
      ...(attributes !== undefined ? { attributes: nextAttributes } : {}),
      ...(variants !== undefined ? { variants: parseJsonArray(variants, existing.variants || []) } : {}),
      ...(category !== undefined || nextCategory !== existing.category ? { category: nextCategory } : {}),
      ...(subCategory !== undefined || nextSubCategory !== existing.subCategory ? { subCategory: nextSubCategory } : {}),
      ...(sizes !== undefined ? { sizes: parseJsonArray(sizes, existing.sizes || []) } : {}),
      ...(bestseller !== undefined ? { bestseller: String(bestseller) === 'true' } : {}),
      ...(stockQuantity !== undefined ? { stockQuantity: Number(stockQuantity) } : {}),
      ...(inStock !== undefined ? { inStock: String(inStock) === 'true' } : {}),
      ...(isAvailable !== undefined ? { isAvailable: String(isAvailable) === 'true' } : {}),
      ...(urlVideos.length ? { videos: urlVideos } : {}),
      ...(req.body.mainCategory !== undefined ? { mainCategory: nextMainCategory } : {}),
      ...(req.body.section !== undefined ? { section: nextSection } : {}),
      ...(req.body.categorySlug !== undefined ? { categorySlug: nextCategorySlug } : {}),
      ...(req.body.sectionLabel !== undefined ? { sectionLabel: nextSectionLabel } : {}),
      ...(req.body.categoryLabel !== undefined ? { categoryLabel: nextCategoryLabel } : {}),
      ...(req.body.collectionType !== undefined ? { collectionType } : {}),
      ...(req.body.colors !== undefined ? { colors } : {}),
      ...(req.body.tags !== undefined ? { tags } : {}),
      ...(req.body.featured !== undefined ? { featured } : {}),
      ...(req.body.recommended !== undefined ? { recommended } : {}),
      gender: derivedGenderFinal,
      fashionCategory: derivedFashionFinal,
      image: nextImages,
    }

    await productModel.findByIdAndUpdate(id, patch)
    res.json({ success: true, message: 'Product Updated' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const removeMyProduct = async (req, res) => {
  try {
    const sellerId = req.user?.id
    const { id } = req.body
    const existing = await productModel.findById(id)
    if (!existing) return res.json({ success: false, message: 'Product not found' })
    if (String(existing.sellerId || '') !== String(sellerId || '')) return res.json({ success: false, message: 'Not Authorized' })
    await productModel.findByIdAndDelete(id)
    res.json({ success: true, message: 'Product Removed' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { listMyProducts, addMyProduct, updateMyProduct, removeMyProduct }
