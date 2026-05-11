import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCategoryBySlug } from '../../data/categoryData';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Special case for category pages
  const isCategoryPage = pathnames[0] === 'category' && pathnames[1];
  
  // Build breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> }
  ];

  if (isCategoryPage) {
    const categorySlug = pathnames[1];
    const category = getCategoryBySlug(categorySlug);
    
    if (category) {
      // Add category group
      breadcrumbItems.push({
        name: category.groupTitle,
        path: `/category/${category.groupId}`,
        icon: <span className="text-lg">{category.groupIcon}</span>
      });
      
      // Add specific category
      breadcrumbItems.push({
        name: category.name,
        path: `/category/${category.slug}`,
        icon: null
      });
    } else {
      // Fallback for unknown categories
      breadcrumbItems.push({
        name: 'Categories',
        path: '/category/all',
        icon: null
      });
    }
  } else {
    // For other pages, build breadcrumb from path
    let currentPath = '';
    pathnames.forEach((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === pathnames.length - 1;
      
      // Format the name for display
      const formattedName = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbItems.push({
        name: formattedName,
        path: currentPath,
        icon: null,
        isLast
      });
    });
  }

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  return (
    <nav className="w-full" aria-label="Breadcrumb">
      <motion.ol 
        className="flex items-center flex-wrap gap-2"
        initial="hidden"
        animate="visible"
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <motion.li 
              key={item.path} 
              className="flex items-center"
              custom={index}
              variants={itemVariants}
            >
              {!isLast ? (
                <Link
                  to={item.path}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  {item.icon && (
                    <span className="text-gray-500 group-hover:text-blue-600 transition-colors">
                      {item.icon}
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                  {item.icon && (
                    <span className="text-blue-600">
                      {item.icon}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-blue-700">
                    {item.name}
                  </span>
                </div>
              )}
              
              {!isLast && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              )}
            </motion.li>
          );
        })}
      </motion.ol>
      
      {/* Decorative elements */}
      <div className="mt-4 flex items-center gap-2">
        <motion.div 
          className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.div 
          className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '60%' }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
      </div>
    </nav>
  );
};

export default Breadcrumb;