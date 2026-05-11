import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import adminRouter from './routes/adminRoute.js'
import sellerRouter from './routes/sellerRoute.js'
import subscriptionRouter from './routes/subscriptionRoute.js'
import notificationRouter from './routes/notificationRoute.js'
import careerRouter from './routes/careerRoute.js'
import blogRouter from './routes/blogRoute.js'
import categoryRouter from './routes/categoryRoute.js'
import productModel from './models/productModel.js'
import categoryModel from './models/categoryModel.js'
import categorySectionModel from './models/categorySectionModel.js'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { securityMiddleware } from './middleware/security.js'

dotenv.config()
try {
    const envPath = fileURLToPath(new URL('./.env', import.meta.url))
    dotenv.config({ path: envPath })
    const looksPlaceholder = (v) => {
        const s = String(v || '').trim()
        if (!s) return true
        return /^your_/i.test(s) || s.includes('your_actual_') || s.includes('your-cloudinary')
    }
    if (
        looksPlaceholder(process.env.CLOUDINARY_NAME) ||
        looksPlaceholder(process.env.CLOUDINARY_API_KEY) ||
        looksPlaceholder(process.env.CLOUDINARY_SECRET_KEY)
    ) {
        dotenv.config({ path: envPath, override: true })
    }
} catch {}

// App Config
const app = express()
const port = process.env.PORT || 4000
let cloudinaryEnabled = false

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))
const stablePrice = (seed, min, max, step) => {
    const base = min + (seed * 83) % (max - min)
    const rounded = Math.round(base / step) * step
    return clamp(rounded, min, max)
}
const stableRating = (seed) => {
    const r = 3.7 + ((seed * 11) % 13) / 10
    return clamp(Number(r.toFixed(1)), 3.7, 4.9)
}
const stableReviews = (seed) => 80 + ((seed * 29) % 18000)

const safeSlug = (name) =>
    String(name || '')
        .replace(/\.[^/.]+$/, '')
        .replace(/[%]/g, 'pct')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()

const listFiles = async (dir, exts) => {
    try {
        const items = await fs.readdir(dir, { withFileTypes: true })
        return items
            .filter((d) => d.isFile())
            .map((d) => d.name)
            .filter((name) => exts.some((e) => name.toLowerCase().endsWith(e)))
            .sort((a, b) => a.localeCompare(b))
    } catch {
        return []
    }
}

const isLikelyPhoneImage = (filename) => {
    const base = String(filename || '').replace(/\.[^.]+$/, '').trim().toLowerCase()
    if (!base) return false
    const excluded = new Set([
        'logo',
        'hero_img',
        'about_img',
        'contact_img',
        'cart_icon',
        'profile_icon',
        'menu_icon',
        'search_icon',
        'dropdown_icon',
        'cross_icon',
        'bin_icon',
        'stripe_logo',
        'razorpay_logo',
        'star_icon',
        'star_dull_icon',
        'exchange_icon',
        'quality_icon',
        'support_img',
        'vivo',
        'samsung',
        'iphone',
    ])
    if (excluded.has(base)) return false
    if (base.startsWith('p_img')) return false
    if (base.includes('icon')) return false
    if (base.includes('logo')) return false
    return (
        /\d/.test(base) ||
        base.includes('5g') ||
        base.includes('gb') ||
        base.includes('ram') ||
        base.includes('phone') ||
        base.includes('galaxy') ||
        base.includes('iphone') ||
        base.includes('nord') ||
        base.includes('reno') ||
        base.includes('(')
    )
}

const detectBrand = (filename) => {
    const lower = String(filename || '').toLowerCase()
    const brands = [
        { brand: 'Samsung', keys: ['samsung', 'galaxy'] },
        { brand: 'Apple', keys: ['iphone', 'apple'] },
        { brand: 'OnePlus', keys: ['oneplus', 'nord'] },
        { brand: 'Vivo', keys: ['vivo'] },
        { brand: 'OPPO', keys: ['oppo', 'reno'] },
        { brand: 'Nothing', keys: ['nothing'] },
        { brand: 'Realme', keys: ['realme'] },
        { brand: 'Motorola', keys: ['moto', 'motorola'] },
        { brand: 'Xiaomi', keys: ['mi', 'redmi', 'xiaomi', 'poco'] },
    ]
    for (const b of brands) {
        if (b.keys.some((k) => lower.includes(k))) return b.brand
    }
    return 'Mobiles'
}

const uploadToCloudinary = async (absPath) => {
    if (!cloudinaryEnabled) return null
    try {
        const res = await cloudinary.uploader.upload(absPath, { resource_type: 'image' })
        return res?.secure_url || null
    } catch {
        return null
    }
}

