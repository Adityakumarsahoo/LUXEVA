import React, { useContext, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import SectionHeader from './SectionHeader'
import { motion } from 'framer-motion'

const safeAssetUrl = (value) => {
  const unwrapped = value && typeof value === 'object' && 'default' in value ? value.default : value
  const raw = typeof unwrapped === 'string' ? unwrapped : String(unwrapped || '')
  if (!raw) return ''
  const escaped = raw.replace(/%(?![0-9A-Fa-f]{2})/g, '%25')
  try {
    return encodeURI(escaped)
  } catch {
    return escaped
  }
}

const pickUnique = (items, count) => {
  const out = []
  for (const it of items || []) {
    if (!it || out.includes(it)) continue
    out.push(it)
    if (out.length >= count) break
  }
  return out
}

const fashionPool = [
  ...Object.values(import.meta.glob('../assets/clothing/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Clothing/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/p_img*.png', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Western Wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/western-wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/western wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Ethnic Wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/ethnic-wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/ethnic wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/footwear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/accessories/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/beauty/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
].map(safeAssetUrl)

const homeKitchenPool = [
  ...Object.values(import.meta.glob('../assets/Furniture/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/furniture/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Appliances/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/appliances/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Kitchen Items/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/kitchen-items/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/kitchen items/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Home Decor/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/home-decor/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/home decor/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
].map(safeAssetUrl)

const lifestylePool = [
  ...Object.values(import.meta.glob('../assets/Gym/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/gym/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Cricket/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/cricket/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Football/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/football/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Story Books/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/story-books/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/story books/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Technology/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/technology/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Business/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/business/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Gaming/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/gaming/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Action Figures/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/action-figures/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/action figures/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Learning/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/learning/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
].map(safeAssetUrl)

const electronicsPool = [
  ...Object.values(import.meta.glob('../assets/smartphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Smartphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/tablets/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Tablets/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/laptops/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Laptops/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/headphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ...Object.values(import.meta.glob('../assets/Headphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
].map(safeAssetUrl)

const cards = [
  {
    id: 'fashion',
    title: 'Fashion',
    subtitle: 'Fresh styles and everyday essentials.',
    range: 'Up to 70% OFF',
    to: '/fashion/clothing',
    pool: fashionPool,
  },
  {
    id: 'electronics',
    title: 'Electronics',
    subtitle: 'Smart picks with premium value.',
    range: 'Best Deals',
    to: '/electronics/smartphones',
    pool: electronicsPool,
  },
  {
    id: 'home-kitchen',
    title: 'Home & Kitchen',
    subtitle: 'Upgrade your space with modern finds.',
    range: 'Top Savings',
    to: '/home-kitchen/furniture',
    pool: homeKitchenPool,
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    subtitle: 'Sports, books, and collectibles.',
    range: 'Trending Now',
    to: '/lifestyle/gym',
    pool: lifestylePool,
  },
]

const ShopByCategory = () => {
  const { navigate } = useContext(ShopContext)

  const enriched = useMemo(() => {
    const want = (pool, count) => pickUnique(pool, count)
    return cards.map((c) => ({ ...c, images: want(c.pool, 3) }))
  }, [])

  const collage = useMemo(() => {
    const all = enriched.flatMap((c) => c.images || [])
    return pickUnique(all, 8)
  }, [enriched])

  return (
    <div className='mt-14'>
      <SectionHeader title='Collections' subtitle='Premium picks across Fashion, Electronics, Home & Kitchen, and Lifestyle.' />

      <div className='mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6'>
        <div className='lg:col-span-5 overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white shadow-sm'>
          <div className='relative p-7 sm:p-8'>
            <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50' />
            <div className='absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-400/10 blur-[90px]' />
            <div className='absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue-400/10 blur-[90px]' />

            <div className='relative z-10'>
              <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Curated Mix</p>
              <p className='mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase'>All Categories, One Premium View</p>
              <p className='mt-3 text-sm font-semibold text-slate-500 max-w-md'>Balanced visuals from Fashion, Electronics, Home & Kitchen, and Lifestyle.</p>
            </div>

            <div className='relative z-10 mt-6 grid grid-cols-4 gap-2 sm:gap-3'>
              {collage.map((src, idx) => (
                <motion.div
                  key={`${src}-${idx}`}
                  initial={false}
                  animate={{ y: idx % 2 === 0 ? [0, -3, 0] : [0, 3, 0] }}
                  transition={{ duration: 10 + (idx % 4) * 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className={`overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem] border border-white/60 bg-white shadow-sm ${
                    idx === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
                >
                  <div className={`aspect-square bg-white ${idx === 0 ? 'p-3 sm:p-4' : 'p-2 sm:p-3'}`}>
                    <img src={src} alt='' loading='lazy' decoding='async' className='h-full w-full object-contain' />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              type='button'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                navigate('/collection', {
                  state: {
                    filters: {
                      mainCategory: ['fashion', 'electronics', 'home-kitchen', 'lifestyle'],
                      allCollections: true,
                      collectionTitle: 'All Collections',
                      collectionEyebrow: 'Shop',
                    },
                  },
                })
              }
              className='relative z-10 mt-7 w-full h-12 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-[0.25em] uppercase hover:bg-black transition-all'
            >
              View All Collections
            </motion.button>
          </div>
        </div>

        <div className='lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {enriched.map((c, idx) => (
            <motion.button
              type='button'
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(c.to)}
              className='group relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white shadow-sm hover:shadow-xl transition text-left'
            >
              <div className='absolute inset-0 bg-gradient-to-tr from-black/80 via-black/15 to-transparent opacity-95' />
              <div className='grid grid-cols-3'>
                <div className='col-span-2 aspect-square bg-white overflow-hidden p-3 sm:p-4'>
                  <img src={c.images?.[0]} alt='' loading='lazy' decoding='async' className='h-full w-full object-contain transition-transform duration-700 group-hover:scale-105' />
                </div>
                <div className='aspect-square bg-white overflow-hidden p-3 sm:p-4 border-l border-slate-100'>
                  <img src={c.images?.[1] || c.images?.[0]} alt='' loading='lazy' decoding='async' className='h-full w-full object-contain transition-transform duration-700 group-hover:scale-105' />
                </div>
              </div>

              <div className='absolute inset-0 p-6 flex flex-col justify-end'>
                <p className='text-[10px] font-black tracking-[0.35em] text-white/70 uppercase'>{c.range}</p>
                <p className='mt-2 text-2xl font-black tracking-tight text-white uppercase'>{c.title}</p>
                <p className='mt-2 text-sm font-semibold text-white/80 max-w-[28ch]'>{c.subtitle}</p>
                <span className='mt-4 inline-flex w-fit items-center rounded-full bg-white/15 px-4 py-2 text-[10px] font-black tracking-[0.25em] uppercase text-white backdrop-blur'>
                  Shop Now
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ShopByCategory
