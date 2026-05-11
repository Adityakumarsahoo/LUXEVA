import { DEFAULT_PLACEHOLDER_IMAGE } from './defaultProducts'

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

const stablePrice = (seed) => {
  const base = 199 + (seed * 83) % 2400
  const rounded = Math.round(base / 10) * 10
  return clamp(rounded, 149, 3999)
}

const stableRating = (seed) => {
  const rating = 3.9 + ((seed * 11) % 11) / 10
  return clamp(Number(rating.toFixed(1)), 3.8, 4.9)
}

const stableReviews = (seed) => 80 + ((seed * 29) % 3200)

const encodeSvg = (svg) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)
    .replace(/%0A/g, '')
    .replace(/%20/g, ' ')}`

const beautySvg = ({ title, accentA, accentB }) =>
  encodeSvg(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125" viewBox="0 0 900 1125">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accentA}"/>
      <stop offset="1" stop-color="${accentB}"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="30" flood-color="#000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="900" height="1125" fill="url(#g)"/>
  <circle cx="120" cy="140" r="90" fill="rgba(255,255,255,0.25)"/>
  <circle cx="800" cy="220" r="140" fill="rgba(255,255,255,0.18)"/>
  <circle cx="730" cy="1020" r="190" fill="rgba(255,255,255,0.14)"/>
  <g filter="url(#s)">
    <rect x="120" y="250" rx="44" ry="44" width="660" height="700" fill="rgba(255,255,255,0.85)"/>
    <rect x="190" y="340" rx="26" ry="26" width="520" height="460" fill="rgba(255,255,255,0.55)"/>
    <rect x="230" y="860" rx="24" ry="24" width="440" height="74" fill="rgba(15,23,42,0.88)"/>
    <text x="450" y="910" text-anchor="middle" font-family="Inter,Segoe UI,Arial" font-size="30" fill="#fff" font-weight="600">${title}</text>
  </g>
</svg>`)

const brandPalettes = {
  CeraVe: ['#60A5FA', '#93C5FD'],
  'The Ordinary': ['#111827', '#6B7280'],
  Mamaearth: ['#22C55E', '#A7F3D0'],
  Lakme: ['#F472B6', '#FBCFE8'],
  Nivea: ['#2563EB', '#93C5FD'],
  Neutrogena: ['#0F172A', '#38BDF8'],
  Dove: ['#F59E0B', '#FDE68A'],
  'Plum Goodness': ['#A855F7', '#DDD6FE'],
}

const sections = [
  { key: 'skin-care', label: 'Skin Care', brands: ['CeraVe', 'The Ordinary', 'Neutrogena', 'Nivea'] },
  { key: 'top-deals', label: 'Top 25 deals', brands: ['Lakme', 'Nivea', 'Dove', 'Mamaearth'] },
  { key: 'hair-care', label: 'Hair Care', brands: ['Dove', 'Mamaearth', 'Plum Goodness'] },
  { key: 'makeup', label: 'Makeup', brands: ['Lakme', 'Plum Goodness'] },
  { key: 'premium', label: 'Premium', brands: ['The Ordinary', 'CeraVe', 'Neutrogena'] },
  { key: 'fragrances', label: 'Fragrances', brands: ['The Ordinary', 'Nivea'] },
  { key: 'derma', label: 'Derma', brands: ['CeraVe', 'Neutrogena'] },
  { key: 'mens-grooming', label: "Men's Grooming", brands: ['Nivea', 'Dove'] },
  { key: 'personal-care', label: 'Personal Care', brands: ['Dove', 'Nivea', 'Mamaearth'] },
  { key: 'k-beauty', label: 'K-beauty', brands: ['Plum Goodness', 'The Ordinary'] },
]

const productNames = {
  'skin-care': ['Hydrating Cleanser', 'Moisturizing Lotion', 'Vitamin C Serum', 'Sunscreen SPF 50'],
  'top-deals': ['Combo Pack', 'Daily Essentials Kit', 'Mini Starter Set', 'Value Pack'],
  'hair-care': ['Repair Shampoo', 'Keratin Conditioner', 'Hair Mask', 'Anti-Hairfall Oil'],
  makeup: ['Matte Lipstick', 'Glow Primer', 'Compact Powder', 'Kajal Eyeliner'],
  premium: ['Advanced Serum', 'Barrier Repair Cream', 'Retinol Night Cream', 'Brightening Kit'],
  fragrances: ['Fresh Mist', 'Eau de Parfum', 'Body Spray', 'Perfume Roll-on'],
  derma: ['Gentle Cleanser', 'Acne Care Gel', 'Barrier Moisturizer', 'SPF Dermatology Sunscreen'],
  'mens-grooming': ['Face Wash', 'After Shave Gel', 'Beard Oil', 'Deodorant'],
  'personal-care': ['Body Wash', 'Hand Cream', 'Body Lotion', 'Lip Balm'],
  'k-beauty': ['Glass Skin Toner', 'Hydra Essence', 'Glow Serum', 'Soothing Gel'],
}

export const buildBeautyProductsCatalog = () => {
  const products = []
  let seed = 1

  for (const sec of sections) {
    const names = productNames[sec.key] || []
    for (let i = 0; i < 10; i += 1) {
      const brand = sec.brands[(i + seed) % sec.brands.length]
      const [a, b] = brandPalettes[brand] || ['#CBD5E1', '#F1F5F9']
      const name = `${brand} ${names[i % names.length] || `Beauty Product ${i + 1}`}`
      const price = stablePrice(seed)
      const rating = stableRating(seed)

      products.push({
        _id: `beauty-${sec.key}-${i + 1}`,
        name,
        description:
          'Premium beauty product with dermatologist-inspired formula, gentle ingredients, and daily-use performance. Curated for a production-like shopping experience.',
        price,
        image: [beautySvg({ title: brand, accentA: a, accentB: b }) || DEFAULT_PLACEHOLDER_IMAGE],
        category: 'Beauty',
        subCategory: sec.label,
        sizes: ['50ml', '100ml', '200ml'],
        date: Date.now() - seed * 6 * 60 * 60 * 1000,
        bestseller: rating >= 4.6 || i === 0,
        rating,
        reviews: stableReviews(seed),
        isBeauty: true,
        recentlyAdded: seed < 12,
      })

      seed += 1
    }
  }

  return products
}

export const beautySections = sections.map((s) => ({ key: s.key, label: s.label }))
