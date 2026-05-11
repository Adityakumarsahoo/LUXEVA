import { createContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { normalizeProductImages } from "../utils/defaultProducts";
import { formatINR } from "../utils/money";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '₹';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState(() => {
        try {
            const raw = localStorage.getItem('guestCart')
            const parsed = raw ? JSON.parse(raw) : {}
            return parsed && typeof parsed === 'object' ? parsed : {}
        } catch {
            return {}
        }
    });
    const [products, setProducts] = useState([]);
    const [productsRevision, setProductsRevision] = useState(0)
    const [token, setToken] = useState('')
    const [userProfile, setUserProfile] = useState(null)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [wishlistIds, setWishlistIds] = useState(() => {
        try {
            const raw = localStorage.getItem('wishlistIds')
            const parsed = raw ? JSON.parse(raw) : []
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    })
    const navigate = useNavigate();

    const openCollectionSearch = (query, filters = {}) => {
        const value = (query || '').trim()
        setSearch(value)
        setShowSearch(true)
        
        // Navigate with state for specific filters
        navigate('/collection', { state: { filters: { ...(filters || {}), search: value } } })
        scrollTo(0, 0)
    }

    const openForYou = () => {
        setSearch('')
        setShowSearch(false)
        navigate('/for-you')
        scrollTo(0, 0)
    }

    const openFashion = () => {
        setSearch('')
        setShowSearch(false)
        navigate('/fashion')
        scrollTo(0, 0)
    }

    const openMobiles = () => {
        setSearch('')
        setShowSearch(false)
        navigate('/mobiles')
        scrollTo(0, 0)
    }

    const openBeauty = () => {
        setSearch('')
        setShowSearch(false)
        navigate('/beauty')
        scrollTo(0, 0)
    }

    const openElectronics = () => {
        setSearch('')
        setShowSearch(false)
        navigate('/electronics')
        scrollTo(0, 0)
    }

    const openCategory = (categorySlug) => {
        const slug = String(categorySlug || '').trim()
        if (!slug) return
        setSearch('')
        setShowSearch(false)
        navigate(`/category/${slug}`)
        scrollTo(0, 0)
    }

    const openHomeDecor = () => {
        setSearch('')
        setShowSearch(false)
        navigate('/home')
        scrollTo(0, 0)
    }


    const addToCart = async (itemId, size) => {

        if (!size) {
            toast.error('Select Product Size');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {

                await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } })

            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }

    }

    const addToCartAuto = async (itemId) => {
        const product = products.find((p) => p._id === itemId)
        const size = product?.sizes?.[0] || 'M'
        return addToCart(itemId, size)
    }

    const formatPrice = (amount) => formatINR(amount)

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {

        let cartData = structuredClone(cartItems);

        cartData[itemId][size] = quantity;

        setCartItems(cartData)

        if (token) {
            try {

                await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } })

            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }

    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        setLoadingProducts(true)
        try {

            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                const apiProducts = Array.isArray(response.data.products) ? response.data.products : []
                setProducts(apiProducts.reverse().map(normalizeProductImages))
            } else {
                setProducts([])
            }

        } catch (error) {
            setProducts([])
        } finally {
            setLoadingProducts(false)
        }
    }

    const refreshProducts = async () => {
        await getProductsData()
        setProductsRevision((v) => v + 1)
    }

    const getUserCart = async ( token ) => {
        try {
            
            const response = await axios.post(backendUrl + '/api/cart/get',{},{headers:{token}})
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getUserProfile = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } })
            if (response.data.success) {
                setUserProfile(response.data.user)
            } else {
                setUserProfile(null)
            }
        } catch (error) {
            setUserProfile(null)
        }
    }

    useEffect(() => {
        getProductsData()
    }, [])

    useEffect(() => {
        if (!token) {
            localStorage.setItem('guestCart', JSON.stringify(cartItems))
        }
    }, [cartItems, token])

    useEffect(() => {
        localStorage.setItem('wishlistIds', JSON.stringify(wishlistIds))
    }, [wishlistIds])

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
            getUserProfile(localStorage.getItem('token'))
        }
        if (token) {
            getUserCart(token)
            getUserProfile(token)
        } else {
            setUserProfile(null)
        }
    }, [token])

    const toggleWishlist = (productId) => {
        setWishlistIds((prev) => {
            if (prev.includes(productId)) return prev.filter((id) => id !== productId)
            return [productId, ...prev]
        })
    }

    const isWishlisted = (productId) => wishlistIds.includes(productId)

    const logout = () => {
        setToken('')
        setUserProfile(null)
        setCartItems({})
        localStorage.removeItem('token')
        navigate('/')
    }

    const value = {
        products, currency, delivery_fee,
        productsRevision,
        formatPrice,
        openCollectionSearch,
        openForYou,
        openFashion,
        openMobiles,
        openBeauty,
        openElectronics,
        openCategory,
        openHomeDecor,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, addToCartAuto, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token,
        loadingProducts,
        wishlistIds, toggleWishlist, isWishlisted,
        userProfile, setUserProfile,
        showAuthModal, setShowAuthModal,
        refreshProducts,
        logout
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;
