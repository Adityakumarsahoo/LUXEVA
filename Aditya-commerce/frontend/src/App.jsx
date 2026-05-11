import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import ForYou from './pages/ForYou'
import Fashion from './pages/Fashion'
import Mobiles from './pages/Mobiles'
import Beauty from './pages/Beauty'
import Electronics from './pages/Electronics'
import HomeDecor from './pages/HomeDecor'
import CategoryPage from './pages/categories/CategoryPage'
import SellerDashboard from './pages/SellerDashboard'
import DeliveryDashboard from './pages/DeliveryDashboard'
import WarehouseDashboard from './pages/WarehouseDashboard'
import SupportDashboard from './pages/SupportDashboard'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import InfoPage from './pages/InfoPage'
import Careers from './pages/Careers'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import AdminApp from './admin/AdminApp'
import AuthModal from './components/AuthModal'
import Profile from './pages/Profile'
import { ShopContext } from './context/ShopContext'
import { useContext } from 'react'
import { AnimatePresence } from 'framer-motion'
import PremiumDetail from './pages/PremiumDetail'
import ShopLanding from './pages/ShopLanding'
import CategoryListing from './pages/CategoryListing'

const App = () => {
  const location = useLocation()
  const { showAuthModal } = useContext(ShopContext)
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isDashboardRoute = ['/profile', '/orders', '/seller', '/delivery', '/warehouse', '/support'].some(
    (base) => location.pathname === base || location.pathname.startsWith(`${base}/`)
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className={`min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 ${showAuthModal ? 'overflow-hidden h-screen' : ''}`}>
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <AnimatePresence>
        {showAuthModal && <AuthModal />}
      </AnimatePresence>
      
      {isAdminRoute ? (
        <Routes>
          <Route path='/admin/*' element={<AdminApp />} />
        </Routes>
      ) : (
        <div className={`transition-all duration-700 ease-[0.22, 1, 0.36, 1] ${showAuthModal ? 'opacity-0 scale-[0.98] blur-xl pointer-events-none' : 'opacity-100 scale-100 blur-0'}`}>
          
          {!isDashboardRoute && <Navbar />}

          <main className={`mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 ${isDashboardRoute ? 'pt-10' : 'pt-32'}`}>
            <SearchBar />
            
            <div className='flex flex-col lg:flex-row gap-12'>
              {/* Main Content Area */}
              <div className='flex-1 min-w-0'>
                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/for-you' element={<ForYou />} />
                  <Route path='/fashion' element={<Fashion />} />
                  <Route path='/fashion/:fashionSlug' element={<Fashion />} />
                  <Route path='/mobiles' element={<Mobiles />} />
                  <Route path='/beauty' element={<Beauty />} />
                  <Route path='/electronics' element={<Electronics />} />
                  <Route path='/home' element={<HomeDecor />} />
                  <Route path='/premium/:slug' element={<PremiumDetail />} />
                  <Route path='/shop/:slug' element={<ShopLanding />} />
                  <Route path='/electronics/:subSlug' element={<CategoryListing />} />
                  <Route path='/home-kitchen/:subSlug' element={<CategoryListing />} />
                  <Route path='/mobiles/:subSlug' element={<CategoryListing />} />
                  <Route path='/beauty/:subSlug' element={<CategoryListing />} />
                  <Route path='/sports/:subSlug' element={<CategoryListing />} />
                  <Route path='/toys/:subSlug' element={<CategoryListing />} />
                  <Route path='/grocery/:subSlug' element={<CategoryListing />} />
                  <Route path='/lifestyle/:subSlug' element={<CategoryListing />} />
                  <Route path='/category/:categoryName' element={<CategoryPage />} />
                  <Route path='/seller' element={<SellerDashboard />} />
                  <Route path='/delivery' element={<DeliveryDashboard />} />
                  <Route path='/warehouse' element={<WarehouseDashboard />} />
                  <Route path='/support' element={<SupportDashboard />} />
                  <Route path='/collection' element={<Collection />} />
                  <Route
                    path='/clothes'
                    element={
                      <Collection
                        preset={{
                          title: 'Clothing',
                          eyebrow: 'Clothing',
                          countLabel: 'Clothing Products Found',
                          filters: {
                            category: ['Men', 'Women', 'Kids'],
                            excludeSubCategory: ['Footwear', 'Accessories', 'Beauty', 'Baby Care'],
                          },
                        }}
                      />
                    }
                  />
                  <Route path='/about' element={<About />} />
                  <Route path='/contact' element={<Contact />} />
                  <Route path='/careers' element={<Careers />} />
                  <Route path='/blog' element={<Blog />} />
                  <Route path='/blog/:slug' element={<BlogPost />} />
                  <Route path='/privacy-policy' element={<InfoPage slug='privacy-policy' />} />
                  <Route path='/help-center' element={<InfoPage slug='help-center' />} />
                  <Route path='/returns-exchanges' element={<InfoPage slug='returns-exchanges' />} />
                  <Route path='/shipping-info' element={<InfoPage slug='shipping-info' />} />
                  <Route path='/size-guide' element={<InfoPage slug='size-guide' />} />
                  <Route path='/new-arrivals' element={<InfoPage slug='new-arrivals' />} />
                  <Route path='/product/:productId' element={<Product />} />
                  <Route path='/cart' element={<Cart />} />
                  <Route path='/login' element={<Login />} />
                  <Route path='/profile' element={<Profile />} />
                  <Route path='/place-order' element={<PlaceOrder />} />
                  <Route path='/orders' element={<Orders />} />
                  <Route path='/orders/:orderId' element={<Orders />} />
                  <Route path='/verify' element={<Verify />} />
                </Routes>
              </div>
            </div>
            
            <Footer />
          </main>
        </div>
      )}
    </div>
  )
}

export default App
