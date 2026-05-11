import React, { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BadgeCheck,
  Box,
  ChevronRight,
  Edit2,
  Eye,
  Home,
  Layers,
  LogOut,
  PackagePlus,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShoppingBag,
  Store,
  ToggleLeft,
  ToggleRight,
  Trash2,
  XCircle,
  Bell,
  User,
  Settings,
  BarChart3,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Filter,
  Upload,
  Download,
  MoreVertical,
  Calendar,
  ShoppingCart,
  CreditCard,
  Star,
  Tag,
  MessageSquare,
  PieChart,
  LineChart,
  Activity,
  TrendingDown,
  CheckCircle,
  X,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronDown,
  Grid,
  List,
  Heart,
  Share2,
  Image as ImageIcon,
  Camera,
  Globe,
  Lock,
  Unlock,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Award,
  Target,
  Zap,
  Clock,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Edit,
  Save,
  Trash,
  RotateCcw,
  MoreHorizontal,
  PieChart as PieChartIcon,
  BarChart2,
  TrendingUp as TrendingUpIcon,
  DollarSign as DollarSignIcon,
  Users as UsersIcon,
  Package as PackageIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  Tag as TagIcon,
  MessageSquare as MessageSquareIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  User as UserIcon,
  BarChart3 as BarChart3Icon,
  Home as HomeIcon,
  Calendar as CalendarIcon,
  CreditCard as CreditCardIcon,
  Truck
} from 'lucide-react'
import { ShopContext } from '../context/ShopContext'
import CategoryTreeSelect from '../components/CategoryTreeSelect'
import { CATEGORY_TREE, getLabels } from '../config/categoryTree'

const parseUrls = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return raw.split(',').map(url => url.trim()).filter(Boolean)
    }
  }
  return []
}

const SellerDashboard = () => {
  const { backendUrl, token, refreshProducts, userProfile, navigate, logout } = useContext(ShopContext)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editDraft, setEditDraft] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addTaxonomy, setAddTaxonomy] = useState({ mainCategory: 'fashion', section: 'men', categorySlug: 'clothing' })
  const [addCategory, setAddCategory] = useState('Fashion')
  const [addSubCategory, setAddSubCategory] = useState('Clothing')
  const [addSizes, setAddSizes] = useState(['M'])
  const [addAttributes, setAddAttributes] = useState({
    fashionCategory: 'Clothing',
    gender: 'Men',
    productType: 'Topwear',
  })
  const [addGender, setAddGender] = useState('Men')
  const [addProductType, setAddProductType] = useState('Topwear')
  const [addCollectionType, setAddCollectionType] = useState([])
  const [addColors, setAddColors] = useState([])
  const [editCategory, setEditCategory] = useState('Fashion')
  const [editSubCategory, setEditSubCategory] = useState('Clothing')
  const [editGender, setEditGender] = useState('Men')
  const [editProductType, setEditProductType] = useState('Topwear')
  const [editCollectionType, setEditCollectionType] = useState([])
  const [editColors, setEditColors] = useState([])
  const [editTaxonomy, setEditTaxonomy] = useState(null)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New order received', message: 'Order #ORD-7892 has been placed', time: '2 min ago', unread: true },
    { id: 2, title: 'Low stock alert', message: 'Product "Wireless Earbuds" is running low', time: '1 hour ago', unread: true },
    { id: 3, title: 'Payment received', message: '₹14,299 has been credited to your account', time: '3 hours ago', unread: false },
    { id: 4, title: 'Customer review', message: 'New 5-star review for "Smart Watch"', time: '1 day ago', unread: false },
    { id: 5, title: 'Weekly report', message: 'Your weekly sales report is ready', time: '2 days ago', unread: false }
  ])
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [orderStatusDraft, setOrderStatusDraft] = useState({})
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)

  const canUse = userProfile?.role === 'seller' && userProfile?.status === 'active'

  const mainLabelForSellerCategory = (mainSlug) => {
    if (mainSlug === 'fashion') return 'Fashion'
    if (mainSlug === 'electronics') return 'Electronics'
    if (mainSlug === 'home-kitchen') return 'Home'
    if (mainSlug === 'lifestyle') return 'Lifestyle'
    return 'Fashion'
  }

  const inferSection = (mainSlug, categorySlug) => {
    const main = CATEGORY_TREE[mainSlug]
    if (!main) return ''
    if (main.sections?.[String(categorySlug || '')]) return String(categorySlug || '')
    const cats = String(categorySlug || '')
    for (const [sectionSlug, section] of Object.entries(main.sections || {})) {
      if (section?.categories?.[cats]) return sectionSlug
    }
    const first = Object.keys(main.sections || {})[0] || ''
    return first
  }

  const applyTaxonomyToAdd = (tax) => {
    if (!tax?.mainCategory || !tax?.section || !tax?.categorySlug) return
    const labels = getLabels(tax.mainCategory, tax.section, tax.categorySlug)
    const catLabel = mainLabelForSellerCategory(tax.mainCategory)
    const subLabel = labels.categoryLabel || ''
    setAddCategory(catLabel)
    setAddSubCategory(subLabel)
    if (tax.mainCategory === 'fashion') {
      const gender = labels.sectionLabel || 'Men'
      const nextProductType = (subLabel && ['Clothing', 'Ethnic Wear', 'Western Wear'].includes(subLabel)) ? 'Topwear' : (subLabel === 'Footwear' ? 'Footwear' : subLabel || 'Topwear')
      setAddGender(gender)
      setAddProductType(nextProductType)
      setAddAttributes({ fashionCategory: subLabel || 'Clothing', gender, productType: nextProductType })
      if (subLabel === 'Footwear') setAddSizes(['8'])
      else if (['Clothing', 'Ethnic Wear', 'Western Wear'].includes(subLabel)) setAddSizes(['M'])
      else setAddSizes(['M'])
    } else {
      setAddGender('Men')
      setAddProductType('Topwear')
      setAddAttributes({})
      setAddSizes([])
    }
  }

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  if (token && !userProfile) {
    return (
      <div className='border-t pt-10'>
        <div className='rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500'>
          Loading seller account…
        </div>
      </div>
    )
  }

  if (userProfile?.role === 'seller' && userProfile?.status === 'pending') {
    return (
      <div className='border-t pt-10'>
        <div className='rounded-[2.75rem] border border-sky-100 bg-white shadow-sm overflow-hidden'>
          <div className='relative p-8 sm:p-10'>
            <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50' />
            <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
            <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />
            <div className='relative z-10'>
              <p className='text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase'>Seller Dashboard</p>
              <p className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>Approval Pending</p>
              <p className='mt-3 text-sm font-semibold text-slate-500 max-w-2xl'>
                Your seller account request has been submitted. An admin will review and activate your dashboard soon.
              </p>
              <div className='mt-6 flex flex-wrap gap-3'>
                <button
                  type='button'
                  onClick={() => navigate('/')}
                  className='h-11 px-5 rounded-2xl bg-white border border-sky-100 text-sky-700 font-black text-[11px] tracking-widest uppercase hover:bg-sky-50 transition-all active:scale-[0.98]'
                >
                  Back Home
                </button>
                <button
                  type='button'
                  onClick={() => logout()}
                  className='h-11 px-5 rounded-2xl bg-slate-900 text-white font-black text-[11px] tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98]'
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (userProfile?.role === 'seller' && (userProfile?.status === 'rejected' || userProfile?.status === 'suspended')) {
    return (
      <div className='border-t pt-10'>
        <div className='rounded-[2.75rem] border border-slate-200 bg-white p-8 sm:p-10 shadow-sm'>
          <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Seller Dashboard</p>
          <p className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>Access Restricted</p>
          <p className='mt-3 text-sm font-semibold text-slate-500'>
            Your seller account is <span className='text-slate-900 font-black'>{userProfile.status}</span>. Please contact support for help.
          </p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <button
              type='button'
              onClick={() => navigate('/contact')}
              className='h-11 px-5 rounded-2xl bg-sky-600 text-white font-black text-[11px] tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20'
            >
              Contact Support
            </button>
            <button
              type='button'
              onClick={() => logout()}
              className='h-11 px-5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-[11px] tracking-widest uppercase hover:bg-slate-50 transition-all active:scale-[0.98]'
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!canUse) {
    return (
      <div className='border-t pt-10'>
        <div className='rounded-3xl border border-gray-200 bg-white p-6'>
          <p className='text-lg font-semibold text-gray-900'>Seller Dashboard</p>
          <p className='mt-2 text-sm text-gray-600'>This account is not approved as an active Seller.</p>
        </div>
      </div>
    )
  }

  const subcategoryOptions = useMemo(() => {
    return {
      Fashion: ['Clothing', 'Footwear', 'Accessories', 'Ethnic Wear', 'Western Wear', 'Beauty', 'Boys', 'Girls', 'Baby Care'],
      Electronics: ['Mobiles', 'Laptops', 'Gaming', 'Monitors', 'Headphones', 'Speakers', 'Soundbars', 'Accessories', 'Tablets'],
      Mobiles: ['Smartphones', 'Tablets', 'Accessories'],
      Beauty: ['Skincare', 'Makeup', 'Hair Care', 'Fragrances', 'Personal Care'],
      Home: ['Furniture', 'Decor', 'Cookware', 'Lighting', 'Cleaning', 'Dining'],
      Lifestyle: ['Sports', 'Toys', 'Grocery'],
    }
  }, [])

  const fashionProductTypeOptions = useMemo(() => {
    return {
      Clothing: ['Topwear', 'Bottomwear', 'Winterwear'],
      Footwear: ['Footwear'],
      Accessories: ['Accessories'],
      'Ethnic Wear': ['Ethnic Wear'],
      'Western Wear': ['Western Wear'],
      Beauty: ['Beauty'],
      Boys: ['Boys'],
      Girls: ['Girls'],
      'Baby Care': ['Baby Care'],
    }
  }, [])

  useEffect(() => {
    applyTaxonomyToAdd(addTaxonomy)
  }, [addTaxonomy?.mainCategory, addTaxonomy?.section, addTaxonomy?.categorySlug])

  const attributeFields = useMemo(() => {
    const key = `${addCategory}:${addSubCategory}`
    const map = {
      'Fashion:Clothing': [
        { k: 'fabric', label: 'Fabric', placeholder: 'Cotton / Denim / Polyester' },
        { k: 'color', label: 'Color', placeholder: 'Black / Blue / White' },
        { k: 'fitType', label: 'Fit Type', placeholder: 'Regular / Slim / Oversized' },
      ],
      'Fashion:Ethnic Wear': [
        { k: 'fabric', label: 'Fabric', placeholder: 'Cotton / Silk / Rayon' },
        { k: 'color', label: 'Color', placeholder: 'Red / Green / Beige' },
        { k: 'occasion', label: 'Occasion', placeholder: 'Festive / Wedding / Daily' },
      ],
      'Fashion:Western Wear': [
        { k: 'fabric', label: 'Fabric', placeholder: 'Denim / Knit / Satin' },
        { k: 'color', label: 'Color', placeholder: 'Black / Blue / White' },
        { k: 'fitType', label: 'Fit Type', placeholder: 'Regular / Slim' },
      ],
      'Fashion:Footwear': [
        { k: 'material', label: 'Material', placeholder: 'Leather / Mesh / Synthetic' },
        { k: 'soleType', label: 'Sole Type', placeholder: 'Rubber / EVA' },
      ],
      'Mobiles:Smartphones': [
        { k: 'ram', label: 'RAM', placeholder: '6GB / 8GB / 12GB' },
        { k: 'storage', label: 'Storage', placeholder: '128GB / 256GB' },
        { k: 'processor', label: 'Processor', placeholder: 'Snapdragon / Dimensity' },
        { k: 'battery', label: 'Battery', placeholder: '5000mAh' },
      ],
      'Electronics:Laptops': [
        { k: 'processor', label: 'Processor', placeholder: 'Intel i5 / Ryzen 5' },
        { k: 'ram', label: 'RAM', placeholder: '8GB / 16GB' },
        { k: 'ssd', label: 'SSD', placeholder: '512GB / 1TB' },
        { k: 'gpu', label: 'GPU', placeholder: 'RTX / Integrated' },
      ],
    }
    return map[key] || []
  }, [addCategory, addSubCategory])

  const sizeOptions = useMemo(() => {
    if (addCategory === 'Fashion' && ['Clothing', 'Ethnic Wear', 'Western Wear'].includes(addSubCategory)) return ['S', 'M', 'L', 'XL']
    if (addCategory === 'Fashion' && addSubCategory === 'Footwear') return ['6', '7', '8', '9', '10']
    if (addCategory === 'Mobiles' || (addCategory === 'Electronics' && addSubCategory === 'Mobiles')) return ['128GB', '256GB']
    return []
  }, [addCategory, addSubCategory])

  const toggleAddSize = (s) => {
    setAddSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const setAttr = (k, v) => {
    setAddAttributes((prev) => ({ ...(prev || {}), [k]: v }))
  }

  useEffect(() => {
    if (addCategory !== 'Fashion') {
      setAddAttributes({})
      return
    }
    setAddAttributes((prev) => ({
      ...(prev || {}),
      fashionCategory: addSubCategory,
      gender: addGender,
      productType: addProductType,
    }))
  }, [addCategory, addSubCategory, addGender, addProductType])

  // Stats data
  const [stats, setStats] = useState({
    totalSales: 124299,
    totalOrders: 342,
    totalProducts: 28,
    totalCustomers: 189,
    revenueGrowth: 12.5,
    orderGrowth: 8.2,
    customerGrowth: 5.7,
    avgRating: 4.6
  })

  const fetchMine = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/seller/products', { headers: { token } })
      setProducts(res.data?.products || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token || !canUse) return
    fetchMine()
  }, [token, canUse])

  const fetchSellerOrders = async () => {
    setOrdersLoading(true)
    try {
      const res = await axios.post(backendUrl + '/api/order/seller/list', {}, { headers: { token } })
      if (res.data?.success) {
        setOrders(res.data?.orders || [])
      } else {
        toast.error(res.data?.message || 'Failed to load orders')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (token && canUse) fetchSellerOrders()
  }, [token, canUse])

  const sellerStatusOptions = useMemo(
    () => ['Order Placed', 'Order Confirmed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    []
  )

  const saveSellerOrderStatus = async (orderId) => {
    const nextStatus = String(orderStatusDraft?.[orderId] || '').trim()
    if (!orderId || !nextStatus) return
    try {
      const res = await axios.post(backendUrl + '/api/order/seller/status', { orderId, status: nextStatus }, { headers: { token } })
      if (res.data?.success) {
        toast.success(res.data?.message || 'Status updated')
        await fetchSellerOrders()
      } else {
        toast.error(res.data?.message || 'Failed to update status')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status')
    }
  }

  const addProduct = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData(e.target)
      const slugify = (value) =>
        String(value || '')
          .trim()
          .toLowerCase()
          .replace(/[%]/g, 'pct')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

      const rawCategory = String(fd.get('category') || '').trim()
      const rawSubCategory = String(fd.get('subCategory') || '').trim()
      let attr = {}
      try {
        attr = JSON.parse(String(fd.get('attributes') || '{}'))
      } catch {}

      let mainCategory = ''
      let sectionLabel = ''
      let categoryLabel = rawSubCategory
      let section = ''
      let categorySlug = slugify(rawSubCategory)

      const incomingMain = String(fd.get('mainCategory') || '').trim()
      const incomingSection = String(fd.get('section') || '').trim()
      const incomingSlug = String(fd.get('categorySlug') || '').trim()

      if (incomingMain && CATEGORY_TREE[incomingMain]) {
        mainCategory = incomingMain
        categorySlug = incomingSlug || categorySlug
        section = incomingSection || inferSection(mainCategory, categorySlug)
        const labels = getLabels(mainCategory, section, categorySlug)
        sectionLabel = String(fd.get('sectionLabel') || labels.sectionLabel || '').trim()
        categoryLabel = String(fd.get('categoryLabel') || labels.categoryLabel || rawSubCategory).trim()
      } else {
        if (rawCategory === 'Fashion') mainCategory = 'fashion'
        else if (rawCategory === 'Electronics' || rawCategory === 'Mobiles') mainCategory = 'electronics'
        else if (rawCategory === 'Home' || rawCategory === 'Home & Kitchen') mainCategory = 'home-kitchen'
        else if (rawCategory === 'Lifestyle') mainCategory = 'lifestyle'

        if (mainCategory === 'fashion') {
          sectionLabel = String(attr.gender || 'Men').trim() || 'Men'
          section = slugify(sectionLabel)
        } else if (mainCategory === 'electronics') {
          const sub = rawSubCategory
          if (rawCategory === 'Mobiles') {
            sectionLabel = 'Mobiles'
            section = 'mobiles'
          } else if (['Mobiles', 'Smartphones', 'Tablets', 'Accessories'].includes(sub)) {
            sectionLabel = 'Mobiles'
            section = 'mobiles'
          } else if (['Laptops', 'Gaming', 'Monitors'].includes(sub)) {
            sectionLabel = 'Computing'
            section = 'computing'
          } else if (['Headphones', 'Speakers', 'Soundbars'].includes(sub)) {
            sectionLabel = 'Audio'
            section = 'audio'
          } else {
            sectionLabel = 'Electronics'
            section = ''
          }
          if (sub === 'Mobiles') {
            categoryLabel = 'Smartphones'
            categorySlug = 'smartphones'
          } else {
            categoryLabel = rawSubCategory
            categorySlug = slugify(categoryLabel)
          }
        } else if (mainCategory === 'home-kitchen') {
          const sub = rawSubCategory
          if (['Lighting', 'Furniture', 'Decor', 'Home Decor'].includes(sub)) {
            sectionLabel = 'Decor'
            section = 'decor'
          } else if (['Appliances', 'Kitchen Items', 'Storage', 'Cookware', 'Dining'].includes(sub)) {
            sectionLabel = 'Kitchen'
            section = 'kitchen'
          } else {
            sectionLabel = 'Living'
            section = 'living'
          }
        }
      }

      if (mainCategory) fd.append('mainCategory', mainCategory)
      if (section) fd.append('section', section)
      if (categorySlug) fd.append('categorySlug', categorySlug)
      if (sectionLabel) fd.append('sectionLabel', sectionLabel)
      if (categoryLabel) fd.append('categoryLabel', categoryLabel)

      const imageUrlsRaw = String(fd.get('imageUrls') || '')
      const images = imageUrlsRaw
        .split(/\r?\n|,/)
        .map((v) => v.trim())
        .filter(Boolean)
      fd.delete('imageUrls')
      if (images.length) fd.append('imageUrls', JSON.stringify(images))

      const res = await axios.post(backendUrl + '/api/seller/product/add', fd, { headers: { token } })
      toast.success('Product added')
      setAddOpen(false)
      fetchMine()
      refreshProducts?.()
    } catch (err) {
      console.error(err)
      toast.error('Failed to add product')
    }
  }

  const removeProduct = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await axios.post(backendUrl + '/api/seller/product/remove', { id }, { headers: { token } })
      toast.success('Product deleted')
      fetchMine()
      refreshProducts?.()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete product')
    }
  }

  const openEdit = (p) => {
    const slugify = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[%]/g, 'pct')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    const looksFashion = ['Men', 'Women', 'Kids', 'Unisex', 'Fashion'].includes(String(p?.category || '').trim()) || p?.mainCategory === 'fashion'
    const initialCategory = looksFashion ? 'Fashion' : (String(p?.category || '').trim() || 'Fashion')
    const initialSubCategory = looksFashion ? (String(p?.subCategory || '').trim() || 'Clothing') : (String(p?.subCategory || '').trim() || (subcategoryOptions[initialCategory] || [])[0] || '')
    const initialGender = String(p?.gender || p?.attributes?.gender || (looksFashion && ['Men', 'Women', 'Kids', 'Unisex'].includes(String(p?.category || '').trim()) ? p.category : 'Men')).trim() || 'Men'
    const initialProductType = String(p?.attributes?.productType || (fashionProductTypeOptions[initialSubCategory] || [])[0] || 'Topwear')
    const initialCollection = Array.isArray(p?.collectionType) ? p.collectionType : Array.isArray(p?.attributes?.collectionType) ? p.attributes.collectionType : []
    const initialColors = Array.isArray(p?.colors) ? p.colors : Array.isArray(p?.attributes?.colors) ? p.attributes.colors : []

    const inferredMain =
      String(p?.mainCategory || '').trim() ||
      (initialCategory === 'Fashion' ? 'fashion' : initialCategory === 'Electronics' || initialCategory === 'Mobiles' ? 'electronics' : initialCategory === 'Home' ? 'home-kitchen' : initialCategory === 'Lifestyle' ? 'lifestyle' : '')
    const inferredLeaf = String(p?.categorySlug || '').trim() || slugify(String(p?.categoryLabel || p?.subCategory || initialSubCategory))
    const inferredSection = String(p?.section || '').trim() || inferSection(inferredMain, inferredLeaf)
    const labels = getLabels(inferredMain, inferredSection, inferredLeaf)
    const normalizedCategory = mainLabelForSellerCategory(inferredMain)
    const normalizedSub = labels.categoryLabel || initialSubCategory
    const normalizedGender = inferredMain === 'fashion' ? (labels.sectionLabel || initialGender) : initialGender
    const normalizedProductType = inferredMain === 'fashion' ? String(p?.attributes?.productType || (fashionProductTypeOptions[normalizedSub] || [])[0] || initialProductType) : initialProductType

    setEditDraft({
      ...p,
      imageUrls: Array.isArray(p.imageUrls) ? p.imageUrls.join(',') : p.imageUrls || ''
    })
    setEditTaxonomy({ mainCategory: inferredMain, section: inferredSection, categorySlug: inferredLeaf })
    setEditCategory(normalizedCategory)
    setEditSubCategory(normalizedSub)
    setEditGender(normalizedGender)
    setEditProductType(normalizedProductType)
    setEditCollectionType((initialCollection || []).map((v) => String(v || '').trim()).filter(Boolean))
    setEditColors((initialColors || []).map((v) => String(v || '').trim()).filter(Boolean))
    setEditOpen(true)
  }

  const closeEdit = () => {
    setEditOpen(false)
    setEditDraft(null)
  }

  const updateProduct = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData(e.target)
      fd.append('id', editDraft._id)
      const slugify = (value) =>
        String(value || '')
          .trim()
          .toLowerCase()
          .replace(/[%]/g, 'pct')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

      const rawCategory = String(fd.get('category') || '').trim()
      const rawSubCategory = String(fd.get('subCategory') || '').trim()
      let attr = {}
      try {
        attr = JSON.parse(String(fd.get('attributes') || '{}'))
      } catch {}

      let mainCategory = ''
      let sectionLabel = ''
      let categoryLabel = rawSubCategory
      let section = ''
      let categorySlug = slugify(rawSubCategory)

      const incomingMain = String(fd.get('mainCategory') || '').trim()
      const incomingSection = String(fd.get('section') || '').trim()
      const incomingSlug = String(fd.get('categorySlug') || '').trim()

      if (incomingMain && CATEGORY_TREE[incomingMain]) {
        mainCategory = incomingMain
        categorySlug = incomingSlug || categorySlug
        section = incomingSection || inferSection(mainCategory, categorySlug)
        const labels = getLabels(mainCategory, section, categorySlug)
        sectionLabel = String(fd.get('sectionLabel') || labels.sectionLabel || '').trim()
        categoryLabel = String(fd.get('categoryLabel') || labels.categoryLabel || rawSubCategory).trim()
      } else {
        if (rawCategory === 'Fashion') mainCategory = 'fashion'
        else if (rawCategory === 'Electronics' || rawCategory === 'Mobiles') mainCategory = 'electronics'
        else if (rawCategory === 'Home' || rawCategory === 'Home & Kitchen') mainCategory = 'home-kitchen'
        else if (rawCategory === 'Lifestyle') mainCategory = 'lifestyle'

        if (mainCategory === 'fashion') {
          sectionLabel = String(attr.gender || 'Men').trim() || 'Men'
          section = slugify(sectionLabel)
        } else if (mainCategory === 'electronics') {
          const sub = rawSubCategory
          if (rawCategory === 'Mobiles') {
            sectionLabel = 'Mobiles'
            section = 'mobiles'
          } else if (['Mobiles', 'Smartphones', 'Tablets', 'Accessories'].includes(sub)) {
            sectionLabel = 'Mobiles'
            section = 'mobiles'
          } else if (['Laptops', 'Gaming', 'Monitors'].includes(sub)) {
            sectionLabel = 'Computing'
            section = 'computing'
          } else if (['Headphones', 'Speakers', 'Soundbars'].includes(sub)) {
            sectionLabel = 'Audio'
            section = 'audio'
          } else {
            sectionLabel = 'Electronics'
            section = ''
          }
          if (sub === 'Mobiles') {
            categoryLabel = 'Smartphones'
            categorySlug = 'smartphones'
          } else {
            categoryLabel = rawSubCategory
            categorySlug = slugify(categoryLabel)
          }
        } else if (mainCategory === 'home-kitchen') {
          const sub = rawSubCategory
          if (['Lighting', 'Furniture', 'Decor', 'Home Decor'].includes(sub)) {
            sectionLabel = 'Decor'
            section = 'decor'
          } else if (['Appliances', 'Kitchen Items', 'Storage', 'Cookware', 'Dining'].includes(sub)) {
            sectionLabel = 'Kitchen'
            section = 'kitchen'
          } else {
            sectionLabel = 'Living'
            section = 'living'
          }
        }
      }

      if (mainCategory) fd.append('mainCategory', mainCategory)
      if (section) fd.append('section', section)
      if (categorySlug) fd.append('categorySlug', categorySlug)
      if (sectionLabel) fd.append('sectionLabel', sectionLabel)
      if (categoryLabel) fd.append('categoryLabel', categoryLabel)

      const imageUrlsRaw = String(fd.get('imageUrls') || '')
      const images = imageUrlsRaw
        .split(/\r?\n|,/)
        .map((v) => v.trim())
        .filter(Boolean)
      fd.delete('imageUrls')
      if (images.length) fd.append('imageUrls', JSON.stringify(images))

      await axios.post(backendUrl + '/api/seller/product/update', fd, { headers: { token } })
      toast.success('Product updated')
      closeEdit()
      fetchMine()
      refreshProducts?.()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update product')
    }
  }

  const quickToggle = async (id, patch) => {
    try {
      await axios.patch(
        backendUrl + '/api/product/' + id,
        patch,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Updated')
      fetchMine()
    } catch (err) {
      console.error(err)
      toast.error('Failed')
    }
  }

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'products', label: 'Products', icon: PackageIcon },
    { id: 'orders', label: 'Orders', icon: ShoppingCartIcon },
    { id: 'customers', label: 'Customers', icon: UsersIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3Icon },
    { id: 'revenue', label: 'Revenue', icon: DollarSignIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'logout', label: 'Logout', icon: LogOutIcon }
  ]

  // Stats cards data
  const statCards = [
    {
      id: 'sales',
      title: 'Total Sales',
      value: `₹${stats.totalSales.toLocaleString()}`,
      change: `${stats.revenueGrowth}%`,
      trend: 'up',
      icon: DollarSignIcon,
      color: 'from-emerald-500 to-teal-400',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: stats.totalOrders,
      change: `${stats.orderGrowth}%`,
      trend: 'up',
      icon: ShoppingCartIcon,
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    {
      id: 'products',
      title: 'Active Products',
      value: stats.totalProducts,
      change: '+3',
      trend: 'up',
      icon: PackageIcon,
      color: 'from-purple-500 to-violet-400',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20'
    },
    {
      id: 'customers',
      title: 'Total Customers',
      value: stats.totalCustomers,
      change: `${stats.customerGrowth}%`,
      trend: 'up',
      icon: UsersIcon,
      color: 'from-amber-500 to-orange-400',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
    }
  ]

  // Demo products for showcase
  const demoProducts = [
    {
      id: 1,
      name: 'Premium Wireless Earbuds',
      category: 'Electronics',
      price: 8999,
      stock: 42,
      rating: 4.8,
      status: 'low',
      image: 'https://images.unsplash.com/photo-1590658165737-15a047b8b5e8?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Smart Fitness Watch',
      category: 'Wearables',
      price: 12999,
      stock: 156,
      rating: 4.6,
      status: 'in-stock',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      name: 'Organic Cotton T-Shirt',
      category: 'Fashion',
      price: 1499,
      stock: 89,
      rating: 4.4,
      status: 'in-stock',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      name: 'Bluetooth Speaker',
      category: 'Electronics',
      price: 3499,
      stock: 23,
      rating: 4.7,
      status: 'low',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      name: 'Laptop Backpack',
      category: 'Accessories',
      price: 2499,
      stock: 67,
      rating: 4.5,
      status: 'in-stock',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      name: 'Coffee Maker',
      category: 'Home Appliances',
      price: 5999,
      stock: 34,
      rating: 4.3,
      status: 'in-stock',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
    }
  ]

  const recentOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders.slice() : []
    return list.slice(0, 12).map((o) => {
      const address = o?.address || {}
      const customer = String(address?.name || `${address?.firstName || ''} ${address?.lastName || ''}`.trim() || 'Customer')
      const amount = Number(o?.sellerAmount ?? o?.amount ?? 0)
      const date = (() => {
        const d = new Date(Number(o?.date || Date.now()))
        return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
      })()
      return {
        orderId: String(o?._id || ''),
        id: `#${String(o?._id || '').slice(-6).toUpperCase()}`,
        customer,
        amount: `₹${amount.toLocaleString()}`,
        status: String(o?.status || 'Order Placed'),
        date,
        _raw: o,
      }
    })
  }, [orders])

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ))
  }

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([])
  }

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    const source = Array.isArray(products) && products.length ? products : demoProducts

    const normalized = source.map((p) => {
      const id = p?._id || p?.id
      const name = String(p?.name || '')
      const category = String(p?.category || '')
      const price = Number(p?.price ?? p?.new_price ?? 0)
      const stock = Number(p?.stockQuantity ?? p?.stock ?? 0)
      const rating = Number(p?.rating ?? 4.5)
      const image = Array.isArray(p?.image) ? p.image[0] : p?.image
      const status = stock > 0 && stock <= 25 ? 'low' : 'in-stock'

      return { id, name, category, price, stock, rating, status, image }
    })

    const q = searchQuery.trim().toLowerCase()
    if (!q) return normalized

    return normalized.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q)
      )
    })
  }, [searchQuery, products])

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Top Header */}
      <header className='sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-8'>
              <div className='flex items-center gap-3'>
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className='lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200'
                  aria-label='Toggle menu'
                >
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                  </svg>
                </button>
                
                <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center'>
                  <Store className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-xl font-bold text-slate-900 dark:text-white'>Seller Dashboard</h1>
                  <p className='text-sm text-slate-500 dark:text-slate-400'>Welcome back, Seller!</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className='hidden md:flex items-center bg-slate-100 rounded-2xl px-4 py-2 w-80'>
                <Search className='h-5 w-5 text-slate-400 mr-2' />
                <input
                  type='text'
                  placeholder='Search products, orders, customers...'
                  className='bg-transparent border-none outline-none w-full text-slate-700 placeholder-slate-400'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className='flex items-center gap-4'>
              {/* Notifications */}
              <div className='relative'>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className='p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors relative'
                  aria-label='Notifications'
                >
                  <Bell className='h-5 w-5' />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className='absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className='absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50'
                    >
                      <div className='p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between'>
                        <h3 className='font-bold text-slate-900 dark:text-white'>Notifications</h3>
                        <button
                          onClick={clearNotifications}
                          className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                        >
                          Clear all
                        </button>
                      </div>
                      <div className='max-h-96 overflow-y-auto'>
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer ${notification.unread ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className='flex items-start gap-3'>
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${notification.unread ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                  <Bell className={`h-5 w-5 ${notification.unread ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                                </div>
                                <div className='flex-1'>
                                  <div className='flex items-center justify-between'>
                                    <h4 className='font-bold text-slate-900 dark:text-white'>{notification.title}</h4>
                                    <span className='text-xs text-slate-500'>{notification.time}</span>
                                  </div>
                                  <p className='text-sm text-slate-600 dark:text-slate-300 mt-1'>{notification.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className='p-8 text-center'>
                            <Bell className='h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4' />
                            <p className='text-slate-500 dark:text-slate-400'>No notifications</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile */}
              <div className='flex items-center gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800'>
                <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center'>
                  <User className='h-5 w-5 text-white' />
                </div>
                <div className='hidden md:block'>
                  <p className='text-sm font-bold text-slate-900 dark:text-white'>Seller Account</p>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>Pro Seller</p>
                </div>
                <ChevronDown className='h-4 w-4 text-slate-400' />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 sm:px-6 py-6 sm:py-8'>
        <div className='flex flex-col lg:flex-row gap-6 sm:gap-8'>
          {/* Mobile Sidebar Overlay */}
          {showSidebar && (
            <div
              className='fixed inset-0 bg-black/50 z-40 lg:hidden'
              onClick={() => setShowSidebar(false)}
            />
          )}
          
          {/* Sidebar Navigation */}
          <div className={`lg:w-64 ${showSidebar ? 'fixed inset-y-0 left-0 z-50 w-64 p-4 bg-white dark:bg-slate-900 lg:static lg:bg-transparent lg:dark:bg-transparent lg:p-0' : 'hidden lg:block'}`}>
            <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 sticky top-24 h-[calc(100vh-6rem)] lg:h-auto overflow-y-auto'>
              {/* Close button for mobile */}
              <div className='flex items-center justify-between mb-6 lg:hidden'>
                <h2 className='text-lg font-bold text-slate-900 dark:text-white'>Navigation</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className='p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700'
                >
                  <X className='h-5 w-5 text-slate-500' />
                </button>
              </div>
              <div className='mb-8'>
                <h2 className='text-lg font-bold text-slate-900 dark:text-white mb-2'>Navigation</h2>
                <p className='text-sm text-slate-500 dark:text-slate-400'>Manage your seller account</p>
              </div>

              <div className='space-y-2'>
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                  >
                    <item.icon className='h-5 w-5' />
                    <span className='font-medium'>{item.label}</span>
                    {activeTab === item.id && <ChevronRight className='h-4 w-4 ml-auto' />}
                  </button>
                ))}
              </div>

              <div className='mt-8 pt-6 border-t border-slate-200 dark:border-slate-700'>
                <div className='flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl'>
                  <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center'>
                    <Award className='h-5 w-5 text-white' />
                  </div>
                  <div>
                    <p className='text-sm font-bold text-slate-900 dark:text-white'>Pro Seller</p>
                    <p className='text-xs text-slate-600 dark:text-slate-300'>Level 3 • 90% complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            <AnimatePresence mode='wait'>
              {activeTab === 'dashboard' && (
                <motion.div
                  key='dashboard'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='space-y-8'
                >
                  {/* Welcome Banner */}
                  <div className='bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 text-white'>
                    <div className='flex flex-col md:flex-row items-start md:items-center justify-between'>
                      <div>
                        <h1 className='text-3xl font-bold mb-2'>Welcome back, Seller!</h1>
                        <p className='text-blue-100'>Here's what's happening with your store today.</p>
                        <div className='flex items-center gap-4 mt-6'>
                          <div className='flex items-center gap-2'>
                            <CheckCircle className='h-5 w-5' />
                            <span className='font-medium'>24 new orders</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <TrendingUp className='h-5 w-5' />
                            <span className='font-medium'>12.5% revenue growth</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        className='mt-4 md:mt-0 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2'
                        onClick={() => setAddOpen(true)}
                      >
                        <Plus className='h-5 w-5' />
                        Add New Product
                      </button>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {statCards.map((card) => (
                      <div
                        key={card.id}
                        className={`${card.bgColor} rounded-3xl p-6 border border-slate-200 dark:border-slate-700`}
                      >
                        <div className='flex items-center justify-between mb-4'>
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                            <card.icon className='h-6 w-6 text-white' />
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${card.trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {card.trend === 'up' ? <ArrowUpRight className='h-3 w-3' /> : <ArrowDownRight className='h-3 w-3' />}
                            <span className='text-sm font-bold'>{card.change}</span>
                          </div>
                        </div>
                        <h3 className='text-2xl font-black text-slate-900 dark:text-white'>{card.value}</h3>
                        <p className='text-slate-600 dark:text-slate-300 mt-1'>{card.title}</p>
                      </div>
                    ))}
                  </div>

                  {/* Product Management Section */}
                  <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700'>
                    <div className='flex items-center justify-between mb-6'>
                      <div>
                        <h2 className='text-xl font-bold text-slate-900 dark:text-white'>Product Management</h2>
                        <p className='text-slate-500 dark:text-slate-400'>Manage your products, stock, and pricing</p>
                      </div>
                      <div className='flex gap-3'>
                        <button className='px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium flex items-center gap-2'>
                          <Filter className='h-4 w-4' />
                          Filter
                        </button>
                        <button 
                          className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2'
                          onClick={() => setAddOpen(true)}
                        >
                          <Plus className='h-4 w-4' />
                          Add Product
                        </button>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className='bg-slate-50 dark:bg-slate-750 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow'
                        >
                          <div className='relative'>
                            <img
                              src={product.image}
                              alt={product.name}
                              className='w-full h-48 object-cover rounded-xl mb-4'
                            />
                            <div className='absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold'>
                              {product.status === 'low' ? (
                                <span className='text-amber-600'>Low Stock</span>
                              ) : (
                                <span className='text-emerald-600'>In Stock</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className='font-bold text-slate-900 dark:text-white truncate'>{product.name}</h3>
                            <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>{product.category}</p>
                            <div className='flex items-center justify-between mt-4'>
                              <div>
                                <p className='text-xl font-black text-slate-900 dark:text-white'>₹{product.price.toLocaleString()}</p>
                                <p className='text-xs text-slate-500'>{product.stock} units</p>
                              </div>
                              <div className='flex items-center gap-1'>
                                <Star className='h-4 w-4 text-amber-500 fill-amber-500' />
                                <span className='text-sm font-bold'>{product.rating}</span>
                              </div>
                            </div>
                            <div className='flex gap-2 mt-4'>
                              <button className='flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors'>
                                Edit
                              </button>
                              <button className='flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors'>
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analytics Section */}
                  <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700'>
                    <div className='flex items-center justify-between mb-6'>
                      <div>
                        <h2 className='text-xl font-bold text-slate-900 dark:text-white'>Sales Analytics</h2>
                        <p className='text-slate-500 dark:text-slate-400'>Track your performance and growth</p>
                      </div>
                      <select className='px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium'>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last quarter</option>
                      </select>
                    </div>
                    <div className='h-64 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl flex items-center justify-center'>
                      <div className='text-center'>
                        <BarChart3 className='h-12 w-12 text-blue-500 mx-auto mb-4' />
                        <p className='text-slate-600 dark:text-slate-300'>Sales chart visualization would appear here</p>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mt-2'>Integration with charts library required</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700'>
                    <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-6'>Recent Orders</h2>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead>
                          <tr className='border-b border-slate-200 dark:border-slate-700'>
                            <th className='text-left py-3 text-slate-500 dark:text-slate-400 font-medium'>Order ID</th>
                            <th className='text-left py-3 text-slate-500 dark:text-slate-400 font-medium'>Customer</th>
                            <th className='text-left py-3 text-slate-500 dark:text-slate-400 font-medium'>Amount</th>
                            <th className='text-left py-3 text-slate-500 dark:text-slate-400 font-medium'>Status</th>
                            <th className='text-left py-3 text-slate-500 dark:text-slate-400 font-medium'>Date</th>
                            <th className='text-left py-3 text-slate-500 dark:text-slate-400 font-medium'>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ordersLoading ? (
                            <tr>
                              <td colSpan={6} className='py-8 text-center text-sm font-semibold text-slate-500'>
                                Loading orders…
                              </td>
                            </tr>
                          ) : recentOrders.length === 0 ? (
                            <tr>
                              <td colSpan={6} className='py-8 text-center text-sm font-semibold text-slate-500'>
                                No orders yet for your products.
                              </td>
                            </tr>
                          ) : (
                            recentOrders.map((order) => (
                              <tr key={order.orderId || order.id} className='border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'>
                                <td className='py-4 font-medium text-slate-900 dark:text-white'>{order.id}</td>
                                <td className='py-4 text-slate-700 dark:text-slate-300'>{order.customer}</td>
                                <td className='py-4 font-bold text-slate-900 dark:text-white'>{order.amount}</td>
                                <td className='py-4'>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      order.status === 'Delivered'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : order.status === 'Order Confirmed' || order.status === 'Packing'
                                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                          : order.status === 'Shipped' || order.status === 'Out for Delivery'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : order.status === 'Cancelled'
                                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td className='py-4 text-slate-600 dark:text-slate-400'>{order.date}</td>
                                <td className='py-4'>
                                  <div className='flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end'>
                                    <select
                                      value={orderStatusDraft?.[order.orderId] ?? order.status}
                                      onChange={(e) => setOrderStatusDraft((prev) => ({ ...(prev || {}), [order.orderId]: e.target.value }))}
                                      className='h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none hover:border-slate-300'
                                    >
                                      {sellerStatusOptions.map((s) => (
                                        <option key={s} value={s}>
                                          {s}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type='button'
                                      onClick={() => saveSellerOrderStatus(order.orderId)}
                                      className='h-9 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition-colors'
                                    >
                                      Save
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div
                  key='products'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='space-y-8'
                >
                  <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>Products Management</h2>
                    <p className='text-slate-600 dark:text-slate-400'>Full product management interface would be here.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key='orders'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='space-y-8'
                >
                  <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>Orders Management</h2>
                    <p className='text-slate-600 dark:text-slate-400'>Full orders management interface would be here.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'customers' && (
                <motion.div
                  key='customers'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='space-y-8'
                >
                  <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>Customers Management</h2>
                    <p className='text-slate-600 dark:text-slate-400'>Full customers management interface would be here.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key='analytics'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='space-y-8'
                >
                  <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>Analytics Dashboard</h2>
                    <p className='text-slate-600 dark:text-slate-400'>Full analytics dashboard would be here.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'revenue' && (
                <motion.div
                  key='revenue'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='space-y-8'
                >
                  <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>Revenue & Payments</h2>
                    <p className='text-slate-600 dark:text-slate-400'>Full revenue and payments interface would be here.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key='notifications'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='space-y-8'
                >
                  <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>Notifications Center</h2>
                    <p className='text-slate-600 dark:text-slate-400'>Full notifications interface would be here.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key='settings'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='space-y-8'
                >
                  <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>Settings</h2>
                    <p className='text-slate-600 dark:text-slate-400'>Full settings interface would be here.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'logout' && (
                <motion.div
                  key='logout'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='space-y-8'
                >
                  <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>Logout</h2>
                    <p className='text-slate-600 dark:text-slate-400'>Are you sure you want to logout?</p>
                    <button className='mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors'>
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {addOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>Add New Product</h2>
              <button
                onClick={() => setAddOpen(false)}
                className='p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700'
              >
                <X className='h-5 w-5 text-slate-500' />
              </button>
            </div>
            <form onSubmit={addProduct} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Product Name</label>
                  <input
                    type='text'
                    name='name'
                    required
                    className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>All Categories</label>
                  <CategoryTreeSelect
                    value={addTaxonomy}
                    onChange={(next) => {
                      if (!next?.mainCategory || !next?.section || !next?.categorySlug) return
                      setAddTaxonomy({ mainCategory: next.mainCategory, section: next.section, categorySlug: next.categorySlug })
                      setAddCollectionType([])
                      setAddColors([])
                    }}
                    allowClear={false}
                    placeholder='Pick a category'
                    maxPanelHeightClass='max-h-[460px]'
                  />
                  <input type='hidden' name='category' value={addCategory} />
                  <input type='hidden' name='subCategory' value={addSubCategory} />
                  <input type='hidden' name='mainCategory' value={addTaxonomy?.mainCategory || ''} />
                  <input type='hidden' name='section' value={addTaxonomy?.section || ''} />
                  <input type='hidden' name='categorySlug' value={addTaxonomy?.categorySlug || ''} />
                  <input
                    type='hidden'
                    name='sectionLabel'
                    value={getLabels(addTaxonomy?.mainCategory, addTaxonomy?.section, addTaxonomy?.categorySlug)?.sectionLabel || ''}
                  />
                  <input
                    type='hidden'
                    name='categoryLabel'
                    value={getLabels(addTaxonomy?.mainCategory, addTaxonomy?.section, addTaxonomy?.categorySlug)?.categoryLabel || ''}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Price</label>
                  <input
                    type='number'
                    name='price'
                    required
                    className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Stock Quantity</label>
                  <input
                    type='number'
                    name='stockQuantity'
                    required
                    className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                  />
                </div>
                
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Brand</label>
                  <input
                    type='text'
                    name='brand'
                    className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                    placeholder='Nike / Samsung / Apple'
                  />
                </div>
                {addTaxonomy?.mainCategory === 'fashion' && (
                  <div className='md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur px-4 py-3'>
                    <p className='text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400'>Fashion Segment</p>
                    <div className='mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700 dark:text-slate-200'>
                      <span className='font-semibold'>Gender:</span>{' '}
                      <span>{getLabels(addTaxonomy?.mainCategory, addTaxonomy?.section, addTaxonomy?.categorySlug)?.sectionLabel || 'Men'}</span>
                      <span className='font-semibold'>Category:</span> <span>{addSubCategory || 'Clothing'}</span>
                    </div>
                  </div>
                )}
                {addTaxonomy?.mainCategory === 'fashion' && ['Clothing', 'Ethnic Wear', 'Western Wear'].includes(addSubCategory) && (
                  <div>
                    <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Product Type</label>
                    <select
                      value={addProductType}
                      onChange={(e) => {
                        const next = e.target.value
                        setAddProductType(next)
                        setAddAttributes((prev) => ({ ...(prev || {}), productType: next }))
                      }}
                      className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                    >
                      {(fashionProductTypeOptions[addSubCategory] || []).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Collection Type</label>
                  <div className='flex flex-wrap gap-2'>
                    {['New Arrivals', 'Trending', 'Best Seller', 'Discount Deals', 'Featured', 'Recommended'].map((c) => {
                      const active = addCollectionType.includes(c)
                      return (
                        <button
                          key={c}
                          type='button'
                          onClick={() =>
                            setAddCollectionType((prev) =>
                              prev.includes(c) ? prev.filter((v) => v !== c) : [...prev, c]
                            )
                          }
                          className={`px-4 py-2 rounded-full text-[11px] font-black tracking-widest uppercase transition-all ${
                            active
                              ? 'text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 shadow-lg shadow-pink-600/20'
                              : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                          }`}
                        >
                          {c}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Colors (optional)</label>
                  <div className='flex flex-wrap gap-2'>
                    {[
                      { name: 'Black', hex: '#000000' },
                      { name: 'White', hex: '#FFFFFF' },
                      { name: 'Blue', hex: '#3B82F6' },
                      { name: 'Red', hex: '#EF4444' },
                      { name: 'Green', hex: '#10B981' },
                      { name: 'Beige', hex: '#E5D3B3' },
                      { name: 'Purple', hex: '#A855F7' },
                      { name: 'Pink', hex: '#EC4899' },
                      { name: 'Yellow', hex: '#FACC15' },
                      { name: 'Grey', hex: '#9CA3AF' },
                    ].map((c) => {
                      const active = addColors.includes(c.name)
                      return (
                        <button
                          key={c.name}
                          type='button'
                          onClick={() =>
                            setAddColors((prev) =>
                              prev.includes(c.name) ? prev.filter((v) => v !== c.name) : [...prev, c.name]
                            )
                          }
                          className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-black tracking-widest uppercase transition-all ${
                            active
                              ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/10 bg-white dark:bg-slate-700'
                              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`h-4 w-4 rounded-full border ${c.name === 'White' ? 'border-slate-300' : 'border-transparent'}`}
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className={active ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}>
                            {c.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <input type='hidden' name='sizes' value={JSON.stringify(addSizes.length ? addSizes : ['M'])} />
              <input type='hidden' name='attributes' value={JSON.stringify(addAttributes || {})} />
              <input type='hidden' name='collectionType' value={JSON.stringify(addCollectionType || [])} />
              <input type='hidden' name='colors' value={JSON.stringify(addColors || [])} />
              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Description</label>
                <textarea
                  name='description'
                  rows={4}
                  className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>MRP (optional)</label>
                  <input
                    type='number'
                    name='mrp'
                    className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Discount % (optional)</label>
                  <input
                    type='number'
                    name='discountPercent'
                    className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                  />
                </div>
              </div>
              {(sizeOptions.length > 0 || attributeFields.length > 0) && (
                <div className='rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 p-5 space-y-5'>
                  {sizeOptions.length > 0 && (
                    <div>
                      <p className='text-sm font-bold text-slate-900 dark:text-white mb-3'>Variants</p>
                      <div className='flex flex-wrap gap-2'>
                        {sizeOptions.map((s) => (
                          <button
                            key={s}
                            type='button'
                            onClick={() => toggleAddSize(s)}
                            className={`px-3 py-2 rounded-xl text-sm font-bold border transition ${
                              addSizes.includes(s)
                                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {attributeFields.length > 0 && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {attributeFields.map((f) => (
                        <div key={f.k}>
                          <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>{f.label}</label>
                          <input
                            type='text'
                            value={addAttributes?.[f.k] || ''}
                            onChange={(e) => setAttr(f.k, e.target.value)}
                            className='w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                            placeholder={f.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Image URLs (comma separated)</label>
                <textarea
                  name='imageUrls'
                  rows={2}
                  className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                  placeholder='https://example.com/image1.jpg, https://example.com/image2.jpg'
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Upload Image 1</label>
                  <input type='file' name='image1' accept='image/*' className='w-full' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Upload Image 2</label>
                  <input type='file' name='image2' accept='image/*' className='w-full' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Upload Image 3</label>
                  <input type='file' name='image3' accept='image/*' className='w-full' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Upload Image 4</label>
                  <input type='file' name='image4' accept='image/*' className='w-full' />
                </div>
              </div>
              <div className='flex justify-end gap-4'>
                <button
                  type='button'
                  onClick={() => setAddOpen(false)}
                  className='px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl'
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editOpen && editDraft && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>Edit Product</h2>
              <button
                onClick={closeEdit}
                className='p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700'
              >
                <X className='h-5 w-5 text-slate-500' />
              </button>
            </div>
            <form onSubmit={updateProduct} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Product Name</label>
                  <input
                    type='text'
                    name='name'
                    defaultValue={editDraft.name}
                    required
                    className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>All Categories</label>
                  <CategoryTreeSelect
                    value={editTaxonomy || { mainCategory: 'fashion', section: 'men', categorySlug: 'clothing' }}
                    onChange={(next) => {
                      if (!next?.mainCategory || !next?.section || !next?.categorySlug) return
                      const labels = getLabels(next.mainCategory, next.section, next.categorySlug)
                      setEditTaxonomy({ mainCategory: next.mainCategory, section: next.section, categorySlug: next.categorySlug })
                      const catLabel = mainLabelForSellerCategory(next.mainCategory)
                      const subLabel = labels.categoryLabel || ''
                      setEditCategory(catLabel)
                      setEditSubCategory(subLabel)
                      if (next.mainCategory === 'fashion') {
                        const gender = labels.sectionLabel || 'Men'
                        setEditGender(gender)
                        const nextProductType = (fashionProductTypeOptions[subLabel] || [])[0] || 'Topwear'
                        setEditProductType(nextProductType)
                      }
                    }}
                    allowClear={false}
                    placeholder='Pick a category'
                    maxPanelHeightClass='max-h-[460px]'
                  />
                  <input type='hidden' name='category' value={editCategory} />
                  <input type='hidden' name='subCategory' value={editSubCategory} />
                  <input type='hidden' name='mainCategory' value={editTaxonomy?.mainCategory || ''} />
                  <input type='hidden' name='section' value={editTaxonomy?.section || ''} />
                  <input type='hidden' name='categorySlug' value={editTaxonomy?.categorySlug || ''} />
                  <input
                    type='hidden'
                    name='sectionLabel'
                    value={getLabels(editTaxonomy?.mainCategory, editTaxonomy?.section, editTaxonomy?.categorySlug)?.sectionLabel || ''}
                  />
                  <input
                    type='hidden'
                    name='categoryLabel'
                    value={getLabels(editTaxonomy?.mainCategory, editTaxonomy?.section, editTaxonomy?.categorySlug)?.categoryLabel || ''}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Price</label>
                  <input
                    type='number'
                    name='price'
                    defaultValue={editDraft.price}
                    required
                    className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Stock Quantity</label>
                  <input
                    type='number'
                    name='stockQuantity'
                    defaultValue={editDraft.stockQuantity}
                    required
                    className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                  />
                </div>
                
              </div>

              {editTaxonomy?.mainCategory === 'fashion' && (
                <div className='rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur px-4 py-3'>
                  <p className='text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400'>Fashion Segment</p>
                  <div className='mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700 dark:text-slate-200'>
                    <span className='font-semibold'>Gender:</span>{' '}
                    <span>{getLabels(editTaxonomy?.mainCategory, editTaxonomy?.section, editTaxonomy?.categorySlug)?.sectionLabel || 'Men'}</span>
                    <span className='font-semibold'>Category:</span> <span>{editSubCategory || 'Clothing'}</span>
                  </div>
                </div>
              )}
              {editTaxonomy?.mainCategory === 'fashion' && ['Clothing', 'Ethnic Wear', 'Western Wear'].includes(editSubCategory) && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Product Type</label>
                    <select
                      value={editProductType}
                      onChange={(e) => setEditProductType(e.target.value)}
                      className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                    >
                      {(fashionProductTypeOptions[editSubCategory] || []).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Collection Type</label>
                  <div className='flex flex-wrap gap-2'>
                    {['New Arrivals', 'Trending', 'Best Seller', 'Discount Deals', 'Featured', 'Recommended'].map((c) => {
                      const active = editCollectionType.includes(c)
                      return (
                        <button
                          key={c}
                          type='button'
                          onClick={() =>
                            setEditCollectionType((prev) =>
                              prev.includes(c) ? prev.filter((v) => v !== c) : [...prev, c]
                            )
                          }
                          className={`px-4 py-2 rounded-full text-[11px] font-black tracking-widest uppercase transition-all ${
                            active
                              ? 'text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 shadow-lg shadow-pink-600/20'
                              : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                          }`}
                        >
                          {c}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Colors (optional)</label>
                  <div className='flex flex-wrap gap-2'>
                    {[
                      { name: 'Black', hex: '#000000' },
                      { name: 'White', hex: '#FFFFFF' },
                      { name: 'Blue', hex: '#3B82F6' },
                      { name: 'Red', hex: '#EF4444' },
                      { name: 'Green', hex: '#10B981' },
                      { name: 'Beige', hex: '#E5D3B3' },
                      { name: 'Purple', hex: '#A855F7' },
                      { name: 'Pink', hex: '#EC4899' },
                      { name: 'Yellow', hex: '#FACC15' },
                      { name: 'Grey', hex: '#9CA3AF' },
                    ].map((c) => {
                      const active = editColors.includes(c.name)
                      return (
                        <button
                          key={c.name}
                          type='button'
                          onClick={() =>
                            setEditColors((prev) =>
                              prev.includes(c.name) ? prev.filter((v) => v !== c.name) : [...prev, c.name]
                            )
                          }
                          className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-black tracking-widest uppercase transition-all ${
                            active
                              ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/10 bg-white dark:bg-slate-700'
                              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`h-4 w-4 rounded-full border ${c.name === 'White' ? 'border-slate-300' : 'border-transparent'}`}
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className={active ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}>
                            {c.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <input
                type='hidden'
                name='attributes'
                value={JSON.stringify(
                  editCategory === 'Fashion'
                    ? { gender: editGender, fashionCategory: editSubCategory, productType: editProductType }
                    : {}
                )}
              />
              <input type='hidden' name='collectionType' value={JSON.stringify(editCollectionType || [])} />
              <input type='hidden' name='colors' value={JSON.stringify(editColors || [])} />
              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Description</label>
                <textarea
                  name='description'
                  rows={4}
                  defaultValue={editDraft.description}
                  className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Image URLs (comma separated)</label>
                <textarea
                  name='imageUrls'
                  rows={2}
                  defaultValue={editDraft.imageUrls}
                  className='w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white'
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Upload Image 1</label>
                  <input type='file' name='image1' accept='image/*' className='w-full' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Upload Image 2</label>
                  <input type='file' name='image2' accept='image/*' className='w-full' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Upload Image 3</label>
                  <input type='file' name='image3' accept='image/*' className='w-full' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Upload Image 4</label>
                  <input type='file' name='image4' accept='image/*' className='w-full' />
                </div>
              </div>
              <div className='flex justify-end gap-4'>
                <button
                  type='button'
                  onClick={closeEdit}
                  className='px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl'
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerDashboard
