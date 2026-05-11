import { buildDefaultProductsFromAssets } from './defaultProducts'
import { DEFAULT_PLACEHOLDER_IMAGE } from './defaultProducts'

const titleCase = (value) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ')

const cleanName = (filename) => {
  const base = filename.replace(/\.[^.]+$/, '')
  const normalized = base.replace(/[_-]+/g, ' ').trim()
  return titleCase(normalized)
}

const stableMobilePrice = (index) => {
  const base = 12999 + (index * 1999) % 65000
  const rounded = Math.round(base / 500) * 500
  return Math.max(8999, Math.min(99999, rounded))
}

const stableRating = (index) => {
  const rating = 4.0 + ((index * 7) % 10) / 10
  return Math.min(4.9, Math.max(3.9, Number(rating.toFixed(1))))
}

const stableReviewCount = (index) => 90 + ((index * 31) % 1200)

const stableMrp = (price, index) => {
  const bump = 0.12 + (((index * 9) % 18) / 100)
  const mrp = Math.round((price * (1 + bump)) / 100) * 100
  return Math.max(price + 500, mrp)
}

const stableSpecs = (index) => {
  const ramOptions = [4, 6, 8, 12]
  const storageOptions = [64, 128, 256, 512]
  const displayOptions = [6.1, 6.4, 6.5, 6.7]
  const rearCameraOptions = [50, 64, 108]
  const frontCameraOptions = [16, 32]
  const batteryOptions = [4500, 5000, 5500, 6000, 7000]
  const processors = [
    'Snapdragon 7 Gen',
    'Dimensity 7300',
    'Snapdragon 8 Gen',
    'A-Series Bionic',
    'Exynos',
    'Tensor',
  ]

  return {
    ramGb: ramOptions[index % ramOptions.length],
    storageGb: storageOptions[(index + 1) % storageOptions.length],
    displayInches: displayOptions[(index + 2) % displayOptions.length],
    rearCameraMp: rearCameraOptions[(index + 3) % rearCameraOptions.length],
    frontCameraMp: frontCameraOptions[(index + 4) % frontCameraOptions.length],
    batteryMah: batteryOptions[(index + 5) % batteryOptions.length],
    processor: processors[(index + 6) % processors.length],
    warrantyMonths: 12,
  }
}

const stableOffers = (price, index) => {
  const exchangeOff = Math.min(25000, 5000 + ((index * 1250) % 22000))
  const bankOff = Math.min(4000, 500 + ((index * 250) % 3500))
  const assured = index % 2 === 0
  const discountCap = Math.min(40, 10 + ((index * 3) % 28))
  const discountPercent = discountCap
  const mrp = stableMrp(price, index)
  const finalMrp = Math.max(mrp, Math.round(price / (1 - discountPercent / 100) / 100) * 100)
  return { exchangeOff, bankOff, assured, discountPercent, mrp: finalMrp }
}

const brandMatchers = [
  { brand: 'Apple', keys: ['apple', 'iphone'] },
  { brand: 'Samsung', keys: ['samsung', 'galaxy'] },
  { brand: 'OnePlus', keys: ['oneplus'] },
  { brand: 'Xiaomi', keys: ['xiaomi', 'mi'] },
  { brand: 'Redmi', keys: ['redmi'] },
  { brand: 'Realme', keys: ['realme'] },
  { brand: 'Vivo', keys: ['vivo'] },
  { brand: 'OPPO', keys: ['oppo'] },
  { brand: 'Motorola', keys: ['moto', 'motorola'] },
  { brand: 'Nothing', keys: ['nothing'] },
  { brand: 'iQOO', keys: ['iqoo'] },
  { brand: 'POCO', keys: ['poco'] },
  { brand: 'Nokia', keys: ['nokia'] },
  { brand: 'Infinix', keys: ['infinix'] },
]

const detectBrand = (filename, index) => {
  const lower = filename.toLowerCase()
  for (const m of brandMatchers) {
    if (m.keys.some((k) => lower.includes(k))) return m.brand
  }
  return brandMatchers[index % brandMatchers.length].brand
}

const excludedBaseNames = new Set([
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

const isLikelyPhoneImage = (filename) => {
  const base = filename.replace(/\.[^.]+$/, '').trim().toLowerCase()
  if (!base) return false
  if (excludedBaseNames.has(base)) return false
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

const imageModules = () => {
  return import.meta.glob('../assets/**/*.{png,jpg,jpeg,webp,gif}', { eager: true, import: 'default' })
}

export const buildMobileProductsFromAssets = () => {
  const modules = imageModules()
  const entries = Object.entries(modules)
    .filter(([path]) => {
      const filename = path.split('/').pop() || ''
      return isLikelyPhoneImage(filename)
    })
    .sort(([a], [b]) => a.localeCompare(b))

  if (entries.length === 0) {
    const fallback = buildDefaultProductsFromAssets()
    return fallback.slice(0, 24).map((p, index) => ({
      ...p,
      _id: `mobile-fallback-${index + 1}`,
      category: 'Mobiles',
      subCategory: detectBrand(p.name || `mobile-${index}`, index),
      name: `${detectBrand(p.name || `mobile-${index}`, index)} ${p.name || `Phone ${index + 1}`}`.trim(),
      price: stableMobilePrice(index),
      mrp: stableMrp(stableMobilePrice(index), index),
      offers: stableOffers(stableMobilePrice(index), index),
      specs: stableSpecs(index),
      sizes: ['128GB', '256GB'],
      description:
        'High-performance smartphone with premium display, fast charging, and camera features. Hand-picked as a mobile category item.',
      isMobile: true,
    }))
  }

  return entries.map(([path, src], index) => {
    const filename = path.split('/').pop() || `mobile-${index + 1}.png`
    const brand = detectBrand(filename, index)
    const name = cleanName(filename)
      .replace(new RegExp(`^${brand}\\s+`, 'i'), '')
      .replace(new RegExp(`\\b${brand}\\b`, 'ig'), '')
      .trim()

    const model = name ? name : `Smartphone ${index + 1}`
    const price = stableMobilePrice(index)
    const offers = stableOffers(price, index)

    return {
      _id: `mobile-${index + 1}`,
      name: `${brand} ${model}`.trim(),
      description:
        'Premium smartphone with powerful performance, crisp display, and long-lasting battery. Best for daily use and gaming.',
      price,
      mrp: offers.mrp,
      image: [src || DEFAULT_PLACEHOLDER_IMAGE],
      category: 'Mobiles',
      subCategory: brand,
      sizes: ['128GB', '256GB'],
      date: Date.now() - index * 12 * 60 * 60 * 1000,
      bestseller: stableRating(index) >= 4.6,
      rating: stableRating(index),
      reviews: stableReviewCount(index),
      offers,
      specs: stableSpecs(index),
      isMobile: true,
      recentlyAdded: index < 8,
    }
  })
}

export const groupMobilesByBrand = (products) => {
  const map = new Map()
  for (const p of products) {
    const brand = p?.subCategory || 'Others'
    if (!map.has(brand)) map.set(brand, [])
    map.get(brand).push(p)
  }
  return Array.from(map.entries()).map(([brand, items]) => ({
    brand,
    items,
  }))
}
