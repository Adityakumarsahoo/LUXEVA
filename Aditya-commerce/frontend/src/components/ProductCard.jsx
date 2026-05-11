import React, { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/defaultProducts'
import { assets } from '../assets/assets'

const ProductCard = ({ product, theme, size = 'sm' }) => {
  const { formatPrice, addToCartAuto, toggleWishlist, isWishlisted } = useContext(ShopContext)

  const item = useMemo(() => product || {}, [product])
  const productId = item?._id
  const imageSrc = item?.image?.[0] || DEFAULT_PLACEHOLDER_IMAGE
  const rating = item?.rating ?? 4.3
  const reviews = item?.reviews ?? 120
  const mrp = Number(item?.mrp || 0)
  const hasMrp = mrp > Number(item?.price || 0)
  const discountPercent = Number(item?.discountPercent || 0)
  const showDiscount = (hasMrp || discountPercent > 0) && (discountPercent > 0 || (hasMrp && mrp > 0))
  const effectiveDiscount = discountPercent > 0 ? discountPercent : hasMrp ? Math.round((1 - Number(item?.price || 0) / mrp) * 100) : 0
  const wishlisted = productId ? isWishlisted(productId) : false
  const isNew = Boolean(item?.recentlyAdded || item?.isNew || item?.newArrival)

  const accent = theme?.chip || '#0F172A'

  const isCompact = size === 'sm' || size === 'compact'
  const radius = isCompact ? 'rounded-[1.75rem]' : 'rounded-[2.25rem]'
  const pad = isCompact ? 'p-3' : 'p-4'
  const titleSize = isCompact ? 'text-[12px]' : 'text-sm'
  const priceSize = isCompact ? 'text-sm' : 'text-base'
  const metaSize = isCompact ? 'text-[11px]' : 'text-xs'

  return (
    <div className={`group relative overflow-hidden ${radius} border border-slate-200 bg-white shadow-sm transition hover:shadow-xl hover:-translate-y-0.5`}>
      {showDiscount && effectiveDiscount > 0 ? (
        <div className='absolute left-3 top-3 z-10 rounded-full bg-rose-600 px-3 py-1 text-[10px] font-black tracking-widest text-white shadow'>
          -{effectiveDiscount}%
        </div>
      ) : isNew ? (
        <div className='absolute left-3 top-3 z-10 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black tracking-widest text-white shadow'>
          NEW
        </div>
      ) : null}

      <button
        type='button'
        onClick={() => productId && toggleWishlist(productId)}
        className={`absolute right-3 top-3 z-10 flex ${isCompact ? 'h-8 w-8' : 'h-9 w-9'} items-center justify-center rounded-full border border-black/10 bg-white/85 shadow-sm backdrop-blur transition hover:scale-105`}
        aria-label='Add to wishlist'
      >
        <span className={`${wishlisted ? 'text-red-500' : 'text-slate-600'} ${isCompact ? 'text-[15px]' : 'text-lg'} leading-none`}>♥</span>
      </button>

      <Link to={productId ? `/product/${productId}` : '#'} onClick={() => scrollTo(0, 0)} className='block'>
        <div className='relative aspect-[4/5] overflow-hidden bg-white'>
          <div className={`h-full w-full ${isCompact ? 'p-4' : 'p-6'} bg-gradient-to-br from-slate-50 via-white to-slate-100`}>
            <img
              loading='lazy'
              src={imageSrc}
              alt={item?.name || 'Product'}
              className='h-full w-full object-contain transition-transform duration-500 group-hover:scale-105'
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE
              }}
            />
          </div>

          <div className={`absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0`}>
            <button
              type='button'
              onClick={(e) => {
                e.preventDefault()
                if (!productId) return
                addToCartAuto(productId)
              }}
              className={`flex-1 ${isCompact ? 'h-9' : 'h-10'} rounded-full bg-slate-900 px-4 text-[11px] font-black tracking-widest uppercase text-white shadow hover:bg-black active:scale-[0.98]`}
              style={{ backgroundColor: accent }}
            >
              Add
            </button>
          </div>
        </div>
      </Link>

      <div className={pad}>
        <div className={`line-clamp-2 ${titleSize} font-black tracking-tight text-slate-900`}>{item?.name}</div>
        <div className='mt-2 flex items-center justify-between gap-3'>
          <div className='flex items-baseline gap-2'>
            <div className={`${priceSize} font-black text-slate-900`}>{formatPrice(item?.price)}</div>
            {hasMrp && <div className={`${metaSize} font-semibold text-slate-500 line-through`}>{formatPrice(mrp)}</div>}
          </div>
          <div className={`flex items-center gap-1 ${metaSize} font-semibold text-slate-600`}>
            <img src={assets.star_icon} className='w-3' alt='' />
            <span>{Number(rating).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
