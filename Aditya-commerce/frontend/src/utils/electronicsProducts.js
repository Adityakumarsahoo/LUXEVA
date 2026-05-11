import { DEFAULT_PLACEHOLDER_IMAGE } from './defaultProducts'

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

const stablePrice = (seed) => {
  const base = 799 + (seed * 131) % 82000
  const rounded = Math.round(base / 100) * 100
  return clamp(rounded, 499, 199999)
}

const stableRating = (seed) => {
  const rating = 3.9 + ((seed * 13) % 11) / 10
  return clamp(Number(rating.toFixed(1)), 3.8, 4.9)
}

const stableReviews = (seed) => 120 + ((seed * 37) % 12000)

const encodeSvg = (svg) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)
    .replace(/%0A/g, '')
    .replace(/%20/g, ' ')}`

const electronicsSvg = ({ title, accentA, accentB, glyph }) =>
  encodeSvg(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125" viewBox="0 0 900 1125">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accentA}"/>
      <stop offset="1" stop-color="${accentB}"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="#000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="900" height="1125" fill="url(#g)"/>
  <circle cx="120" cy="160" r="110" fill="rgba(255,255,255,0.20)"/>
  <circle cx="820" cy="220" r="160" fill="rgba(255,255,255,0.14)"/>
  <circle cx="720" cy="980" r="220" fill="rgba(255,255,255,0.12)"/>
  <g filter="url(#s)">
    <rect x="120" y="240" rx="54" ry="54" width="660" height="720" fill="rgba(255,255,255,0.86)"/>
    <rect x="190" y="320" rx="30" ry="30" width="520" height="440" fill="rgba(255,255,255,0.55)"/>
    <text x="450" y="560" text-anchor="middle" font-family="Inter,Segoe UI,Arial" font-size="160" fill="rgba(15,23,42,0.85)" font-weight="700">${glyph}</text>
    <rect x="230" y="820" rx="24" ry="24" width="440" height="82" fill="rgba(15,23,42,0.90)"/>
    <text x="450" y="872" text-anchor="middle" font-family="Inter,Segoe UI,Arial" font-size="30" fill="#fff" font-weight="650">${title}</text>
  </g>
</svg>`)

const sections = [
  { key: 'new-launches', label: 'New launches', glyph: '▲', colors: ['#8B5CF6', '#EC4899'] },
  { key: 'headsets', label: 'Headsets', glyph: '♪', colors: ['#06B6D4', '#3B82F6'] },
  { key: 'wearables', label: 'Wearables', glyph: '⌚', colors: ['#22C55E', '#A7F3D0'] },
  { key: 'pet-tech', label: 'Pet Tech', glyph: '🐾', colors: ['#F43F5E', '#F59E0B'] },
  { key: 'grooming', label: 'Grooming', glyph: '✂', colors: ['#F97316', '#FBBF24'] },
  { key: 'mobile-cover', label: 'Mobile Cover', glyph: '▣', colors: ['#60A5FA', '#A78BFA'] },
  { key: 'accessories', label: 'Accessories', glyph: '⟡', colors: ['#0EA5E9', '#22C55E'] },
  { key: 'power-banks', label: 'Power Banks', glyph: '⚡', colors: ['#10B981', '#34D399'] },
  { key: 'gaming', label: 'Gaming', glyph: '◎', colors: ['#111827', '#6366F1'] },
  { key: 'health-care', label: 'Health care', glyph: '✚', colors: ['#EF4444', '#FCA5A5'] },
  { key: 'networking', label: 'Networking', glyph: '⌁', colors: ['#334155', '#38BDF8'] },
  { key: 'laptops', label: 'Laptops', glyph: '▭', colors: ['#0F172A', '#3B82F6'] },
  { key: 'tablets', label: 'Tablets', glyph: '▯', colors: ['#111827', '#F59E0B'] },
  { key: 'it-peripherals', label: 'IT Peripherals', glyph: '⌨', colors: ['#1F2937', '#93C5FD'] },
  { key: 'camera', label: 'Camera', glyph: '◉', colors: ['#0F172A', '#94A3B8'] },
  { key: 'data-storage', label: 'Data Storage', glyph: '▣', colors: ['#0EA5E9', '#A78BFA'] },
  { key: 'smart-devices', label: 'Smart device', glyph: '⦿', colors: ['#06B6D4', '#A7F3D0'] },
  { key: 'speakers', label: 'Speakers', glyph: '⟲', colors: ['#F43F5E', '#F97316'] },
  { key: 'gaming-hub', label: 'Gaming Hub', glyph: '◍', colors: ['#111827', '#22C55E'] },
]

const nameSets = {
  'new-launches': ['AI Smart TV', 'Ultra Laptop', '5G Router', 'Flagship Earbuds'],
  headsets: ['Wireless Earbuds', 'ANC Headphones', 'Gaming Headset', 'Neckband'],
  wearables: ['Smartwatch', 'Fitness Band', 'GPS Watch', 'Smart Ring'],
  'pet-tech': ['Smart Pet Feeder', 'Pet Camera', 'GPS Pet Tracker', 'Auto Water Fountain'],
  grooming: ['Trimmer', 'Hair Dryer', 'Shaver', 'Styler'],
  'mobile-cover': ['Shockproof Case', 'Silicone Cover', 'Flip Cover', 'MagSafe Case'],
  accessories: ['USB-C Cable', 'Fast Charger', 'Adapter', 'Hub'],
  'power-banks': ['20,000 mAh Power Bank', 'MagSafe Power Bank', 'Compact Power Bank', 'Fast Power Bank'],
  gaming: ['Controller', 'Gaming Mouse', 'Mechanical Keyboard', 'Gaming Chair'],
  'health-care': ['Smart Weighing Scale', 'Digital Thermometer', 'BP Monitor', 'Pulse Oximeter'],
  networking: ['Wi‑Fi 6 Router', 'Mesh System', 'Range Extender', 'Network Switch'],
  laptops: ['Creator Laptop', 'Gaming Laptop', 'Ultrabook', 'Student Laptop'],
  tablets: ['Entertainment Tablet', 'Note Tablet', 'Kids Tablet', 'Pro Tablet'],
  'it-peripherals': ['Keyboard', 'Mouse', 'Webcam', 'Monitor'],
  camera: ['Mirrorless Camera', 'Action Cam', 'Tripod Kit', 'Lens'],
  'data-storage': ['SSD 1TB', 'HDD 2TB', 'Pen Drive', 'Memory Card'],
  'smart-devices': ['Smart Bulb', 'Smart Plug', 'Smart Speaker', 'Smart Camera'],
  speakers: ['Bluetooth Speaker', 'Soundbar', 'Party Speaker', 'Studio Monitor'],
  'gaming-hub': ['Console Bundle', 'Racing Wheel', 'VR Headset', 'Streaming Gear'],
}

export const electronicsSections = sections.map((s) => ({ key: s.key, label: s.label }))

export const buildElectronicsCatalog = () => {
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
        _id: `electronics-${sec.key}-${i + 1}`,
        name: `${title}`,
        description:
          'Premium electronics product with reliable performance, modern design, and smart features. Curated for a production-like storefront experience.',
        price,
        image: [electronicsSvg({ title: sec.label, accentA: a, accentB: b, glyph: sec.glyph }) || DEFAULT_PLACEHOLDER_IMAGE],
        category: 'Electronics',
        subCategory: sec.label,
        sizes: ['Standard'],
        date: Date.now() - seed * 4 * 60 * 60 * 1000,
        bestseller: rating >= 4.6 || i === 0,
        rating,
        reviews: stableReviews(seed),
        isElectronics: true,
        recentlyAdded: seed < 16,
      })

      seed += 1
    }
  }

  return products
}
