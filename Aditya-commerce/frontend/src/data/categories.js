const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

const hashString = (s) => {
  let h = 0
  const str = String(s || '')
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

const stablePrice = (seed) => {
  const base = 399 + (seed * 131) % 82000
  const rounded = Math.round(base / 50) * 50
  return clamp(rounded, 199, 199999)
}

const stableRating = (seed) => {
  const rating = 3.8 + ((seed * 13) % 12) / 10
  return clamp(Number(rating.toFixed(1)), 3.6, 4.9)
}

const stableReviews = (seed) => 80 + ((seed * 37) % 18000)

const assetImageModules = import.meta.glob('/src/assets/images/*.{png,jpg,jpeg,webp}', { eager: true })
const fallbackImageModules = import.meta.glob('/src/assets/*.{png,jpg,jpeg,webp}', { eager: true })

const pickUrl = (m) => (m && typeof m === 'object' && 'default' in m ? m.default : null)

export const getAssetImagePool = () => {
  const urls = []
  for (const m of Object.values(assetImageModules)) {
    const u = pickUrl(m)
    if (u) urls.push(u)
  }
  for (const m of Object.values(fallbackImageModules)) {
    const u = pickUrl(m)
    if (!u) continue
    if (String(u).includes('/logo') || String(u).includes('/menu_icon') || String(u).includes('/cart_icon')) continue
    urls.push(u)
  }
  return urls
}

const findBannerBySlug = (slug) => {
  const lower = String(slug || '').toLowerCase()
  const candidates = Object.entries(assetImageModules)
    .map(([path, mod]) => ({ path, url: pickUrl(mod) }))
    .filter((x) => x.url)
  const hit = candidates.find((x) => x.path.toLowerCase().includes(lower))
  return hit?.url || null
}

export const categorySlugs = ['appliances', 'toys', 'food', 'fashion', 'house', 'two-wheeler', 'sports', 'extra', 'books', 'furniture']

export const categories = {
  appliances: {
    slug: 'appliances',
    title: 'Appliances',
    icon: '🧊',
    theme: { a: '#0EA5E9', b: '#1D4ED8', surface: '#EFF6FF', chip: '#0F172A' },
    types: ['Kitchen', 'Laundry', 'Cooling', 'Small Appliances'],
    bannerUrl: () => findBannerBySlug('appliances'),
    productNames: ['Air Fryer', 'Mixer Grinder', 'Microwave Oven', 'Vacuum Cleaner', 'Water Purifier', 'Smart Fan'],
  },
  toys: {
    slug: 'toys',
    title: 'Toys',
    icon: '🧸',
    theme: { a: '#F472B6', b: '#A855F7', surface: '#FDF2F8', chip: '#111827' },
    types: ['Educational', 'Action', 'Puzzles', 'Remote Control'],
    bannerUrl: () => findBannerBySlug('toys'),
    productNames: ['Building Blocks', 'Remote Car', 'Puzzle Set', 'Soft Toy', 'Art Kit', 'Robot Toy'],
  },
  food: {
    slug: 'food',
    title: 'Food',
    icon: '🍱',
    theme: { a: '#F97316', b: '#EF4444', surface: '#FFF7ED', chip: '#7C2D12' },
    types: ['Snacks', 'Beverages', 'Staples', 'Healthy'],
    bannerUrl: () => findBannerBySlug('food'),
    productNames: ['Dry Fruits Pack', 'Protein Bars', 'Coffee Blend', 'Masala Combo', 'Healthy Mix', 'Snack Box'],
  },
  fashion: {
    slug: 'fashion',
    title: 'Fashion',
    icon: '👗',
    theme: { a: '#E879F9', b: '#C026D3', surface: '#FDF2F8', chip: '#111827' },
    types: ['Clothing', 'Footwear', 'Accessories', 'Kids Fashion'],
    bannerUrl: () => findBannerBySlug('fashion'),
    productNames: ['T-shirt', 'Sneakers', 'Handbag', 'Jeans', 'Watch', 'Sunglasses'],
  },
  house: {
    slug: 'house',
    title: 'House',
    icon: '🏡',
    theme: { a: '#94A3B8', b: '#0F172A', surface: '#F8FAFC', chip: '#0F172A' },
    types: ['Decor', 'Cleaning', 'Storage', 'Lighting'],
    bannerUrl: () => findBannerBySlug('house'),
    productNames: ['Wall Clock', 'Planter Set', 'Storage Box', 'LED Lights', 'Cleaning Kit', 'Curtains'],
  },
  'two-wheeler': {
    slug: 'two-wheeler',
    title: 'Two-Wheeler',
    icon: '🏍️',
    theme: { a: '#0B1220', b: '#111827', surface: '#0B1220', chip: '#F59E0B' },
    types: ['Helmets', 'Riding Gear', 'Maintenance', 'Accessories'],
    bannerUrl: () => findBannerBySlug('two-wheeler'),
    productNames: ['Riding Helmet', 'Bike Gloves', 'Phone Mount', 'Tyre Inflator', 'Chain Lube', 'Riding Jacket'],
  },
  sports: {
    slug: 'sports',
    title: 'Sports',
    icon: '🏏',
    theme: { a: '#EF4444', b: '#111827', surface: '#FEF2F2', chip: '#111827' },
    types: ['Cricket', 'Fitness', 'Outdoor', 'Indoor'],
    bannerUrl: () => findBannerBySlug('sports'),
    productNames: ['Cricket Bat', 'Dumbbell Set', 'Yoga Mat', 'Sports Shoes', 'Badminton Racket', 'Football'],
  },
  extra: {
    slug: 'extra',
    title: 'Extra',
    icon: '✨',
    theme: { a: '#22C55E', b: '#0EA5E9', surface: '#ECFEFF', chip: '#0F172A' },
    types: ['Auto', 'Gadgets', 'Daily Use', 'Essentials'],
    bannerUrl: () => findBannerBySlug('extra'),
    productNames: ['Car Charger', 'Utility Kit', 'Smart Gadget', 'Power Adapter', 'Travel Organizer', 'Tool Set'],
  },
  books: {
    slug: 'books',
    title: 'Books',
    icon: '📚',
    theme: { a: '#D6BCA3', b: '#7C5C46', surface: '#FFFBEB', chip: '#3F2A1D' },
    types: ['Fiction', 'Non-fiction', 'Exam Prep', "Children's"],
    bannerUrl: () => findBannerBySlug('books'),
    productNames: ['Best Seller Novel', 'Self Help Book', 'Exam Guide', 'Kids Story Book', 'Business Book', 'Notebook Set'],
  },
  furniture: {
    slug: 'furniture',
    title: 'Furniture',
    icon: '🛋️',
    theme: { a: '#8B5A2B', b: '#0F172A', surface: '#FEF3C7', chip: '#0F172A' },
    types: ['Living Room', 'Bedroom', 'Office', 'Storage'],
    bannerUrl: () => findBannerBySlug('furniture'),
    productNames: ['Study Chair', 'Coffee Table', 'Shoe Rack', 'Bookshelf', 'Side Table', 'Lamp Stand'],
  },
}

export const normalizeCategorySlug = (raw) => {
  const v = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
  if (v === '2-wheeler') return 'two-wheeler'
  if (v === 'two-wheeler') return 'two-wheeler'
  if (v === 'two-wheeler-accessories') return 'two-wheeler'
  return v
}

export const isKnownCategory = (slug) => !!categories[slug]

export const computeDiscount = (productId, price) => {
  const h = hashString(productId)
  const pct = 10 + (h % 7) * 5
  const mrp = Math.round((Number(price || 0) / (1 - pct / 100)) / 10) * 10
  return { discountPercent: pct, mrp: Math.max(mrp, Number(price || 0) + 10) }
}

export const buildCategoryFallbackProducts = (slug, count = 24) => {
  const cfg = categories[slug]
  if (!cfg) return []
  const pool = getAssetImagePool()
  const out = []
  const names = cfg.productNames || []
  const types = cfg.types || ['General']

  for (let i = 0; i < count; i += 1) {
    const id = `cat-${slug}-${i + 1}`
    const seed = hashString(id)
    const price = stablePrice(seed)
    const rating = stableRating(seed)
    const { discountPercent, mrp } = computeDiscount(id, price)
    const img = pool.length ? pool[seed % pool.length] : null
    const type = types[seed % types.length]
    const name = `${names[i % names.length] || `${cfg.title} Item`} • ${type}`

    out.push({
      _id: id,
      name,
      description: `Premium ${cfg.title.toLowerCase()} product with modern design and reliable quality.`,
      price,
      mrp,
      discountPercent,
      image: [img || null].filter(Boolean),
      category: cfg.title,
      categorySlug: slug,
      type,
      sizes: ['Standard'],
      rating,
      reviews: stableReviews(seed),
      recentlyAdded: seed % 6 === 0,
      isCategoryFallback: true,
      date: Date.now() - (seed % 40) * 24 * 60 * 60 * 1000,
    })
  }

  return out
}

