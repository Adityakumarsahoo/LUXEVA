import React from 'react'
import { motion } from 'framer-motion'

const BrandSection = ({ title = 'Top Brands', subtitle, brands = [] }) => {
  const list = Array.isArray(brands) ? brands.filter(Boolean) : []

  return (
    <section className='rounded-[2.5rem] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Brands</p>
          <h2 className='mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase'>{title}</h2>
          {subtitle ? <p className='mt-2 text-sm font-semibold text-slate-500 max-w-2xl'>{subtitle}</p> : null}
        </div>
        <p className='text-xs font-semibold text-slate-500'>{list.length ? `${list.length} brands` : ''}</p>
      </div>

      <div className='mt-6 flex flex-wrap gap-3'>
        {list.map((b, idx) => (
          <motion.div
            key={`${b}-${idx}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: idx * 0.03 }}
            className='rounded-full border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-5 py-2.5 text-xs font-black tracking-widest uppercase text-slate-800 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition'
          >
            {b}
          </motion.div>
        ))}
        {!list.length ? (
          <div className='text-sm font-semibold text-slate-500'>Brands will appear here as products get added.</div>
        ) : null}
      </div>
    </section>
  )
}

export default BrandSection
