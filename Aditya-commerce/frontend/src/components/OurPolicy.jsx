import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <section className='mt-16'>
      <div className='rounded-[2.75rem] border border-slate-200 bg-white p-7 sm:p-10 shadow-sm'>
        <div className='flex items-center justify-between gap-6'>
          <div>
            <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Trust</p>
            <p className='mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase'>Shopping made effortless</p>
            <p className='mt-2 text-sm font-semibold text-slate-500'>Fast, transparent, and customer-first policy cards.</p>
          </div>
        </div>

        <div className='mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {[
            {
              icon: assets.exchange_icon,
              title: 'Easy Exchange',
              desc: 'Hassle-free exchange across eligible products.',
            },
            {
              icon: assets.quality_icon,
              title: '7 Days Return',
              desc: 'Simple returns with clear tracking and quick action.',
            },
            {
              icon: assets.support_img,
              title: '24/7 Support',
              desc: 'Always-on help from chat to email support.',
            },
          ].map((p) => (
            <div key={p.title} className='rounded-[2.25rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm'>
              <div className='flex items-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm'>
                  <img src={p.icon} className='h-7 w-7 object-contain' alt='' />
                </div>
                <div>
                  <p className='text-sm font-black tracking-tight text-slate-900'>{p.title}</p>
                  <p className='mt-1 text-xs font-semibold text-slate-500'>{p.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OurPolicy
