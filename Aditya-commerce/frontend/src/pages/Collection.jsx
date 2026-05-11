import React, { useContext, useEffect, useState, useRef, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import ProductItem from '../components/ProductItem';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, ChevronDown, Grid, List, Search, SlidersHorizontal, RotateCcw, X, Check } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { normalizeProductImages } from '../utils/defaultProducts'

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

const fashionHeroAssets = {
  clothing: [
    ...Object.values(import.meta.glob('../assets/clothing/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Clothing/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/p_img*.png', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  footwear: [
    ...Object.values(import.meta.glob('../assets/footwear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Footwear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  accessories: [
    ...Object.values(import.meta.glob('../assets/accessories/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Accessories/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  beauty: [
    ...Object.values(import.meta.glob('../assets/beauty/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Beauty/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  'ethnic-wear': [
    ...Object.values(import.meta.glob('../assets/Ethnic Wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/ethnic-wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/ethnic wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  'western-wear': [
    ...Object.values(import.meta.glob('../assets/Western Wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/western-wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/western wear/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  boys: [
    ...Object.values(import.meta.glob('../assets/Boys Kids/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/boys-kids/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/boys kids/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/boys/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Boys/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  girls: [
    ...Object.values(import.meta.glob('../assets/Girls Kids/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/girls-kids/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/girls kids/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/girls/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Girls/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  'baby-care': [
    ...Object.values(import.meta.glob('../assets/Baby Care/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/baby-care/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/baby care/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Baby-Care/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/babycare/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
}

const homeKitchenHeroAssets = {
  lighting: Object.values(import.meta.glob('../assets/lighting/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })).map(safeAssetUrl),
  furniture: Object.values(import.meta.glob('../assets/furniture/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })).map(safeAssetUrl),
  'home-decor': [
    ...Object.values(import.meta.glob('../assets/Home Decor/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/home-decor/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/home decor/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  appliances: Object.values(import.meta.glob('../assets/appliances/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })).map(safeAssetUrl),
  'kitchen-items': [
    ...Object.values(import.meta.glob('../assets/Kitchen Items/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/kitchen-items/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/kitchen items/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  storage: Object.values(import.meta.glob('../assets/storage/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })).map(safeAssetUrl),
  bathroom: Object.values(import.meta.glob('../assets/bathroom/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })).map(safeAssetUrl),
  'smart-home': [
    ...Object.values(import.meta.glob('../assets/Smart Home/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/smart-home/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/smart home/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  grocery: Object.values(import.meta.glob('../assets/grocery/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })).map(safeAssetUrl),
}

const lifestyleHeroAssets = {
  gym: [
    ...Object.values(import.meta.glob('../assets/gym/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Gym/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  cricket: [
    ...Object.values(import.meta.glob('../assets/cricket/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Cricket/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  football: [
    ...Object.values(import.meta.glob('../assets/football/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Football/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  'story-books': [
    ...Object.values(import.meta.glob('../assets/story-books/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Story Books/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  technology: [
    ...Object.values(import.meta.glob('../assets/technology/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Technology/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  business: [
    ...Object.values(import.meta.glob('../assets/business/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Business/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  gaming: [
    ...Object.values(import.meta.glob('../assets/gaming/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Gaming/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  'action-figures': [
    ...Object.values(import.meta.glob('../assets/action-figures/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Action Figures/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  learning: [
    ...Object.values(import.meta.glob('../assets/learning/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Learning/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
}

const electronicsHeroAssets = {
  smartphones: [
    ...Object.values(import.meta.glob('../assets/smartphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Smartphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  tablets: [
    ...Object.values(import.meta.glob('../assets/tablets/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Tablets/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  accessories: [
    ...Object.values(import.meta.glob('../assets/accessories/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Accessories/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  laptops: [
    ...Object.values(import.meta.glob('../assets/laptops/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Laptops/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  gaming: [
    ...Object.values(import.meta.glob('../assets/gaming/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Gaming/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  monitors: [
    ...Object.values(import.meta.glob('../assets/monitors/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Monitors/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  headphones: [
    ...Object.values(import.meta.glob('../assets/headphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Headphones/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  speakers: [
    ...Object.values(import.meta.glob('../assets/speakers/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Speakers/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
  soundbars: [
    ...Object.values(import.meta.glob('../assets/soundbars/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
    ...Object.values(import.meta.glob('../assets/Soundbars/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })),
  ].map(safeAssetUrl),
}

const fashionPreviewAssets = [
  ...((fashionHeroAssets?.['western-wear'] || []).map(safeAssetUrl)),
  ...((fashionHeroAssets?.['ethnic-wear'] || []).map(safeAssetUrl)),
  ...((fashionHeroAssets?.girls || []).map(safeAssetUrl)),
]

const RevealSection = ({ children, delay = 0 }) => {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

const Collection = ({ preset }) => {

  const { products , search , showSearch, loadingProducts, setSearch, setShowSearch, backendUrl, productsRevision } = useContext(ShopContext);
  const location = useLocation();
  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] = useState([]);
  const [category,setCategory] = useState([]);
  const [subCategory,setSubCategory] = useState([]);
  const [brand,setBrand] = useState([]);
  const [excludeSubCategory, setExcludeSubCategory] = useState([])
  const [sortType,setSortType] = useState('relavent')
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [colors, setColors] = useState([])
  const [discountRange, setDiscountRange] = useState(null)
  const [sizesFilter, setSizesFilter] = useState([])
  const [minRating, setMinRating] = useState(null)
  const [genderFilter, setGenderFilter] = useState([])

  const getProductBrand = (item) => {
    if (item?.brand) return String(item.brand)
    if (item?.subCategory) return item.subCategory
    if (item?.name) return String(item.name).split(' ')[0]
    return 'Other'
  }

  const clearAllFilters = () => {
    setCategory([])
    setSubCategory([])
    setBrand([])
    setExcludeSubCategory([])
    setPriceRange([0, 100000])
    setColors([])
    setDiscountRange(null)
    setSizesFilter([])
    setMinRating(null)
    setGenderFilter([])
  }

  const normalizeKey = (value) => String(value || '').trim().toLowerCase()

  const fashionScopeKey = preset?.scope?.kind === 'fashion' ? normalizeKey(preset?.scope?.key) : ''
  const [remoteProducts, setRemoteProducts] = useState([])
  const [remoteLoading, setRemoteLoading] = useState(false)

  const stateFilters = location.state?.filters
  const remoteEnabled = Boolean(
    fashionScopeKey ||
      preset?.remote ||
      stateFilters?.mainCategory ||
      stateFilters?.section ||
      stateFilters?.categorySlug ||
      stateFilters?.category ||
      stateFilters?.subCategory ||
      stateFilters?.brand
  )

  const effectiveProducts = remoteEnabled ? remoteProducts : products
  const effectiveLoading = remoteEnabled ? remoteLoading : loadingProducts

  useEffect(() => {
    if (!remoteEnabled) return
    let cancelled = false
    const load = async () => {
      setRemoteLoading(true)
      try {
        const params = new URLSearchParams()
        const incoming = preset?.filters || stateFilters || {}
        params.set('limit', incoming?.allCollections ? '120' : '60')
        if (fashionScopeKey) {
          params.set('category', fashionScopeKey)
        } else {
          const f = incoming || {}
          const addList = (key, value) => {
            if (!value) return
            const list = Array.isArray(value) ? value : [value]
            const cleaned = list.map((v) => String(v || '').trim()).filter(Boolean)
            if (cleaned.length) params.set(key, cleaned.join(','))
          }
          addList('category', f.category)
          addList('subCategory', f.subCategory)
          addList('brand', f.brand)
          addList('mainCategory', f.mainCategory)
          addList('section', f.section)
          addList('categorySlug', f.categorySlug)
          if (f.gender) params.set('gender', String(f.gender))
          if (f.fashionCategory) params.set('fashionCategory', String(f.fashionCategory))
          if (f.search) params.set('q', String(f.search))
        }
        const url = `${backendUrl}/api/products?${params.toString()}`
        const res = await fetch(url)
        const data = await res.json()
        const list = Array.isArray(data?.products) ? data.products : []
        if (!cancelled) setRemoteProducts(list.map(normalizeProductImages))
      } catch {
        if (!cancelled) setRemoteProducts([])
      } finally {
        if (!cancelled) setRemoteLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [backendUrl, fashionScopeKey, remoteEnabled, preset?.filters, preset?.remote, stateFilters, productsRevision])

  const matchesFashionScope = (item, key) => {
    const k = normalizeKey(key)
    if (!k) return true

    const attr = (item?.attributes && typeof item.attributes === 'object') ? item.attributes : {}
    const fashionCategory = normalizeKey(attr.fashionCategory || item.fashionCategory || '')
    const cat = normalizeKey(item?.category)
    const sub = normalizeKey(item?.subCategory)

    if (fashionCategory) {
      const map = {
        clothing: 'clothing',
        footwear: 'footwear',
        accessories: 'accessories',
        'ethnic wear': 'ethnic-wear',
        'ethnic-wear': 'ethnic-wear',
        'western wear': 'western-wear',
        'western-wear': 'western-wear',
        beauty: 'beauty',
        boys: 'boys',
        girls: 'girls',
        'baby care': 'baby-care',
        'baby-care': 'baby-care',
      }
      const normalized = map[fashionCategory] || fashionCategory
      return normalized === k
    }

    const isFashionBase = ['men', 'women', 'kids', 'fashion', 'beauty'].includes(cat)
    if (!isFashionBase) return false

    if (k === 'clothing') {
      const allowSubs = ['topwear', 'bottomwear', 'winterwear', 'clothing']
      const denySubs = ['footwear', 'accessories', 'ethnic wear', 'western wear', 'beauty', 'boys', 'girls', 'baby care']
      if (denySubs.includes(sub)) return false
      return allowSubs.includes(sub) || cat === 'men' || cat === 'women' || cat === 'kids'
    }

    if (k === 'footwear') return sub.includes('footwear')
    if (k === 'accessories') return sub.includes('accessories')
    if (k === 'ethnic-wear') return sub.includes('ethnic wear')
    if (k === 'western-wear') return sub.includes('western wear')
    if (k === 'beauty') return cat === 'beauty' || sub.includes('beauty')
    if (k === 'boys') return cat === 'kids' && sub.includes('boys')
    if (k === 'girls') return cat === 'kids' && sub.includes('girls')
    if (k === 'baby-care') return cat === 'kids' && sub.includes('baby care')

    return isFashionBase
  }

  const scopedProducts = useMemo(() => {
    if (!fashionScopeKey) return effectiveProducts
    return (effectiveProducts || []).filter((p) => matchesFashionScope(p, fashionScopeKey))
  }, [effectiveProducts, fashionScopeKey])

  // Handle incoming navigation state for filters
  useEffect(() => {
    clearAllFilters()
    setShowSearch(false)
    setSearch('')
    const incoming = location.state?.filters || preset?.filters
    if (incoming) {
      const { category: cat, subCategory: sub, search: query, excludeSubCategory: excludeSub } = incoming;
      
      if (cat) {
        setCategory(Array.isArray(cat) ? cat : [cat]);
        setShowFilter(true);
      }
      if (sub) {
        setSubCategory(Array.isArray(sub) ? sub : [sub]);
        setShowFilter(true);
      }
      if (excludeSub) {
        setExcludeSubCategory(Array.isArray(excludeSub) ? excludeSub : [excludeSub])
      }
      if (query) {
        setSearch(query);
        setShowSearch(true);
      }
    }
  }, [location.state, preset?.scope?.kind, preset?.scope?.key, preset?.title]);

  // Dynamic filter options based on available products
  const availableCategories = useMemo(() => {
    const cats = new Set(scopedProducts.map(p => p.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [scopedProducts])

  const availableSubCategories = useMemo(() => {
    // If a category is selected, show only relevant subcategories
    const filteredProducts = category.length > 0 
      ? scopedProducts.filter(p => category.includes(p.category))
      : scopedProducts
    
    const subs = new Set(filteredProducts.map(p => p.subCategory).filter(Boolean).filter((s) => !excludeSubCategory.includes(s)))
    return Array.from(subs).sort()
  }, [scopedProducts, category, excludeSubCategory])

  const availableBrands = useMemo(() => {
    const brands = new Set(scopedProducts.map(getProductBrand).filter(Boolean))
    return Array.from(brands).sort()
  }, [scopedProducts])

  const availableColors = useMemo(() => {
    const colorMap = new Map()
    scopedProducts.forEach(p => {
      const attr = (p?.attributes && typeof p.attributes === 'object') ? p.attributes : {}
      const list = []
      const direct = Array.isArray(p?.colors) ? p.colors : []
      const attrColors = Array.isArray(attr?.colors) ? attr.colors : []
      const single = p.color || p.productColor || attr.color
      if (direct.length) list.push(...direct)
      if (attrColors.length) list.push(...attrColors)
      if (single) list.push(single)
      if (!list.length) list.push('Other')
      for (const c of list.map((v) => String(v || '').trim()).filter(Boolean)) {
        if (!colorMap.has(c)) {
          colorMap.set(c, 0)
        }
        colorMap.set(c, colorMap.get(c) + 1)
      }
    })
    return Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1])
  }, [scopedProducts])

  const availableSizes = useMemo(() => {
    const set = new Set()
    for (const p of scopedProducts || []) {
      const sizes = Array.isArray(p?.sizes) ? p.sizes : []
      for (const s of sizes) {
        if (!s) continue
        set.add(String(s))
      }
    }
    return Array.from(set.values()).sort((a, b) => String(a).localeCompare(String(b)))
  }, [scopedProducts])

  const getProductGender = (item) => {
    const attr = (item?.attributes && typeof item.attributes === 'object') ? item.attributes : {}
    const g = String(attr.gender || item.gender || '').trim()
    if (g) return g
    const cat = String(item?.category || '').trim()
    if (['Men', 'Women', 'Kids', 'Unisex'].includes(cat)) return cat
    return 'Unisex'
  }

  const availableGenders = useMemo(() => {
    const set = new Set()
    for (const p of scopedProducts || []) {
      const g = getProductGender(p)
      if (g) set.add(g)
    }
    const order = ['Men', 'Women', 'Kids', 'Unisex']
    return Array.from(set.values()).sort((a, b) => order.indexOf(a) - order.indexOf(b))
  }, [scopedProducts])

  const colorOptions = [
    { name: 'Gold', color: '#FFD700' },
    { name: 'Pink', color: '#EC4899' },
    { name: 'Green', color: '#10B981' },
    { name: 'Blue', color: '#3B82F6' },
    { name: 'Black', color: '#000000' },
    { name: 'Purple', color: '#A855F7' },
    { name: 'Red', color: '#EF4444' },
  ]

  const discountOptions = [
    { label: '10% and above', min: 10 },
    { label: '20% and above', min: 20 },
    { label: '30% and above', min: 30 },
    { label: '40% and above', min: 40 },
    { label: '50% and above', min: 50 },
    { label: '60% and above', min: 60 },
    { label: '70% and above', min: 70 },
    { label: '80% and above', min: 80 },
    { label: '90% and above', min: 90 },
  ]

  const toggleCategory = (val) => {
    if (category.includes(val)) {
        setCategory(prev=> prev.filter(item => item !== val))
    }
    else{
      setCategory(prev => [...prev, val])
    }
  }

  const toggleSubCategory = (val) => {
    if (subCategory.includes(val)) {
      setSubCategory(prev=> prev.filter(item => item !== val))
    }
    else{
      setSubCategory(prev => [...prev, val])
    }
  }

  const toggleBrand = (val) => {
    if (brand.includes(val)) {
      setBrand(prev=> prev.filter(item => item !== val))
    }
    else{
      setBrand(prev => [...prev, val])
    }
  }

  const applyFilter = () => {
    let productsCopy = scopedProducts.slice();
    if (showSearch && search) {
      const q = search.toLowerCase()
      productsCopy = productsCopy.filter(item => (
        String(item.name || '').toLowerCase().includes(q) ||
        String(item.category || '').toLowerCase().includes(q) ||
        String(item.subCategory || '').toLowerCase().includes(q) ||
        String(item.description || '').toLowerCase().includes(q)
      ))
    }
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }
    if (subCategory.length > 0 ) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
    }
    if (brand.length > 0) {
      productsCopy = productsCopy.filter(item => brand.includes(getProductBrand(item)))
    }
    if (excludeSubCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => !excludeSubCategory.includes(item.subCategory))
    }
    if (priceRange[0] > 0 || priceRange[1] < 100000) {
      productsCopy = productsCopy.filter(item => {
        const price = item.price || 0
        return price >= priceRange[0] && price <= priceRange[1]
      })
    }
    if (colors.length > 0) {
      productsCopy = productsCopy.filter(item => {
        const attr = (item?.attributes && typeof item.attributes === 'object') ? item.attributes : {}
        const list = []
        const direct = Array.isArray(item?.colors) ? item.colors : []
        const attrColors = Array.isArray(attr?.colors) ? attr.colors : []
        const single = item.color || item.productColor || attr.color
        if (direct.length) list.push(...direct)
        if (attrColors.length) list.push(...attrColors)
        if (single) list.push(single)
        if (!list.length) list.push('Other')
        const normalized = list.map((v) => String(v || '').trim().toLowerCase()).filter(Boolean)
        return colors.some((picked) => normalized.includes(String(picked || '').trim().toLowerCase()))
      })
    }
    if (discountRange !== null) {
      productsCopy = productsCopy.filter(item => {
        const dp = Number(item.discountPercent || 0)
        return dp >= discountRange
      })
    }
    if (sizesFilter.length > 0) {
      productsCopy = productsCopy.filter((item) => {
        const sizes = Array.isArray(item?.sizes) ? item.sizes.map((s) => String(s)) : []
        return sizesFilter.some((picked) => sizes.includes(String(picked)))
      })
    }
    if (minRating !== null) {
      productsCopy = productsCopy.filter((item) => Number(item?.rating || 0) >= Number(minRating))
    }
    if (genderFilter.length > 0) {
      productsCopy = productsCopy.filter((item) => genderFilter.includes(getProductGender(item)))
    }
    setFilterProducts(productsCopy)
  }

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)));
        break;
      default:
        applyFilter();
        break;
    }
  }

  useEffect(()=>{
      applyFilter();
  },[category,subCategory,excludeSubCategory,search,showSearch,scopedProducts,priceRange,colors,discountRange,sizesFilter,minRating,genderFilter])

  useEffect(()=>{
    sortProduct();
  },[sortType])

  const [expandedSections, setExpandedSections] = useState({})

  const toggleExpandSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const heroImages = useMemo(() => {
    const incoming = preset?.filters || stateFilters || {}
    const mainKey = normalizeKey(incoming?.mainCategory)
    const categorySlug = normalizeKey(incoming?.categorySlug)

    let pool = []
    if (incoming?.allCollections) {
      pool = [
        ...(fashionHeroAssets?.clothing || []).slice(0, 2),
        ...(fashionHeroAssets?.footwear || []).slice(0, 2),
        ...(homeKitchenHeroAssets?.furniture || []).slice(0, 2),
        ...(homeKitchenHeroAssets?.appliances || []).slice(0, 2),
        ...(lifestyleHeroAssets?.gym || []).slice(0, 2),
        ...(lifestyleHeroAssets?.technology || []).slice(0, 2),
        ...(electronicsHeroAssets?.smartphones || []).slice(0, 2),
        ...(electronicsHeroAssets?.laptops || []).slice(0, 2),
      ]
    } else if (fashionScopeKey && Array.isArray(fashionHeroAssets?.[fashionScopeKey]) && fashionHeroAssets[fashionScopeKey].length) {
      pool = fashionHeroAssets[fashionScopeKey]
    } else if (mainKey === 'home-kitchen' && categorySlug && Array.isArray(homeKitchenHeroAssets?.[categorySlug]) && homeKitchenHeroAssets[categorySlug].length) {
      pool = homeKitchenHeroAssets[categorySlug]
    } else if (mainKey === 'lifestyle' && categorySlug && Array.isArray(lifestyleHeroAssets?.[categorySlug]) && lifestyleHeroAssets[categorySlug].length) {
      pool = lifestyleHeroAssets[categorySlug]
    } else if (mainKey === 'electronics' && categorySlug) {
      pool = electronicsHeroAssets?.[categorySlug] || []
    } else if (mainKey === 'electronics') {
      pool = [
        ...(electronicsHeroAssets?.smartphones || []).slice(0, 2),
        ...(electronicsHeroAssets?.tablets || []).slice(0, 2),
        ...(electronicsHeroAssets?.accessories || []).slice(0, 2),
        ...(electronicsHeroAssets?.laptops || []).slice(0, 2),
        ...(electronicsHeroAssets?.gaming || []).slice(0, 2),
        ...(electronicsHeroAssets?.monitors || []).slice(0, 2),
        ...(electronicsHeroAssets?.headphones || []).slice(0, 2),
        ...(electronicsHeroAssets?.speakers || []).slice(0, 2),
        ...(electronicsHeroAssets?.soundbars || []).slice(0, 2),
      ]
    }
    const picked = []
    for (const u of pool) {
      const safe = safeAssetUrl(u)
      if (!safe || picked.includes(safe)) continue
      picked.push(safe)
      if (picked.length >= 6) return picked
    }
    for (const p of scopedProducts || []) {
      for (const u of p?.image || []) {
        const safe = safeAssetUrl(u)
        if (!safe || picked.includes(safe)) continue
        picked.push(safe)
        if (picked.length >= 6) return picked
      }
    }
    return picked
  }, [fashionScopeKey, scopedProducts, preset?.filters, stateFilters])

  const categoryVisuals = useMemo(() => {
    const incoming = preset?.filters || stateFilters || {}
    const mainKey = normalizeKey(incoming?.mainCategory)
    const categorySlug = normalizeKey(incoming?.categorySlug)

    let pool = []
    if (incoming?.allCollections) {
      pool = [
        ...(fashionHeroAssets?.clothing || []),
        ...(fashionHeroAssets?.footwear || []),
        ...(fashionHeroAssets?.accessories || []),
        ...(homeKitchenHeroAssets?.furniture || []),
        ...(homeKitchenHeroAssets?.appliances || []),
        ...(homeKitchenHeroAssets?.['home-decor'] || []),
        ...(lifestyleHeroAssets?.gym || []),
        ...(lifestyleHeroAssets?.cricket || []),
        ...(lifestyleHeroAssets?.football || []),
        ...(lifestyleHeroAssets?.technology || []),
        ...(lifestyleHeroAssets?.business || []),
        ...(lifestyleHeroAssets?.gaming || []),
        ...(lifestyleHeroAssets?.['action-figures'] || []),
        ...(lifestyleHeroAssets?.learning || []),
        ...(electronicsHeroAssets?.smartphones || []),
        ...(electronicsHeroAssets?.laptops || []),
        ...(electronicsHeroAssets?.headphones || []),
      ]
    } else if (fashionScopeKey && Array.isArray(fashionHeroAssets?.[fashionScopeKey]) && fashionHeroAssets[fashionScopeKey].length) {
      pool = fashionHeroAssets[fashionScopeKey]
    } else if (mainKey === 'home-kitchen' && categorySlug && Array.isArray(homeKitchenHeroAssets?.[categorySlug]) && homeKitchenHeroAssets[categorySlug].length) {
      pool = homeKitchenHeroAssets[categorySlug]
    } else if (mainKey === 'lifestyle' && categorySlug && Array.isArray(lifestyleHeroAssets?.[categorySlug]) && lifestyleHeroAssets[categorySlug].length) {
      pool = lifestyleHeroAssets[categorySlug]
    } else if (mainKey === 'electronics' && categorySlug) {
      pool = electronicsHeroAssets?.[categorySlug] || []
    } else if (mainKey === 'electronics') {
      pool = [
        ...(electronicsHeroAssets?.smartphones || []),
        ...(electronicsHeroAssets?.tablets || []),
        ...(electronicsHeroAssets?.accessories || []),
        ...(electronicsHeroAssets?.laptops || []),
        ...(electronicsHeroAssets?.gaming || []),
        ...(electronicsHeroAssets?.monitors || []),
        ...(electronicsHeroAssets?.headphones || []),
        ...(electronicsHeroAssets?.speakers || []),
        ...(electronicsHeroAssets?.soundbars || []),
      ]
    }

    const picked = []
    for (const u of pool || []) {
      const safe = safeAssetUrl(u)
      if (!safe || picked.includes(safe)) continue
      picked.push(safe)
    }
    return picked
  }, [fashionScopeKey, preset?.filters, stateFilters])

  const loopedCategoryVisuals = useMemo(() => {
    if (!categoryVisuals.length) return []
    return [...categoryVisuals, ...categoryVisuals]
  }, [categoryVisuals])

  const categoryVisualsRef = useRef(null)
  const categoryVisualsScrollState = useRef({ raf: 0, paused: false })

  useEffect(() => {
    const el = categoryVisualsRef.current
    if (!el) return
    if (loopedCategoryVisuals.length < 2) return

    const state = categoryVisualsScrollState.current
    state.paused = false

    let last = performance.now()
    const speedPxPerMs = 0.02

    const tick = (now) => {
      state.raf = requestAnimationFrame(tick)
      if (state.paused) {
        last = now
        return
      }
      const dt = Math.max(0, now - last)
      last = now
      const half = el.scrollWidth / 2
      if (!Number.isFinite(half) || half <= 0) return

      el.scrollLeft += dt * speedPxPerMs
      if (el.scrollLeft >= half) el.scrollLeft -= half
    }

    state.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(state.raf)
  }, [loopedCategoryVisuals.length])

  const pageMeta = useMemo(() => {
    const toTitle = (value) =>
      String(value || '')
        .trim()
        .split(/[-_ ]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

    const incoming = preset?.filters || stateFilters || {}
    const pickOne = (v) => (Array.isArray(v) ? v[0] : v)

    const title =
      preset?.title ||
      (incoming?.collectionTitle ? String(incoming.collectionTitle) : '') ||
      (incoming?.categoryLabel ? String(incoming.categoryLabel) : '') ||
      (incoming?.categorySlug ? toTitle(incoming.categorySlug) : '') ||
      (pickOne(incoming?.subCategory) ? String(pickOne(incoming.subCategory)) : '') ||
      (pickOne(incoming?.category) ? String(pickOne(incoming.category)) : '') ||
      (showSearch && search ? `Search: ${search}` : 'Collection')

    const normalizedTitle = String(title || '').trim()
    const displayTitle =
      normalizedTitle && /\bcollections?$/i.test(normalizedTitle) ? normalizedTitle : (normalizedTitle ? `${normalizedTitle} Collection` : 'Collection')

    const main = String(incoming?.mainCategory || '').trim().toLowerCase()
    const eyebrow =
      preset?.eyebrow ||
      (incoming?.collectionEyebrow ? String(incoming.collectionEyebrow) : '') ||
      (fashionScopeKey ? 'Fashion' : main === 'electronics' ? 'Electronics' : main === 'home-kitchen' ? 'Home & Kitchen' : main === 'lifestyle' ? 'Lifestyle' : 'Curated Shop')

    const breadcrumb =
      preset?.breadcrumb ||
      (main ? `Home / ${eyebrow}${title ? ` / ${title}` : ''}` : `Home / Collection${title ? ` / ${title}` : ''}`)

    return { title, displayTitle, eyebrow, breadcrumb }
  }, [preset?.title, preset?.eyebrow, preset?.breadcrumb, preset?.filters, stateFilters, fashionScopeKey, showSearch, search])

  const allCollections = Boolean((preset?.filters || stateFilters || {})?.allCollections)

  const electronicsScope = useMemo(() => {
    const incoming = preset?.filters || stateFilters || {}
    const mainKey = normalizeKey(incoming?.mainCategory)
    const categorySlug = normalizeKey(incoming?.categorySlug)
    const section = normalizeKey(incoming?.section)
    return { mainKey, categorySlug, section, isCategoryPage: mainKey === 'electronics' && Boolean(categorySlug) }
  }, [preset?.filters, stateFilters])

  const electronicsSubtitle = useMemo(() => {
    if (!electronicsScope.isCategoryPage) return ''
    const map = {
      smartphones: 'Flagship performance, pro cameras, and fast charging—picked for everyday power users.',
      tablets: 'Work, stream, and create on the go with premium displays and smooth multitasking.',
      accessories: 'Chargers, cases, cables, and essentials—built for reliability and style.',
      laptops: 'Thin-and-light to gaming rigs—premium picks for work, study, and creativity.',
      gaming: 'High-FPS gear, immersive performance, and next-level play—curated for gamers.',
      monitors: 'Sharp clarity, high refresh rates, and color-accurate panels for every setup.',
      headphones: 'ANC, deep bass, and comfort-first designs—tuned for music and calls.',
      speakers: 'Portable power to room-filling sound—crafted for every vibe.',
      soundbars: 'Cinema-grade audio with punchy bass—upgrade your home entertainment.',
    }
    return map[electronicsScope.categorySlug] || 'Premium electronics picks with fast filters, smooth browsing, and a clean modern layout.'
  }, [electronicsScope.categorySlug, electronicsScope.isCategoryPage])

  const heroSubtitle = useMemo(() => {
    if (electronicsScope.isCategoryPage) return electronicsSubtitle
    return 'Discover premium picks with fast filters, smooth browsing, and a clean fashion-first layout.'
  }, [electronicsScope.isCategoryPage, electronicsSubtitle])

  const allCollectionSections = useMemo(() => {
    if (!allCollections) return null
    const base = Array.isArray(scopedProducts) ? scopedProducts.slice() : []
    const hasTag = (p, tag) => {
      const list = Array.isArray(p?.collectionType) ? p.collectionType : []
      return list.some((t) => String(t || '').toLowerCase() === String(tag || '').toLowerCase())
    }
    const toDate = (p) => Number(p?.date || 0)
    const discountValue = (p) => {
      const mrp = Number(p?.mrp || 0)
      const price = Number(p?.price || 0)
      const pct = Number(p?.discountPercent || 0)
      if (pct > 0) return pct
      if (mrp > price && price > 0) return Math.round((1 - price / mrp) * 100)
      return 0
    }
    const newArrivals = base
      .slice()
      .sort((a, b) => toDate(b) - toDate(a))
      .slice(0, 12)

    const trending = base
      .slice()
      .sort((a, b) => {
        const af = a?.featured || hasTag(a, 'Featured') ? 1 : 0
        const bf = b?.featured || hasTag(b, 'Featured') ? 1 : 0
        if (bf !== af) return bf - af
        const ar = Number(a?.rating || 0)
        const br = Number(b?.rating || 0)
        if (br !== ar) return br - ar
        return toDate(b) - toDate(a)
      })
      .slice(0, 12)

    const bestSellers = base
      .slice()
      .sort((a, b) => {
        const ab = a?.bestseller ? 1 : 0
        const bb = b?.bestseller ? 1 : 0
        if (bb !== ab) return bb - ab
        const ar = a?.recommended || hasTag(a, 'Recommended') ? 1 : 0
        const br = b?.recommended || hasTag(b, 'Recommended') ? 1 : 0
        if (br !== ar) return br - ar
        return toDate(b) - toDate(a)
      })
      .slice(0, 12)

    const discounted = base
      .filter((p) => discountValue(p) > 0)
      .slice()
      .sort((a, b) => discountValue(b) - discountValue(a))
      .slice(0, 12)

    return [
      { id: 'new', title: 'New Arrivals', subtitle: 'Latest drops across categories.', items: newArrivals },
      { id: 'trend', title: 'Trending', subtitle: 'Most loved picks right now.', items: trending },
      { id: 'best', title: 'Best Sellers', subtitle: 'Top-rated & recommended products.', items: bestSellers },
      { id: 'deal', title: 'Discount Deals', subtitle: 'Big savings across the store.', items: discounted },
    ]
  }, [allCollections, scopedProducts])

  const recommendedProducts = useMemo(() => {
    const base = Array.isArray(scopedProducts) ? scopedProducts.slice() : []
    const hasTag = (p, tag) => {
      const list = Array.isArray(p?.collectionType) ? p.collectionType : []
      return list.some((t) => String(t || '').toLowerCase() === String(tag || '').toLowerCase())
    }
    base.sort((a, b) => {
      const ar = Number(a?.rating || 0)
      const br = Number(b?.rating || 0)
      const ab = a?.bestseller ? 1 : 0
      const bb = b?.bestseller ? 1 : 0
      const arec = a?.recommended || hasTag(a, 'Recommended') ? 1 : 0
      const brec = b?.recommended || hasTag(b, 'Recommended') ? 1 : 0
      const af = a?.featured || hasTag(a, 'Featured') ? 1 : 0
      const bf = b?.featured || hasTag(b, 'Featured') ? 1 : 0
      if (bb !== ab) return bb - ab
      if (brec !== arec) return brec - arec
      if (bf !== af) return bf - af
      if (br !== ar) return br - ar
      return Number(b?.date || 0) - Number(a?.date || 0)
    })
    return base.slice(0, 12)
  }, [scopedProducts])

  const filterPreview = useMemo(() => {
    const incoming = preset?.filters || stateFilters || {}
    const mainKey = normalizeKey(incoming?.mainCategory)
    const primaryFromCategory = heroImages?.[0]
    const primaryFromFashion = fashionPreviewAssets?.[0]
    const primary =
      mainKey === 'fashion' || Boolean(incoming?.allCollections) || !primaryFromCategory
        ? (primaryFromFashion || primaryFromCategory)
        : primaryFromCategory

    const secondaryFromCategory = heroImages?.[1]
    const secondaryFromFashion = fashionPreviewAssets?.[1]
    const secondary = secondaryFromCategory || secondaryFromFashion || primary

    return { primary, secondary }
  }, [preset?.filters, stateFilters, heroImages])

  const FilterPanel = ({ dense = false, onDone }) => {
    const maxInitialItems = 6
    const categoryList = availableCategories.slice()
    const brandList = availableBrands.slice()
    
    const displayedCats = expandedSections.categoriesExpanded ? categoryList : categoryList.slice(0, maxInitialItems)
    const hiddenCatsCount = Math.max(0, categoryList.length - maxInitialItems)
    
    const displayedBrands = expandedSections.brandsExpanded ? brandList : brandList.slice(0, maxInitialItems)
    const hiddenBrandsCount = Math.max(0, brandList.length - maxInitialItems)

    return (
    <div className={`${dense ? 'p-5' : 'p-6'} rounded-[2.5rem] bg-white border border-slate-200 shadow-sm`}>
      <div className='flex items-center justify-between mb-8'>
        <p className='text-sm font-black uppercase tracking-[0.35em] text-slate-900'>Filters</p>
        <button
          type='button'
          onClick={clearAllFilters}
          className='text-sm font-black uppercase tracking-[0.35em] text-rose-600 hover:text-rose-500 transition-colors'
        >
          Clear All
        </button>
      </div>

      <div className='space-y-8'>
        {!dense && filterPreview?.primary ? (
          <div className='overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-sm'>
            <div className='relative h-[210px]'>
              <div className='absolute inset-0 bg-gradient-to-tr from-slate-900/85 via-slate-900/40 to-transparent' />
              <div className='absolute inset-0 bg-gradient-to-b from-sky-400/10 via-transparent to-blue-500/10' />
              <div className='absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl' />
              <div className='absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl' />

              <div className='absolute inset-0 bg-slate-50'>
                <img
                  src={filterPreview.primary}
                  alt=''
                  loading='lazy'
                  decoding='async'
                  className='h-full w-full object-contain p-5'
                />
              </div>

              <div className='absolute right-4 top-4 h-16 w-16 overflow-hidden rounded-2xl border border-white/30 bg-white/10 backdrop-blur'>
                <img
                  src={filterPreview.secondary}
                  alt=''
                  loading='lazy'
                  decoding='async'
                  className='h-full w-full object-contain p-2'
                />
              </div>

              <div className='absolute inset-0 p-6 flex flex-col justify-end'>
                <p className='text-[10px] font-black tracking-[0.35em] text-white/75 uppercase'>Category Preview</p>
                <p className='mt-1 text-lg font-black tracking-tight text-white uppercase'>{pageMeta.displayTitle || 'Collection'}</p>
                <p className='mt-1 text-[11px] font-semibold text-white/75'>Premium visuals with clean, responsive rendering.</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className='space-y-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <p className='text-xs font-black uppercase tracking-[0.35em] text-slate-900'>Categories</p>
              <Search className='w-4 h-4 text-slate-400' />
            </div>
          </div>
          <div className='space-y-2.5'>
            {displayedCats.map((cat) => {
              const checked = category.includes(cat)
              const count = scopedProducts.filter((item) => item.category === cat).length
              return (
                <label key={cat} className='flex cursor-pointer items-center gap-3 text-sm text-slate-700 group hover:text-slate-900 transition'>
                  <input
                    type='checkbox'
                    checked={checked}
                    onChange={() => toggleCategory(cat)}
                    className='h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900'
                  />
                  <span className='font-medium'>{cat}</span>
                  <span className='ml-auto text-xs text-slate-400'>({count.toLocaleString()})</span>
                </label>
              )
            })}
            {hiddenCatsCount > 0 && (
              <button
                type='button'
                onClick={() => toggleExpandSection('categoriesExpanded')}
                className='text-sm font-bold text-rose-600 hover:text-rose-700 mt-2 transition'
              >
                + {hiddenCatsCount} more
              </button>
            )}
          </div>
        </div>

        <div className='h-px bg-slate-200'></div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <p className='text-xs font-black uppercase tracking-[0.35em] text-slate-900'>Brand</p>
              <Search className='w-4 h-4 text-slate-400' />
            </div>
          </div>
          <div className='space-y-2.5'>
            {displayedBrands.map((name) => {
              const checked = brand.includes(name)
              const count = scopedProducts.filter((item) => getProductBrand(item) === name).length
              return (
                <label key={name} className='flex cursor-pointer items-center gap-3 text-sm text-slate-700 group hover:text-slate-900 transition'>
                  <input
                    type='checkbox'
                    checked={checked}
                    onChange={() => toggleBrand(name)}
                    className='h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900'
                  />
                  <span className='font-medium'>{name}</span>
                  <span className='ml-auto text-xs text-slate-400'>({count.toLocaleString()})</span>
                </label>
              )
            })}
            {hiddenBrandsCount > 0 && (
              <button
                type='button'
                onClick={() => toggleExpandSection('brandsExpanded')}
                className='text-sm font-bold text-rose-600 hover:text-rose-700 mt-2 transition'
              >
                + {hiddenBrandsCount} more
              </button>
            )}
          </div>
        </div>

        <div className='h-px bg-slate-200'></div>

        <div className='space-y-4'>
          <p className='text-xs font-black uppercase tracking-[0.35em] text-slate-900'>Price</p>
          <div className='space-y-3 px-1'>
            <input
              type='range'
              min='0'
              max='100000'
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
              className='w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600'
            />
            <input
              type='range'
              min='0'
              max='100000'
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
              className='w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600'
            />
            <p className='text-xs text-slate-600 text-center font-medium'>
              ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}+
            </p>
          </div>
        </div>

        <div className='h-px bg-slate-200'></div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between gap-3'>
            <p className='text-xs font-black uppercase tracking-[0.35em] text-slate-900'>Color</p>
            <Search className='w-4 h-4 text-slate-400' />
          </div>
          <div className='space-y-2.5'>
            {colorOptions.slice(0, 6).map((option) => {
              const checked = colors.includes(option.name)
              const count = scopedProducts.filter((item) => {
                const attr = (item?.attributes && typeof item.attributes === 'object') ? item.attributes : {}
                const raw = item.color || item.productColor || attr.color || attr.colors || 'Other'
                const text = Array.isArray(raw) ? raw.join(' ') : String(raw || '')
                return text.toLowerCase().includes(option.name.toLowerCase())
              }).length
              return (
                <label key={option.name} className='flex cursor-pointer items-center gap-3 text-sm text-slate-700 group hover:text-slate-900 transition'>
                  <div className='relative flex items-center'>
                    <input
                      type='checkbox'
                      checked={checked}
                      onChange={() => setColors(prev => prev.includes(option.name) ? prev.filter(c => c !== option.name) : [...prev, option.name])}
                      className='h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900'
                    />
                  </div>
                  <div
                    className='w-5 h-5 rounded-full border-2 border-slate-300'
                    style={{ backgroundColor: option.color }}
                  />
                  <span className='font-medium'>{option.name}</span>
                  <span className='ml-auto text-xs text-slate-400'>({count.toLocaleString()})</span>
                </label>
              )
            })}
            {colorOptions.length > 6 && (
              <button
                type='button'
                onClick={() => toggleExpandSection('colorsExpanded')}
                className='text-sm font-bold text-rose-600 hover:text-rose-700 mt-2 transition'
              >
                + {colorOptions.length - 6} more
              </button>
            )}
          </div>
        </div>

        <div className='h-px bg-slate-200'></div>

        <div className='space-y-4'>
          <p className='text-xs font-black uppercase tracking-[0.35em] text-slate-900'>Size</p>
          <div className='flex flex-wrap gap-2'>
            {(availableSizes.length ? availableSizes : ['S', 'M', 'L', 'XL']).slice(0, 12).map((s) => {
              const checked = sizesFilter.includes(s)
              return (
                <button
                  key={s}
                  type='button'
                  onClick={() => setSizesFilter((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black tracking-widest uppercase transition active:scale-[0.98] ${
                    checked ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <div className='h-px bg-slate-200'></div>

        <div className='space-y-4'>
          <p className='text-xs font-black uppercase tracking-[0.35em] text-slate-900'>Gender</p>
          <div className='flex flex-wrap gap-2'>
            {(availableGenders.length ? availableGenders : ['Men', 'Women', 'Kids', 'Unisex']).map((g) => {
              const checked = genderFilter.includes(g)
              const count = scopedProducts.filter((p) => getProductGender(p) === g).length
              return (
                <button
                  key={g}
                  type='button'
                  onClick={() => setGenderFilter((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black tracking-widest uppercase transition active:scale-[0.98] ${
                    checked ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {g} <span className='opacity-70'>({count})</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className='h-px bg-slate-200'></div>

        <div className='space-y-4'>
          <p className='text-xs font-black uppercase tracking-[0.35em] text-slate-900'>Rating</p>
          <div className='space-y-2.5'>
            {[4.5, 4.0, 3.5, 3.0].map((r) => {
              const selected = Number(minRating) === Number(r)
              return (
                <label key={r} className='flex cursor-pointer items-center gap-3 text-sm text-slate-700 group hover:text-slate-900 transition'>
                  <input
                    type='radio'
                    name='rating'
                    checked={selected}
                    onChange={() => setMinRating(selected ? null : r)}
                    className='h-4 w-4 rounded-full border-slate-300 text-slate-900 focus:ring-slate-900'
                  />
                  <span className='font-medium'>{r}★ & above</span>
                </label>
              )
            })}
          </div>
        </div>

        <div className='h-px bg-slate-200'></div>

        <div className='space-y-4'>
          <p className='text-xs font-black uppercase tracking-[0.35em] text-slate-900'>Discount Range</p>
          <div className='space-y-2.5'>
            {discountOptions.map((option) => {
              const isSelected = discountRange === option.min
              return (
                <label key={option.min} className='flex cursor-pointer items-center gap-3 text-sm text-slate-700 group hover:text-slate-900 transition'>
                  <input
                    type='radio'
                    name='discount'
                    checked={isSelected}
                    onChange={() => setDiscountRange(isSelected ? null : option.min)}
                    className='h-4 w-4 rounded-full border-slate-300 text-slate-900 focus:ring-slate-900'
                  />
                  <span className='font-medium'>{option.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </div>
    )
  }

  return (
    <div className='pb-20 pt-8 sm:pt-10 px-1'>
      <RevealSection>
        <div className='relative mb-8 overflow-hidden rounded-[2.5rem] border border-sky-100 bg-white shadow-xl shadow-sky-900/5'>
          <div className='absolute inset-0 bg-gradient-to-br from-white via-sky-50 to-blue-50' />
          <div className='absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-400/10 blur-[90px]' />
          <div className='absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue-400/10 blur-[90px]' />

          <div className='relative z-10 grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:items-center'>
            <div className='lg:col-span-6'>
              <p className='text-[10px] font-black tracking-[0.4em] text-sky-600 uppercase'>
                {pageMeta.eyebrow}
              </p>
              <h1 className='mt-2.5 text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase leading-[0.95]'>
                {pageMeta.displayTitle || 'Collection'}
              </h1>
              <p className='mt-3 text-xs sm:text-sm font-semibold text-slate-500 max-w-xl'>
                {heroSubtitle}
              </p>

              <div className='mt-5 flex flex-wrap gap-2'>
                <span className='rounded-full border border-sky-100 bg-white/70 px-3.5 py-1.5 text-[9px] font-black tracking-widest uppercase text-sky-700'>
                  Premium UI
                </span>
                <span className='rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5 text-[9px] font-black tracking-widest uppercase text-slate-700'>
                  Smart Filters
                </span>
                <span className='rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5 text-[9px] font-black tracking-widest uppercase text-slate-700'>
                  Smooth Scroll
                </span>
              </div>
            </div>

            <div className='lg:col-span-6'>
              <div className='grid grid-cols-3 gap-2 sm:gap-3 max-w-[520px] ml-auto'>
                {heroImages.slice(0, 6).map((src, idx) => (
                  <div
                    key={`${src}-${idx}`}
                    className={`overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem] border border-white/60 bg-white shadow-sm ${
                      idx === 0 ? 'col-span-2 row-span-2' : ''
                    }`}
                  >
                    <div
                      className={`aspect-square bg-slate-50 flex items-center justify-center ${
                        idx === 0 ? 'p-3 sm:p-4' : 'p-2 sm:p-3'
                      }`}
                    >
                      <img
                        src={src}
                        alt=''
                        loading='lazy'
                        decoding='async'
                        onError={(e) => {
                          const fallback =
                            heroImages?.[(idx + 1) % Math.max(1, heroImages.length)] ||
                            categoryVisuals?.[(idx + 1) % Math.max(1, categoryVisuals.length)] ||
                            heroImages?.[0] ||
                            categoryVisuals?.[0] ||
                            ''
                          if (fallback && e.currentTarget.src !== fallback) e.currentTarget.src = fallback
                        }}
                        className='h-full w-full object-contain'
                      />
                    </div>
                  </div>
                ))}
                {heroImages.length === 0 && (
                  <div className='col-span-3 rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500'>
                    Loading category visuals…
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {categoryVisuals.length ? (
          <div className='mb-10 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm'>
            <div className='px-7 sm:px-8 pt-7 sm:pt-8'>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
                <div>
                  <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Category Visuals</p>
                  <p className='mt-2 text-2xl font-black tracking-tight text-slate-900 uppercase'>Highlights</p>
                </div>
                <p className='text-xs font-semibold text-slate-500'>{categoryVisuals.length} images</p>
              </div>
            </div>
            <div
              ref={categoryVisualsRef}
              onMouseEnter={() => {
                categoryVisualsScrollState.current.paused = true
              }}
              onMouseLeave={() => {
                categoryVisualsScrollState.current.paused = false
              }}
              onTouchStart={() => {
                categoryVisualsScrollState.current.paused = true
              }}
              onTouchEnd={() => {
                categoryVisualsScrollState.current.paused = false
              }}
              className='mt-5 flex gap-3 overflow-x-auto px-6 sm:px-8 pb-6 sm:pb-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            >
              {loopedCategoryVisuals.map((src, idx) => (
                <div key={`${src}-${idx}`} className='shrink-0 w-[140px] sm:w-[160px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50'>
                  <div className='aspect-[4/5]'>
                    <div className='h-full w-full flex items-center justify-center p-2'>
                      <img
                        src={src}
                        alt=''
                        loading='lazy'
                        decoding='async'
                        onError={(e) => {
                          const next = loopedCategoryVisuals?.[(idx + 1) % Math.max(1, loopedCategoryVisuals.length)] || heroImages?.[0] || ''
                          if (next && e.currentTarget.src !== next) e.currentTarget.src = next
                        }}
                        className='h-full w-full object-contain'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {null}

        {allCollections && allCollectionSections?.length ? (
          <div className='mb-10 space-y-10'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {allCollectionSections.slice(0, 4).map((s, idx) => (
                <div key={s.id} className='relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm'>
                  <div className='absolute inset-0 bg-gradient-to-tr from-slate-900/85 via-slate-900/35 to-transparent' />
                  <img
                    src={heroImages?.[idx] || heroImages?.[0] || categoryVisuals?.[idx] || categoryVisuals?.[0]}
                    alt=''
                    loading='lazy'
                    decoding='async'
                    className='h-36 sm:h-40 w-full object-contain bg-slate-50'
                  />
                  <div className='absolute inset-0 p-6 flex flex-col justify-end'>
                    <p className='text-[10px] font-black tracking-[0.35em] text-white/70 uppercase'>{s.subtitle}</p>
                    <p className='mt-1 text-xl font-black tracking-tight text-white uppercase'>{s.title}</p>
                    <p className='mt-1 text-xs font-semibold text-white/80'>{s.items.length} picks</p>
                  </div>
                </div>
              ))}
            </div>

            <div className='space-y-8'>
              {allCollectionSections.map((s) => (
                <div key={s.id} className='rounded-[2.5rem] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm'>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
                    <div>
                      <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>{s.subtitle}</p>
                      <p className='mt-2 text-2xl font-black tracking-tight text-slate-900 uppercase'>{s.title}</p>
                    </div>
                    <p className='text-xs font-semibold text-slate-500'>Showing {s.items.length} items</p>
                  </div>
                  <div className='mt-6 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                    {s.items.map((p) => (
                      <div key={p._id} className='min-w-[180px] max-w-[180px]'>
                        <ProductItem product={p} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className='mb-6 flex flex-col gap-6'>
          <div className='flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between'>
            <div className='space-y-3 max-w-3xl'>
              <p className='text-sm font-semibold uppercase tracking-[0.4em] text-slate-500'>
                {pageMeta.breadcrumb}
              </p>
              <div className='space-y-2'>
                <h1 className='text-4xl sm:text-5xl font-black tracking-tight text-slate-900'>
                  {pageMeta.displayTitle || 'Collection'}
                </h1>
                <p className='text-sm uppercase tracking-[0.35em] text-slate-400'>
                  {filterProducts.length} {preset?.countLabel || 'Products Found'}
                </p>
              </div>
            </div>

            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4'>
              <button
                type='button'
                onClick={clearAllFilters}
                className='rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50'
              >
                Clear All
              </button>
              <div className='flex items-center gap-3'>
                <span className='text-sm font-semibold uppercase tracking-[0.35em] text-slate-500'>Sort by</span>
                <div className='relative min-w-[180px]'>
                  <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value)}
                    className='appearance-none w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-900 outline-none transition hover:border-slate-300'
                  >
                    <option value="relavent">Relevance</option>
                    <option value="low-high">Price: Low-High</option>
                    <option value="high-low">Price: High-Low</option>
                  </select>
                  <ChevronDown className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                </div>
              </div>
              <button
                type='button'
                onClick={() => setShowFilter(!showFilter)}
                className={`lg:hidden inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition active:scale-95 ${
                  showFilter ? 'shadow-xl shadow-slate-900/20' : 'shadow-sm'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilter ? 'Hide Filters' : 'Filters'}
              </button>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            {category.map((value) => (
              <button key={value} type='button' onClick={() => toggleCategory(value)} className='rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300'>
                {value}
              </button>
            ))}
            {genderFilter.map((value) => (
              <button key={value} type='button' onClick={() => setGenderFilter((prev) => prev.filter((x) => x !== value))} className='rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300'>
                {value}
              </button>
            ))}
            {subCategory.map((value) => (
              <button key={value} type='button' onClick={() => toggleSubCategory(value)} className='rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300'>
                {value}
              </button>
            ))}
            {brand.map((value) => (
              <button key={value} type='button' onClick={() => toggleBrand(value)} className='rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300'>
                {value}
              </button>
            ))}
            {(category.length === 0 && genderFilter.length === 0 && subCategory.length === 0 && brand.length === 0) && (
              <p className='text-sm text-slate-500'>No filters applied yet</p>
            )}
          </div>
        </div>
      </RevealSection>

      <div className='grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8'>
        <div className='hidden lg:block'>
          <div className='sticky top-32'>
            <div className='max-h-[calc(100vh-9rem)] overflow-y-auto overscroll-contain pr-1'>
              <FilterPanel />
            </div>
          </div>
        </div>

        <div className='min-w-0'>
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className='lg:hidden mb-8'
              >
                <FilterPanel dense onDone={() => setShowFilter(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {!effectiveLoading && filterProducts.length === 0 ? (
            <div className='space-y-8'>
              <div className='rounded-[2.5rem] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm'>
                <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-start gap-4'>
                    <div className='h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200'>
                      <Search className='w-6 h-6 text-slate-400' />
                    </div>
                    <div>
                      <h3 className='text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tighter'>No matches for your filters</h3>
                      <p className='text-slate-500 font-medium mt-1'>Clear filters or explore curated picks from this collection.</p>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={clearAllFilters}
                    className='h-12 px-6 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10'
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-tr from-slate-900/85 via-slate-900/40 to-transparent' />
                    <img
                      src={heroImages?.[0] || categoryVisuals?.[0]}
                      alt=''
                      loading='lazy'
                      decoding='async'
                      className='h-[240px] sm:h-[280px] w-full object-cover'
                    />
                    <div className='absolute inset-0 p-8 flex flex-col justify-end'>
                      <p className='text-[10px] font-black tracking-[0.35em] text-white/70 uppercase'>Featured Drop</p>
                      <p className='mt-2 text-3xl sm:text-4xl font-black tracking-tighter text-white uppercase leading-[0.95]'>
                        {preset?.title ? `${preset.title} Essentials` : 'Fashion Essentials'}
                      </p>
                      <p className='mt-3 text-sm font-semibold text-white/80 max-w-xl'>
                        Fresh picks, best sellers, and premium styling—built for fast browsing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='space-y-6'>
                  {[
                    { t: 'New Arrivals', d: 'Latest additions', img: heroImages?.[1] },
                    { t: 'Trending Now', d: 'Most viewed picks', img: heroImages?.[2] },
                    { t: 'Best Sellers', d: 'Top-rated styles', img: heroImages?.[3] },
                  ].map((c) => (
                    <div key={c.t} className='overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-sm'>
                      <div className='relative h-[120px]'>
                        <div className='absolute inset-0 bg-gradient-to-tr from-slate-900/85 via-slate-900/35 to-transparent' />
                        <img
                          src={c.img || heroImages?.[0] || categoryVisuals?.[0]}
                          alt=''
                          loading='lazy'
                          decoding='async'
                          className='h-full w-full object-cover'
                        />
                        <div className='absolute inset-0 p-5 flex flex-col justify-end'>
                          <p className='text-[10px] font-black tracking-[0.35em] text-white/70 uppercase'>{c.d}</p>
                          <p className='mt-1 text-lg font-black tracking-tight text-white uppercase'>{c.t}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-4'>
                <div className='flex items-end justify-between gap-4'>
                  <div>
                    <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Recommended</p>
                    <p className='mt-1 text-2xl font-black tracking-tight text-slate-900 uppercase'>Top Picks</p>
                  </div>
                  <p className='text-xs font-semibold text-slate-500'>Showing {recommendedProducts.length} items</p>
                </div>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5'>
                  {recommendedProducts.map((item, i) => (
                    <RevealSection key={item._id} delay={i % 6 * 0.05}>
                      <ProductItem product={item} />
                    </RevealSection>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5'>
              {effectiveLoading
                ? Array.from({ length: 12 }).map((_, index) => <ProductCardSkeleton key={index} />)
                : filterProducts.map((item, i)=>(
                    <RevealSection key={item._id} delay={i % 6 * 0.05}>
                      <ProductItem product={item} />
                    </RevealSection>
                  ))
              }
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Collection
