import React, { useContext, useMemo, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/defaultProducts'

const bullet = (value) => (
  <li className='flex gap-2 text-sm text-slate-700'>
    <span className='mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400' />
    <span>{value}</span>
  </li>
)

const ElectronicsListItem = ({ product }) => {
  const { formatPrice, addToCartAuto, toggleWishlist, isWishlisted } = useContext(ShopContext)
  const [imgOk, setImgOk] = useState(true)

  const rating = Number(product?.rating || 0)
  const ratingText = Number.isFinite(rating) ? rating.toFixed(1) : '4.4'
  const reviews = Number(product?.reviews || 0)

  const mrp = Number(product?.mrp || Math.round(product?.price * 1.25 / 100) * 100)
  const price = Number(product?.price || 0)
  const percentOff = product?.discountPercent || (mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0)

  const wish = isWishlisted(product?._id)

  const highlights = useMemo(() => {
    if (product?.highlights) return product.highlights.slice(0, 6)
    
    const h = []
    const sub = (product?.subCategory || '').toLowerCase()
    
    if (sub.includes('headset') || sub.includes('audio')) {
      h.push('Active Noise Cancellation')
      h.push('Up to 40 hours battery life')
      h.push('Bluetooth 5.2 connectivity')
    } else if (sub.includes('wearable') || sub.includes('watch')) {
      h.push('AMOLED Display')
      h.push('Heart Rate & SpO2 Monitoring')
      h.push('5ATM Water Resistant')
    } else if (sub.includes('gaming')) {
      h.push('High-precision sensor')
      h.push('RGB Customizable Lighting')
      h.push('Ultra-low latency')
    } else {
      h.push('Premium build quality')
      h.push('Latest smart technology')
      h.push('Energy efficient design')
    }
    
    h.push('Category: ' + (product?.subCategory || 'Electronics'))
    h.push('1 Year Brand Warranty')
    return h
  }, [product])

  return (
    <div className='group rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-[0_30px_70px_-55px_rgba(0,0,0,0.55)]'>
      <div className='flex flex-col gap-4 p-4 sm:flex-row sm:items-start'>
        <div className='flex gap-3 sm:w-[260px]'>
          <div className='mt-1 hidden sm:block'>
            <input
              type='checkbox'
              className='h-4 w-4 rounded border-slate-300 text-slate-900'
            />
          </div>

          <div className='relative h-[170px] w-[170px] flex-shrink-0 overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-black/5'>
            <button
              type='button'
              onClick={() => toggleWishlist(product?._id)}
              className='absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow ring-1 ring-black/5 backdrop-blur transition hover:bg-white'
              aria-label='Wishlist'
            >
              <span className={`text-lg leading-none ${wish ? 'text-rose-500' : 'text-slate-400'}`}>♥</span>
            </button>

            <img
              src={imgOk ? product?.image?.[0] : DEFAULT_PLACEHOLDER_IMAGE}
              alt={product?.name || 'Product'}
              loading='lazy'
              className='h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]'
              onError={() => setImgOk(false)}
            />

            {product?.bestseller ? (
              <span className='absolute left-3 top-3 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow'>
                Top Rated
              </span>
            ) : null}
          </div>

          <div className='mt-2 flex flex-col gap-2 sm:hidden'>
            <div className='flex items-center justify-between gap-3'>
              <div className='rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white'>
                {ratingText} ★
              </div>
              <div className='inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700'>
                <span className='inline-block h-4 w-4 rounded-full bg-blue-600 text-center text-[10px] leading-4 text-white'>
                  A
                </span>
                Assured
              </div>
            </div>
            <div className='text-sm font-semibold text-slate-900'>{formatPrice(price)}</div>
          </div>
        </div>

        <div className='flex-1'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-start justify-between gap-4'>
              <h3 className='text-base font-semibold text-slate-900 sm:text-lg'>{product?.name}</h3>
              <div className='hidden sm:flex items-center gap-3'>
                <div className='rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white'>
                  {ratingText} ★
                </div>
                <div className='text-sm text-slate-600'>
                  {reviews.toLocaleString('en-IN')} Ratings &amp; {Math.round(reviews * 0.2 + 45).toLocaleString('en-IN')}{' '}
                  Reviews
                </div>
              </div>
            </div>

            <ul className='space-y-1'>{highlights.map((h, i) => <React.Fragment key={i}>{bullet(h)}</React.Fragment>)}</ul>

            <div className='mt-2 hidden sm:flex items-center gap-2 text-sm text-slate-600'>
              <label className='inline-flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  className='h-4 w-4 rounded border-slate-300 text-slate-900'
                />
                Add to Compare
              </label>
            </div>
          </div>
        </div>

        <div className='sm:w-[260px]'>
          <div className='flex flex-col gap-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <div className='text-xl font-bold tracking-tight text-slate-900'>{formatPrice(price)}</div>
                {mrp > price ? (
                  <div className='mt-0.5 flex items-center gap-2 text-sm'>
                    <span className='text-slate-500 line-through'>{formatPrice(mrp)}</span>
                    <span className='font-semibold text-emerald-700'>{percentOff}% off</span>
                  </div>
                ) : null}
              </div>

              <div className='inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700'>
                <span className='inline-block h-4 w-4 rounded-full bg-blue-600 text-center text-[10px] leading-4 text-white'>
                  A
                </span>
                Assured
              </div>
            </div>

            <div className='text-sm text-slate-700'>
              Upto <span className='font-semibold text-slate-900'>{formatPrice(Math.round(price * 0.15))}</span> Off on Exchange
            </div>
            <div className='text-sm font-semibold text-emerald-700'>Bank Offer: {formatPrice(Math.round(price * 0.07))} off</div>

            <button
              type='button'
              onClick={() => addToCartAuto(product?._id)}
              className='mt-1 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 active:scale-[0.99]'
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ElectronicsListItem
