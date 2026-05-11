import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import Collection from './Collection'

const pageVariants = {
  initial: { opacity: 0, y: 14, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: 10, filter: 'blur(10px)' },
}

const slugToPreset = (slug) => {
  const s = String(slug || '').trim().toLowerCase()

  const common = {
    eyebrow: 'Curated Shop',
    countLabel: 'Items Found',
  }

  if (s === 'clothing') {
    return {
      ...common,
      title: 'Clothing',
      eyebrow: 'Fashion Essentials',
      countLabel: 'Clothing Products Found',
      filters: {
        category: ['Men', 'Women', 'Kids'],
        excludeSubCategory: ['Footwear', 'Accessories', 'Beauty', 'Baby Care'],
      },
    }
  }

  if (s === 'footwear') {
    return {
      ...common,
      title: 'Footwear',
      eyebrow: 'Step Into Style',
      countLabel: 'Footwear Products Found',
      filters: {
        subCategory: ['Footwear'],
      },
    }
  }

  if (s === 'accessories') {
    return {
      ...common,
      title: 'Accessories',
      eyebrow: 'Curated Add-Ons',
      countLabel: 'Accessories Found',
      filters: {
        subCategory: ['Accessories'],
      },
    }
  }

  if (s === 'ethnic-wear') {
    return {
      ...common,
      title: 'Ethnic Wear',
      eyebrow: 'Traditional Luxe',
      countLabel: 'Ethnic Picks Found',
      filters: {
        subCategory: ['Ethnic Wear'],
      },
    }
  }

  if (s === 'western-wear') {
    return {
      ...common,
      title: 'Western Wear',
      eyebrow: 'Modern Staples',
      countLabel: 'Western Styles Found',
      filters: {
        subCategory: ['Western Wear'],
      },
    }
  }

  if (s === 'beauty') {
    return {
      ...common,
      title: 'Beauty',
      eyebrow: 'Glow & Go',
      countLabel: 'Beauty Products Found',
      filters: {
        category: ['Beauty'],
      },
    }
  }

  if (s === 'boys') {
    return {
      ...common,
      title: 'Boys',
      eyebrow: 'Kids Collection',
      countLabel: 'Boys Items Found',
      filters: {
        category: ['Kids'],
        subCategory: ['Boys'],
      },
    }
  }

  if (s === 'girls') {
    return {
      ...common,
      title: 'Girls',
      eyebrow: 'Kids Collection',
      countLabel: 'Girls Items Found',
      filters: {
        category: ['Kids'],
        subCategory: ['Girls'],
      },
    }
  }

  if (s === 'baby-care') {
    return {
      ...common,
      title: 'Baby Care',
      eyebrow: 'Kids Essentials',
      countLabel: 'Baby Care Items Found',
      filters: {
        category: ['Kids'],
        subCategory: ['Baby Care'],
      },
    }
  }

  return null
}

const ShopLanding = () => {
  const { slug } = useParams()
  const navigate = useNavigate()

  const preset = useMemo(() => slugToPreset(slug), [slug])

  if (!preset) {
    return (
      <div className='py-28'>
        <div className='rounded-[2.5rem] border border-slate-200 bg-white p-10 text-center shadow-sm'>
          <p className='text-sm font-black text-slate-900'>This category page does not exist.</p>
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

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={String(slug)}
        variants={pageVariants}
        initial='initial'
        animate='animate'
        exit='exit'
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className='px-1 mb-6'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur px-4 py-2 text-[10px] font-black tracking-widest text-slate-400 uppercase'>
              <button type='button' onClick={() => navigate('/')} className='hover:text-slate-900 transition-colors'>
                Home
              </button>
              <ChevronRight className='w-3 h-3 opacity-60' />
              <button type='button' onClick={() => navigate('/collection')} className='hover:text-slate-900 transition-colors'>
                Collection
              </button>
              <ChevronRight className='w-3 h-3 opacity-60' />
              <span className='text-slate-900'>{preset.title}</span>
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
        </div>

        <Collection preset={preset} />
      </motion.div>
    </AnimatePresence>
  )
}

export default ShopLanding
