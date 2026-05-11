import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'

const Hero = () => {
  const { navigate } = useContext(ShopContext)

  return (
    <section className='relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white shadow-sm'>
      <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50' />
      <div className='absolute -right-32 -top-24 h-96 w-96 rounded-full bg-sky-400/10 blur-[110px]' />
      <div className='absolute -left-32 -bottom-24 h-96 w-96 rounded-full bg-blue-400/10 blur-[110px]' />

      <div className='relative grid grid-cols-1 lg:grid-cols-12 gap-8 p-7 sm:p-10'>
        <div className='lg:col-span-5 flex flex-col justify-center'>
          <div className='inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-[10px] font-black tracking-[0.35em] uppercase text-slate-500 backdrop-blur'>
            New Season
            <span className='h-1 w-1 rounded-full bg-sky-600' />
            Latest Arrivals
          </div>

          <h1 className='mt-5 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900'>
            Premium picks for a modern storefront.
          </h1>
          <p className='mt-4 text-sm sm:text-base font-semibold text-slate-600 max-w-xl'>
            Shop curated Fashion, Electronics, Home & Kitchen, and Lifestyle essentials with a clean, fast, and mobile-first experience.
          </p>

          <div className='mt-7 flex flex-col sm:flex-row gap-3'>
            <button
              type='button'
              onClick={() => {
                navigate('/fashion/clothing')
                scrollTo(0, 0)
              }}
              className='h-12 px-7 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-[0.25em] uppercase hover:bg-black transition-all active:scale-[0.98]'
            >
              Shop Fashion
            </button>
            <button
              type='button'
              onClick={() => {
                navigate('/collection')
                scrollTo(0, 0)
              }}
              className='h-12 px-7 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur text-[11px] font-black tracking-[0.25em] uppercase text-slate-800 hover:bg-white transition-all active:scale-[0.98]'
            >
              Explore Deals
            </button>
          </div>

          <div className='mt-8 flex flex-wrap gap-2'>
            {[
              { label: 'Clothing', to: '/fashion/clothing' },
              { label: 'Footwear', to: '/fashion/footwear' },
              { label: 'Beauty', to: '/fashion/beauty' },
              { label: 'Mobiles', to: '/electronics/mobiles' },
              { label: 'Home & Kitchen', to: '/home-kitchen/furniture' },
            ].map((c) => (
              <button
                key={c.to}
                type='button'
                onClick={() => {
                  navigate(c.to)
                  scrollTo(0, 0)
                }}
                className='h-10 px-4 rounded-full border border-slate-200 bg-white/70 backdrop-blur text-[11px] font-black tracking-widest uppercase text-slate-700 hover:text-slate-900 hover:bg-white transition'
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className='lg:col-span-7'>
          <div className='relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-sm'>
            <div className='absolute inset-0 bg-gradient-to-tr from-slate-900/10 via-transparent to-sky-500/10' />
            <img src={assets.hero_img} alt='' className='relative w-full h-full object-cover' />
            <div className='absolute left-5 top-5 rounded-2xl border border-white/50 bg-white/80 px-4 py-3 backdrop-blur shadow-sm'>
              <p className='text-[10px] font-black tracking-[0.35em] uppercase text-slate-500'>Limited Drops</p>
              <p className='mt-1 text-lg font-black tracking-tight text-slate-900'>Up to 60% OFF</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
