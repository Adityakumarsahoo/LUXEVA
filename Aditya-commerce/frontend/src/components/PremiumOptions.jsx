import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const cards = [
  {
    slug: 'aurora-satin-top',
    eyebrow: 'Premium Drop',
    title: 'Aurora Satin Top',
    subtitle: 'Silky finish, clean drape, luxe everyday.',
    priceLabel: 'From ₹1,299',
    accent: 'from-sky-500/20 via-white to-white',
  },
  {
    slug: 'atlas-cotton-tee',
    eyebrow: 'Best Seller',
    title: 'Atlas Cotton Tee',
    subtitle: 'Heavyweight cotton with a modern fit.',
    priceLabel: 'From ₹999',
    accent: 'from-slate-900/10 via-white to-white',
  },
  {
    slug: 'mini-urban-kids-set',
    eyebrow: 'Kids Edit',
    title: 'Mini Urban Set',
    subtitle: 'Soft touch, breathable, play-ready.',
    priceLabel: 'From ₹799',
    accent: 'from-blue-600/15 via-white to-white',
  },
]

const PremiumOptions = () => {
  const navigate = useNavigate()

  return (
    <div className='px-1'>
      <div className='rounded-[2.5rem] border border-slate-100 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] overflow-hidden'>
        <div className='p-8 sm:p-10 border-b border-slate-100 bg-gradient-to-br from-white via-sky-50/40 to-white'>
          <div className='flex items-center gap-2 text-slate-500'>
            <div className='h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10'>
              <Sparkles className='w-5 h-5' />
            </div>
            <div>
              <p className='text-[10px] font-black tracking-[0.35em] uppercase'>Premium Interaction Flow</p>
              <p className='mt-1 text-sm font-bold text-slate-700'>Tap any card to open a dedicated detail page</p>
            </div>
          </div>
        </div>

        <div className='p-6 sm:p-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6'>
            {cards.map((card, idx) => (
              <motion.button
                key={card.slug}
                type='button'
                onClick={() => navigate(`/premium/${card.slug}`)}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                className={`group relative text-left rounded-[2rem] border border-slate-200/80 bg-gradient-to-br ${card.accent} p-6 sm:p-7 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-900/10 transition-shadow`}
              >
                <div className='absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
                <div className='absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700' />

                <div className='relative'>
                  <p className='text-[10px] font-black tracking-[0.3em] uppercase text-slate-400'>{card.eyebrow}</p>
                  <h3 className='mt-3 text-xl font-black tracking-tight text-slate-900'>{card.title}</h3>
                  <p className='mt-2 text-sm font-bold text-slate-600 leading-relaxed'>{card.subtitle}</p>

                  <div className='mt-6 flex items-center justify-between'>
                    <p className='text-[11px] font-black tracking-widest uppercase text-slate-700'>{card.priceLabel}</p>
                    <div className='inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 text-[10px] font-black tracking-[0.25em] uppercase shadow-lg shadow-slate-900/10 group-hover:shadow-xl transition-shadow'>
                      Open
                      <ArrowRight className='w-4 h-4 transition-transform duration-300 group-hover:translate-x-1' />
                    </div>
                  </div>

                  <div className='mt-5 flex items-center gap-2'>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${i <= idx ? 'w-10 bg-sky-600' : 'w-6 bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PremiumOptions
