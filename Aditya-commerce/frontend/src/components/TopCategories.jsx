import React, { useContext, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const items = [
  { key: 'for-you', label: 'For You', accent: '#2563EB' },
  { key: 'fashion', label: 'Fashion', accent: '#F59E0B' },
  { key: 'mobiles', label: 'Mobiles', accent: '#F59E0B' },
  { key: 'beauty', label: 'Beauty', accent: '#F59E0B' },
  { key: 'electronics', label: 'Electronics', accent: '#F59E0B' },
  { key: 'home', label: 'Home', accent: '#F59E0B' },
  { key: 'appliances', label: 'Appliances', accent: '#F59E0B' },
  { key: 'toys', label: 'Toys', accent: '#F59E0B' },
  { key: 'food', label: 'Food & H...', accent: '#F59E0B' },
  { key: 'auto', label: 'Auto Acc...', accent: '#F59E0B' },
  { key: '2w', label: '2 Wheel...', accent: '#F59E0B' },
  { key: 'sports', label: 'Sports & ...', accent: '#F59E0B' },
  { key: 'books', label: 'Books & ...', accent: '#F59E0B' },
  { key: 'furniture', label: 'Furniture', accent: '#F59E0B' },
]

const iconPaths = {
  bag: 'M7 8V7a5 5 0 0 1 10 0v1m-12 0h14l-1 12H6L5 8Z',
  tee: 'M9 4 7 6 5 6 4 10l3 1v9h10v-9l3-1-1-4-2 0-2-2',
  phone: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm4 14h0',
  lipstick: 'M10 3h4v5h-4V3Zm-1 5h6v3H9V8Zm1 3v10h4V11h-4Z',
  tv: 'M6 6h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm5-3 2 2 2-2',
  lamp: 'M12 2a6 6 0 0 0-3 11v2h6v-2a6 6 0 0 0-3-11Zm-3 17h6',
  fridge: 'M9 2h6a2 2 0 0 1 2 2v17H7V4a2 2 0 0 1 2-2Zm0 8h8M9 16h1m6 0h1',
  teddy: 'M8.5 9a3.5 3.5 0 1 1 7 0v1.5A3.5 3.5 0 0 1 12 14a3.5 3.5 0 0 1-3.5-3.5V9Zm-2.5.5a2 2 0 1 1 3-1.7M18 9.5a2 2 0 1 0-3-1.7',
  bottle: 'M10 2h4v2l1 2v2a3 3 0 0 1-6 0V6l1-2V2Zm-2 9h8v10H8V11Z',
  car: 'M7 16h10l2-5-2-5H7L5 11l2 5Zm1 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  scooter: 'M7 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM8 17h5l4-6h2l1 4',
  bat: 'M18 4 7 15l2 2L20 6l-2-2Zm-9 13 2 2',
  book: 'M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 0-2 2V4Zm2 14h10',
  sofa: 'M5 12a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5H5v-5Zm1 9h2v-2H6v2Zm12 0h2v-2h-2v2Z',
}

const iconFor = (key) => {
  switch (key) {
    case 'for-you':
      return iconPaths.bag
    case 'fashion':
      return iconPaths.tee
    case 'mobiles':
      return iconPaths.phone
    case 'beauty':
      return iconPaths.lipstick
    case 'electronics':
      return iconPaths.tv
    case 'home':
      return iconPaths.lamp
    case 'appliances':
      return iconPaths.fridge
    case 'toys':
      return iconPaths.teddy
    case 'food':
      return iconPaths.bottle
    case 'auto':
      return iconPaths.car
    case '2w':
      return iconPaths.scooter
    case 'sports':
      return iconPaths.bat
    case 'books':
      return iconPaths.book
    case 'furniture':
      return iconPaths.sofa
    default:
      return iconPaths.bag
  }
}

const TopCategories = ({ variant = 'sidebar' }) => {
  const { openCollectionSearch, openForYou, openFashion, openMobiles, openBeauty, openElectronics, openHomeDecor, openCategory } = useContext(ShopContext)
  const [active, setActive] = useState('for-you')
  const itemRefs = useRef({})
  const navigate = useNavigate()

  const mappedQuery = useMemo(() => {
    return {
      'for-you': 'Fashion',
      fashion: 'Fashion',
      mobiles: 'Mobiles',
      beauty: 'Beauty',
      electronics: 'Electronics',
      home: 'Home',
      appliances: 'Appliances',
      toys: 'Toys',
      food: 'Food',
      auto: 'Auto',
      '2w': '2W',
      sports: 'Sports',
      books: 'Books',
      furniture: 'Furniture',
    }
  }, [])

  const onPick = (key) => {
    setActive(key)
    if (key === 'for-you') {
      openForYou()
    } else if (key === 'fashion') {
      openFashion()
    } else if (key === 'mobiles') {
      openMobiles()
    } else if (key === 'beauty') {
      openBeauty()
    } else if (key === 'electronics') {
      openElectronics()
    } else if (key === 'home') {
      openHomeDecor()
    } else if (key === 'appliances') {
      openCategory('appliances')
    } else if (key === 'toys') {
      openCategory('toys')
    } else if (key === 'food') {
      openCategory('food')
    } else if (key === 'auto') {
      openCategory('extra')
    } else if (key === '2w') {
      openCategory('two-wheeler')
    } else if (key === 'sports') {
      openCategory('sports')
    } else if (key === 'books') {
      openCategory('books')
    } else if (key === 'furniture') {
      openCategory('furniture')
    } else {
      openCollectionSearch(mappedQuery[key] || '')
    }
    itemRefs.current[key]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  if (variant === 'homebar') {
    return (
      <div className='w-full'>
        <div className='rounded-[2.5rem] border border-slate-100 bg-white/80 backdrop-blur-xl shadow-sm'>
          <div className='flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100'>
            <div className='min-w-0'>
              <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Quick Categories</p>
              <p className='mt-1 text-sm font-black tracking-tight text-slate-900'>Browse Instantly</p>
            </div>
            <button
              type='button'
              onClick={() => navigate('/collection')}
              className='h-10 px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10'
            >
              View All
            </button>
          </div>

          <div className='px-3 py-3 overflow-x-auto no-scrollbar'>
            <div className='flex items-center gap-2 min-w-max'>
              {items.map((item) => {
                const isActive = item.key === active
                const iconPath = iconFor(item.key)
                return (
                  <button
                    key={item.key}
                    type='button'
                    onClick={() => onPick(item.key)}
                    ref={(node) => {
                      if (node) itemRefs.current[item.key] = node
                    }}
                    className={`relative h-20 w-[92px] rounded-2xl border transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-2 ${
                      isActive ? 'bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-600/20' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-2xl flex items-center justify-center border ${
                      isActive ? 'bg-white/10 border-white/20' : 'bg-sky-50 border-sky-100'
                    }`}>
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                        <path d={iconPath} />
                      </svg>
                    </div>
                    <span className='text-[11px] font-black tracking-tight truncate w-full px-2 text-center'>{item.label}</span>
                    {isActive && <span className='absolute -bottom-1 left-4 right-4 h-1 rounded-full bg-white/80' />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <aside className='w-full lg:w-60 flex-shrink-0'>
      <div className='sticky top-[70px] space-y-4'>
        <div className='rounded-3xl border border-black/5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-4 transition-all hover:shadow-lg hover:border-black/10'>
          <div className='flex items-center justify-between mb-5 px-1'>
            <h2 className='text-sm font-black tracking-tighter text-slate-900 uppercase'>Categories</h2>
            <button
              onClick={() => navigate('/collection')}
              className='lg:hidden inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1 text-[9px] font-bold text-white shadow-lg active:scale-95'
            >
              ALL
            </button>
          </div>

          {/* Sort Section */}
          <div className='mb-6 space-y-2 px-1'>
            <p className='text-[9px] font-bold tracking-widest text-slate-400 uppercase'>Sort By</p>
            <div className='flex flex-wrap gap-1.5 lg:flex-col lg:gap-1'>
              {['Relevance', 'Popularity', 'Newest First'].map((label, idx) => (
                <button
                  key={label}
                  className={`text-[10px] text-left px-3 py-1.5 rounded-lg transition-all duration-300 active:scale-[0.98] ${
                    idx === 0 
                      ? 'bg-slate-50 text-slate-900 font-bold border border-black/5' 
                      : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-800 font-medium'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className='flex flex-wrap gap-1.5 lg:flex-col lg:gap-1 custom-scrollbar lg:max-h-[calc(100vh-480px)] lg:overflow-y-auto pr-1'>
            {items.map((item) => {
              const isActive = item.key === active
              const iconPath = iconFor(item.key)
              return (
                <button
                  key={item.key}
                  type='button'
                  onClick={() => {
                    onPick(item.key)
                  }}
                  ref={(node) => { if (node) itemRefs.current[item.key] = node }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left text-[11px] font-bold transition-all duration-300 active:scale-[0.98] w-full group ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className={`transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <path d={iconPath} />
                    </svg>
                  </div>
                  <span className='truncate'>{item.label}</span>
                  {isActive && (
                    <div className='ml-auto bg-white/20 rounded-md p-0.5'>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Promo Card Removed */}

        <button
          onClick={() => navigate('/collection')}
          className='hidden lg:flex w-full items-center justify-center rounded-2xl bg-slate-900 p-3.5 text-[10px] font-black text-white tracking-[0.2em] shadow-xl shadow-slate-900/10 transition-all hover:bg-black active:scale-[0.98] uppercase'
        >
          VIEW ALL PRODUCTS
        </button>
      </div>
    </aside>
  )
}

export default TopCategories
