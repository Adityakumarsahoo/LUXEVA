import React, { useContext, useMemo } from 'react'
import Hero from '../components/Hero'
import ShopByCategory from '../components/ShopByCategory'
import SectionHeader from '../components/SectionHeader'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import CategoryShowcase from '../components/CategoryShowcase'
import Title from '../components/Title'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import { ShopContext } from '../context/ShopContext'

const Home = () => {
  const { products, loadingProducts, openCollectionSearch, navigate } = useContext(ShopContext)

  const topPicks = useMemo(() => {
    const list = Array.isArray(products) ? products.slice() : []
    return list
      .sort((a, b) => {
        const ar = Number(a?.rating || 0)
        const br = Number(b?.rating || 0)
        if (br !== ar) return br - ar
        const ad = Number(a?.date || 0)
        const bd = Number(b?.date || 0)
        return bd - ad
      })
      .slice(0, 12)
  }, [products])

  const newArrivals = useMemo(() => {
    const list = Array.isArray(products) ? products.slice() : []
    return list
      .sort((a, b) => Number(b?.date || 0) - Number(a?.date || 0))
      .slice(0, 12)
  }, [products])

  return (
    <div className='pb-16'>
      <Hero />
      <div className='mt-10 rounded-[2.75rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm overflow-hidden'>
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-sky-50' />
          <div className='relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
            <div className='flex items-center gap-4'>
              <div className='h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black'>
                %
              </div>
              <div>
                <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Limited Deals</p>
                <p className='mt-1 text-lg sm:text-xl font-black tracking-tight text-slate-900'>
                  Up to 60% OFF on New Arrivals
                </p>
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              {[
                { label: 'Shop Clothing', to: '/fashion/clothing' },
                { label: 'Shop Mobiles', to: '/electronics/mobiles' },
                { label: 'Shop Home', to: '/home-kitchen/furniture' },
              ].map((c) => (
                <button
                  key={c.to}
                  type='button'
                  onClick={() => {
                    navigate(c.to)
                    scrollTo(0, 0)
                  }}
                  className='h-10 px-5 rounded-full bg-white border border-slate-200 text-[11px] font-black tracking-widest uppercase text-slate-800 hover:bg-slate-50 transition'
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ShopByCategory />

      <div className='mt-14 rounded-[2.75rem] border border-slate-200 bg-white p-7 sm:p-10 shadow-sm'>
        <div className='text-center'>
          <Title text1={'LATEST'} text2={'COLLECTIONS'} />
          <p className='mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-500'>
            Curated drops with premium product cards, smooth hover, and quick actions.
          </p>
        </div>
        <div className='mt-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5'>
          {loadingProducts
            ? Array.from({ length: 12 }).map((_, index) => <ProductCardSkeleton key={index} />)
            : newArrivals.slice(0, 12).map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>

      <div className='mt-14'>
        <SectionHeader
          title='Top Picks'
          subtitle='Premium, modern product cards with quick actions and clean spacing.'
          onViewAll={() => openCollectionSearch('')}
        />
        <div className='mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5'>
          {loadingProducts
            ? Array.from({ length: 12 }).map((_, index) => <ProductCardSkeleton key={index} />)
            : topPicks.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>

      <div className='mt-14'>
        <SectionHeader
          title='New Arrivals'
          subtitle='Fresh drops, best visuals, and a smooth browsing experience.'
          onViewAll={() => openCollectionSearch('New')}
        />
        <div className='mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5'>
          {loadingProducts
            ? Array.from({ length: 12 }).map((_, index) => <ProductCardSkeleton key={index} />)
            : newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>

      <CategoryShowcase
        title='Fashion Spotlight'
        subtitle='Clothing, footwear, and premium wardrobe essentials.'
        query='fashion'
        pick={(list) =>
          (list || [])
            .filter((p) => ['Men', 'Women', 'Kids'].includes(String(p?.category || '').trim()) || String(p?.subCategory || '').toLowerCase().includes('wear'))
            .slice(0, 12)
        }
      />

      <CategoryShowcase
        title='Electronics & Mobiles'
        subtitle='Smart picks across mobiles, laptops, and accessories.'
        query='electronics'
        pick={(list) =>
          (list || [])
            .filter((p) => ['Mobiles', 'Electronics'].includes(String(p?.category || '').trim()) || String(p?.subCategory || '').toLowerCase().includes('gb'))
            .slice(0, 12)
        }
      />

      <OurPolicy />
      <NewsletterBox />
    </div>
  )
}

export default Home