const seedDefaultProducts = async () => {
    const backendDir = path.dirname(fileURLToPath(import.meta.url))
    const assetsDir = path.resolve(backendDir, '../frontend/src/assets')
    const beautyDir = path.resolve(assetsDir, 'beauty')

    const clothingFiles = (await listFiles(assetsDir, ['.png', '.jpg', '.jpeg', '.webp']))
        .filter((n) => /^p_img\d+/i.test(n))
        .slice(0, 80)
    const beautyFiles = (await listFiles(beautyDir, ['.png', '.jpg', '.jpeg', '.webp'])).slice(0, 120)
    const mobileFiles = (await listFiles(assetsDir, ['.webp', '.png', '.jpg', '.jpeg']))
        .filter((n) => isLikelyPhoneImage(n))
        .slice(0, 80)

    const categories = ['Men', 'Women', 'Kids']
    const subCategories = ['Topwear', 'Bottomwear', 'Winterwear']
    const sizes = ['S', 'M', 'L', 'XL']

    const clothingKeys = clothingFiles.map((f) => `seed-clothing-${safeSlug(f)}`)
    const beautyKeys = beautyFiles.map((f) => `seed-beauty-${safeSlug(f)}`)
    const mobileKeys = mobileFiles.map((f) => `seed-mobile-${safeSlug(f)}`)
    const allKeys = [...clothingKeys, ...beautyKeys, ...mobileKeys].filter(Boolean)

    const existing = await productModel.find({ seedKey: { $in: allKeys } }).select('seedKey').lean()
    const existingKeys = new Set((existing || []).map((d) => d.seedKey))

    const seedItems = []

    for (let i = 0; i < clothingFiles.length; i++) {
        const filename = clothingFiles[i]
        const seedKey = `seed-clothing-${safeSlug(filename)}`
        if (existingKeys.has(seedKey)) continue
        const abs = path.resolve(assetsDir, filename)
        const img = await uploadToCloudinary(abs)
        const category = categories[i % categories.length]
        const subCategory = subCategories[i % subCategories.length]
        const date = Date.now() - i * 24 * 60 * 60 * 1000
        const rating = stableRating(i)
        seedItems.push({
            seedKey,
            isDefault: true,
            name: `Premium Product ${i + 1}`,
            description:
                'Premium quality product with modern design, durable materials, and a comfortable fit. Hand-picked as a default item for a production-like storefront.',
            price: stablePrice(i, 299, 1999, 10),
            image: img ? [img] : [],
            category,
            subCategory,
            sizes,
            bestseller: rating >= 4.6 || i % 7 === 0,
            date,
            rating,
            reviews: stableReviews(i),
            stockQuantity: 50 + ((i * 17) % 120),
            inStock: true,
            isAvailable: true,
            deliveryEnabled: true,
            deliveryPincodes: [],
        })
    }

    for (let i = 0; i < beautyFiles.length; i++) {
        const filename = beautyFiles[i]
        const seedKey = `seed-beauty-${safeSlug(filename)}`
        if (existingKeys.has(seedKey)) continue
        const abs = path.resolve(beautyDir, filename)
        const img = await uploadToCloudinary(abs)
        const seed = 1000 + i
        const date = Date.now() - seed * 10 * 60 * 1000
        const rating = stableRating(seed)
        seedItems.push({
            seedKey,
            isDefault: true,
            name: String(filename).replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(),
            description: 'Beauty product curated for skincare, makeup, and personal care with premium results.',
            price: stablePrice(seed, 149, 3999, 10),
            image: img ? [img] : [],
            category: 'Beauty',
            subCategory: 'Skincare',
            sizes: ['1'],
            bestseller: rating >= 4.6 || seed % 9 === 0,
            date,
            rating,
            reviews: stableReviews(seed),
            stockQuantity: 40 + ((seed * 19) % 180),
            inStock: true,
            isAvailable: true,
            deliveryEnabled: true,
            deliveryPincodes: [],
        })
    }

    for (let i = 0; i < mobileFiles.length; i++) {
        const filename = mobileFiles[i]
        const seedKey = `seed-mobile-${safeSlug(filename)}`
        if (existingKeys.has(seedKey)) continue
        const abs = path.resolve(assetsDir, filename)
        const img = await uploadToCloudinary(abs)
        const seed = 2000 + i
        const brand = detectBrand(filename)
        const date = Date.now() - seed * 6 * 60 * 1000
        const rating = stableRating(seed)
        seedItems.push({
            seedKey,
            isDefault: true,
            name: String(filename).replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(),
            description: 'High-performance smartphone with premium display, fast charging, and camera features.',
            price: stablePrice(seed, 6999, 99999, 100),
            image: img ? [img] : [],
            category: 'Mobiles',
            subCategory: brand,
            sizes: ['128GB', '256GB'],
            bestseller: rating >= 4.6 || seed % 11 === 0,
            date,
            rating,
            reviews: stableReviews(seed),
            stockQuantity: 10 + ((seed * 7) % 40),
            inStock: true,
            isAvailable: true,
            deliveryEnabled: true,
            deliveryPincodes: [],
        })
    }

    if (seedItems.length === 0) return
    try {
        await productModel.insertMany(seedItems, { ordered: false })
    } catch (e) {
        const msg = String(e?.message || '')
        if (!msg.toLowerCase().includes('duplicate')) throw e
    }
}

const seedDefaultCategories = async () => {
    const count = await categoryModel.countDocuments()
    if (count > 0) return

    const roots = await categoryModel.insertMany(
        [
            { name: 'Fashion', slug: 'fashion', level: 0, sortOrder: 1, featured: true, isActive: true },
            { name: 'Electronics', slug: 'electronics', level: 0, sortOrder: 2, featured: true, isActive: true },
            { name: 'Home & Kitchen', slug: 'home-kitchen', level: 0, sortOrder: 3, featured: true, isActive: true },
            { name: 'Grocery', slug: 'grocery', level: 0, sortOrder: 4, featured: true, isActive: true },
            { name: 'Lifestyle', slug: 'lifestyle', level: 0, sortOrder: 5, featured: true, isActive: true },
        ],
        { ordered: false }
    )

    const rootBySlug = new Map(roots.map((r) => [r.slug, r]))

    const children = [
        { parent: 'fashion', name: 'Clothing', slug: 'fashion/clothing', navGroup: 'Men', sortOrder: 1, productMatch: { subCategory: ['Clothing'] } },
        { parent: 'fashion', name: 'Footwear', slug: 'fashion/footwear', navGroup: 'Men', sortOrder: 2, productMatch: { subCategory: ['Footwear'] } },
        { parent: 'fashion', name: 'Accessories', slug: 'fashion/accessories', navGroup: 'Men', sortOrder: 3, productMatch: { subCategory: ['Accessories'] } },
        { parent: 'fashion', name: 'Ethnic Wear', slug: 'fashion/ethnic-wear', navGroup: 'Women', sortOrder: 4, productMatch: { subCategory: ['Ethnic Wear'] } },
        { parent: 'fashion', name: 'Western Wear', slug: 'fashion/western-wear', navGroup: 'Women', sortOrder: 5, productMatch: { subCategory: ['Western Wear'] } },
        { parent: 'fashion', name: 'Beauty', slug: 'fashion/beauty', navGroup: 'Women', sortOrder: 6, productMatch: { subCategory: ['Beauty'], category: ['Beauty'] } },
        { parent: 'fashion', name: 'Boys', slug: 'fashion/boys', navGroup: 'Kids', sortOrder: 7, productMatch: { subCategory: ['Boys'], category: ['Kids'] } },
        { parent: 'fashion', name: 'Girls', slug: 'fashion/girls', navGroup: 'Kids', sortOrder: 8, productMatch: { subCategory: ['Girls'], category: ['Kids'] } },
        { parent: 'fashion', name: 'Baby Care', slug: 'fashion/baby-care', navGroup: 'Kids', sortOrder: 9, productMatch: { subCategory: ['Baby Care'], category: ['Kids'] } },

        { parent: 'electronics', name: 'Mobiles', slug: 'electronics/mobiles', navGroup: 'Mobiles', sortOrder: 1, productMatch: { category: ['Mobiles'] } },
        { parent: 'electronics', name: 'Tablets', slug: 'electronics/tablets', navGroup: 'Mobiles', sortOrder: 2, productMatch: { search: ['tablet'] } },
        { parent: 'electronics', name: 'Accessories', slug: 'electronics/accessories', navGroup: 'Mobiles', sortOrder: 3, productMatch: { search: ['case', 'charger', 'cable'] } },
        { parent: 'electronics', name: 'Laptops', slug: 'electronics/laptops', navGroup: 'Computing', sortOrder: 4, productMatch: { subCategory: ['Laptops'] } },
        { parent: 'electronics', name: 'Gaming', slug: 'electronics/gaming', navGroup: 'Computing', sortOrder: 5, productMatch: { subCategory: ['Gaming', 'Gaming Hub'] } },
        { parent: 'electronics', name: 'Monitors', slug: 'electronics/monitors', navGroup: 'Computing', sortOrder: 6, productMatch: { subCategory: ['IT Peripherals'] } },
        { parent: 'electronics', name: 'Headphones', slug: 'electronics/headphones', navGroup: 'Audio', sortOrder: 7, productMatch: { subCategory: ['Headsets'] } },
        { parent: 'electronics', name: 'Speakers', slug: 'electronics/speakers', navGroup: 'Audio', sortOrder: 8, productMatch: { subCategory: ['Speakers'] } },
        { parent: 'electronics', name: 'Soundbars', slug: 'electronics/soundbars', navGroup: 'Audio', sortOrder: 9, productMatch: { search: ['soundbar'] } },

        { parent: 'home-kitchen', name: 'Lighting', slug: 'home-kitchen/lighting', navGroup: 'Decor', sortOrder: 1, productMatch: { subCategory: ['Bulbs'] } },
        { parent: 'home-kitchen', name: 'Furniture', slug: 'home-kitchen/furniture', navGroup: 'Decor', sortOrder: 2, productMatch: { subCategory: ['Furniture'] } },
        { parent: 'home-kitchen', name: 'Home Decor', slug: 'home-kitchen/home-decor', navGroup: 'Decor', sortOrder: 3, productMatch: { subCategory: ['Decor'] } },
        { parent: 'home-kitchen', name: 'Appliances', slug: 'home-kitchen/appliances', navGroup: 'Kitchen', sortOrder: 4, productMatch: { category: ['Home'], subCategory: ['Appliances'] } },
        { parent: 'home-kitchen', name: 'Kitchen Items', slug: 'home-kitchen/kitchen-items', navGroup: 'Kitchen', sortOrder: 5, productMatch: { subCategory: ['Cookware'] } },
        { parent: 'home-kitchen', name: 'Storage', slug: 'home-kitchen/storage', navGroup: 'Kitchen', sortOrder: 6, productMatch: { subCategory: ['Dining'] } },
        { parent: 'home-kitchen', name: 'Bathroom', slug: 'home-kitchen/bathroom', navGroup: 'Living', sortOrder: 7, productMatch: { subCategory: ['Bathroom'] } },
        { parent: 'home-kitchen', name: 'Smart Home', slug: 'home-kitchen/smart-home', navGroup: 'Living', sortOrder: 8, productMatch: { search: ['smart'] } },

        { parent: 'grocery', name: 'Vegetables', slug: 'grocery/vegetables', navGroup: 'Grocery', sortOrder: 1, productMatch: { search: ['vegetable'] } },
        { parent: 'grocery', name: 'Fruits', slug: 'grocery/fruits', navGroup: 'Grocery', sortOrder: 2, productMatch: { search: ['fruit'] } },
        { parent: 'grocery', name: 'Snacks', slug: 'grocery/snacks', navGroup: 'Grocery', sortOrder: 3, productMatch: { search: ['snack'] } },
        { parent: 'grocery', name: 'Beverages', slug: 'grocery/beverages', navGroup: 'Grocery', sortOrder: 4, productMatch: { search: ['drink', 'beverage'] } },
        { parent: 'grocery', name: 'Dairy', slug: 'grocery/dairy', navGroup: 'Grocery', sortOrder: 5, productMatch: { search: ['milk', 'dairy'] } },
        { parent: 'grocery', name: 'Household Essentials', slug: 'grocery/household-essentials', navGroup: 'Grocery', sortOrder: 6, productMatch: { search: ['household'] } },

        { parent: 'lifestyle', name: 'Gym', slug: 'lifestyle/gym', navGroup: 'Sports', sortOrder: 1, productMatch: { search: ['gym'] } },
        { parent: 'lifestyle', name: 'Cricket', slug: 'lifestyle/cricket', navGroup: 'Sports', sortOrder: 2, productMatch: { search: ['cricket'] } },
        { parent: 'lifestyle', name: 'Football', slug: 'lifestyle/football', navGroup: 'Sports', sortOrder: 3, productMatch: { search: ['football'] } },
        { parent: 'lifestyle', name: 'Story Books', slug: 'lifestyle/story-books', navGroup: 'Books', sortOrder: 4, productMatch: { search: ['story'] } },
        { parent: 'lifestyle', name: 'Technology', slug: 'lifestyle/technology', navGroup: 'Books', sortOrder: 5, productMatch: { search: ['technology'] } },
        { parent: 'lifestyle', name: 'Business', slug: 'lifestyle/business', navGroup: 'Books', sortOrder: 6, productMatch: { search: ['business'] } },
        { parent: 'lifestyle', name: 'Gaming', slug: 'lifestyle/gaming', navGroup: 'Toys', sortOrder: 7, productMatch: { search: ['gaming'] } },
        { parent: 'lifestyle', name: 'Action Figures', slug: 'lifestyle/action-figures', navGroup: 'Toys', sortOrder: 8, productMatch: { search: ['action figure'] } },
        { parent: 'lifestyle', name: 'Learning', slug: 'lifestyle/learning', navGroup: 'Toys', sortOrder: 9, productMatch: { search: ['learning'] } },
    ]

    const docs = children.map((c) => {
        const parent = rootBySlug.get(c.parent)
        return {
            name: c.name,
            slug: c.slug,
            parent: parent?._id || null,
            level: 1,
            navGroup: c.navGroup || '',
            sortOrder: c.sortOrder || 0,
            featured: false,
            isActive: true,
            productMatch: {
                category: c.productMatch?.category || [],
                subCategory: c.productMatch?.subCategory || [],
                search: c.productMatch?.search || [],
            },
        }
    })

    const createdChildren = await categoryModel.insertMany(docs, { ordered: false })

    const bySlug = new Map([...roots, ...createdChildren].map((d) => [d.slug, d]))

    const defaultSections = [
        { slug: 'fashion', key: 'limited-deals', type: 'promo', title: 'Limited Deals', subtitle: 'UP TO 60% OFF', ctaLabel: 'Shop Now', ctaUrl: '/fashion/clothing', sortOrder: 1 },
        { slug: 'electronics', key: 'featured', type: 'promo', title: 'Featured Category', subtitle: 'LAPTOPS DEALS', ctaLabel: 'Shop Now', ctaUrl: '/electronics/laptops', sortOrder: 1 },
        { slug: 'home-kitchen', key: 'limited-deals', type: 'promo', title: 'Limited Deals', subtitle: 'UP TO 60% OFF', ctaLabel: 'Shop Now', ctaUrl: '/home-kitchen/furniture', sortOrder: 1 },
        { slug: 'lifestyle', key: 'limited-deals', type: 'promo', title: 'Limited Deals', subtitle: 'UP TO 60% OFF', ctaLabel: 'Shop Now', ctaUrl: '/lifestyle/gym', sortOrder: 1 },
    ]

    await categorySectionModel.insertMany(
        defaultSections
            .map((s) => {
                const cat = bySlug.get(s.slug)
                if (!cat) return null
                return {
                    category: cat._id,
                    key: s.key,
                    type: s.type,
                    title: s.title,
                    subtitle: s.subtitle,
                    ctaLabel: s.ctaLabel,
                    ctaUrl: s.ctaUrl,
                    layout: { style: 'promo', columns: 1 },
                    sortOrder: s.sortOrder,
                    isActive: true,
                }
            })
            .filter(Boolean),
        { ordered: false }
    )
}

