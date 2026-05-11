import React, { useContext, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import HorizontalCarousel from './HorizontalCarousel'
import SectionHeader from './SectionHeader'
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/defaultProducts'

const dealBrands = ['DKNY', 'Just Cavalli', 'GUESS', 'POLO', 'FRED PERRY', 'THE COLLECTIVE']

const LuxeDeals = () => {
  const { products, openCollectionSearch } = useContext(ShopContext)

  const deals = useMemo(() => {
    const picks = products.slice().reverse().slice(0, 12)
    return picks.slice(0, 6).map((p, idx) => {
      const brand = dealBrands[idx % dealBrands.length]
      const off = 20 + ((idx * 10) % 30)
      const label = idx % 2 === 0 ? `Min. ${off}% Off` : `Flat ${off}% Off`
      return {
        id: `deal-${p._id}`,
        image: p.image?.[0] || DEFAULT_PLACEHOLDER_IMAGE,
        brand,
        label,
      }
    })
  }, [products])

  return (
    <div className='mt-14'>
      <SectionHeader title='Luxe Grand Reduction Deals' subtitle='Premium brand deals with bold tiles and swipe carousel.' />
      <div className='mt-6 relative'>
        <div className='hidden lg:flex absolute -right-10 top-0 bottom-10 items-center'>
          <button
            type='button'
            onClick={() => openCollectionSearch('Fashion', { category: ['Men', 'Women', 'Kids'] })}
            className='h-44 w-10 rounded-l-xl bg-sky-600 text-white text-xs font-semibold tracking-wide rotate-180 [writing-mode:vertical-rl] flex items-center justify-center shadow-lg hover:bg-sky-700 transition-colors'
          >
            UP TO ₹200 OFF
          </button>
        </div>

        <HorizontalCarousel itemWidthClass='w-[220px] sm:w-[260px] lg:w-[280px]' showDots autoplayMs={3500}>
          {deals.map((deal) => (
            <button
              type='button'
              key={deal.id}
              onClick={() => openCollectionSearch(deal.brand, { category: ['Men', 'Women', 'Kids'] })}
              className='group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition text-left w-full'
            >
              <div className='aspect-[4/3] bg-gray-100 overflow-hidden'>
                <img
                  loading='lazy'
                  src={deal.image}
                  alt={deal.brand}
                  className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE
                  }}
                />
              </div>
              <div className='px-4 py-3 border-t bg-white group-hover:bg-sky-50 transition-colors'>
                <p className='text-xs tracking-[0.24em] text-sky-600 uppercase font-black'>{deal.brand}</p>
                <p className='mt-1 text-sm font-semibold text-slate-900'>{deal.label}</p>
              </div>
            </button>
          ))}
        </HorizontalCarousel>
      </div>
    </div>
  )
}

export default LuxeDeals
