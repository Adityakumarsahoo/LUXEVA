import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import ElectronicsCard from './ElectronicsCard'

const ProductSection = ({ title, subtitle, products = [], visuals = [], layout = 'carousel', id }) => {
  const list = Array.isArray(products) ? products : []

  const pickedVisuals = useMemo(() => {
    const picked = []
    for (const u of visuals || []) {
      if (!u || picked.includes(u)) continue
      picked.push(u)
      if (picked.length >= 10) break
    }
    return picked
  }, [visuals])

  const isCarousel = layout === 'carousel'

  return (
    <section id={id} className='rounded-[2.5rem] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Showcase</p>
          <h2 className='mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase'>{title}</h2>
          {subtitle ? <p className='mt-2 text-sm font-semibold text-slate-500 max-w-2xl'>{subtitle}</p> : null}
        </div>
        <p className='text-xs font-semibold text-slate-500'>{list.length ? `${list.length} items` : 'Curated visuals'}</p>
      </div>

      {list.length ? (
        isCarousel ? (
          <div className='mt-6 flex gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {list.slice(0, 16).map((p, idx) => (
              <div key={p?._id || idx} className='min-w-[200px] max-w-[200px] sm:min-w-[230px] sm:max-w-[230px]'>
                <ElectronicsCard product={p} delay={(idx % 10) * 0.03} />
              </div>
            ))}
          </div>
        ) : (
          <div className='mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8'>
            {list.slice(0, 20).map((p, idx) => (
              <ElectronicsCard key={p?._id || idx} product={p} delay={(idx % 10) * 0.03} />
            ))}
          </div>
        )
      ) : pickedVisuals.length ? (
        <div className='mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
          {pickedVisuals.slice(0, 10).map((src, idx) => (
            <motion.div
              key={`${src}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: idx * 0.03 }}
              className='overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50'
            >
              <div className='aspect-[4/5] flex items-center justify-center p-3'>
                <img src={src} alt='' loading='lazy' decoding='async' className='h-full w-full object-contain' />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className='mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-600'>
          No items to show yet.
        </div>
      )}
    </section>
  )
}

export default ProductSection
