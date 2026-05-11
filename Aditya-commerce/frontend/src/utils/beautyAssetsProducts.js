const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

const hashString = (s) => {
  let h = 0
  const str = String(s || '')
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

const stablePrice = (seed) => {
  const base = 149 + (seed * 97) % 4200
  const rounded = Math.round(base / 10) * 10
  return clamp(rounded, 149, 3999)
}

const stableRating = (seed) => {
  const rating = 3.7 + ((seed * 11) % 13) / 10
  return clamp(Number(rating.toFixed(1)), 3.7, 4.9)
}

const stableReviews = (seed) => 80 + ((seed * 29) % 18000)

// Disable glob import to prevent build errors - use placeholder instead
const beautyAssetModules = {}

const pickUrl = (m) => (m && typeof m === 'object' && 'default' in m ? m.default : null)

export const beautySubcategories = [
  'Skincare',
  'Face Wash',
  'Face Cream',
  'Sunscreen',
  'Serum',
  'Toner',
  'Face Mask',
  'Makeup',
  'Hair Care',
  'Personal Care',
]

const normalizeName = (raw) =>
  String(raw || '')
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const classifySubcategory = (name) => {
  const n = String(name || '').toLowerCase()
  if (n.includes('face wash') || n.includes('cleanser')) return 'Face Wash'
  if (n.includes('sunscreen') || n.includes(' spf') || n.includes('spf ')) return 'Sunscreen'
  if (n.includes('serum')) return 'Serum'
  if (n.includes('toner')) return 'Toner'
  if (n.includes('mask')) return 'Face Mask'
  if (n.includes('moistur') || n.includes('cream') || n.includes('gel creme') || n.includes('moisturiser')) return 'Face Cream'
  if (n.includes('shampoo') || n.includes('conditioner') || n.includes('hair')) return 'Hair Care'
  if (n.includes('lipstick') || n.includes('kajal') || n.includes('foundation') || n.includes('primer') || n.includes('makeup'))
    return 'Makeup'
  if (n.includes('scrub') || n.includes('exfol')) return 'Skincare'
  if (n.includes('underarm') || n.includes('body') || n.includes('mist') || n.includes('water')) return 'Personal Care'
  return 'Skincare'
}

const sizesFor = (sub) => {
  if (sub === 'Face Wash') return ['100 ml', '200 ml']
  if (sub === 'Sunscreen') return ['50 g', '100 g']
  if (sub === 'Serum') return ['15 ml', '30 ml']
  if (sub === 'Toner') return ['100 ml', '200 ml']
  if (sub === 'Face Mask') return ['50 g', '100 g']
  if (sub === 'Face Cream') return ['50 g', '100 g']
  if (sub === 'Hair Care') return ['180 ml', '340 ml']
  if (sub === 'Personal Care') return ['100 ml', '250 ml']
  if (sub === 'Makeup') return ['Standard']
  return ['Standard']
}

export const buildBeautyAssetsCatalog = () => {
  const entries = Object.entries(beautyAssetModules).map(([path, mod]) => ({
    path,
    url: pickUrl(mod),
  }))

  const products = []
  let idx = 1

  for (const e of entries) {
    if (!e.url) continue
    const fileName = e.path.split('/').pop() || `beauty-${idx}`
    const name = normalizeName(fileName)
    const subCategory = classifySubcategory(name)
    const seed = hashString(`${e.path}-${idx}`)

    products.push({
      _id: `beauty-asset-${seed}-${idx}`,
      id: `beauty-asset-${seed}-${idx}`,
      name,
      description: 'Beauty product curated from local beauty catalog with premium look and reliable storefront experience.',
      category: 'beauty',
      categorySlug: 'beauty',
      subCategory,
      image: [e.url],
      price: stablePrice(seed),
      rating: stableRating(seed),
      reviews: stableReviews(seed),
      sizes: sizesFor(subCategory),
      date: Date.now() - (seed % 14) * 24 * 60 * 60 * 1000,
      recentlyAdded: seed % 7 === 0,
      isBeautyAsset: true,
    })

    idx += 1
  }

  return products
}
