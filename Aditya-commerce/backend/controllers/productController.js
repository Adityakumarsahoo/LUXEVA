import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import settingsModel from "../models/settingsModel.js"
import jwt from 'jsonwebtoken'

const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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

const toFashionSlug = (value) => {
    const k = normalizeKey(value)
    if (!k) return ''
    const slug = k.replace(/\s+/g, '-')
    if (FASHION_CANONICAL[slug]) return slug
    if (FASHION_CANONICAL[k]) return k
    return ''
}

const toFashionLabel = (value) => {
    const k = normalizeKey(value).replace(/\s+/g, '-')
    if (!k) return ''
    if (FASHION_CANONICAL[k]) return FASHION_CANONICAL[k]
    if (FASHION_CANONICAL[normalizeKey(value)]) return FASHION_CANONICAL[normalizeKey(value)]
    return ''
}

const buildInsensitiveOr = (field, values) => {
    const list = (values || []).map((v) => String(v || '').trim()).filter(Boolean)
    if (!list.length) return null
    return {
        $or: list.map((v) => ({ [field]: new RegExp(`^${escapeRegex(v)}$`, 'i') })),
    }
}

const buildFashionScopeFilter = (slug) => {
    const s = String(slug || '').trim().toLowerCase()
    if (!s) return null
    const label = FASHION_CANONICAL[s] || ''
    const rxLabel = label ? new RegExp(`^${escapeRegex(label)}$`, 'i') : null

    if (s === 'clothing') {
        const allowSubs = ['Topwear', 'Bottomwear', 'Winterwear', 'Clothing']
        const denySubs = ['Footwear', 'Accessories', 'Ethnic Wear', 'Western Wear', 'Beauty', 'Boys', 'Girls', 'Baby Care']
        const allowRx = allowSubs.map((v) => new RegExp(`^${escapeRegex(v)}$`, 'i'))
        const denyRx = new RegExp(`^(?:${denySubs.map(escapeRegex).join('|')})$`, 'i')
        const baseCatRx = ['Men', 'Women', 'Kids', 'Fashion', 'Beauty'].map((v) => new RegExp(`^${escapeRegex(v)}$`, 'i'))
        return {
            $or: [
                ...(rxLabel ? [{ fashionCategory: rxLabel }, { 'attributes.fashionCategory': rxLabel }] : []),
                { subCategory: { $in: allowRx } },
                { $and: [{ category: { $in: baseCatRx } }, { subCategory: { $not: denyRx } }] },
            ],
        }
    }

    if (s === 'footwear') {
        return {
            $or: [
                ...(rxLabel ? [{ fashionCategory: rxLabel }, { 'attributes.fashionCategory': rxLabel }] : []),
                { subCategory: /footwear/i },
            ],
        }
    }

    if (s === 'accessories') {
        return {
            $or: [
                ...(rxLabel ? [{ fashionCategory: rxLabel }, { 'attributes.fashionCategory': rxLabel }] : []),
                { subCategory: /accessories/i },
            ],
        }
    }

    if (s === 'ethnic-wear') {
        return {
            $or: [
                ...(rxLabel ? [{ fashionCategory: rxLabel }, { 'attributes.fashionCategory': rxLabel }] : []),
                { subCategory: /ethnic wear/i },
            ],
        }
    }

    if (s === 'western-wear') {
        return {
            $or: [
                ...(rxLabel ? [{ fashionCategory: rxLabel }, { 'attributes.fashionCategory': rxLabel }] : []),
                { subCategory: /western wear/i },
            ],
        }
    }

    if (s === 'beauty') {
        return {
            $or: [
                ...(rxLabel ? [{ fashionCategory: rxLabel }, { 'attributes.fashionCategory': rxLabel }] : []),
                { category: /beauty/i },
                { subCategory: /beauty/i },
            ],
        }
    }

    if (s === 'boys') {
        return {
            $or: [
                ...(rxLabel ? [{ fashionCategory: rxLabel }, { 'attributes.fashionCategory': rxLabel }] : []),
                { $and: [{ category: /^kids$/i }, { subCategory: /boys/i }] },
            ],
        }
    }

    if (s === 'girls') {
        return {
            $or: [
                ...(rxLabel ? [{ fashionCategory: rxLabel }, { 'attributes.fashionCategory': rxLabel }] : []),
                { $and: [{ category: /^kids$/i }, { subCategory: /girls/i }] },
            ],
        }
    }

    if (s === 'baby-care') {
        return {
            $or: [
                ...(rxLabel ? [{ fashionCategory: rxLabel }, { 'attributes.fashionCategory': rxLabel }] : []),
                { $and: [{ category: /^kids$/i }, { subCategory: /baby care/i }] },
            ],
        }
    }

    return null
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

const parseCsv = (value) => {
    if (value === undefined || value === null) return []
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
    return String(value)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
}

const safeInt = (value, fallback) => {
    const n = Number.parseInt(String(value), 10)
    return Number.isFinite(n) ? n : fallback
}

const safeNumber = (value) => {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
}

// function for add product
const addProduct = async (req, res) => {
    try {

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
            deliveryEnabled,
            deliveryPincodes,
        } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

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
            bestseller: bestseller === "true" ? true : false,
            sizes: parseJsonArray(sizes, ['M']),
            image: imagesUrl,
            videos: urlVideos,
            stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : undefined,
            inStock: inStock !== undefined ? String(inStock) === 'true' : undefined,
            isAvailable: isAvailable !== undefined ? String(isAvailable) === 'true' : undefined,
            deliveryEnabled: deliveryEnabled !== undefined ? String(deliveryEnabled) === 'true' : undefined,
            deliveryPincodes: parseJsonArray(deliveryPincodes, []),
            date: Date.now()
        }

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateProduct = async (req, res) => {
    try {
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
            deliveryEnabled,
            deliveryPincodes,
            replaceImages,
        } = req.body
        if (!id) return res.json({ success: false, message: "Product id is required" })

        const existing = await productModel.findById(id)
        if (!existing) return res.json({ success: false, message: "Product not found" })

        const image1 = req.files?.image1 && req.files.image1[0]
        const image2 = req.files?.image2 && req.files.image2[0]
        const image3 = req.files?.image3 && req.files.image3[0]
        const image4 = req.files?.image4 && req.files.image4[0]
        const uploads = [image1, image2, image3, image4].filter(Boolean)

        let uploadedUrls = []
        if (uploads.length) {
            uploadedUrls = await Promise.all(
                uploads.map(async (item) => {
                    let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                    return result.secure_url
                })
            )
        }

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
            ...(deliveryEnabled !== undefined ? { deliveryEnabled: String(deliveryEnabled) === 'true' } : {}),
            ...(deliveryPincodes !== undefined ? { deliveryPincodes: parseJsonArray(deliveryPincodes, []) } : {}),
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
        res.json({ success: true, message: "Product Updated" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const duplicateProduct = async (req, res) => {
    try {
        const { id } = req.body
        if (!id) return res.json({ success: false, message: "Product id is required" })

        const existing = await productModel.findById(id)
        if (!existing) return res.json({ success: false, message: "Product not found" })

        const copy = existing.toObject()
        delete copy._id
        delete copy.seedKey
        copy.isDefault = false
        copy.name = `${existing.name} (Copy)`
        copy.date = Date.now()

        const created = await productModel.create(copy)
        res.json({ success: true, message: "Product Duplicated", product: created })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        const hasQuery = [
            'q',
            'category',
            'subCategory',
            'brand',
            'gender',
            'fashionCategory',
            'mainCategory',
            'section',
            'categorySlug',
            'collectionType',
            'colors',
            'featured',
            'recommended',
            'priceMin',
            'priceMax',
            'sort',
            'page',
            'limit',
        ].some((k) => req.query?.[k] !== undefined)

        if (!hasQuery) {
            const products = await productModel.find({})
            res.json({ success: true, products })
            return
        }

        const q = String(req.query.q || '').trim()
        const categories = parseCsv(req.query.category)
        const subCategories = parseCsv(req.query.subCategory)
        const brands = parseCsv(req.query.brand)
        const gender = String(req.query.gender || '').trim()
        const fashionCategory = String(req.query.fashionCategory || '').trim()
        const mainCategories = parseCsv(req.query.mainCategory)
        const sections = parseCsv(req.query.section)
        const categorySlugs = parseCsv(req.query.categorySlug)
        const collectionTypes = parseCsv(req.query.collectionType)
        const colors = parseCsv(req.query.colors)
        const featured = req.query.featured
        const recommended = req.query.recommended

        const priceMin = safeNumber(req.query.priceMin)
        const priceMax = safeNumber(req.query.priceMax)

        const page = Math.max(1, safeInt(req.query.page, 1))
        const limit = Math.min(60, Math.max(1, safeInt(req.query.limit, 60)))
        const skip = (page - 1) * limit

        const filter = {}
        const and = []

        const categoryValues = []
        const fashionFromCategory = []
        for (const raw of categories) {
            const fashionLabel = toFashionLabel(raw)
            if (fashionLabel) fashionFromCategory.push(fashionLabel)
            else categoryValues.push(raw)
        }

        const catOr = buildInsensitiveOr('category', categoryValues)
        if (catOr) and.push(catOr)

        const subOr = buildInsensitiveOr('subCategory', subCategories)
        if (subOr) and.push(subOr)

        const brandOr = buildInsensitiveOr('brand', brands)
        if (brandOr) and.push(brandOr)

        const mainOr = buildInsensitiveOr('mainCategory', mainCategories)
        if (mainOr) and.push(mainOr)

        const sectionOr = buildInsensitiveOr('section', sections)
        if (sectionOr) and.push(sectionOr)

        const slugOr = buildInsensitiveOr('categorySlug', categorySlugs)
        if (slugOr) and.push(slugOr)

        const collOr = buildInsensitiveOr('collectionType', collectionTypes)
        if (collOr) and.push(collOr)

        const colorOr = buildInsensitiveOr('colors', colors)
        if (colorOr) and.push(colorOr)

        if (featured !== undefined) {
            and.push({ featured: String(featured).toLowerCase() === 'true' })
        }

        if (recommended !== undefined) {
            and.push({ recommended: String(recommended).toLowerCase() === 'true' })
        }

        const fashionTokens = []
        if (fashionCategory) {
            const label = toFashionLabel(fashionCategory) || fashionCategory
            fashionTokens.push(label)
        }
        if (fashionFromCategory.length) fashionTokens.push(...fashionFromCategory)

        if (fashionTokens.length) {
            const scopeOr = []
            for (const token of fashionTokens.map((t) => String(t || '').trim()).filter(Boolean)) {
                const slug = toFashionSlug(token)
                if (slug) {
                    const scoped = buildFashionScopeFilter(slug)
                    if (scoped) scopeOr.push(scoped)
                    continue
                }
                const rx = new RegExp(`^${escapeRegex(token)}$`, 'i')
                scopeOr.push({ $or: [{ fashionCategory: rx }, { 'attributes.fashionCategory': rx }, { subCategory: rx }] })
            }
            if (scopeOr.length) and.push({ $or: scopeOr })
        }

        if (priceMin !== null || priceMax !== null) {
            filter.price = {}
            if (priceMin !== null) filter.price.$gte = priceMin
            if (priceMax !== null) filter.price.$lte = priceMax
        }

        if (gender) {
            const rx = new RegExp(`^${escapeRegex(gender)}$`, 'i')
            and.push({
                $or: [
                    { gender: rx },
                    { 'attributes.gender': rx },
                    { category: rx },
                ],
            })
        }

        if (q) {
            const rx = new RegExp(escapeRegex(q), 'i')
            and.push({
                $or: [
                    { name: rx },
                    { description: rx },
                    { brand: rx },
                    { category: rx },
                    { subCategory: rx },
                    { fashionCategory: rx },
                    { gender: rx },
                    { 'attributes.fashionCategory': rx },
                    { 'attributes.gender': rx },
                ],
            })
        }

        if (and.length) {
            filter.$and = (filter.$and || []).concat(and)
        }

        const sortParam = String(req.query.sort || '').trim()
        const sort =
            sortParam === 'price_asc'
                ? { price: 1, date: -1 }
                : sortParam === 'price_desc'
                    ? { price: -1, date: -1 }
                    : sortParam === 'rating_desc'
                        ? { rating: -1, reviews: -1, date: -1 }
                        : { date: -1 }

        const [total, products] = await Promise.all([
            productModel.countDocuments(filter),
            productModel.find(filter).sort(sort).skip(skip).limit(limit),
        ])

        res.json({
            success: true,
            products,
            total,
            page,
            pages: Math.max(1, Math.ceil(total / limit)),
            limit,
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        const id = req.body.id
        const product = await productModel.findById(id).lean()
        if (!product) return res.json({ success: false, message: "Product not found" })

        if (product.isDefault) {
            const token = req.headers.token || ''
            let adminRole = null
            try {
                const token_decode = jwt.verify(token, process.env.JWT_SECRET)
                const adminSig = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
                const superSig = (process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL) + (process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD)
                if (token_decode === superSig) adminRole = 'superadmin'
                else if (token_decode === adminSig) adminRole = 'admin'
            } catch {}

            const settings = await settingsModel.findOne({ key: 'platform' }).lean()
            const allowDefaultDelete = Boolean(settings?.value?.allowDefaultDelete)
            if (adminRole !== 'superadmin' && !allowDefaultDelete) {
                return res.json({ success: false, message: "Default products cannot be deleted" })
            }
        }

        await productModel.findByIdAndDelete(id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct, duplicateProduct }