const startServer = async () => {
    try {
        await connectDB()
        cloudinaryEnabled = await connectCloudinary()
        await seedDefaultProducts()
        await seedDefaultCategories()

        // Apply security middleware
        securityMiddleware(app)
        
        // Body parsing middleware
        app.use(express.json({ limit: '10mb' }))
        app.use(express.urlencoded({ extended: true, limit: '10mb' }))
        app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))

        // api endpoints
        app.use('/api/user', userRouter)
        app.use('/api/admin', adminRouter)
        app.use('/api/product', productRouter)
        app.use('/api/products', productRouter)
        app.use('/api/categories', categoryRouter)
        app.use('/api/subscription', subscriptionRouter)
        app.use('/api/notification', notificationRouter)
        app.use('/api/careers', careerRouter)
        app.use('/api/blog', blogRouter)
        app.use('/api/seller', sellerRouter)
        app.use('/api/cart', cartRouter)
        app.use('/api/order', orderRouter)

        app.get('/',(req,res)=>{
            res.send("API Working")
        })

        const startListen = (desiredPort) => {
            const server = app.listen(desiredPort, () => console.log('Server started on PORT : ' + desiredPort))
            server.on('error', (e) => {
                const code = String(e?.code || '')
                if (code === 'EADDRINUSE') {
                    console.log(`PORT ${desiredPort} is already in use. Stop the other server using this port, then run the backend again.`)
                    process.exit(0)
                }
                console.error('Server failed to listen:', e?.message || e)
                process.exit(1)
            })
        }

        startListen(Number(port))
    } catch (err) {
        console.error('Server failed to start:', err?.message || err)
        process.exit(1)
    }
}

startServer()
