import React, { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Package,
  Heart,
  ShoppingCart,
  MapPin,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Edit2,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Home,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCcw,
} from 'lucide-react'
import { ShopContext } from '../context/ShopContext'
import ProductItem from '../components/ProductItem'

const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const Profile = () => {
  const {
    userProfile,
    logout,
    navigate,
    getCartCount,
    getCartAmount,
    wishlistIds,
    products,
    backendUrl,
    token,
    formatPrice,
    openCollectionSearch,
  } = useContext(ShopContext)

  const storageKey = useMemo(() => {
    const id = userProfile?._id || userProfile?.email || 'guest'
    return `profilePrefs:${id}`
  }, [userProfile])

  const [activeTab, setActiveTab] = useState('overview')
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [orders, setOrders] = useState([])

  const [addresses, setAddresses] = useState([])
  const [addressDraft, setAddressDraft] = useState({
    name: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
    label: 'Home',
  })

  const [prefs, setPrefs] = useState({
    notifications: { orderUpdates: true, promotions: false, sms: false },
    payments: { defaultMethod: 'Razorpay' },
  })

  useEffect(() => {
    if (!userProfile) navigate('/login')
  }, [userProfile, navigate])

  useEffect(() => {
    if (!userProfile) return
    const raw = localStorage.getItem(storageKey)
    const next = safeParse(raw, null)
    if (next?.addresses) setAddresses(Array.isArray(next.addresses) ? next.addresses : [])
    if (next?.prefs) setPrefs(next.prefs)
  }, [storageKey, userProfile])

  useEffect(() => {
    if (!userProfile) return
    localStorage.setItem(storageKey, JSON.stringify({ addresses, prefs }))
  }, [addresses, prefs, storageKey, userProfile])

  const loadOrders = async () => {
    if (!token) return
    setOrdersLoading(true)
    try {
      const response = await axios.post(`${backendUrl}/api/order/userorders`, {}, { headers: { token } })
      if (response.data?.success) {
        const list = Array.isArray(response.data.orders) ? response.data.orders : []
        setOrders(list.slice().reverse())
      }
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (token) loadOrders()
    else setOrders([])
  }, [token])

  const wishlistProducts = useMemo(() => {
    const set = new Set(wishlistIds || [])
    return (products || []).filter((p) => set.has(p?._id))
  }, [products, wishlistIds])

  const memberSince = useMemo(() => {
    if (!userProfile?.createdAt) return '—'
    try {
      return new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } catch {
      return '—'
    }
  }, [userProfile])

  if (!userProfile) return null

  const stats = [
    { label: 'Orders', value: orders.length, icon: Package, bg: 'bg-sky-50', fg: 'text-sky-700' },
    { label: 'Wishlist', value: wishlistIds?.length || 0, icon: Heart, bg: 'bg-rose-50', fg: 'text-rose-600' },
    { label: 'Cart Items', value: getCartCount(), icon: ShoppingCart, bg: 'bg-amber-50', fg: 'text-amber-700' },
    { label: 'Cart Value', value: formatPrice(getCartAmount()), icon: CreditCard, bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  ]

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: User, action: () => setActiveTab('overview') },
    { id: 'orders', label: 'My Orders', icon: Package, action: () => setActiveTab('orders') },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, action: () => setActiveTab('wishlist') },
    { id: 'cart', label: 'My Cart', icon: ShoppingCart, action: () => setActiveTab('cart') },
    { id: 'addresses', label: 'Addresses', icon: MapPin, action: () => setActiveTab('addresses') },
    { id: 'notifications', label: 'Notifications', icon: Bell, action: () => setActiveTab('notifications') },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard, action: () => setActiveTab('payments') },
    { id: 'settings', label: 'Account Settings', icon: Settings, action: () => setActiveTab('settings') },
  ]

  const Panel = ({ id, children }) => (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"
    >
      {children}
    </motion.div>
  )

  const addAddress = () => {
    const next = {
      id: `addr_${Date.now()}`,
      ...addressDraft,
    }
    if (!next.name || !next.phone || !next.line1 || !next.city || !next.state || !next.pincode) return
    setAddresses((prev) => [next, ...prev])
    setAddressDraft({ name: '', phone: '', line1: '', city: '', state: '', pincode: '', label: 'Home' })
  }

  const removeAddress = (id) => setAddresses((prev) => prev.filter((a) => a.id !== id))

  const togglePref = (key) =>
    setPrefs((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }))

  const setPayment = (method) =>
    setPrefs((prev) => ({
      ...prev,
      payments: { ...prev.payments, defaultMethod: method },
    }))

  const recentOrders = orders.slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="mb-8 rounded-[3rem] border border-sky-100 bg-white shadow-sm overflow-hidden">
        <div className="relative px-8 py-10 sm:px-12">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]" />
          <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]" />
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase">User Dashboard</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase truncate">
                {userProfile?.name || 'Account'}
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-500 truncate">{userProfile?.email}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="h-12 px-5 rounded-2xl bg-white border border-sky-100 text-sky-700 font-black text-[11px] tracking-widest uppercase hover:bg-sky-50 transition-all active:scale-[0.98] flex items-center gap-2"
              >
                <Home className="w-4 h-4" /> Home
              </button>
              <button
                type="button"
                onClick={() => openCollectionSearch('')}
                className="h-12 px-6 rounded-2xl bg-sky-600 text-white font-black text-[11px] tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20 flex items-center gap-2"
              >
                Shop <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="lg:sticky lg:top-10 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center overflow-hidden">
                    {userProfile?.profileImage ? (
                      <img src={userProfile.profileImage} alt={userProfile?.name || 'Profile'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-sky-600" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="absolute -bottom-2 -right-2 h-9 w-9 rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95 flex items-center justify-center"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{userProfile?.name}</p>
                  <p className="text-[11px] font-bold text-slate-500 truncate">{userProfile?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-1">
                {menuItems.map((item) => {
                  const active = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.action}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all active:scale-[0.99] ${
                        active ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} />
                        <span className="text-[11px] font-black tracking-widest uppercase">{item.label}</span>
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'text-white/80' : 'text-slate-300'} ${active ? 'translate-x-0.5' : ''}`} />
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={logout}
                  className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 transition-all active:scale-[0.99]"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[11px] font-black tracking-widest uppercase">Logout</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Membership</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-black text-slate-900">Member Since</p>
                <p className="text-sm font-bold text-slate-600">{memberSince}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-black text-slate-900">Role</p>
                <p className="text-sm font-bold text-slate-600 uppercase">{userProfile?.role || 'customer'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.button
                type="button"
                onClick={() => {
                  if (stat.label === 'Orders') setActiveTab('orders')
                  else if (stat.label === 'Wishlist') setActiveTab('wishlist')
                  else if (stat.label === 'Cart Items' || stat.label === 'Cart Value') setActiveTab('cart')
                }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                key={stat.label}
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-4 text-left hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.fg}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900 truncate">{stat.value}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <Panel id="overview">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Account Overview</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tighter text-slate-900">Your Activity</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Quick insights and shortcuts to manage your account.</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadOrders}
                    className="h-11 px-4 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 font-black text-[10px] tracking-widest uppercase hover:bg-sky-100 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <RefreshCcw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Profile</p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Full Name</p>
                        <p className="mt-1 font-bold text-slate-900">{userProfile?.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Email</p>
                        <p className="mt-1 font-bold text-slate-900 break-all">{userProfile?.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Phone</p>
                        <p className="mt-1 font-bold text-slate-900">{userProfile?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Member Since</p>
                        <p className="mt-1 font-bold text-slate-900">{memberSince}</p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-white border border-sky-100 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">Account Security</p>
                          <p className="text-[11px] font-bold text-slate-500">Protected with secure authentication.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className="h-11 px-4 rounded-2xl bg-white border border-sky-200 text-sky-700 font-black text-[10px] tracking-widest uppercase hover:bg-sky-100 transition-all active:scale-95"
                      >
                        Settings
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Recent Orders</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="text-[10px] font-black tracking-widest text-sky-700 uppercase hover:text-sky-600 transition-colors"
                      >
                        View
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {ordersLoading ? (
                        <div className="text-sm font-bold text-slate-400">Loading orders…</div>
                      ) : recentOrders.length === 0 ? (
                        <div className="rounded-2xl border border-slate-100 p-5">
                          <p className="text-sm font-bold text-slate-700">No orders yet</p>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">Start shopping to see your orders here.</p>
                          <button
                            type="button"
                            onClick={() => openCollectionSearch('')}
                            className="mt-4 h-11 px-4 rounded-2xl bg-sky-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-95"
                          >
                            Browse Products
                          </button>
                        </div>
                      ) : (
                        recentOrders.map((order) => (
                          <button
                            type="button"
                            key={order?._id}
                            onClick={() => navigate('/orders')}
                            className="w-full text-left rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all active:scale-[0.99]"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-black text-slate-900">Order #{String(order?._id || '').slice(-6).toUpperCase()}</p>
                              <span className="text-[10px] font-black tracking-widest uppercase text-sky-700 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full">
                                {order?.status || '—'}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-4">
                              <p className="text-[11px] font-bold text-slate-500">
                                {order?.date ? new Date(order.date).toDateString() : '—'}
                              </p>
                              <p className="text-[11px] font-black text-slate-900">{formatPrice(order?.amount || 0)}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {activeTab === 'orders' && (
              <Panel id="orders">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Orders</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tighter text-slate-900">Order History</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Track shipments, payments, and refunds.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={loadOrders}
                      className="h-11 px-4 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 font-black text-[10px] tracking-widest uppercase hover:bg-sky-100 transition-all active:scale-95"
                    >
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/orders')}
                      className="h-11 px-4 rounded-2xl bg-sky-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-95 shadow-lg shadow-sky-600/20"
                    >
                      Open Orders
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {ordersLoading ? (
                    <div className="text-sm font-bold text-slate-400">Loading orders…</div>
                  ) : orders.length === 0 ? (
                    <div className="rounded-[2rem] border border-slate-100 p-6">
                      <p className="text-sm font-black text-slate-900">No orders found</p>
                      <p className="mt-2 text-[11px] font-semibold text-slate-500">When you place an order, it will appear here.</p>
                    </div>
                  ) : (
                    orders.slice(0, 8).map((order) => (
                      <div key={order?._id} className="rounded-[2rem] border border-slate-100 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-900">Order #{String(order?._id || '').slice(-6).toUpperCase()}</p>
                            <p className="mt-1 text-[11px] font-bold text-slate-500">
                              Date: {order?.date ? new Date(order.date).toDateString() : '—'}
                            </p>
                            <p className="mt-1 text-[11px] font-bold text-slate-500">Payment: {order?.paymentMethod || '—'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-sky-500" />
                            <span className="text-[11px] font-black tracking-widest uppercase text-sky-700">{order?.status || '—'}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-[11px] font-bold text-slate-500">Total</p>
                          <p className="text-sm font-black text-slate-900">{formatPrice(order?.amount || 0)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            )}

            {activeTab === 'wishlist' && (
              <Panel id="wishlist">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Wishlist</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tighter text-slate-900">Saved Items</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Quickly access products you love.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCollectionSearch('')}
                    className="h-11 px-4 rounded-2xl bg-sky-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-95 shadow-lg shadow-sky-600/20"
                  >
                    Browse
                  </button>
                </div>

                <div className="mt-6">
                  {wishlistProducts.length === 0 ? (
                    <div className="rounded-[2rem] border border-slate-100 p-6">
                      <p className="text-sm font-black text-slate-900">No saved items</p>
                      <p className="mt-2 text-[11px] font-semibold text-slate-500">Tap the heart icon on any product to save it here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                      {wishlistProducts.slice(0, 10).map((p) => (
                        <ProductItem key={p._id} product={p} />
                      ))}
                    </div>
                  )}
                </div>
              </Panel>
            )}

            {activeTab === 'cart' && (
              <Panel id="cart">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Cart</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tighter text-slate-900">Checkout Summary</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Review totals and continue to checkout.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="h-11 px-4 rounded-2xl bg-sky-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-95 shadow-lg shadow-sky-600/20"
                  >
                    Open Cart
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-[2rem] border border-slate-100 p-6">
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Items</p>
                    <p className="mt-2 text-4xl font-black tracking-tighter text-slate-900">{getCartCount()}</p>
                    <p className="mt-2 text-[11px] font-semibold text-slate-500">Items currently in your cart.</p>
                    <button
                      type="button"
                      onClick={() => openCollectionSearch('')}
                      className="mt-6 h-11 w-full rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 font-black text-[10px] tracking-widest uppercase hover:bg-sky-100 transition-all active:scale-95"
                    >
                      Continue Shopping
                    </button>
                  </div>

                  <div className="rounded-[2rem] border border-slate-100 p-6">
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total</p>
                    <p className="mt-2 text-4xl font-black tracking-tighter text-slate-900">{formatPrice(getCartAmount())}</p>
                    <p className="mt-2 text-[11px] font-semibold text-slate-500">Taxes and delivery calculated at checkout.</p>
                    <button
                      type="button"
                      onClick={() => navigate('/place-order')}
                      className="mt-6 h-11 w-full rounded-2xl bg-sky-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-95 shadow-lg shadow-sky-600/20"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </Panel>
            )}

            {activeTab === 'addresses' && (
              <Panel id="addresses">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Addresses</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tighter text-slate-900">Delivery Addresses</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Manage saved addresses for faster checkout.</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-[2rem] border border-slate-100 p-6">
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Add New</p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={addressDraft.label}
                        onChange={(e) => setAddressDraft((p) => ({ ...p, label: e.target.value }))}
                        className="floating-input"
                        placeholder="Label (Home/Work)"
                      />
                      <input
                        value={addressDraft.phone}
                        onChange={(e) => setAddressDraft((p) => ({ ...p, phone: e.target.value }))}
                        className="floating-input"
                        placeholder="Phone"
                      />
                      <input
                        value={addressDraft.name}
                        onChange={(e) => setAddressDraft((p) => ({ ...p, name: e.target.value }))}
                        className="floating-input sm:col-span-2"
                        placeholder="Full name"
                      />
                      <input
                        value={addressDraft.line1}
                        onChange={(e) => setAddressDraft((p) => ({ ...p, line1: e.target.value }))}
                        className="floating-input sm:col-span-2"
                        placeholder="Address line"
                      />
                      <input
                        value={addressDraft.city}
                        onChange={(e) => setAddressDraft((p) => ({ ...p, city: e.target.value }))}
                        className="floating-input"
                        placeholder="City"
                      />
                      <input
                        value={addressDraft.state}
                        onChange={(e) => setAddressDraft((p) => ({ ...p, state: e.target.value }))}
                        className="floating-input"
                        placeholder="State"
                      />
                      <input
                        value={addressDraft.pincode}
                        onChange={(e) => setAddressDraft((p) => ({ ...p, pincode: e.target.value }))}
                        className="floating-input sm:col-span-2"
                        placeholder="Pincode"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addAddress}
                      className="mt-4 h-11 w-full rounded-2xl bg-sky-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-95 shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Save Address
                    </button>
                  </div>

                  <div className="rounded-[2rem] border border-slate-100 p-6">
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Saved</p>
                    <div className="mt-4 space-y-3">
                      {addresses.length === 0 ? (
                        <div className="rounded-2xl border border-slate-100 p-5">
                          <p className="text-sm font-black text-slate-900">No addresses saved</p>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">Add one address to speed up checkout.</p>
                        </div>
                      ) : (
                        addresses.map((a) => (
                          <div key={a.id} className="rounded-2xl border border-slate-100 p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-black text-slate-900">{a.label}</p>
                                <p className="mt-1 text-[11px] font-bold text-slate-600">{a.name} • {a.phone}</p>
                                <p className="mt-2 text-[11px] font-semibold text-slate-500">
                                  {a.line1}, {a.city}, {a.state} - {a.pincode}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAddress(a.id)}
                                className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-all active:scale-95"
                                aria-label="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {activeTab === 'notifications' && (
              <Panel id="notifications">
                <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Notifications</p>
                <h2 className="mt-2 text-2xl font-black tracking-tighter text-slate-900">Preferences</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">Control how you receive updates.</p>

                <div className="mt-6 space-y-3">
                  {[
                    { key: 'orderUpdates', title: 'Order Updates', desc: 'Delivery, refund, and status notifications.' },
                    { key: 'promotions', title: 'Promotions', desc: 'Exclusive deals and new arrivals.' },
                    { key: 'sms', title: 'SMS Alerts', desc: 'Text message notifications.' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => togglePref(item.key)}
                      className="w-full rounded-[2rem] border border-slate-100 p-6 text-left hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-between gap-6"
                    >
                      <div>
                        <p className="text-sm font-black text-slate-900">{item.title}</p>
                        <p className="mt-1 text-[11px] font-semibold text-slate-500">{item.desc}</p>
                      </div>
                      <div
                        className={`h-10 w-10 rounded-2xl flex items-center justify-center border ${
                          prefs.notifications[item.key] ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>
            )}

            {activeTab === 'payments' && (
              <Panel id="payments">
                <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Payments</p>
                <h2 className="mt-2 text-2xl font-black tracking-tighter text-slate-900">Payment Methods</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">Choose your preferred payment method.</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Razorpay', 'Stripe', 'COD'].map((m) => {
                    const active = prefs.payments.defaultMethod === m
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPayment(m)}
                        className={`rounded-[2rem] border p-6 text-left transition-all active:scale-[0.99] ${
                          active ? 'bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-600/20' : 'bg-white border-slate-100 hover:shadow-md'
                        }`}
                      >
                        <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-80">Default</p>
                        <p className="mt-3 text-xl font-black tracking-tight">{m}</p>
                        <p className={`mt-2 text-[11px] font-semibold ${active ? 'text-white/80' : 'text-slate-500'}`}>
                          {m === 'COD' ? 'Cash on Delivery' : 'Secure online payment'}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </Panel>
            )}

            {activeTab === 'settings' && (
              <Panel id="settings">
                <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Settings</p>
                <h2 className="mt-2 text-2xl font-black tracking-tighter text-slate-900">Account Settings</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">Manage account preferences and security.</p>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-[2rem] border border-slate-100 p-6">
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Security</p>
                    <p className="mt-3 text-sm font-black text-slate-900">Session is secured</p>
                    <p className="mt-2 text-[11px] font-semibold text-slate-500">For password reset, use “Forgot password” from login.</p>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="mt-4 h-11 w-full rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 font-black text-[10px] tracking-widest uppercase hover:bg-sky-100 transition-all active:scale-95"
                    >
                      Open Login
                    </button>
                  </div>

                  <div className="rounded-[2rem] border border-slate-100 p-6">
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Actions</p>
                    <button
                      type="button"
                      onClick={logout}
                      className="mt-4 h-11 w-full rounded-2xl bg-rose-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-600/20"
                    >
                      Logout
                    </button>
                    <button
                      type="button"
                      onClick={() => openCollectionSearch('')}
                      className="mt-3 h-11 w-full rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all active:scale-95"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </Panel>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Profile
