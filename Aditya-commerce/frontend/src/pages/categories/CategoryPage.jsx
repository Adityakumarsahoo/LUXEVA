import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CategoryLayout from '../../components/category/CategoryLayout';
import Breadcrumb from '../../components/category/Breadcrumb';
import { getCategoryBySlug } from '../../data/categoryData';
import CategoryLoading from '../../components/category/CategoryLoading';

// Default category config for fallback
const defaultCategoryConfig = {
  title: 'Category',
  description: 'Discover premium products curated just for you.',
  themeColor: '#3B82F6',
  features: ['Premium Quality', 'Curated Selection', 'Best Prices', 'Fast Delivery']
};

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const loadCategoryData = async () => {
      setLoading(true);
      
      // Get category by slug
      const categoryData = getCategoryBySlug(categoryName);
      
      if (categoryData) {
        setCategory(categoryData);
      }
      
      // Simulate loading delay
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };

    loadCategoryData();
  }, [categoryName]);

  if (loading) {
    return <CategoryLoading />;
  }

  const config = category ? {
    title: category.name,
    description: `Discover the best ${category.name} from top brands. ${category.count} premium products available with exclusive deals.`,
    themeColor: '#3B82F6',
    features: [
      `${category.count}+ Products`,
      'Premium Quality',
      'Free Shipping',
      'Easy Returns'
    ]
  } : defaultCategoryConfig;

  return (
    <>
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mt-6">
        <Breadcrumb />
      </div>

      <CategoryLayout
        categoryName={config.title}
        categoryDescription={config.description}
        themeColor={config.themeColor}
      >
        {/* Additional Category-Specific Content */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 border border-gray-100 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our {config.title}?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {config.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{feature}</h4>
                    <p className="text-sm text-gray-600 mt-1">Premium quality guaranteed with every purchase</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Count & Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-700">{category?.count || '245'}+</div>
              <div className="text-sm font-medium text-blue-800 mt-1">Products</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-green-700">50+</div>
              <div className="text-sm font-medium text-green-800 mt-1">Brands</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-700">4.5★</div>
              <div className="text-sm font-medium text-purple-800 mt-1">Avg Rating</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-700">30%</div>
              <div className="text-sm font-medium text-orange-800 mt-1">Off Today</div>
            </div>
          </div>

          {/* Trending Now Section */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Trending Now in {config.title}</h3>
                <p className="text-gray-600">Most popular picks this week</p>
              </div>
              <button className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                View All
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Best Sellers', color: 'bg-red-50 text-red-700', icon: '🔥' },
                { name: 'New Arrivals', color: 'bg-blue-50 text-blue-700', icon: '🆕' },
                { name: 'Limited Edition', color: 'bg-purple-50 text-purple-700', icon: '⭐' },
                { name: 'Editor\'s Pick', color: 'bg-green-50 text-green-700', icon: '👑' }
              ].map((item, index) => (
                <div key={index} className={`${item.color} rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform cursor-pointer`}>
                  <div className="text-2xl font-bold mb-2">{item.icon}</div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm opacity-80 mt-1">Explore collection</p>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Showcase */}
          <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Premium Brands</h3>
                <p className="text-gray-300">Shop from top brands in {config.title}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Zara', 'H&M', 'Levi\'s'].slice(0, 4).map((brand) => (
                  <div key={brand} className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    {brand}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Free Shipping', desc: 'On orders above ₹999' },
                { name: 'Easy Returns', desc: '30-day return policy' },
                { name: 'Secure Payment', desc: '100% secure checkout' },
                { name: '24/7 Support', desc: 'Dedicated customer care' }
              ].map((item, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-lg font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-300">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CategoryLayout>
    </>
  );
};

export default CategoryPage;