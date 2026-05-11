import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterSidebar = ({ onMobileClose }) => {
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brand: true,
    rating: true,
    color: true,
    size: true,
    discount: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const brands = [
    'Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Levi\'s', 'Allen Solly', 'Ray-Ban',
    'Apple', 'Samsung', 'Sony', 'Bose', 'Dyson', 'Philips', 'LG'
  ];

  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Yellow', hex: '#F59E0B' },
    { name: 'Purple', hex: '#8B5CF6' },
    { name: 'Pink', hex: '#EC4899' }
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const ratings = [4.5, 4.0, 3.5, 3.0];
  const discounts = ['10%', '20%', '30%', '40%', '50%', '60%+'];

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="mb-6">
      <div 
        className="flex justify-between items-center cursor-pointer mb-4"
        onClick={() => toggleSection(sectionKey)}
      >
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <motion.svg
          animate={{ rotate: expandedSections[sectionKey] ? 180 : 0 }}
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </motion.svg>
      </div>
      
      <AnimatePresence>
        {expandedSections[sectionKey] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-[calc(100vh-10rem)] overflow-y-auto pr-4 custom-scrollbar">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <p className="text-sm text-gray-500">Refine your search</p>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Clear All
            </button>
          </div>

          {/* Price Range Filter */}
          <FilterSection title="Price Range" sectionKey="price">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Min: ₹{priceRange[0].toLocaleString()}</span>
                <span className="text-gray-600">Max: ₹{priceRange[1].toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-full p-2 border border-gray-300 rounded-lg text-center"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                  className="w-full p-2 border border-gray-300 rounded-lg text-center"
                  placeholder="Max"
                />
              </div>
            </div>
          </FilterSection>

          {/* Brand Filter */}
          <FilterSection title="Brand" sectionKey="brand">
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Rating Filter */}
          <FilterSection title="Customer Rating" sectionKey="rating">
            <div className="space-y-2">
              {ratings.map((rating) => (
                <label key={rating} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input type="radio" name="rating" className="w-4 h-4 text-blue-600" />
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                    <span className="ml-2 text-gray-700">& above</span>
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Color Filter */}
          <FilterSection title="Color" sectionKey="color">
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  className="relative group"
                  title={color.name}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 border-gray-200 group-hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-gray-900 transition-colors" />
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Size Filter */}
          <FilterSection title="Size" sectionKey="size">
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Discount Filter */}
          <FilterSection title="Discount" sectionKey="discount">
            <div className="flex flex-wrap gap-2">
              {discounts.map((discount) => (
                <button
                  key={discount}
                  className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
                >
                  {discount} OFF
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Apply Filters Button */}
          <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Mobile Filter Button - Shown in CategoryLayout */}
      <div className="lg:hidden">
        <button 
          onClick={onMobileClose}
          className="w-full py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          Show Filters
        </button>
      </div>
    </>
  );
};

export default FilterSidebar;