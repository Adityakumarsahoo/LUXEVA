import React from 'react';
import { motion } from 'framer-motion';

// Animation variants (defined outside component to avoid ESLint errors)
const shimmerVariants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  }
};

const pulseVariants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: 1,
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: 'easeInOut',
      repeatType: 'reverse'
    }
  }
};

const CategoryLoading = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl mx-4 mt-4 lg:mx-8 lg:mt-8">
        <div className="relative h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden bg-gray-200">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            style={{
              backgroundSize: '200% 100%',
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar - Filter Skeleton */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="sticky top-32">
              <motion.div 
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/30 p-6"
                variants={pulseVariants}
                initial="initial"
                animate="animate"
              >
                {/* Filter Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-gray-300 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-300 rounded"></div>
                </div>

                {/* Filter Sections */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-5 w-24 bg-gray-300 rounded"></div>
                      <div className="h-5 w-5 bg-gray-300 rounded"></div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="h-5 w-5 bg-gray-200 rounded"></div>
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right Content Area - Product Grid Skeleton */}
          <div className="w-full lg:w-3/4">
            {/* Sorting and Controls Skeleton */}
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="h-8 w-48 bg-gray-300 rounded"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded"></div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="h-10 w-40 bg-gray-300 rounded-xl"></div>
                  <div className="h-10 w-32 bg-gray-300 rounded-xl"></div>
                </div>
              </div>
            </div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div 
                  key={i}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                  variants={pulseVariants}
                  initial="initial"
                  animate="animate"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Product Image Skeleton */}
                  <div className="relative h-64 bg-gray-200">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      variants={shimmerVariants}
                      initial="initial"
                      animate="animate"
                      style={{
                        backgroundSize: '200% 100%',
                        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                      }}
                    />
                  </div>

                  {/* Product Info Skeleton */}
                  <div className="p-5">
                    <div className="h-5 w-3/4 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 w-20 bg-gray-300 rounded"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    </div>

                    <div className="h-10 w-full bg-gray-300 rounded-xl"></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle Skeleton */}
      <div className="lg:hidden mb-4">
        <div className="w-full py-3 bg-gray-300 rounded-xl"></div>
      </div>
    </div>
  );
};

// Loading spinner component for smaller loading states
export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className="flex items-center justify-center">
      <motion.svg
        className={`${sizeClasses[size]} ${colorClasses[color]}`}
        viewBox="0 0 24 24"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray="80"
          strokeDashoffset="60"
        />
      </motion.svg>
    </div>
  );
};

// Product card skeleton for inline loading
export const ProductCardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div 
          key={i}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="relative h-48 bg-gray-200">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              style={{
                backgroundSize: '200% 100%',
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
              }}
            />
          </div>
          <div className="p-4">
            <div className="h-4 w-3/4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 w-1/2 bg-gray-200 rounded mb-3"></div>
            <div className="h-6 w-20 bg-gray-300 rounded mb-3"></div>
            <div className="h-8 w-full bg-gray-300 rounded-xl"></div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default CategoryLoading;