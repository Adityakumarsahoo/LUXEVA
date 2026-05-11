import { DEFAULT_PLACEHOLDER_IMAGE } from './defaultProducts'

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

const stablePrice = (seed) => {
  const base = 299 + (seed * 97) % 24000
  const rounded = Math.round(base / 50) * 50
  return clamp(rounded, 149, 59999)
}

const stableRating = (seed) => {
  const rating = 3.8 + ((seed * 11) % 12) / 10
  return clamp(Number(rating.toFixed(1)), 3.7, 4.9)
}

const stableReviews = (seed) => 90 + ((seed * 41) % 15000)

const encodeSvg = (svg) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)
    .replace(/%0A/g, '')
    .replace(/%20/g, ' ')}`

const decorSvg = ({ title, accentA, accentB, glyph }) =>
  encodeSvg(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125" viewBox="0 0 900 1125">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accentA}"/>
      <stop offset="1" stop-color="${accentB}"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="#000" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="900" height="1125" fill="url(#g)"/>
  <circle cx="150" cy="170" r="120" fill="rgba(255,255,255,0.22)"/>
  <circle cx="820" cy="220" r="170" fill="rgba(255,255,255,0.14)"/>
  <circle cx="720" cy="980" r="230" fill="rgba(255,255,255,0.12)"/>
  <g filter="url(#s)">
    <rect x="120" y="240" rx="54" ry="54" width="660" height="720" fill="rgba(255,255,255,0.86)"/>
    <rect x="190" y="320" rx="30" ry="30" width="520" height="440" fill="rgba(255,255,255,0.55)"/>
    <text x="450" y="560" text-anchor="middle" font-family="Inter,Segoe UI,Arial" font-size="160" fill="rgba(15,23,42,0.82)" font-weight="700">${glyph}</text>
    <rect x="230" y="820" rx="24" ry="24" width="440" height="82" fill="rgba(15,23,42,0.90)"/>
    <text x="450" y="872" text-anchor="middle" font-family="Inter,Segoe UI,Arial" font-size="30" fill="#fff" font-weight="650">${title}</text>
  </g>
</svg>`)

const sections = [
  { key: 'bedsheets', label: 'Bedsheets', glyph: '▦', colors: ['#60A5FA', '#A78BFA'] },
  { key: 'furnishing', label: 'Furnishing', glyph: '▤', colors: ['#F59E0B', '#F97316'] },
  { key: 'insect-killer', label: 'Insect killer', glyph: '✦', colors: ['#111827', '#38BDF8'] },
  { key: 'bath-linen', label: 'Bath linen', glyph: '▥', colors: ['#22C55E', '#A7F3D0'] },
  { key: 'containers', label: 'Containers', glyph: '▣', colors: ['#06B6D4', '#3B82F6'] },
  { key: 'cleaning', label: 'Cleaning', glyph: '⟡', colors: ['#94A3B8', '#E2E8F0'] },
  { key: 'pooja', label: 'Pooja needs', glyph: '✺', colors: ['#F43F5E', '#F59E0B'] },
  { key: 'wallpaper', label: 'Wallpaper', glyph: '▧', colors: ['#A78BFA', '#EC4899'] },
  { key: 'furniture', label: 'Furniture', glyph: '▭', colors: ['#0F172A', '#64748B'] },
  { key: 'bulbs', label: 'Bulbs', glyph: '☼', colors: ['#FBBF24', '#F97316'] },
  { key: 'sofas', label: 'Sofas', glyph: '▯', colors: ['#334155', '#60A5FA'] },
  { key: 'mosquito', label: 'Mosquito nets', glyph: '⌁', colors: ['#0EA5E9', '#22C55E'] },
  { key: 'dining', label: 'Dining', glyph: '◍', colors: ['#111827', '#A78BFA'] },
  { key: 'drinkware', label: 'Drinkware', glyph: '◌', colors: ['#06B6D4', '#A7F3D0'] },
  { key: 'cookware', label: 'Cookware', glyph: '◈', colors: ['#F97316', '#FCA5A5'] },
  { key: 'decor', label: 'Decor', glyph: '✶', colors: ['#8B5CF6', '#EC4899'] },
]

const nameSets = {
  bedsheets: ['Cotton Bedsheet', 'King Bedsheet', 'Printed Bedsheet', 'Microfiber Bedsheet'],
  furnishing: ['Curtains', 'Cushion Covers', 'Door Mat', 'Table Runner'],
  'insect-killer': ['Mosquito Killer Lamp', 'Insect Killer Bat', 'Repellent Refill', 'Electric Diffuser'],
  'bath-linen': ['Bath Towel Set', 'Hand Towels', 'Bath Mat', 'Cotton Robe'],
  containers: ['Storage Box Set', 'Airtight Jars', 'Lunch Box', 'Fridge Container'],
  cleaning: ['Mop & Bucket', 'Microfiber Cloths', 'Scrubber Set', 'Cleaning Spray'],
  pooja: ['Pooja Thali', 'Brass Diya', 'Incense Sticks', 'Festive Toran'],
  wallpaper: ['Peel & Stick Wallpaper', 'Wall Sticker Set', '3D Panel', 'Texture Roll'],
  furniture: ['Study Table', 'Office Chair', 'Shoe Rack', 'Side Table'],
  bulbs: ['LED Bulb Pack', 'Smart Bulb', 'String Lights', 'Night Lamp'],
  sofas: ['Sofa Cover', 'Cushion Set', 'Throw Blanket', 'Floor Seating'],
  mosquito: ['Mosquito Net', 'Window Mesh', 'Repellent Kit', 'Bed Canopy'],
  dining: ['Dinner Set', 'Serving Tray', 'Cutlery Set', 'Placemats'],
  drinkware: ['Water Bottle', 'Steel Tumbler', 'Coffee Mug', 'Glass Set'],
  cookware: ['Non-stick Pan', 'Pressure Cooker', 'Kadai', 'Cookware Set'],
  decor: ['Vase Set', 'Wall Art', 'Clock', 'Indoor Planter'],
}

export const homeDecorSections = sections.map((s) => ({ key: s.key, label: s.label }))

export const buildHomeDecorCatalog = () => {
  const products = []
  let seed = 1

  for (const sec of sections) {
    const names = nameSets[sec.key] || []
    for (let i = 0; i < 12; i += 1) {
      const title = names[i % names.length] || `${sec.label} Item ${i + 1}`
      const price = stablePrice(seed)
      const rating = stableRating(seed)
      const [a, b] = sec.colors

      products.push({
        _id: `home-${sec.key}-${i + 1}`,
        name: `${title}`,
        description: 'Home & decor product with stylish look, daily utility, and premium storefront design.',
        price,
        image: [decorSvg({ title: sec.label, accentA: a, accentB: b, glyph: sec.glyph }) || DEFAULT_PLACEHOLDER_IMAGE],
        category: 'Home',
        subCategory: sec.label,
        sizes: ['Standard'],
        date: Date.now() - seed * 3.5 * 60 * 60 * 1000,
        bestseller: rating >= 4.6 || i === 0,
        rating,
        reviews: stableReviews(seed),
        isHomeDecor: true,
        recentlyAdded: seed < 16,
      })

      seed += 1
    }
  }

  return products
}

