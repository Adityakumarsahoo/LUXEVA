import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import HorizontalCarousel from '../components/HorizontalCarousel'
import ProductCard from '../components/ProductCard'
import ProductItem from '../components/ProductItem'
import SectionHeader from '../components/SectionHeader'
import BeautyListItem from '../components/BeautyListItem'
import { ShopContext } from '../context/ShopContext'
import { buildBeautyProductsCatalog } from '../utils/beautyProducts'
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/defaultProducts'
import { buildCategoryFallbackProducts, categories, categorySlugs, isKnownCategory, normalizeCategorySlug as normalizeGeneral } from '../data/categories'
import { beautySubcategories, buildBeautyAssetsCatalog } from '../utils/beautyAssetsProducts'

const beautyCategoryList = [
  'skincare',
  'top-deals',
  'haircare',
  'mens-grooming',
  'makeup',
  'premium',
  'fragrances',
  'derma',
  'personal-care',
  'beauty',
]

const categoryMeta = {
  skincare: { title: 'Skincare', subtitle: 'Cleanser • Serum • Moisturizer', a: '#EC4899', b: '#A855F7', icon: '✨' },
  'top-deals': { title: 'Top 25 Deals', subtitle: 'Value packs • Best sellers', a: '#F59E0B', b: '#F97316', icon: '🏷️' },
  haircare: { title: 'Hair Care', subtitle: 'Shampoo • Conditioner • Mask', a: '#22C55E', b: '#14B8A6', icon: '🫧' },
  'mens-grooming': { title: "Men's Grooming", subtitle: 'Face wash • Deo • Beard care', a: '#0F172A', b: '#3B82F6', icon: '🧔' },
  makeup: { title: 'Makeup', subtitle: 'Lipstick • Kajal • Primer', a: '#F43F5E', b: '#FB7185', icon: '💄' },
  premium: { title: 'Premium', subtitle: 'Dermat-inspired • Advanced care', a: '#111827', b: '#6B7280', icon: '👑' },
  fragrances: { title: 'Fragrances', subtitle: 'Mists • Perfumes • Deos', a: '#06B6D4', b: '#3B82F6', icon: '🌸' },
  derma: { title: 'Derma', subtitle: 'Barrier • Acne care • SPF', a: '#0EA5E9', b: '#22C55E', icon: '🧴' },
  'personal-care': { title: 'Personal Care', subtitle: 'Body care • Hand care • Daily use', a: '#A78BFA', b: '#EC4899', icon: '🧼' },
  beauty: { title: 'Beauty', subtitle: 'All categories • Trending picks', a: '#1D4ED8', b: '#60A5FA', icon: '🛍️' },
}

const slugToBeautyKey = {
  skincare: 'skin-care',
  'top-deals': 'top-deals',
  haircare: 'hair-care',
  'mens-grooming': 'mens-grooming',
  makeup: 'makeup',
  premium: 'premium',
  fragrances: 'fragrances',
  derma: 'derma',
  'personal-care': 'personal-care',
  beauty: 'beauty',
  'beauty-care': 'beauty',
}

const beautyKeyToLabel = {
  'skin-care': 'Skin Care',
  'top-deals': 'Top 25 deals',
  'hair-care': 'Hair Care',
  makeup: 'Makeup',
  premium: 'Premium',
  fragrances: 'Fragrances',
  derma: 'Derma',
  'mens-grooming': "Men's Grooming",
  'personal-care': 'Personal Care',
  beauty: 'Beauty',
}

const knownBrands = ['CeraVe', 'The Ordinary', 'Mamaearth', 'Lakme', 'Nivea', 'Neutrogena', 'Dove', 'Plum Goodness']

const titleCase = (slug) =>
  String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const parseBrand = (name) => {
  const str = String(name || '').trim()
  if (!str) return 'Other'
  const direct = knownBrands.find((b) => str.toLowerCase().startsWith(b.toLowerCase()))
  if (direct) return direct
  return str.split(' ')[0] || 'Other'
}

const hashString = (s) => {
  let h = 0
  const str = String(s || '')
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

const assetImageModules = import.meta.glob('/src/assets/images/*.{png,jpg,jpeg,webp}', { eager: true })
const fallbackImageModules = import.meta.glob('/src/assets/*.{png,jpg,jpeg,webp}', { eager: true })

const getImagePool = () => {
  const pickUrl = (m) => (m && typeof m === 'object' && 'default' in m ? m.default : null)
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

const categorySubfilters = {
  skincare: [
    { key: 'cleanser', label: 'Cleanser', match: ['cleanser', 'face wash'] },
    { key: 'serum', label: 'Serum', match: ['serum'] },
    { key: 'moisturizer', label: 'Moisturizer', match: ['moistur', 'lotion', 'cream'] },
    { key: 'sunscreen', label: 'Sunscreen', match: ['spf', 'sunscreen'] },
  ],
  haircare: [
    { key: 'shampoo', label: 'Shampoo', match: ['shampoo'] },
    { key: 'conditioner', label: 'Conditioner', match: ['conditioner'] },
    { key: 'mask', label: 'Mask', match: ['mask'] },
    { key: 'oil', label: 'Oil', match: ['oil'] },
  ],
  makeup: [
    { key: 'lipstick', label: 'Lip', match: ['lip', 'lipstick', 'balm'] },
    { key: 'kajal', label: 'Kajal', match: ['kajal', 'eyeliner'] },
    { key: 'primer', label: 'Primer', match: ['primer'] },
    { key: 'powder', label: 'Powder', match: ['powder', 'compact'] },
  ],
  fragrances: [
    { key: 'mist', label: 'Mist', match: ['mist'] },
    { key: 'perfume', label: 'Perfume', match: ['parfum', 'perfume'] },
    { key: 'spray', label: 'Spray', match: ['spray'] },
    { key: 'rollon', label: 'Roll-on', match: ['roll'] },
  ],
  default: [
    { key: 'bestsellers', label: 'Bestsellers', match: ['kit', 'value', 'combo'] },
    { key: 'daily', label: 'Daily Use', match: ['daily', 'gentle'] },
    { key: 'hydration', label: 'Hydration', match: ['hydra', 'moistur'] },
    { key: 'glow', label: 'Glow', match: ['glow', 'bright'] },
  ],
}

const normalizeCategorySlug = (raw) => {
  const v = normalizeGeneral(raw)
  if (v === 'skin-care') return 'skincare'
  if (v === 'hair-care') return 'haircare'
  if (v === 'top-25-deals') return 'top-deals'
  if (v === 'top25-deals') return 'top-deals'
  if (v === 'beauty-care') return 'beauty'
  return v
}

const computeDiscount = (productId, price) => {
  const h = hashString(productId)
  const pct = 10 + (h % 7) * 5
  const mrp = Math.round((Number(price || 0) / (1 - pct / 100)) / 10) * 10
  return { discountPercent: pct, mrp: Math.max(mrp, Number(price || 0) + 10) }
}

const CategoryNotFound = ({ slug }) => {
  const navigate = useNavigate()
  return (
    <div className='relative pt-6'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-white' />
      <div className='rounded-3xl border border-black/5 bg-white/80 p-7 shadow-sm backdrop-blur'>
        <div className='text-2xl font-bold text-slate-900'>Category Not Found</div>
        <div className='mt-2 text-sm font-semibold text-slate-600'>Invalid category: {slug || '-'}</div>
        <div className='mt-6 flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={() => navigate('/')}
            className='rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 active:scale-[0.99]'
          >
            Go Home
          </button>
          <Link
            to='/beauty'
            className='rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 active:scale-[0.99]'
          >
            Browse Beauty
          </Link>
        </div>
      </div>
    </div>
  )
}

const BeautyAssetsOnlyPage = () => {
  const navigate = useNavigate()
  const sectionsRef = React.useRef(new Map())
  const [activeSub, setActiveSub] = useState('all')

  const products = useMemo(() => buildBeautyAssetsCatalog(), [])

  const bySubcategory = useMemo(() => {
    const map = new Map()
    for (const sub of beautySubcategories) map.set(sub, [])
    for (const p of products) {
      const sub = p?.subCategory
      if (!map.has(sub)) map.set(sub, [])
      map.get(sub).push(p)
    }
    return map
  }, [products])

  const availableSubs = useMemo(() => {
    return beautySubcategories.filter((s) => (bySubcategory.get(s) || []).length > 0)
  }, [bySubcategory])

  const trending = useMemo(() => {
    return [...products].sort((a, b) => Number(b?.reviews || 0) - Number(a?.reviews || 0)).slice(0, 10)
  }, [products])

  const topRated = useMemo(() => {
    return [...products].sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0)).slice(0, 10)
  }, [products])

  const scrollTo = (key) => {
    setActiveSub(key)
    if (key === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const node = sectionsRef.current.get(key)
    if (!node) return
    const top = node.getBoundingClientRect().top + window.scrollY - 170
    window.scrollTo({ top, behavior: 'smooth' })
  }

  useEffect(() => {
    const onScroll = () => {
      if (!availableSubs.length) return
      let current = activeSub
      if ((window.scrollY || 0) < 260) current = 'all'
      for (const sub of availableSubs) {
        const node = sectionsRef.current.get(sub)
        if (!node) continue
        if (node.getBoundingClientRect().top <= 190) current = sub
      }
      if (current !== activeSub) setActiveSub(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [activeSub, availableSubs])

  if (!products.length) {
    return (
      <div className='relative pt-6'>
        <div className='pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-pink-50 via-white to-white' />
        <div className='rounded-3xl border border-black/5 bg-white/80 p-7 shadow-sm backdrop-blur'>
          <div className='text-2xl font-bold text-slate-900'>No Beauty Products Available</div>
          <div className='mt-2 text-sm font-semibold text-slate-600'>Add product images to src/assets/beauty and reload.</div>
          <div className='mt-6'>
            <button
              type='button'
              onClick={() => navigate('/')}
              className='rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 active:scale-[0.99]'
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='relative pt-6'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-pink-50 via-white to-white' />

      <div className='mb-4 text-sm text-slate-500'>
        <button onClick={() => navigate('/')} className='hover:text-slate-800 transition-colors'>
          Home
        </button>{' '}
        <span className='mx-1'>›</span> <span className='text-slate-700 font-medium'>Beauty</span>
      </div>

      <div className='rounded-3xl border border-black/5 bg-white/70 p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] backdrop-blur'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>Beauty Products</h1>
            <p className='text-sm text-slate-600'>
              Explore {products.length} beauty-only products, with Flipkart-style list view.
            </p>
          </div>
          <button
            onClick={() => navigate('/collection')}
            className='inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow hover:opacity-95 active:scale-[0.98]'
          >
            View All Products
          </button>
        </div>

        <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-semibold text-slate-800'>Sort By</span>
            <div className='flex flex-wrap gap-4'>
              {['Relevance', 'Popularity', 'Price -- Low to High', 'Price -- High to Low', 'Newest First'].map((label, idx) => (
                <button
                  key={label}
                  type='button'
                  className={`text-sm transition-all duration-300 ${
                    idx === 0 
                      ? 'font-semibold text-slate-900 underline underline-offset-[12px] decoration-2' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='mt-6 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          <button
            onClick={() => scrollTo('all')}
            className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
              activeSub === 'all'
                ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'border-black/10 bg-white text-slate-800 hover:bg-slate-50 hover:border-black/20'
            }`}
          >
            All
          </button>
          {availableSubs.map((s) => {
            const active = s === activeSub
            return (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                    : 'border-black/10 bg-white text-slate-800 hover:bg-slate-50 hover:border-black/20'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      <div className='mt-8 space-y-10'>
        {availableSubs.map((sub) => {
          const items = bySubcategory.get(sub) || []
          if (!items.length) return null
          return (
            <section
              key={sub}
              ref={(el) => {
                if (!el) return
                sectionsRef.current.set(sub, el)
              }}
              className='scroll-mt-40'
            >
              <div className='mb-4 flex items-end justify-between gap-3'>
                <SectionHeader title={sub} subtitle='Top picks, latest arrivals, and trending deals.' />
                <button
                  type='button'
                  onClick={() => navigate('/collection')}
                  className='hidden rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 sm:inline-flex'
                >
                  View More
                </button>
              </div>

              <div className='space-y-4'>
                {items.map((p) => (
                  <BeautyListItem key={p._id} product={p} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

const GeneralCategoryPage = ({ slug }) => {
  const navigate = useNavigate()
  const { products: allProducts } = useContext(ShopContext)
  const cfg = categories[slug]
  const theme = cfg?.theme
  const isDark = slug === 'two-wheeler'

  const bannerUrl = useMemo(() => cfg?.bannerUrl?.() || null, [cfg])

  const heroStyle = useMemo(() => {
    if (bannerUrl) {
      return {
        backgroundImage: `linear-gradient(135deg, ${theme?.a || '#0F172A'} 0%, ${theme?.b || '#3B82F6'} 100%), url(${bannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    return { background: `linear-gradient(135deg, ${theme?.a || '#0F172A'} 0%, ${theme?.b || '#3B82F6'} 100%)` }
  }, [bannerUrl, theme])

  const realProducts = useMemo(() => {
    const pool = Array.isArray(allProducts) ? allProducts : []
    const titleLower = String(cfg?.title || '').toLowerCase()
    return pool.filter((p) => {
      const cat = String(p?.category || '').toLowerCase()
      const tag = String(p?.categorySlug || '').toLowerCase()
      return tag === slug || cat === titleLower
    })
  }, [allProducts, cfg, slug])

  const baseProducts = useMemo(() => {
    if (realProducts.length) return realProducts
    return buildCategoryFallbackProducts(slug, 36)
  }, [realProducts, slug])

  const decoratedProducts = useMemo(() => {
    return baseProducts.map((p) => {
      const img = p?.image?.[0] || DEFAULT_PLACEHOLDER_IMAGE
      return { ...p, image: [img], categorySlug: slug }
    })
  }, [baseProducts, slug])

  const allTypes = useMemo(() => {
    const set = new Set()
    for (const p of decoratedProducts) set.add(String(p?.type || 'General'))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [decoratedProducts])

  const minPriceAll = useMemo(() => {
    let min = Infinity
    for (const p of decoratedProducts) min = Math.min(min, Number(p?.price || 0))
    return Number.isFinite(min) ? min : 0
  }, [decoratedProducts])

  const maxPriceAll = useMemo(() => {
    let max = 0
    for (const p of decoratedProducts) max = Math.max(max, Number(p?.price || 0))
    return max || 0
  }, [decoratedProducts])

  const [sortKey, setSortKey] = useState('popularity')
  const [minRating, setMinRating] = useState(0)
  const [typeSelected, setTypeSelected] = useState([])
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    setTypeSelected([])
    setSortKey('popularity')
    setMinRating(0)
    setMinPrice(minPriceAll)
    setMaxPrice(maxPriceAll)
    setLoading(true)
    const t = window.setTimeout(() => setLoading(false), 380)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return () => window.clearTimeout(t)
  }, [slug, minPriceAll, maxPriceAll])

  const filteredProducts = useMemo(() => {
    const selectedTypes = new Set(typeSelected)
    return decoratedProducts
      .filter((p) => {
        const price = Number(p?.price || 0)
        if (minPrice && price < minPrice) return false
        if (maxPrice && price > maxPrice) return false
        if (minRating && Number(p?.rating || 0) < minRating) return false
        if (selectedTypes.size && !selectedTypes.has(String(p?.type || 'General'))) return false
        return true
      })
      .sort((a, b) => {
        if (sortKey === 'price-asc') return Number(a?.price || 0) - Number(b?.price || 0)
        if (sortKey === 'price-desc') return Number(b?.price || 0) - Number(a?.price || 0)
        if (sortKey === 'new') return Number(b?.date || 0) - Number(a?.date || 0)
        return (Number(b?.reviews || 0) + Number(b?.rating || 0) * 100) - (Number(a?.reviews || 0) + Number(a?.rating || 0) * 100)
      })
  }, [decoratedProducts, typeSelected, minRating, minPrice, maxPrice, sortKey])

  const trending = useMemo(() => {
    return [...decoratedProducts].sort((a, b) => Number(b?.reviews || 0) - Number(a?.reviews || 0)).slice(0, 10)
  }, [decoratedProducts])

  const topDeals = useMemo(() => {
    return [...decoratedProducts].sort((a, b) => Number(b?.discountPercent || 0) - Number(a?.discountPercent || 0)).slice(0, 10)
  }, [decoratedProducts])

  const recommended = useMemo(() => {
    return [...decoratedProducts].sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0)).slice(0, 8)
  }, [decoratedProducts])

  const toggleType = (type) => {
    setTypeSelected((prev) => {
      const set = new Set(prev)
      if (set.has(type)) set.delete(type)
      else set.add(type)
      return Array.from(set)
    })
  }

  return (
    <div className={`relative pt-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className='pointer-events-none absolute inset-0 -z-10' style={{ background: `linear-gradient(180deg, ${theme?.surface || '#F8FAFC'} 0%, #ffffff 60%)` }} />

      <div className={`mb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
        <button onClick={() => navigate('/')} className={isDark ? 'hover:text-white' : 'hover:text-slate-800'}>
          Home
        </button>{' '}
        <span className='mx-1'>›</span> <span className={isDark ? 'text-white' : 'text-slate-700'}>{cfg?.title}</span>
      </div>

      <div className='mb-6 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-slate-900'>{cfg?.title}</h1>
            <p className='mt-1 text-sm text-slate-500'>Explore all available products in {cfg?.title}.</p>
          </div>
          <div className='rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700'>
            {filteredProducts.length} items found
          </div>
        </div>
      </div>

      <div className='relative overflow-hidden rounded-3xl p-6 sm:p-10 text-white shadow-sm ring-1 ring-black/5' style={heroStyle}>
        <div className='absolute inset-0 opacity-25'>
          <div className='absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/40 blur-2xl' />
          <div className='absolute right-10 top-12 h-56 w-56 rounded-full bg-white/30 blur-2xl' />
          <div className='absolute bottom-[-40px] left-1/3 h-64 w-64 rounded-full bg-white/20 blur-2xl' />
        </div>
        <div className='relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
          <div className='max-w-2xl'>
            <div className='text-xs font-semibold tracking-widest text-white/90'>CATEGORY</div>
            <div className='mt-2 text-3xl font-bold sm:text-4xl'>Explore {cfg?.title}</div>
            <div className='mt-2 text-sm text-white/90'>Trending picks, top deals, and premium products.</div>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-2xl ring-1 ring-white/25 backdrop-blur'>
              {cfg?.icon || '✨'}
            </div>
            <button
              type='button'
              onClick={() => navigate('/collection')}
              className='rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-white/95 active:scale-[0.99]'
            >
              Shop All
            </button>
          </div>
        </div>
      </div>

      <div className='mt-6 rounded-3xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur'>
        <div className='flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {categorySlugs.map((c) => {
            const isActive = c === slug
            const label = categories[c]?.title || titleCase(c)
            const icon = categories[c]?.icon || '✨'
            return (
              <Link
                key={c}
                to={`/category/${c}`}
                className={`flex-shrink-0 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
                  isActive 
                    ? 'text-white shadow-lg shadow-black/10' 
                    : 'bg-white text-slate-800 ring-1 ring-black/10 hover:bg-slate-50 hover:ring-black/20'
                }`}
                style={isActive ? { backgroundColor: theme?.chip || '#0F172A' } : undefined}
              >
                <span className='text-base'>{icon}</span>
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className='mt-7 grid grid-cols-1 gap-8 lg:grid-cols-12'>
        <aside className='lg:col-span-3'>
          <div className='sticky top-[70px] space-y-5'>
            <div className='rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur transition-all hover:shadow-md'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-xs font-bold tracking-widest text-slate-400 uppercase'>Filters</p>
                <button
                  type='button'
                  onClick={() => {
                    setTypeSelected([])
                    setMinRating(0)
                    setMinPrice(minPriceAll)
                    setMaxPrice(maxPriceAll)
                  }}
                  className='text-[11px] font-bold text-slate-900 hover:underline'
                >
                  Clear
                </button>
              </div>
              <p className='mt-3 text-sm text-slate-500'>Narrow results by price, rating, and product type.</p>
            </div>

            {/* Sort Section */}
            <div className='rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur transition-all hover:shadow-md'>
              <p className='mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase'>Sort By</p>
              <div className='relative'>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className='w-full appearance-none rounded-2xl border border-black/10 bg-white/50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none ring-offset-2 focus:ring-2 focus:ring-slate-900 transition-all'
                >
                  <option value='popularity'>Popularity</option>
                  <option value='new'>New arrivals</option>
                  <option value='price-asc'>Price low-high</option>
                  <option value='price-desc'>Price high-low</option>
                </select>
                <div className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold'>↓</div>
              </div>
            </div>

            {/* Price Filter */}
            <div className='rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur transition-all hover:shadow-md'>
              <div className='flex items-center justify-between mb-4'>
                <p className='text-xs font-bold tracking-widest text-slate-400 uppercase'>Price Range</p>
                <button
                  type='button'
                  onClick={() => {
                    setMinPrice(minPriceAll)
                    setMaxPrice(maxPriceAll)
                  }}
                  className='text-[11px] font-bold text-slate-900 hover:underline'
                >
                  Reset
                </button>
              </div>
              <div className='grid grid-cols-2 gap-3 mb-5'>
                <div className='rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5'>
                  <div className='text-[10px] font-bold text-slate-400 uppercase'>Min</div>
                  <div className='mt-0.5 text-sm font-bold text-slate-900'>₹{minPrice}</div>
                </div>
                <div className='rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5'>
                  <div className='text-[10px] font-bold text-slate-400 uppercase'>Max</div>
                  <div className='mt-0.5 text-sm font-bold text-slate-900'>₹{maxPrice}</div>
                </div>
              </div>
              <div className='space-y-4 px-1'>
                <input
                  type='range'
                  min={minPriceAll}
                  max={maxPriceAll}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                  className='w-full accent-slate-900 h-1.5'
                />
                <input
                  type='range'
                  min={minPriceAll}
                  max={maxPriceAll}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                  className='w-full accent-slate-900 h-1.5'
                />
              </div>
            </div>

            {/* Ratings Filter */}
            <div className='rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur transition-all hover:shadow-md'>
              <p className='mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase'>Ratings</p>
              <div className='grid grid-cols-2 gap-2.5'>
                {[0, 3.8, 4.2, 4.6].map((r) => {
                  const active = minRating === r
                  return (
                    <button
                      key={r}
                      type='button'
                      onClick={() => setMinRating(r)}
                      className={`rounded-2xl py-3 text-sm font-bold transition-all duration-300 active:scale-[0.98] ${
                        active 
                          ? 'text-white shadow-lg shadow-black/10' 
                          : 'bg-white text-slate-800 ring-1 ring-black/10 hover:bg-slate-50 hover:ring-black/20'
                      }`}
                      style={active ? { backgroundColor: theme?.chip || '#0F172A' } : undefined}
                    >
                      {r === 0 ? 'All' : `${r}+ ★`}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Type Filter */}
            <div className='rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur transition-all hover:shadow-md'>
              <div className='flex items-center justify-between mb-4'>
                <p className='text-xs font-bold tracking-widest text-slate-400 uppercase'>Type</p>
                <button
                  type='button'
                  onClick={() => setTypeSelected([])}
                  className='text-[11px] font-bold text-slate-900 hover:underline'
                >
                  Clear
                </button>
              </div>
              <div className='max-h-60 space-y-2 overflow-auto pr-2 custom-scrollbar'>
                {allTypes.map((t) => {
                  const checked = typeSelected.includes(t)
                  return (
                    <button
                      key={t}
                      type='button'
                      onClick={() => toggleType(t)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm font-bold transition-all duration-300 active:scale-[0.98] ${
                        checked 
                          ? 'text-white shadow-lg' 
                          : 'border-black/5 bg-white text-slate-900 hover:bg-slate-50 hover:border-black/20'
                      }`}
                      style={checked ? { backgroundColor: theme?.chip || '#0F172A', borderColor: theme?.chip || '#0F172A' } : undefined}
                    >
                      <span className='truncate'>{t}</span>
                      {checked && <span className='text-xs'>✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>

        <main className='lg:col-span-9'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <div className='rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur'>
              <SectionHeader title={`Trending in ${cfg?.title}`} subtitle='Popular picks with premium vibes.' />
              <div className='mt-4'>
                <HorizontalCarousel itemWidthClass='w-[260px]' showDots autoplayMs={3200}>
                  {trending.map((p) => (
                    <ProductCard key={p._id} product={p} theme={theme} />
                  ))}
                </HorizontalCarousel>
              </div>
            </div>
            <div className='rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur'>
              <SectionHeader title='Top Deals' subtitle='Big discounts and best value picks.' />
              <div className='mt-4'>
                <HorizontalCarousel itemWidthClass='w-[260px]' showDots autoplayMs={3400}>
                  {topDeals.map((p) => (
                    <ProductCard key={p._id} product={p} theme={theme} />
                  ))}
                </HorizontalCarousel>
              </div>
            </div>
          </div>

          <div className='mt-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader title={`${cfg?.title} Products`} subtitle='Modern grid, filters, hover effects, and smooth navigation.' />
            <div className='text-sm font-semibold text-slate-600'>{filteredProducts.length} items</div>
          </div>

          {loading ? (
            <div className='mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className='overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm'>
                  <div className='aspect-[4/5] animate-pulse bg-slate-100' />
                  <div className='space-y-3 p-4'>
                    <div className='h-4 w-4/5 animate-pulse rounded bg-slate-100' />
                    <div className='h-4 w-2/3 animate-pulse rounded bg-slate-100' />
                    <div className='h-9 w-full animate-pulse rounded-xl bg-slate-100' />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className='mt-5 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur'>
              <div className='text-lg font-bold text-slate-900'>No products found</div>
              <div className='mt-2 text-sm text-slate-600'>Try changing filters, or browse recommended items below.</div>
              <div className='mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
                {recommended.map((p) => (
                  <ProductCard key={p._id} product={p} theme={theme} />
                ))}
              </div>
            </div>
          ) : (
            <div className='mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
              {filteredProducts.map((p) => (
                <ProductCard key={p._id} product={p} theme={theme} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const BeautyCategoryPage = ({ slug }) => {
  const navigate = useNavigate()
  const { products: allProducts } = useContext(ShopContext)

  const activeSlug = slug
  const meta = categoryMeta[activeSlug] || { title: titleCase(activeSlug), subtitle: 'Explore premium picks', a: '#111827', b: '#3B82F6', icon: '✨' }

  const beautyKey = useMemo(() => slugToBeautyKey[activeSlug] || 'beauty', [activeSlug])
  const targetLabel = useMemo(() => (beautyKey === 'beauty' ? null : beautyKeyToLabel[beautyKey]), [beautyKey])

  const imagePool = useMemo(() => getImagePool(), [])

  const baseBeautyCatalog = useMemo(() => buildBeautyProductsCatalog(), [])

  const sourceBeautyProducts = useMemo(() => {
    const pool = Array.isArray(allProducts) && allProducts.length ? allProducts : baseBeautyCatalog
    return pool.filter((p) => p?.isBeauty || p?.category === 'Beauty')
  }, [allProducts, baseBeautyCatalog])

  const categoryProducts = useMemo(() => {
    if (beautyKey === 'beauty') return sourceBeautyProducts
    if (targetLabel) return sourceBeautyProducts.filter((p) => p?.subCategory === targetLabel)
    return sourceBeautyProducts
  }, [beautyKey, targetLabel, sourceBeautyProducts])

  const decoratedProducts = useMemo(() => {
    return categoryProducts.map((p) => {
      const { discountPercent, mrp } = computeDiscount(p?._id, p?.price)
      const img = Array.isArray(imagePool) && imagePool.length ? imagePool[hashString(p?._id) % imagePool.length] : null
      const safeImage = img || p?.image?.[0] || DEFAULT_PLACEHOLDER_IMAGE
      
      // Beauty specific marketing adjustments
      let finalPrice = Number(p?.price || 0)
      let finalRating = Number(p?.rating || 4.4)
      if (p?.category === 'Beauty' || p?.isBeauty) {
        finalPrice = Math.round(finalPrice * 0.85) // Marketing price reduction
        finalRating = Math.min(4.9, finalRating + 0.3) // Marketing rating boost
      }

      return { ...p, image: [safeImage], discountPercent, mrp, price: finalPrice, rating: finalRating }
    })
  }, [categoryProducts, imagePool])

  const allBrands = useMemo(() => {
    const set = new Set()
    for (const p of decoratedProducts) set.add(parseBrand(p?.name))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [decoratedProducts])

  const minPriceAll = useMemo(() => {
    let min = Infinity
    for (const p of decoratedProducts) min = Math.min(min, Number(p?.price || 0))
    return Number.isFinite(min) ? min : 0
  }, [decoratedProducts])

  const maxPriceAll = useMemo(() => {
    let max = 0
    for (const p of decoratedProducts) max = Math.max(max, Number(p?.price || 0))
    return max || 0
  }, [decoratedProducts])

  const [sortKey, setSortKey] = useState('popularity')
  const [minRating, setMinRating] = useState(0)
  const [brandSelected, setBrandSelected] = useState([])
  const [subFilter, setSubFilter] = useState('all')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setBrandSelected([])
    setSubFilter('all')
    setSortKey('popularity')
    setMinRating(0)
    setMinPrice(minPriceAll)
    setMaxPrice(maxPriceAll)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeSlug, minPriceAll, maxPriceAll])

  const subfilters = useMemo(() => categorySubfilters[activeSlug] || categorySubfilters.default, [activeSlug])

  const filteredProducts = useMemo(() => {
    const selectedBrands = new Set(brandSelected)
    const lower = (s) => String(s || '').toLowerCase()
    const inSub = (p) => {
      if (subFilter === 'all') return true
      const rule = subfilters.find((x) => x.key === subFilter)
      if (!rule) return true
      const hay = `${lower(p?.name)} ${lower(p?.description)}`
      return rule.match.some((m) => hay.includes(lower(m)))
    }

    return decoratedProducts
      .filter((p) => {
        const price = Number(p?.price || 0)
        if (minPrice && price < minPrice) return false
        if (maxPrice && price > maxPrice) return false
        if (minRating && Number(p?.rating || 0) < minRating) return false
        if (selectedBrands.size && !selectedBrands.has(parseBrand(p?.name))) return false
        if (!inSub(p)) return false
        return true
      })
      .sort((a, b) => {
        if (sortKey === 'price-asc') return Number(a?.price || 0) - Number(b?.price || 0)
        if (sortKey === 'new') return Number(b?.date || 0) - Number(a?.date || 0)
        return (Number(b?.reviews || 0) + Number(b?.rating || 0) * 100) - (Number(a?.reviews || 0) + Number(a?.rating || 0) * 100)
      })
  }, [decoratedProducts, brandSelected, minRating, minPrice, maxPrice, sortKey, subFilter, subfilters])

  const recommended = useMemo(() => {
    const pool = sourceBeautyProducts
      .map((p) => {
        const { discountPercent, mrp } = computeDiscount(p?._id, p?.price)
        return { ...p, discountPercent, mrp }
      })
      .sort((a, b) => (Number(b?.rating || 0) - Number(a?.rating || 0)) || (Number(b?.reviews || 0) - Number(a?.reviews || 0)))
    return pool.slice(0, 8)
  }, [sourceBeautyProducts])

  const toggleBrand = (brand) => {
    setBrandSelected((prev) => {
      const set = new Set(prev)
      if (set.has(brand)) set.delete(brand)
      else set.add(brand)
      return Array.from(set)
    })
  }

  return (
    <div className={`relative pt-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-pink-50 via-white to-white' />

      <div className='mb-4 text-sm text-slate-500'>
        <button onClick={() => navigate('/')} className='hover:text-slate-800'>
          Home
        </button>{' '}
        <span className='mx-1'>›</span>{' '}
        <Link to='/beauty' className='hover:text-slate-800'>
          Beauty
        </Link>{' '}
        <span className='mx-1'>›</span> <span className='text-slate-700'>{meta.title}</span>
      </div>

      <div
        className='relative overflow-hidden rounded-3xl p-6 sm:p-10 text-white shadow-sm ring-1 ring-black/5'
        style={{ background: `linear-gradient(135deg, ${meta.a} 0%, ${meta.b} 100%)` }}
      >
        <div className='absolute inset-0 opacity-25'>
          <div className='absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/40 blur-2xl' />
          <div className='absolute right-10 top-12 h-56 w-56 rounded-full bg-white/30 blur-2xl' />
          <div className='absolute bottom-[-40px] left-1/3 h-64 w-64 rounded-full bg-white/20 blur-2xl' />
        </div>
        <div className='relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
          <div className='max-w-2xl'>
            <div className='text-xs font-semibold tracking-widest text-white/90'>CATEGORY</div>
            <div className='mt-2 text-3xl font-bold sm:text-4xl'>Explore {meta.title} Products</div>
            <div className='mt-2 text-sm text-white/90'>{meta.subtitle}</div>
            <div className='mt-5 flex flex-wrap gap-2'>
              {subfilters.map((s) => (
                <button
                  key={s.key}
                  type='button'
                  onClick={() => setSubFilter(s.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    subFilter === s.key ? 'bg-white text-slate-900' : 'bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15'
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <button
                type='button'
                onClick={() => setSubFilter('all')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  subFilter === 'all' ? 'bg-white text-slate-900' : 'bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15'
                }`}
              >
                All
              </button>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-2xl ring-1 ring-white/25 backdrop-blur'>
              {meta.icon}
            </div>
            <button
              type='button'
              onClick={() => navigate('/beauty')}
              className='rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-white/95 active:scale-[0.99]'
            >
              Back to Beauty
            </button>
          </div>
        </div>
      </div>

      <div className='mt-5 rounded-3xl bg-white/75 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur'>
        <div className='flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {beautyCategoryList.map((c) => {
            const isActive = c === activeSlug
            const label = categoryMeta[c]?.title || titleCase(c)
            return (
              <Link
                key={c}
                to={`/category/${c}`}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 ring-1 ring-black/10 hover:bg-slate-50'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className='mt-8 space-y-4'>
        {filteredProducts.length === 0 ? (
          <div className='rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur'>
            <div className='text-lg font-bold text-slate-900'>No products found</div>
            <div className='mt-2 text-sm text-slate-600'>Try changing filters, or browse recommended items below.</div>
            <div className='mt-6 space-y-4'>
              {recommended.map((p) => (
                <BeautyListItem key={p._id} product={p} />
              ))}
            </div>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <BeautyListItem key={p._id} product={p} />
          ))
        )}
      </div>
    </div>
  )
}

const CategoryPage = () => {
  const { categoryName } = useParams()
  const slug = useMemo(() => normalizeCategorySlug(categoryName), [categoryName])

  if (slug === 'fashion') return <Navigate to='/fashion' replace />
  if (isKnownCategory(slug)) return <GeneralCategoryPage slug={slug} />
  if (slug === 'beauty') return <BeautyAssetsOnlyPage />
  if (beautyCategoryList.includes(slug)) return <BeautyCategoryPage slug={slug} />
  return <CategoryNotFound slug={slug} />
}

export default CategoryPage
