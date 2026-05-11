import React, { useContext, useEffect, useRef, useState } from 'react'
import {assets} from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, User, ShoppingCart, Menu, X,
  ChevronDown, Heart, Package, LogOut, Shield,
  ArrowRight
} from 'lucide-react';

const ELECTRONICS_LABEL_TO_SLUG = {
  Smartphones: 'smartphones',
  Tablets: 'tablets',
  Accessories: 'accessories',
  Laptops: 'laptops',
  Gaming: 'gaming',
  Monitors: 'monitors',
  Headphones: 'headphones',
  Speakers: 'speakers',
  Soundbars: 'soundbars',
}

const pickFirstUrl = (...globs) => {
  for (const g of globs || []) {
    const urls = Object.values(g || {})
    if (urls.length) return urls[0]
  }
  return ''
}

const toTitle = (value) =>
  String(value || '')
    .trim()
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const initials = (label) => {
  const words = String(label || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const a = (words[0] || '').slice(0, 1)
  const b = (words[1] || '').slice(0, 1)
  const s = `${a}${b}`.toUpperCase()
  return s || '•'
}

const safeAssetUrl = (value) => {
  const unwrapped = value && typeof value === 'object' && 'default' in value ? value.default : value
  const raw = typeof unwrapped === 'string' ? unwrapped : String(unwrapped || '')
  if (!raw) return ''
  const escaped = raw.replace(/%(?![0-9A-Fa-f]{2})/g, '%25')
  try {
    return encodeURI(escaped)
  } catch {
    return escaped
  }
}

const ELECTRONICS_THUMB_URLS = {
  smartphones: safeAssetUrl(
    pickFirstUrl(
      import.meta.glob('../assets/Smartphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }),
      import.meta.glob('../assets/smartphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })
    )
  ),
  tablets: safeAssetUrl(
    pickFirstUrl(
      import.meta.glob('../assets/Tablets/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }),
      import.meta.glob('../assets/tablets/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })
    )
  ),
  accessories: safeAssetUrl(
    pickFirstUrl(
      import.meta.glob('../assets/Accessories/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }),
      import.meta.glob('../assets/accessories/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })
    )
  ),
  laptops: safeAssetUrl(
    pickFirstUrl(
      import.meta.glob('../assets/Laptops/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }),
      import.meta.glob('../assets/laptops/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })
    )
  ),
  gaming: safeAssetUrl(
    pickFirstUrl(
      import.meta.glob('../assets/Gaming/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }),
      import.meta.glob('../assets/gaming/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })
    )
  ),
  monitors: safeAssetUrl(
    pickFirstUrl(
      import.meta.glob('../assets/Monitors/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }),
      import.meta.glob('../assets/monitors/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })
    )
  ),
  headphones: safeAssetUrl(
    pickFirstUrl(
      import.meta.glob('../assets/Headphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }),
      import.meta.glob('../assets/headphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })
    )
  ),
  speakers: safeAssetUrl(
    pickFirstUrl(
      import.meta.glob('../assets/Speakers/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }),
      import.meta.glob('../assets/speakers/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })
    )
  ),
  soundbars: safeAssetUrl(
    pickFirstUrl(
      import.meta.glob('../assets/Soundbars/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }),
      import.meta.glob('../assets/soundbars/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })
    )
  ),
}

const Navbar = () => {
    const [visible,setVisible] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false)
    const [activeMegaMenu, setActiveMegaMenu] = useState(null)
    const profileRef = useRef(null)
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [electronicsPreviewSlug, setElectronicsPreviewSlug] = useState('smartphones')

    const {setShowSearch, getCartCount, navigate, token, logout, userProfile, setShowAuthModal, openCollectionSearch} = useContext(ShopContext);

    useEffect(() => {
      const handleScroll = () => {
        const currentScrollY = window.scrollY
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
        setLastScrollY(currentScrollY)
      }
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY])

    const electronicsPreviewUrl = ELECTRONICS_THUMB_URLS[electronicsPreviewSlug] || ''

    const openFashionFiltered = (parentCategory, subLabel) => {
      const cat = String(parentCategory || '').trim()
      const sub = String(subLabel || '').trim()
      if (!cat || !sub) return

      if (cat === 'Men' && sub === 'Clothing') {
        navigate('/fashion/clothing')
        setActiveMegaMenu(null)
        return
      }

      if (cat === 'Men' && sub === 'Footwear') {
        navigate('/fashion/footwear')
        setActiveMegaMenu(null)
        return
      }

      if (cat === 'Men' && sub === 'Accessories') {
        navigate('/fashion/accessories')
        setActiveMegaMenu(null)
        return
      }

      if (cat === 'Women' && sub === 'Ethnic Wear') {
        navigate('/fashion/ethnic-wear')
        setActiveMegaMenu(null)
        return
      }

      if (cat === 'Women' && sub === 'Western Wear') {
        navigate('/fashion/western-wear')
        setActiveMegaMenu(null)
        return
      }

      if (cat === 'Women' && sub === 'Beauty') {
        navigate('/fashion/beauty')
        setActiveMegaMenu(null)
        return
      }

      if (cat === 'Kids' && sub === 'Boys') {
        navigate('/fashion/boys')
        setActiveMegaMenu(null)
        return
      }

      if (cat === 'Kids' && sub === 'Girls') {
        navigate('/fashion/girls')
        setActiveMegaMenu(null)
        return
      }

      if (cat === 'Kids' && sub === 'Baby Care') {
        navigate('/fashion/baby-care')
        setActiveMegaMenu(null)
        return
      }

      const map = {
        Men: {
          Clothing: ['Topwear', 'Bottomwear', 'Winterwear'],
          Footwear: ['Footwear'],
          Accessories: ['Accessories'],
        },
        Women: {
          'Ethnic Wear': ['Ethnic Wear'],
          'Western Wear': ['Western Wear'],
          Beauty: ['Beauty'],
        },
        Kids: {
          Boys: ['Boys'],
          Girls: ['Girls'],
          'Baby Care': ['Baby Care'],
        },
      }

      const mappedSubs = map?.[cat]?.[sub]
      if (mappedSubs) {
        openCollectionSearch('', { category: cat, subCategory: mappedSubs })
        return
      }

      openCollectionSearch('', { category: cat, subCategory: sub })
    }

    const toSlug = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

    const openCategoryPage = (categorySlug, subSlug) => {
      const cat = toSlug(categorySlug)
      const sub = toSlug(subSlug)
      if (!cat || !sub) return
      navigate(`/${cat}/${sub}`)
      setActiveMegaMenu(null)
      scrollTo(0, 0)
    }

    const megaMenuItems = {
      fashion: {
        title: 'Fashion',
        categories: [
          { name: 'Men', sub: ['Clothing', 'Footwear', 'Accessories'], action: (s) => openFashionFiltered('Men', s) },
          { name: 'Women', sub: ['Ethnic Wear', 'Western Wear', 'Beauty'], action: (s) => openFashionFiltered('Women', s) },
          { name: 'Kids', sub: ['Boys', 'Girls', 'Baby Care'], action: (s) => openFashionFiltered('Kids', s) }
        ]
      },
      electronics: {
        title: 'Electronics',
        categories: [
          {
            name: 'Mobiles',
            sub: ['Smartphones', 'Tablets', 'Accessories'],
            action: (s) => {
              const map = { Mobiles: 'smartphones', Smartphones: 'smartphones', Tablets: 'tablets', Accessories: 'accessories' }
              openCategoryPage('electronics', map[s] || s)
            },
          },
          {
            name: 'Computing',
            sub: ['Laptops', 'Gaming', 'Monitors'],
            action: (s) => {
              const map = { Computing: 'laptops', Laptops: 'laptops', Gaming: 'gaming', Monitors: 'monitors' }
              openCategoryPage('electronics', map[s] || s)
            },
          },
          {
            name: 'Audio',
            sub: ['Headphones', 'Speakers', 'Soundbars'],
            action: (s) => {
              const map = { Audio: 'headphones', Headphones: 'headphones', Speakers: 'speakers', Soundbars: 'soundbars' }
              openCategoryPage('electronics', map[s] || s)
            },
          },
        ]
      },
      home: {
        title: 'Home & Kitchen',
        categories: [
          {
            name: 'Decor',
            sub: ['Lighting', 'Furniture', 'Home Decor'],
            action: (s) => {
              const map = { Decor: 'home-decor', Lighting: 'lighting', Furniture: 'furniture', 'Home Decor': 'home-decor' }
              openCategoryPage('home-kitchen', map[s] || s)
            },
          },
          {
            name: 'Kitchen',
            sub: ['Appliances', 'Kitchen Items', 'Storage'],
            action: (s) => {
              const map = { Kitchen: 'appliances', Appliances: 'appliances', 'Kitchen Items': 'kitchen-items', Storage: 'storage' }
              openCategoryPage('home-kitchen', map[s] || s)
            },
          },
          {
            name: 'Living',
            sub: ['Bathroom', 'Smart Home', 'Grocery'],
            action: (s) => {
              const map = { Living: 'bathroom', Bathroom: 'bathroom', 'Smart Home': 'smart-home', Grocery: 'grocery' }
              openCategoryPage('home-kitchen', map[s] || s)
            },
          },
        ]
      },
      lifestyle: {
        title: 'Lifestyle',
        categories: [
          {
            name: 'Sports',
            sub: ['Gym', 'Cricket', 'Football'],
            action: (s) => {
              const map = { Sports: 'gym', Gym: 'gym', Cricket: 'cricket', Football: 'football' }
              openCategoryPage('lifestyle', map[s] || 'gym')
            },
          },
          {
            name: 'Books',
            sub: ['Story Books', 'Technology', 'Business'],
            action: (s) => {
              const map = { Books: 'story-books', 'Story Books': 'story-books', Technology: 'technology', Business: 'business' }
              openCategoryPage('lifestyle', map[s] || 'story-books')
            },
          },
          {
            name: 'Toys',
            sub: ['Gaming', 'Action Figures', 'Learning'],
            action: (s) => {
              const map = { Toys: 'gaming', Gaming: 'gaming', 'Action Figures': 'action-figures', Learning: 'learning' }
              openCategoryPage('lifestyle', map[s] || 'gaming')
            },
          },
        ]
      }
    }

    const roleItems = [
      { key: 'Admin', title: 'Admin Dashboard', icon: Shield, show: userProfile?.role === 'admin', action: () => navigate('/admin') },
      { key: 'Seller', title: 'Seller Dashboard', icon: Package, show: userProfile?.role === 'seller', action: () => navigate('/seller') },
      { key: 'Orders', title: 'My Orders', icon: Package, show: true, action: () => navigate('/orders') },
      { key: 'Profile', title: 'My Profile', icon: User, show: true, action: () => navigate('/profile') },
    ]

    const handleAccountClick = () => {
      if (token) setProfileOpen(!profileOpen)
      else setShowAuthModal(true)
    }

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
        if (!e.target.closest('.mega-menu-trigger') && !e.target.closest('.mega-menu-panel')) setActiveMegaMenu(null)
      }
      window.addEventListener('mousedown', handleClickOutside)
      return () => window.removeEventListener('mousedown', handleClickOutside)
    }, [])

  return (
    <nav className={`fixed top-4 left-0 right-0 z-50 transition-all duration-500 ${isVisible ? 'translate-y-0' : '-translate-y-28'}`}>
      <div className="mx-auto w-[94%] max-w-7xl">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] px-6 xl:px-8 py-2.5 flex items-center justify-between relative shadow-2xl shadow-slate-900/5">
          
          {/* Logo */}
          <Link to='/' className='flex items-center gap-3 group' onClick={() => scrollTo(0,0)}>
            <img src={assets.logo} className='h-10 sm:h-11 lg:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105' alt="Logo" />
          </Link>

          {/* Main Navigation */}
          <ul className='hidden lg:flex items-center gap-1 xl:gap-2'>
            {[
              { to: '/', label: 'HOME' },
              { label: 'FASHION', mega: 'fashion' },
              { label: 'ELECTRONICS', mega: 'electronics' },
              { label: 'HOME & KITCHEN', mega: 'home' },
              { label: 'LIFESTYLE', mega: 'lifestyle' },
              { to: '/collection', label: 'COLLECTION' },
              { to: '/about', label: 'ABOUT' },
              { to: '/contact', label: 'CONTACT' },
            ].map((link) => (
              <li key={link.label} className="relative mega-menu-trigger">
                {link.to ? (
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `px-3 py-2 text-[11px] font-black tracking-widest transition-all duration-300 rounded-xl hover:bg-slate-50 ${
                        isActive ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ) : (
                  <button
                    onMouseEnter={() => setActiveMegaMenu(link.mega)}
                    className={`px-3 py-2 text-[11px] font-black tracking-widest transition-all duration-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 ${
                      activeMegaMenu === link.mega ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMegaMenu === link.mega ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className='flex items-center gap-2 sm:gap-3'>
            <button
              onClick={()=> { setShowSearch(true); navigate('/collection') }}
              className='h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-all active:scale-90'
              aria-label='Search'
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <div className='relative' ref={profileRef}>
              <button
                onClick={handleAccountClick}
                className={`h-10 px-3 rounded-xl transition-all active:scale-90 flex items-center gap-2 ${profileOpen ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <User className="w-[18px] h-[18px]" />
                {token && userProfile && (
                  <span className="hidden xl:block text-[11px] font-black tracking-widest uppercase truncate max-w-[80px]">
                    {userProfile.name.split(' ')[0]}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className='absolute right-0 top-full mt-3 w-64 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl z-[100]'
                  >
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>Authenticated as</p>
                      <p className='text-sm font-black text-slate-900 truncate'>{userProfile?.name || 'Guest User'}</p>
                      <p className='text-[10px] font-bold text-blue-600 uppercase mt-0.5'>{userProfile?.role || 'Visitor'}</p>
                    </div>

                    <div className='p-2'>
                      {roleItems.filter(r => r.show).map((r) => (
                        <button
                          key={r.key}
                          onClick={() => { setProfileOpen(false); r.action() }}
                          className='w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black text-slate-600 hover:bg-slate-900 hover:text-white transition-all group'
                        >
                          <r.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          {r.title}
                          <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                      
                      <button
                        onClick={() => { setProfileOpen(false); logout() }}
                        className='w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black text-rose-500 hover:bg-rose-50 transition-all mt-1'
                      >
                        <LogOut className="w-4 h-4" />
                        Logout Session
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to='/cart' className='relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-all active:scale-90 group'>
              <ShoppingCart className="w-[18px] h-[18px] group-hover:text-blue-600 transition-colors" />
              {getCartCount() > 0 && (
                <span className='absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white ring-2 ring-white'>
                  {getCartCount()}
                </span>
              )}
            </Link>

            <button 
              onClick={()=>setVisible(true)} 
              className='p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-all active:scale-90 lg:hidden'
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mega Menu Overlay */}
          <AnimatePresence>
            {activeMegaMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                onMouseLeave={() => setActiveMegaMenu(null)}
                className="mega-menu-panel absolute top-[calc(100%+12px)] left-0 right-0 bg-white/95 backdrop-blur-xl border border-slate-200 p-10 shadow-2xl rounded-[3rem] z-[60] overflow-hidden origin-top"
              >
                <div className="mx-auto max-w-7xl grid grid-cols-4 gap-12">
                  {megaMenuItems[activeMegaMenu].categories.map((cat) => (
                    <div key={cat.name} className="space-y-6">
                      <button 
                        onClick={() => { megaMenuItems[activeMegaMenu].categories.find(c => c.name === cat.name).action(cat.name); setActiveMegaMenu(null); }}
                        className="text-[11px] font-black tracking-[0.3em] text-sky-600 uppercase hover:text-sky-400 transition-colors flex items-center gap-2"
                      >
                        <span className="w-4 h-px bg-sky-200" />
                        {cat.name}
                      </button>
                      <ul className="space-y-4">
                        {cat.sub.map((s) => (
                          <li key={s}>
                            <button 
                              onClick={() => { megaMenuItems[activeMegaMenu].categories.find(c => c.name === cat.name).action(s); setActiveMegaMenu(null); }}
                              onMouseEnter={() => {
                                if (activeMegaMenu !== 'electronics') return
                                const slug = ELECTRONICS_LABEL_TO_SLUG[s]
                                if (slug) setElectronicsPreviewSlug(slug)
                              }}
                              onFocus={() => {
                                if (activeMegaMenu !== 'electronics') return
                                const slug = ELECTRONICS_LABEL_TO_SLUG[s]
                                if (slug) setElectronicsPreviewSlug(slug)
                              }}
                              className={`w-full text-left flex items-center gap-3 group/item transition-all ${
                                activeMegaMenu === 'electronics'
                                  ? 'rounded-2xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                                  : 'text-sm font-bold text-slate-500 hover:text-sky-600'
                              }`}
                            >
                              {activeMegaMenu === 'electronics' && ELECTRONICS_LABEL_TO_SLUG[s] ? (
                                <>
                                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm flex items-center justify-center">
                                    <span className="text-[10px] font-black tracking-widest text-slate-500">
                                      {initials(s)}
                                    </span>
                                    {ELECTRONICS_THUMB_URLS[ELECTRONICS_LABEL_TO_SLUG[s]] ? (
                                      <img
                                        src={ELECTRONICS_THUMB_URLS[ELECTRONICS_LABEL_TO_SLUG[s]]}
                                        alt=''
                                        loading='lazy'
                                        decoding='async'
                                        className="absolute inset-0 h-full w-full object-contain p-1.5"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                        }}
                                      />
                                    ) : null}
                                  </span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/item:bg-sky-500 group-hover/item:scale-125 transition-all" />
                                  <span>{s}</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/item:bg-sky-500 group-hover/item:scale-125 transition-all" />
                                  {s}
                                </>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  
                  {/* Limited Deals Card */}
                  <div
                    className={`col-span-1 rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden group/card shadow-xl ${
                      'bg-sky-600 shadow-sky-600/20'
                    }`}
                    style={
                      activeMegaMenu === 'electronics' && electronicsPreviewUrl
                        ? {
                            backgroundImage: `linear-gradient(120deg, rgba(2,132,199,0.92) 0%, rgba(2,132,199,0.55) 55%, rgba(2,6,23,0.25) 100%), url(${electronicsPreviewUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover/card:scale-150 transition-transform duration-700" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse" />
                        <p className="text-[10px] font-black tracking-[0.3em] text-sky-100">
                          {activeMegaMenu === 'electronics' ? 'FEATURED CATEGORY' : 'LIMITED DEALS'}
                        </p>
                      </div>
                      <h3 className="text-2xl font-black leading-tight uppercase tracking-tighter">
                        {activeMegaMenu === 'electronics'
                          ? `${toTitle(electronicsPreviewSlug)} Deals`
                          : (
                            <>
                              Up to 60% Off<br />New Arrivals
                            </>
                          )}
                      </h3>
                      {activeMegaMenu === 'electronics' ? (
                        <p className="mt-3 text-xs font-semibold text-white/75">Shop the latest picks from this category.</p>
                      ) : null}
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (activeMegaMenu === 'electronics') {
                          navigate(`/electronics/${electronicsPreviewSlug || 'smartphones'}`)
                          setActiveMegaMenu(null)
                          scrollTo(0, 0)
                          return
                        }
                        navigate('/collection', {
                          state: {
                            filters: {
                              mainCategory: ['fashion', 'electronics', 'home-kitchen', 'lifestyle'],
                              allCollections: true,
                              collectionTitle: 'All Collections',
                              collectionEyebrow: 'Shop',
                            },
                          },
                        })
                        setActiveMegaMenu(null)
                      }}
                      className="relative z-10 w-full py-4 bg-white text-sky-600 rounded-2xl text-[11px] font-black tracking-[0.2em] hover:bg-sky-50 transition-all active:scale-95 shadow-lg"
                    >
                      SHOP NOW
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {visible && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={()=>setVisible(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-[300px] bg-white z-[101] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <p className="text-xs font-black tracking-widest text-slate-400 uppercase">Navigation</p>
                <button onClick={()=>setVisible(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-6">
                <div className="space-y-2">
                  {[
                    { to: '/', label: 'HOME' },
                    { to: '/collection', label: 'COLLECTION' },
                    { to: '/about', label: 'ABOUT' },
                    { to: '/contact', label: 'CONTACT' },
                  ].map((link) => (
                    <NavLink 
                      key={link.to}
                      to={link.to}
                      onClick={()=>setVisible(false)}
                      className={({ isActive }) => 
                        `flex items-center justify-between p-4 rounded-2xl text-sm font-black transition-all ${
                          isActive ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-600 hover:bg-slate-50'
                        }`
                      }
                    >
                      {link.label}
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </NavLink>
                  ))}
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase px-4">Shop Categories</p>
                  <div className="grid grid-cols-2 gap-2 px-2">
                      {Object.entries(megaMenuItems).map(([key, item]) => (
                        <button
                          key={key}
                          onClick={() => { openCollectionSearch(item.title, { category: item.title }); setVisible(false); }}
                          className="p-4 rounded-2xl bg-slate-50 text-slate-900 text-[11px] font-black uppercase text-left hover:bg-slate-100 transition-all border border-slate-100"
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                {token ? (
                  <button onClick={logout} className="w-full p-4 bg-rose-50 text-rose-500 rounded-2xl text-sm font-black flex items-center justify-center gap-3">
                    <LogOut className="w-5 h-5" /> Logout Session
                  </button>
                ) : (
                  <button onClick={() => { setShowAuthModal(true); setVisible(false); }} className="w-full p-4 bg-slate-900 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-3">
                    <User className="w-5 h-5" /> Secure Login
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
