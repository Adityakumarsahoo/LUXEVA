import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../ProductCard';

// Mock product data for demonstration
const mockProducts = [
  {
    id: 1,
    name: 'Premium Casual Shirt',
    category: 'clothing',
    price: 1299,
    originalPrice: 1999,
    discount: 35,
    rating: 4.2,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop',
    colors: ['blue', 'white', 'black'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    isNew: true,
    isTrending: true
  },
  {
    id: 2,
    name: 'Designer Sneakers',
    category: 'footwear',
    price: 3499,
    originalPrice: 4999,
    discount: 30,
    rating: 4.5,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
    colors: ['white', 'black', 'red'],
    sizes: ['7', '8', '9', '10'],
    inStock: true,
    isNew: false,
    isTrending: true
  },
  {
    id: 3,
    name: 'Leather Handbag',
    category: 'accessories',
    price: 4599,
    originalPrice: 6999,
    discount: 34,
    rating: 4.3,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
    colors: ['brown', 'black'],
    sizes: ['One Size'],
    inStock: true,
    isNew: true,
    isTrending: false
  },
  {
    id: 4,
    name: 'Wireless Headphones',
    category: 'electronics',
    price: 5999,
    originalPrice: 8999,
    discount: 33,
    rating: 4.7,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop',
    colors: ['black', 'white', 'blue'],
    sizes: ['One Size'],
    inStock: true,
    isNew: false,
    isTrending: true
  },
  {
    id: 5,
    name: 'Fitness Tracker',
    category: 'electronics',
    price: 2999,
    originalPrice: 4999,
    discount: 40,
    rating: 4.1,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
    colors: ['black', 'pink', 'blue'],
    sizes: ['S', 'M', 'L'],
    inStock: true,
    isNew: true,
    isTrending: false
  },
  {
    id: 6,
    name: 'Cotton T-Shirt',
    category: 'clothing',
    price: 799,
    originalPrice: 1299,
    discount: 38,
    rating: 4.0,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    colors: ['white', 'gray', 'navy'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    isNew: false,
    isTrending: true
  },
  {
    id: 7,
    name: 'Running Shoes',
    category: 'footwear',
    price: 4299,
    originalPrice: 5999,
    discount: 28,
    rating: 4.6,
    reviews: 143,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=500&fit=crop',
    colors: ['blue', 'black', 'red'],
    sizes: ['7', '8', '9', '10', '11'],
    inStock: true,
    isNew: true,
    isTrending: true
  },
  {
    id: 8,
    name: 'Sunglasses',
    category: 'accessories',
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    rating: 4.4,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop',
    colors: ['black', 'brown', 'gold'],
    sizes: ['One Size'],
    inStock: true,
    isNew: false,
    isTrending: false
  },
  {
    id: 9,
    name: 'Smart Watch',
    category: 'electronics',
    price: 8999,
    originalPrice: 12999,
    discount: 31,
    rating: 4.8,
    reviews: 421,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=500&fit=crop',
    colors: ['black', 'silver', 'gold'],
    sizes: ['S', 'M', 'L'],
    inStock: true,
    isNew: true,
    isTrending: true
  },
  {
    id: 10,
    name: 'Denim Jacket',
    category: 'clothing',
    price: 3299,
    originalPrice: 4999,
    discount: 34,
    rating: 4.3,
    reviews: 96,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    colors: ['blue', 'black'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    isNew: true,
    isTrending: false
  },
  {
    id: 11,
    name: 'Formal Shoes',
    category: 'footwear',
    price: 2799,
    originalPrice: 3999,
    discount: 30,
    rating: 4.2,
    reviews: 54,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=500&fit=crop',
    colors: ['black', 'brown'],
    sizes: ['7', '8', '9', '10'],
    inStock: true,
    isNew: false,
    isTrending: true
  },
  {
    id: 12,
    name: 'Backpack',
    category: 'accessories',
    price: 1899,
    originalPrice: 2999,
    discount: 37,
    rating: 4.5,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
    colors: ['black', 'gray', 'blue'],
    sizes: ['One Size'],
    inStock: true,
    isNew: true,
    isTrending: true
  }
];

const ProductGrid = ({ category }) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'masonry'
  const [sortBy, setSortBy] = useState('popularity');

  // Filter products by category
  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      let filtered = [...mockProducts];
      
      // Filter by category if specified
      if (category && category !== 'all') {
        filtered = filtered.filter(product => 
          product.category?.toLowerCase().includes(category.toLowerCase()) ||
          product.name?.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-high':
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.id || 0) - new Date(a.id || 0));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'popularity':
        default:
          // Default sorting - keep as is or sort by reviews
          filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
          break;
      }
      
      // Limit to 12 products for demo
      setFilteredProducts(filtered.slice(0, 12));
      setLoading(false);
    }, 600);
  }, [category, sortBy]);

  // Skeleton loading
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Sorting Controls Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="bg-gray-200 rounded-2xl h-64"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sorting and View Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredProducts.length} Products in {category || 'All Categories'}
          </h3>
          <p className="text-sm text-gray-600">Premium quality, curated just for you</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer shadow-sm"
            >
              <option value="popularity">Sort by: Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                </svg>
                Grid
              </div>
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'masonry' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13zM1.5 1a.5.5 0 0 0-.5.5V5h4V1H1.5zM5 6H1v4h4V6zm1 4h4V6H6v4zm-1 1H1v3.5a.5.5 0 0 0 .5.5H5v-4zm1 0v4h4v-4H6zm5 0v4h3.5a.5.5 0 0 0 .5-.5V11h-4zm0-1h4V6h-4v4zm0-5h4V1.5a.5.5 0 0 0-.5-.5H11v4zm-1 0V1H6v4h4z"/>
                </svg>
                Masonry
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={viewMode === 'masonry' 
            ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          }
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={viewMode === 'masonry' ? "break-inside-avoid mb-6" : ""}
            >
              <ProductCard product={product} theme="modern" />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any products matching your criteria. Try adjusting your filters or browse other categories.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300">
              Browse All Categories
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;