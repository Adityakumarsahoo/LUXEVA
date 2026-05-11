import { DEFAULT_PLACEHOLDER_IMAGE } from './defaultProducts'

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

const stablePrice = (seed) => {
  const base = 99 + (seed * 113) % 15000
  const rounded = Math.round(base / 10) * 10
  return clamp(rounded, 99, 14999)
}

const stableRating = (seed) => {
  const rating = 3.8 + ((seed * 17) % 12) / 10
  return clamp(Number(rating.toFixed(1)), 3.7, 4.9)
}

const stableReviews = (seed) => 40 + ((seed * 53) % 8000)

const encodeSvg = (svg) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)
    .replace(/%0A/g, '')
    .replace(/%20/g, ' ')}`

const lifestyleSvg = ({ title, accentA, accentB, glyph }) =>
  encodeSvg(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125" viewBox="0 0 900 1125">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accentA}"/>
      <stop offset="1" stop-color="${accentB}"/>
    </linearGradient>
  </defs>
  <rect width="900" height="1125" fill="url(#g)"/>
  <circle cx="450" cy="450" r="300" fill="rgba(255,255,255,0.1)"/>
  <text x="450" y="580" text-anchor="middle" font-family="Inter,Arial" font-size="200" fill="rgba(255,255,255,0.8)">${glyph}</text>
  <rect x="200" y="800" rx="30" ry="30" width="500" height="100" fill="#fff"/>
  <text x="450" y="865" text-anchor="middle" font-family="Inter,Arial" font-size="40" fill="#000" font-weight="900">${title}</text>
</svg>`)

const sections = [
  { key: 'sports', label: 'Sports', glyph: '⚽', colors: ['#0EA5E9', '#2563EB'] },
  { key: 'gym', label: 'Gym', glyph: '🏋️', colors: ['#111827', '#4B5563'] },
  { key: 'books', label: 'Books', glyph: '📚', colors: ['#F59E0B', '#D97706'] },
  { key: 'toys', label: 'Toys', glyph: '🧸', colors: ['#EC4899', '#D946EF'] },
  { key: 'gaming', label: 'Gaming', glyph: '🎮', colors: ['#8B5CF6', '#7C3AED'] },
]

const nameSets = {
  sports: ['Football Pro', 'Cricket Bat', 'Tennis Racket', 'Running Shoes'],
  gym: ['Dumbbell Set', 'Yoga Mat', 'Resistance Band', 'Protein Shaker'],
  books: ['The Great Gatsby', 'Clean Code', 'Rich Dad Poor Dad', 'Atomic Habits'],
  toys: ['LEGO Classic', 'Barbie Doll', 'Hot Wheels Pack', 'Soft Teddy'],
  gaming: ['PS5 Controller', 'Gaming Mouse', 'RGB Keyboard', 'Headset Pro'],
}

export const buildLifestyleCatalog = () => {
  const products = []
  let seed = 1

  for (const sec of sections) {
    const names = nameSets[sec.key] || []
    for (let i = 0; i < 10; i += 1) {
      const name = `${names[i % names.length]} - ${i + 1}`
      const price = stablePrice(seed)
      const rating = stableRating(seed)
      const [a, b] = sec.colors

      products.push({
        _id: `life-${sec.key}-${i + 1}`,
        name,
        description: 'High-quality lifestyle product designed for everyday use and performance.',
        price,
        image: [lifestyleSvg({ title: sec.label, accentA: a, accentB: b, glyph: sec.glyph })],
        category: 'Lifestyle',
        subCategory: sec.label,
        sizes: ['Standard'],
        bestseller: rating >= 4.5,
        date: Date.now() - seed * 100000,
        rating,
        reviews: stableReviews(seed),
        isDefault: true,
      })
      seed++
    }
  }
  return products
}
