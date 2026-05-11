import React, { useContext, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import HorizontalCarousel from './HorizontalCarousel'
import SectionHeader from './SectionHeader'
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/defaultProducts'

const brandNames = ['KETCH', 'TOKYO TALKIES', 'STREET9', 'DENISON', 'SHAE', 'HIGHLANDER']

const RisingStars = () => {
  const { products, navigate } = useContext(ShopContext)

  const tiles = useMemo(() => {
    const picks = products.slice(0, 12)
    return picks.slice(0, 6).map((p, idx) => {
      const brand = brandNames[idx % brandNames.length]
      const off = 60 + ((idx * 5) % 15)
      return {
        id: `rising-${p._id}`,
        image: p.image?.[0] || DEFAULT_PLACEHOLDER_IMAGE,
        brand,
        headline: idx % 2 === 0 ? 'Where Glam Meets the Wild' : 'Shine with Confidence',
        offer: `Min. ${off}% Off`,
      }
    })
  }, [products])

  return (
    <div className='mt-12'>
      <SectionHeader title='Rising Stars' subtitle='Curated brand picks with fresh deals and premium visuals.' />
      <div className='mt-6'>
        <HorizontalCarousel itemWidthClass='w-[320px] sm:w-[380px] lg:w-[420px]' showDots autoplayMs={4200}>
          {tiles.map((tile) => (
            <button
              type='button'
              key={tile.id}
              onClick={() => navigate('/collection')}
              className='group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition text-left w-full'
            >
              <div className='aspect-[16/9] bg-gray-100 overflow-hidden'>
                <img
                  loading='lazy'
                  src={tile.image}
                  alt={tile.brand}
                  className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE
                  }}
                />
              </div>
              <div className='absolute inset-x-0 bottom-0'>
                <div className='bg-white/90 backdrop-blur border-t border-gray-200 px-4 py-3'>
                  <div className='flex items-end justify-between gap-3'>
                    <div>
                      <p className='text-[11px] tracking-[0.22em] text-gray-700'>{tile.brand}</p>
                      <p className='mt-1 text-sm text-gray-600'>{tile.headline}</p>
                      <p className='mt-1 text-lg font-semibold text-gray-900'>{tile.offer}</p>
                    </div>
                    <div className='h-9 w-9 rounded-xl bg-gray-900 text-white flex items-center justify-center'>
                      <span className='text-sm'>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </HorizontalCarousel>
      </div>
    </div>
  )
}

export default RisingStars
