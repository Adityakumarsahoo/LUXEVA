import React from 'react'

const ProductCardSkeleton = () => {
  return (
    <div className='rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse'>
      <div className='aspect-[4/5] bg-gradient-to-br from-slate-50 to-slate-100' />
      <div className='p-3'>
        <div className='h-3 w-4/5 bg-slate-100 rounded-full' />
        <div className='mt-3 flex items-center justify-between'>
          <div className='h-4 w-1/3 bg-slate-100 rounded-full' />
          <div className='h-4 w-1/5 bg-slate-100 rounded-full' />
        </div>
      </div>
    </div>
  )
}

export default ProductCardSkeleton
