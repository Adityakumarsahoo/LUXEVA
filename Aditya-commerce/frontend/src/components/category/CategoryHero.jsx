import React from 'react';
import { motion } from 'framer-motion';

const CategoryHero = ({ title, description, bannerImage, themeColor = '#3b82f6' }) => {
  // Default banner images based on category
  const getDefaultBanner = (categoryTitle) => {
    const category = categoryTitle?.toLowerCase() || '';
    if (category.includes('clothing') || category.includes('fashion')) {
      return 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop';
    } else if (category.includes('footwear') || category.includes('shoe')) {
      return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&auto=format&fit=crop';
    } else if (category.includes('accessories')) {
      return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&auto=format&fit=crop';
    } else if (category.includes('beauty')) {
      return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&auto=format&fit=crop';
    } else if (category.includes('baby') || category.includes('kids')) {
      return 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1600&auto=format&fit=crop';
    } else if (category.includes('ethnic')) {
      return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&auto=format&fit=crop';
    } else if (category.includes('western')) {
      return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop';
    } else {
      return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop';
    }
  };

  const banner = bannerImage || getDefaultBanner(title);

  return (
    <div className="relative overflow-hidden rounded-3xl mx-4 mt-4 lg:mx-8 lg:mt-8">
      {/* Background Image with Overlay */}
      <div className="relative h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden">
        <img
          src={banner}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        
        {/* Theme color accent */}
        <div
          className="absolute top-0 left-0 w-32 h-32 opacity-20 blur-3xl"
          style={{ backgroundColor: themeColor }}
        />
        
        {/* Animated Floating Elements */}
        <motion.div
          className="absolute top-8 right-8 w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute bottom-12 left-12 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm"
          animate={{
            y: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.5
          }}
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 lg:px-16">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <span className="text-white font-medium">Category</span>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {title || 'Category'}
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              {description || 'Discover premium products, exclusive deals, and curated collections tailored just for you.'}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Shop Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                View Collections
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="bg-white/90 backdrop-blur-sm rounded-t-3xl px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">50+</div>
              <div className="text-sm text-gray-600">Brands</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">4.8★</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">Up to 70%</div>
              <div className="text-sm text-gray-600">Discount</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Categories */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <div className="space-y-3">
          {['Trending', 'New Arrivals', 'Best Sellers', 'Premium', 'Limited Edition'].map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ x: -5 }}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium cursor-pointer hover:bg-white/20 transition-colors"
            >
              {tag}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryHero;