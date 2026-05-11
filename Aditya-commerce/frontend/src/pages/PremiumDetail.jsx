import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  CheckCircle2,
  Tag,
  BadgePercent,
} from 'lucide-react'
import { ShopContext } from '../context/ShopContext'

const pageVariants = {
  initial: { opacity: 0, y: 18, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: 10, filter: 'blur(10px)' },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] } }),
}

const premiumMap = {
  'aurora-satin-top': {
    productId: 'aaaae',
    brand: 'AURORA',
    title: 'Aurora Satin Top',
    price: 1299,
    mrp: 1799,
    accent: 'from-sky-500/20 via-white to-white',
    highlights: ['Silky satin finish', 'Breathable comfort', 'Premium stitching', 'Minimal branding'],
    offers: ['Extra 10% off on prepaid', 'Buy 2 get 1 free on Tops', 'Free returns for 7 days'],
    delivery: ['Delivery in 2-5 days', 'Cash on Delivery available', 'Easy exchange'],
    details: {
      material: 'Satin blend',
      fit: 'Relaxed',
      care: 'Machine wash cold',
      warranty: '30-day quality assurance',
    },
    reviews: [
      { name: 'Ananya', rating: 5, text: 'Looks premium and feels super soft. The drape is perfect.' },
      { name: 'Riya', rating: 4, text: 'Great quality for the price. Packaging was also nice.' },
      { name: 'Sneha', rating: 5, text: 'Elegant and minimal. Works for office and outings.' },
    ],
    similar: ['aaaam', 'aaabh', 'aaaaa'],
  },
  'atlas-cotton-tee': {
    productId: 'aaaab',
    brand: 'ATLAS',
    title: 'Atlas Cotton Tee',
    price: 999,
    mrp: 1499,
    accent: 'from-slate-900/10 via-white to-white',
    highlights: ['Heavyweight cotton', 'Fade-resistant', 'Tailored collar', 'Everyday staple'],
    offers: ['Flat ₹150 off with ATLAS150', 'Free shipping above ₹499', 'No-cost EMI on orders above ₹2,999'],
    delivery: ['Delivery in 1-4 days', 'Pickup return available', 'Secure packaging'],
    details: {
      material: '100% cotton',
      fit: 'Modern regular',
      care: 'Wash inside-out',
      warranty: '15-day replacement',
    },
    reviews: [
      { name: 'Rahul', rating: 5, text: 'The fabric is thick and premium. Fit is spot on.' },
      { name: 'Arjun', rating: 4, text: 'Good value. The collar holds shape after wash.' },
      { name: 'Kunal', rating: 5, text: 'Feels like an expensive tee. Great basic.' },
    ],
    similar: ['aaaad', 'aaaak', 'aaabl'],
  },
  'mini-urban-kids-set': {
    productId: 'aaaac',
    brand: 'MINI URBAN',
    title: 'Mini Urban Set',
    price: 799,
    mrp: 1099,
    accent: 'from-blue-600/15 via-white to-white',
    highlights: ['Soft touch fabric', 'Kid-friendly seams', 'All-day comfort', 'Play-ready fit'],
    offers: ['Extra 5% off on kidswear', 'Combo discounts on sets', 'Free size exchange'],
    delivery: ['Delivery in 2-6 days', 'COD available', 'Track live updates'],
    details: {
      material: 'Cotton comfort',
      fit: 'Comfort',
      care: 'Gentle wash',
      warranty: '30-day return window',
    },
    reviews: [
      { name: 'Pooja', rating: 5, text: 'My kid loved it. Very soft and comfortable.' },
      { name: 'Meera', rating: 4, text: 'Nice colors and quality. Size chart is accurate.' },
      { name: 'Isha', rating: 5, text: 'Perfect for daily wear. Worth buying again.' },
    ],
    similar: ['aaaaf', 'aaaan', 'aaaar'],
  },
}

const Stars = ({ value = 4.6 }) => {
  const rounded = Math.round(value)
  return (
    <div className='flex items-center gap-1'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rounded ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  )
}

const PremiumDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { products, formatPrice, addToCartAuto, toggleWishlist, isWishlisted } = useContext(ShopContext)

  const cfg = premiumMap[slug]
  const [activeImage, setActiveImage] = useState('')
  const [activeSection, setActiveSection] = useState('overview')
  const contentRef = useRef(null)

  const product = useMemo(() => {
    if (!cfg?.productId) return null
    return products.find((p) => p._id === cfg.productId) || null
  }, [cfg?.productId, products])

  const images = useMemo(() => {
    const list = product?.image
    return Array.isArray(list) && list.length ? list : []
  }, [product])

  useEffect(() => {
    setActiveSection('overview')
    setActiveImage(images[0] || '')
  }, [slug, images])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const handler = () => {
      const sections = ['overview', 'details', 'delivery', 'reviews', 'similar']
      let best = 'overview'
      for (const id of sections) {
        const node = document.getElementById(`pd-${id}`)
        if (!node) continue
        const rect = node.getBoundingClientRect()
        if (rect.top <= 140) best = id
      }
      setActiveSection(best)
    }

    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const ratingValue = slug === 'atlas-cotton-tee' ? 4.7 : slug === 'mini-urban-kids-set' ? 4.6 : 4.8
  const reviewCount = slug === 'atlas-cotton-tee' ? 1824 : slug === 'mini-urban-kids-set' ? 991 : 1466

  if (!cfg) {
    return (
      <div className='py-32'>
        <div className='rounded-3xl border border-slate-200 bg-white p-10 text-center'>
          <p className='text-sm font-black text-slate-900'>This page does not exist.</p>
          <button
            type='button'
            onClick={() => navigate('/')}
            className='mt-6 h-11 px-6 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-[0.25em] uppercase hover:bg-black transition-all active:scale-[0.98]'
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const hasMrp = Number(cfg.mrp) > Number(cfg.price)
  const discountPercent = hasMrp ? Math.max(0, Math.round((1 - cfg.price / cfg.mrp) * 100)) : 0

  const scrollToSection = (key) => {
    const node = document.getElementById(`pd-${key}`)
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={slug}
        ref={contentRef}
        variants={pageVariants}
        initial='initial'
        animate='animate'
        exit='exit'
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className='pb-28 pt-8 sm:pt-10 relative'
      >
        <div className='pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white via-sky-50 to-blue-50' />

        {/* Breadcrumbs + Back */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7'>
          <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur px-4 py-2 text-[10px] font-black tracking-widest text-slate-400 uppercase'>
            <button type='button' onClick={() => navigate('/')} className='hover:text-slate-900 transition-colors'>
              Home
            </button>
            <ChevronRight className='w-3 h-3 opacity-60' />
            <button type='button' onClick={() => navigate('/collection')} className='hover:text-slate-900 transition-colors'>
              Collection
            </button>
            <ChevronRight className='w-3 h-3 opacity-60' />
            <span className='text-slate-900'>{cfg.title}</span>
          </div>

          <button
            type='button'
            onClick={() => navigate(-1)}
            className='inline-flex items-center gap-2 h-11 px-5 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur text-[11px] font-black tracking-widest uppercase text-slate-700 hover:bg-white transition-all active:scale-[0.98] shadow-sm'
          >
            <ArrowLeft className='w-4 h-4' />
            Back
          </button>
        </div>

        {/* Sticky product nav */}
        <div className='sticky top-24 z-[40] mb-8'>
          <div className='rounded-[2rem] border border-slate-200 bg-white/75 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] px-3 py-2'>
            <div className='flex items-center gap-1 overflow-x-auto no-scrollbar'>
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'details', label: 'Details' },
                { key: 'delivery', label: 'Delivery' },
                { key: 'reviews', label: 'Ratings' },
                { key: 'similar', label: 'Similar' },
              ].map((item) => {
                const active = activeSection === item.key
                return (
                  <button
                    key={item.key}
                    type='button'
                    onClick={() => scrollToSection(item.key)}
                    className={`h-10 px-5 rounded-2xl text-[10px] font-black tracking-[0.25em] uppercase transition-all whitespace-nowrap active:scale-[0.98] ${
                      active ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}

              <div className='ml-auto hidden md:flex items-center gap-2 pr-1'>
                <div className='hidden lg:flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-100'>
                  <Stars value={ratingValue} />
                  <span className='text-[11px] font-black text-slate-700'>{ratingValue.toFixed(1)}</span>
                  <span className='text-[10px] font-bold text-slate-400'>({reviewCount})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start'>
          {/* Gallery */}
          <motion.div custom={0} variants={sectionVariants} initial='hidden' animate='show' className='lg:col-span-7'>
            <div className='rounded-[2.5rem] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] overflow-hidden'>
              <div className={`p-6 sm:p-8 bg-gradient-to-br ${cfg.accent} border-b border-slate-100`}>
                <p className='text-[10px] font-black tracking-[0.35em] text-slate-500 uppercase'>Product Image Gallery</p>
                <h1 className='mt-2 text-3xl sm:text-4xl font-black tracking-tighter text-slate-900'>{cfg.title}</h1>
              </div>

              <div className='p-6 sm:p-8'>
                <div className='grid grid-cols-1 sm:grid-cols-12 gap-5'>
                  <div className='sm:col-span-3 order-2 sm:order-1'>
                    <div className='flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible no-scrollbar'>
                      {images.length ? (
                        images.slice(0, 6).map((img) => {
                          const active = img === activeImage
                          return (
                            <button
                              key={img}
                              type='button'
                              onClick={() => setActiveImage(img)}
                              className={`h-20 w-20 sm:w-full sm:h-24 rounded-2xl border overflow-hidden transition-all active:scale-[0.98] ${
                                active ? 'border-slate-900 shadow-md' : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <img src={img} alt='' className='h-full w-full object-cover' />
                            </button>
                          )
                        })
                      ) : (
                        <div className='text-sm font-bold text-slate-500'>No images</div>
                      )}
                    </div>
                  </div>

                  <div className='sm:col-span-9 order-1 sm:order-2'>
                    <div className='relative rounded-[2rem] border border-slate-200 bg-white overflow-hidden'>
                      <div className='absolute inset-0 bg-gradient-to-br from-white via-sky-50 to-white opacity-70' />
                      <div className='relative p-6 sm:p-8'>
                        <AnimatePresence mode='wait'>
                          <motion.img
                            key={activeImage || 'img'}
                            src={activeImage || images[0]}
                            alt=''
                            initial={{ opacity: 0, scale: 0.98, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 8 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className='w-full h-[320px] sm:h-[420px] object-contain drop-shadow-[0_18px_60px_rgba(15,23,42,0.20)]'
                          />
                        </AnimatePresence>
                      </div>

                      <div className='absolute top-5 left-5 flex items-center gap-2'>
                        <span className='inline-flex items-center gap-2 rounded-full bg-white/85 backdrop-blur border border-slate-200 px-3 py-1.5 text-[10px] font-black tracking-widest uppercase text-slate-700 shadow-sm'>
                          <ShieldCheck className='w-4 h-4 text-sky-600' />
                          Verified Premium
                        </span>
                        {discountPercent > 0 && (
                          <span className='inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-black tracking-widest uppercase text-white shadow-lg shadow-slate-900/10'>
                            <BadgePercent className='w-4 h-4' />
                            {discountPercent}% Off
                          </span>
                        )}
                      </div>
                    </div>

                    <div className='mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3'>
                      {[
                        { icon: Truck, title: 'Fast Delivery', desc: cfg.delivery[0] },
                        { icon: ShieldCheck, title: 'Secure', desc: 'Quality checked' },
                        { icon: CheckCircle2, title: 'Easy Returns', desc: 'Hassle-free support' },
                        { icon: Tag, title: 'Offers', desc: cfg.offers[0] },
                      ].map((s) => (
                        <div key={s.title} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
                          <s.icon className='w-5 h-5 text-sky-600' />
                          <p className='mt-2 text-[11px] font-black text-slate-900 tracking-tight'>{s.title}</p>
                          <p className='mt-1 text-[10px] font-bold text-slate-500 leading-snug'>{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Details + Actions */}
          <motion.div custom={1} variants={sectionVariants} initial='hidden' animate='show' className='lg:col-span-5 space-y-6'>
            <div id='pd-overview' className='scroll-mt-40 rounded-[2.5rem] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] p-7 sm:p-8'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <p className='text-[10px] font-black tracking-[0.35em] uppercase text-slate-400'>{cfg.brand}</p>
                  <h2 className='mt-2 text-2xl font-black tracking-tight text-slate-900'>Product Details</h2>
                </div>

                <button
                  type='button'
                  onClick={() => toggleWishlist(cfg.productId)}
                  className={`h-11 w-11 rounded-2xl border transition-all active:scale-[0.98] flex items-center justify-center ${
                    isWishlisted(cfg.productId) ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-label='Wishlist'
                >
                  <Heart className={`w-5 h-5 ${isWishlisted(cfg.productId) ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <div className='mt-5 flex items-end gap-4'>
                <p className='text-3xl font-black tracking-tight text-slate-900'>{formatPrice(cfg.price)}</p>
                {hasMrp && (
                  <div className='pb-1'>
                    <p className='text-sm font-black text-slate-400 line-through'>{formatPrice(cfg.mrp)}</p>
                    <p className='text-[11px] font-black tracking-widest uppercase text-emerald-600'>Save {formatPrice(cfg.mrp - cfg.price)}</p>
                  </div>
                )}
              </div>

              <div className='mt-4 flex flex-wrap items-center gap-3'>
                <div className='inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 text-[10px] font-black tracking-[0.25em] uppercase shadow-lg shadow-slate-900/10'>
                  <Stars value={ratingValue} />
                  <span className='text-[11px] font-black'>{ratingValue.toFixed(1)}</span>
                  <span className='text-[10px] font-bold text-white/70'>({reviewCount})</span>
                </div>
                <div className='inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black tracking-[0.25em] uppercase text-slate-600'>
                  <ShieldCheck className='w-4 h-4 text-sky-600' />
                  Premium QC
                </div>
              </div>

              <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {cfg.highlights.map((h) => (
                  <div key={h} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
                    <p className='text-[11px] font-black text-slate-900'>{h}</p>
                    <p className='mt-1 text-[10px] font-bold text-slate-500'>Refined for premium daily use.</p>
                  </div>
                ))}
              </div>

              <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <button
                  type='button'
                  onClick={() => addToCartAuto(cfg.productId)}
                  className='h-12 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-[0.25em] uppercase hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3'
                >
                  <ShoppingBag className='w-5 h-5' />
                  Add to Cart
                </button>
                <button
                  type='button'
                  onClick={() => {
                    addToCartAuto(cfg.productId)
                    navigate('/cart')
                  }}
                  className='h-12 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-[0.25em] uppercase hover:bg-sky-500 transition-all active:scale-[0.98] shadow-xl shadow-sky-600/20 flex items-center justify-center gap-3'
                >
                  <CheckCircle2 className='w-5 h-5' />
                  Buy Now
                </button>
              </div>

              <div className='mt-6 rounded-2xl border border-slate-200 bg-white p-5'>
                <p className='text-[10px] font-black tracking-[0.35em] uppercase text-slate-400'>Offers & Discounts</p>
                <div className='mt-3 space-y-2'>
                  {cfg.offers.map((o) => (
                    <div key={o} className='flex items-start gap-3'>
                      <span className='mt-1.5 h-2 w-2 rounded-full bg-sky-600' />
                      <p className='text-sm font-bold text-slate-700 leading-relaxed'>{o}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div id='pd-details' className='scroll-mt-40 rounded-[2.5rem] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] p-7 sm:p-8'>
              <p className='text-[10px] font-black tracking-[0.35em] uppercase text-slate-400'>Specifications</p>
              <h3 className='mt-2 text-2xl font-black tracking-tight text-slate-900'>Product Details</h3>

              <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {Object.entries(cfg.details).map(([k, v]) => (
                  <div key={k} className='rounded-2xl border border-slate-200 bg-white p-5'>
                    <p className='text-[10px] font-black tracking-[0.3em] uppercase text-slate-400'>{k}</p>
                    <p className='mt-2 text-sm font-black text-slate-900'>{v}</p>
                    <p className='mt-1 text-[10px] font-bold text-slate-500'>Designed for premium everyday use.</p>
                  </div>
                ))}
              </div>

              <div className='mt-6 rounded-2xl border border-slate-200 bg-white p-5'>
                <p className='text-[10px] font-black tracking-[0.35em] uppercase text-slate-400'>Description</p>
                <p className='mt-3 text-sm font-bold text-slate-700 leading-relaxed'>
                  {product?.description || 'A premium pick crafted for a clean, modern look with comfort-first details.'}
                </p>
              </div>
            </div>

            <div id='pd-delivery' className='scroll-mt-40 rounded-[2.5rem] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] p-7 sm:p-8'>
              <p className='text-[10px] font-black tracking-[0.35em] uppercase text-slate-400'>Delivery Information</p>
              <h3 className='mt-2 text-2xl font-black tracking-tight text-slate-900'>Fast, Safe & Reliable</h3>

              <div className='mt-6 grid grid-cols-1 gap-3'>
                {cfg.delivery.map((d) => (
                  <div key={d} className='rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-4'>
                    <Truck className='w-5 h-5 text-sky-600 mt-0.5' />
                    <div>
                      <p className='text-sm font-black text-slate-900'>{d}</p>
                      <p className='mt-1 text-[10px] font-bold text-slate-500'>Real-time order updates and premium packaging included.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id='pd-reviews' className='scroll-mt-40 rounded-[2.5rem] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] p-7 sm:p-8'>
              <p className='text-[10px] font-black tracking-[0.35em] uppercase text-slate-400'>Ratings & Reviews</p>
              <div className='mt-2 flex items-end justify-between gap-4'>
                <div>
                  <h3 className='text-2xl font-black tracking-tight text-slate-900'>What people say</h3>
                  <p className='mt-2 text-sm font-bold text-slate-600'>Premium reviews curated for this product page.</p>
                </div>
                <div className='hidden sm:flex items-center gap-3 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-lg shadow-slate-900/10'>
                  <div>
                    <p className='text-[10px] font-black tracking-[0.35em] uppercase text-white/70'>Rating</p>
                    <p className='text-xl font-black'>{ratingValue.toFixed(1)}</p>
                  </div>
                  <div className='h-10 w-px bg-white/15' />
                  <div>
                    <Stars value={ratingValue} />
                    <p className='mt-1 text-[10px] font-bold text-white/70'>{reviewCount} reviews</p>
                  </div>
                </div>
              </div>

              <div className='mt-6 grid grid-cols-1 gap-3'>
                {cfg.reviews.map((r) => (
                  <motion.div
                    key={r.name}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:shadow-slate-900/10 transition-shadow'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <p className='text-sm font-black text-slate-900'>{r.name}</p>
                        <p className='mt-1 text-[10px] font-bold text-slate-400'>Verified Purchase</p>
                      </div>
                      <div className='inline-flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2'>
                        <Stars value={r.rating} />
                        <span className='text-[11px] font-black text-amber-700'>{r.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className='mt-4 text-sm font-bold text-slate-700 leading-relaxed'>{r.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div id='pd-similar' className='scroll-mt-40 rounded-[2.5rem] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] p-7 sm:p-8'>
              <p className='text-[10px] font-black tracking-[0.35em] uppercase text-slate-400'>Similar Products</p>
              <h3 className='mt-2 text-2xl font-black tracking-tight text-slate-900'>You may also like</h3>

              <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {cfg.similar.map((id) => {
                  const sp = products.find((p) => p._id === id)
                  if (!sp) return null
                  return (
                    <motion.button
                      key={id}
                      type='button'
                      onClick={() => navigate(`/product/${id}`)}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                      className='text-left rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-xl hover:shadow-slate-900/10 transition-shadow group'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='h-16 w-16 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden'>
                          <img src={sp.image?.[0]} alt='' className='h-full w-full object-cover' />
                        </div>
                        <div className='min-w-0'>
                          <p className='text-sm font-black text-slate-900 truncate'>{sp.name}</p>
                          <p className='mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest'>{sp.category}</p>
                          <p className='mt-2 text-[11px] font-black text-slate-700'>{formatPrice(sp.price)}</p>
                        </div>
                        <div className='ml-auto h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10 group-hover:shadow-xl transition-shadow'>
                          <ChevronRight className='w-5 h-5' />
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sticky bottom actions (mobile) */}
        <div className='fixed left-0 right-0 bottom-0 z-[70] md:hidden'>
          <div className='mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pb-4'>
            <div className='rounded-[2rem] border border-slate-200 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.18)] p-3 grid grid-cols-2 gap-2'>
              <button
                type='button'
                onClick={() => addToCartAuto(cfg.productId)}
                className='h-12 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-[0.25em] uppercase flex items-center justify-center gap-2 active:scale-[0.98]'
              >
                <ShoppingBag className='w-5 h-5' />
                Cart
              </button>
              <button
                type='button'
                onClick={() => {
                  addToCartAuto(cfg.productId)
                  navigate('/cart')
                }}
                className='h-12 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-[0.25em] uppercase flex items-center justify-center gap-2 active:scale-[0.98]'
              >
                <CheckCircle2 className='w-5 h-5' />
                Buy
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PremiumDetail
