import React, { useContext, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import HorizontalCarousel from './HorizontalCarousel'
import ProductItem from './ProductItem'

import SectionHeader from './SectionHeader'

const CategoryShowcase = ({ title, subtitle, query, pick }) => {
  const { products, openCollectionSearch, loadingProducts } = useContext(ShopContext)

  const items = useMemo(() => {
    if (typeof pick === 'function') return pick(products)
    return products.slice(0, 10)
  }, [products, pick])

  return (
    <div className='mt-12'>
      <SectionHeader 
        title={title} 
        subtitle={subtitle} 
        onViewAll={() => openCollectionSearch(query)} 
      />

      <div className='mt-8 relative group'>
        <div className='pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent' />
        <div className='pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent' />

        <HorizontalCarousel itemWidthClass='w-[200px] sm:w-[240px] lg:w-[260px]' showDots autoplayMs={3600}>
          {(loadingProducts ? Array.from({ length: 8 }).map((_, i) => ({ _id: `sk-${i}` })) : items).map((p) => (
            <div key={p._id} className='w-full'>
              {p.image ? (
                <ProductItem product={p} />
              ) : (
                <div className='rounded-2xl border border-gray-200/60 bg-white/60 shadow-sm overflow-hidden animate-pulse'>
                  <div className='aspect-[3.5/4.5] bg-gradient-to-br from-gray-100 to-gray-200' />
                  <div className='p-4'>
                    <div className='h-4 w-4/5 bg-gray-200 rounded' />
                    <div className='mt-2 h-4 w-2/5 bg-gray-200 rounded' />
                  </div>
                </div>
              )}
            </div>
          ))}
        </HorizontalCarousel>
      </div>
    </div>
  )
}

export default CategoryShowcase

