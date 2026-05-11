import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { DEFAULT_PLACEHOLDER_IMAGE, normalizeProductImages } from '../utils/defaultProducts'

const Product = () => {

  const { productId } = useParams();
  const { products, currency, addToCart, navigate } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [size,setSize] = useState('')

  const fetchProductData = async () => {

    products.map((item) => {
      if (item._id === productId) {
        const normalized = normalizeProductImages(item)
        setProductData(normalized)
        setImage(normalized?.image?.[0] || DEFAULT_PLACEHOLDER_IMAGE)
        const firstSize = Array.isArray(normalized?.sizes) ? normalized.sizes[0] : ''
        if (firstSize) setSize(firstSize)
        return null;
      }
    })

  }

  useEffect(() => {
    fetchProductData();
  }, [productId,products])

  const ratingValue = useMemo(() => {
    const value = Number(productData?.rating ?? 4.4)
    if (!Number.isFinite(value)) return 4.4
    return Math.max(0, Math.min(5, value))
  }, [productData])

  const reviewCount = useMemo(() => {
    const value = Number(productData?.reviews ?? 122)
    if (!Number.isFinite(value)) return 122
    return Math.max(0, Math.round(value))
  }, [productData])

  const stars = useMemo(() => {
    const full = Math.floor(ratingValue)
    const hasHalf = ratingValue - full >= 0.5
    return Array.from({ length: 5 }).map((_, idx) => {
      if (idx < full) return 'full'
      if (idx === full && hasHalf) return 'half'
      return 'empty'
    })
  }, [ratingValue])

  const buyNow = async () => {
    const selected = size || (Array.isArray(productData?.sizes) ? productData.sizes[0] : 'M')
    if (!productData?._id) return
    await addToCart(productData._id, selected)
    navigate('/place-order')
    scrollTo(0, 0)
  }

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      <div className='rounded-[2.75rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm'>
        <div className='flex gap-10 flex-col lg:flex-row'>
          <div className='flex-1 flex flex-col-reverse gap-4 sm:flex-row'>
            <div className='flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto justify-between sm:justify-start sm:w-[18%] w-full [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {(productData.image || []).map((item, index) => (
                <button
                  type='button'
                  key={index}
                  onClick={() => setImage(item)}
                  className={`shrink-0 overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                    item === image ? 'border-slate-900' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className='w-[84px] sm:w-full aspect-[4/5] p-2 bg-slate-50'>
                    <img src={item} className='h-full w-full object-contain' alt='' />
                  </div>
                </button>
              ))}
            </div>

            <div className='w-full sm:w-[82%]'>
              <div className='relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-sm'>
                <div className='aspect-[4/5] p-6 sm:p-10'>
                  <img className='h-full w-full object-contain' src={image || DEFAULT_PLACEHOLDER_IMAGE} alt='' />
                </div>
              </div>
            </div>
          </div>

          <div className='flex-1'>
            <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Premium Product</p>
            <h1 className='mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900'>{productData.name}</h1>

            <div className='mt-3 flex flex-wrap items-center gap-3'>
              <div className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5'>
                {stars.map((s, i) => (
                  <img
                    key={i}
                    src={s === 'empty' ? assets.star_dull_icon : assets.star_icon}
                    alt=''
                    className='w-3.5 h-3.5'
                    style={s === 'half' ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
                  />
                ))}
                <span className='ml-2 text-[11px] font-black text-slate-900'>{ratingValue.toFixed(1)}</span>
              </div>
              <span className='text-xs font-semibold text-slate-500'>({reviewCount} reviews)</span>
            </div>

            <div className='mt-6 flex items-end gap-4'>
              <p className='text-3xl font-black tracking-tight text-slate-900'>
                {currency}
                {productData.price}
              </p>
              {productData?.mrp ? (
                <p className='text-sm font-semibold text-slate-500 line-through'>
                  {currency}
                  {productData.mrp}
                </p>
              ) : null}
            </div>

            <p className='mt-4 text-sm font-semibold text-slate-600 max-w-2xl'>{productData.description}</p>

            <div className='mt-8'>
              <p className='text-[11px] font-black tracking-widest uppercase text-slate-500'>Select Size</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                {(Array.isArray(productData.sizes) ? productData.sizes : []).map((item, index) => (
                  <button
                    type='button'
                    onClick={() => setSize(item)}
                    className={`h-10 px-4 rounded-full border text-[11px] font-black tracking-widest uppercase transition ${
                      item === size
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className='mt-7 flex flex-col sm:flex-row gap-3'>
              <button
                type='button'
                onClick={() => addToCart(productData._id, size || (Array.isArray(productData?.sizes) ? productData.sizes[0] : 'M'))}
                className='h-12 px-7 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-[0.25em] uppercase hover:bg-black transition-all active:scale-[0.98]'
              >
                Add to cart
              </button>
              <button
                type='button'
                onClick={buyNow}
                className='h-12 px-7 rounded-2xl border border-slate-200 bg-white text-slate-900 text-[11px] font-black tracking-[0.25em] uppercase hover:bg-slate-50 transition-all active:scale-[0.98]'
              >
                Buy now
              </button>
            </div>

            <div className='mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-5'>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600'>
                <div>
                  <p className='text-[10px] font-black tracking-widest uppercase text-slate-400'>Authenticity</p>
                  <p className='mt-1 text-slate-700'>100% Original product</p>
                </div>
                <div>
                  <p className='text-[10px] font-black tracking-widest uppercase text-slate-400'>Payment</p>
                  <p className='mt-1 text-slate-700'>Cash on delivery available</p>
                </div>
                <div>
                  <p className='text-[10px] font-black tracking-widest uppercase text-slate-400'>Returns</p>
                  <p className='mt-1 text-slate-700'>Easy return within 7 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
        </div>
      </div>

      {/* --------- display related products ---------- */}

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

    </div>
  ) : <div className=' opacity-0'></div>
}

export default Product
