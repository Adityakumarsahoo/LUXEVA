import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

const CategoryBanner = ({ eyebrow, title, subtitle, breadcrumb, backgroundImage, tiles = [] }) => {
  const heroStyle = useMemo(() => {
    if (!backgroundImage) return { background: 'linear-gradient(135deg, #020617 0%, #0B1220 55%, #111827 100%)' }
    return {
      backgroundImage: `linear-gradient(120deg, rgba(2,6,23,0.86) 0%, rgba(2,6,23,0.40) 60%, rgba(2,6,23,0.18) 100%), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }, [backgroundImage])

  const pickedTiles = useMemo(() => {
    const picked = []
    for (const u of tiles || []) {
      if (!u || picked.includes(u)) continue
      picked.push(u)
      if (picked.length >= 6) break
    }
    return picked
  }, [tiles])

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className='relative overflow-hidden rounded-[2.75rem] border border-white/10 shadow-2xl shadow-slate-900/15'
      style={heroStyle}
    >
      <div className='absolute inset-0 bg-gradient-to-b from-sky-400/10 via-transparent to-blue-500/15' />
      <div className='absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-400/12 blur-[110px]' />
      <div className='absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full bg-blue-400/12 blur-[130px]' />

      <div className='relative z-10 grid grid-cols-1 gap-8 p-7 sm:p-10 lg:grid-cols-12 lg:items-center'>
        <div className='lg:col-span-7'>
          <p className='text-[10px] font-black tracking-[0.45em] text-sky-200 uppercase'>{eyebrow || 'Electronics'}</p>
          <h1 className='mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase leading-[0.95]'>
            {title}
          </h1>
          <p className='mt-4 max-w-2xl text-sm sm:text-base font-semibold text-white/75'>
            {subtitle}
          </p>
          {breadcrumb ? (
            <div className='mt-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black tracking-[0.35em] uppercase text-white/70 backdrop-blur'>
              {breadcrumb}
            </div>
          ) : null}
        </div>

        <div className='lg:col-span-5'>
          {pickedTiles.length ? (
            <div className='grid grid-cols-3 gap-2 sm:gap-3 max-w-[520px] ml-auto'>
              {pickedTiles.map((src, idx) => (
                <motion.div
                  key={`${src}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className={`overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-sm ${
                    idx === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
                >
                  <div className={`aspect-square bg-black/10 flex items-center justify-center ${idx === 0 ? 'p-3 sm:p-4' : 'p-2 sm:p-3'}`}>
                    <img src={src} alt='' loading='lazy' decoding='async' className='h-full w-full object-contain' />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className='ml-auto max-w-[520px] rounded-[2.25rem] border border-white/10 bg-white/5 p-8 text-center text-sm font-semibold text-white/70 backdrop-blur'>
              Loading category visuals…
            </div>
          )}
        </div>
      </div>
    </motion.section>
  )
}

export default CategoryBanner
