// Category data for mega menu
export const categoryGroups = [
  {
    id: 'mobiles',
    title: 'Mobiles',
    icon: '📱',
    subcategories: [
      { id: 'smartphones', name: 'Smartphones', slug: 'smartphones', count: 245 },
      { id: 'tablets', name: 'Tablets', slug: 'tablets', count: 89 },
      { id: 'accessories', name: 'Accessories', slug: 'mobile-accessories', count: 156 }
    ]
  },
  {
    id: 'computing',
    title: 'Computing',
    icon: '💻',
    subcategories: [
      { id: 'laptops', name: 'Laptops', slug: 'laptops', count: 187 },
      { id: 'gaming', name: 'Gaming', slug: 'gaming', count: 112 },
      { id: 'monitors', name: 'Monitors', slug: 'monitors', count: 76 }
    ]
  },
  {
    id: 'audio',
    title: 'Audio',
    icon: '🎧',
    subcategories: [
      { id: 'headphones', name: 'Headphones', slug: 'headphones', count: 203 },
      { id: 'speakers', name: 'Speakers', slug: 'speakers', count: 145 },
      { id: 'soundbars', name: 'Soundbars', slug: 'soundbars', count: 67 }
    ]
  },
  {
    id: 'electronics',
    title: 'Electronics',
    icon: '🔌',
    subcategories: [
      { id: 'tv', name: 'Televisions', slug: 'televisions', count: 98 },
      { id: 'cameras', name: 'Cameras', slug: 'cameras', count: 54 },
      { id: 'smart-home', name: 'Smart Home', slug: 'smart-home', count: 123 }
    ]
  },
  {
    id: 'fashion',
    title: 'Fashion',
    icon: '👕',
    subcategories: [
      { id: 'mens', name: "Men's Fashion", slug: 'mens-fashion', count: 456 },
      { id: 'womens', name: "Women's Fashion", slug: 'womens-fashion', count: 589 },
      { id: 'kids', name: "Kids' Fashion", slug: 'kids-fashion', count: 234 }
    ]
  },
  {
    id: 'home',
    title: 'Home & Kitchen',
    icon: '🏠',
    subcategories: [
      { id: 'furniture', name: 'Furniture', slug: 'furniture', count: 178 },
      { id: 'kitchen', name: 'Kitchen Appliances', slug: 'kitchen-appliances', count: 267 },
      { id: 'decor', name: 'Home Decor', slug: 'home-decor', count: 189 }
    ]
  }
];

// All categories flattened for easy access
export const allCategories = categoryGroups.flatMap(group => 
  group.subcategories.map(sub => ({
    ...sub,
    groupId: group.id,
    groupTitle: group.title,
    groupIcon: group.icon
  }))
);

// Get category by slug
export const getCategoryBySlug = (slug) => {
  return allCategories.find(cat => cat.slug === slug);
};

// Get products for a specific category (dummy data)
export const getCategoryProducts = (slug, limit = 12) => {
  const category = getCategoryBySlug(slug);
  if (!category) return [];
  
  // Generate dummy products
  const products = [];
  const brands = ['Apple', 'Samsung', 'Sony', 'Bose', 'Dell', 'HP', 'LG', 'Philips', 'JBL', 'Logitech'];
  const adjectives = ['Premium', 'Pro', 'Ultra', 'Gaming', 'Wireless', 'Bluetooth', 'Smart', '4K', 'HD'];
  
  for (let i = 1; i <= limit; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const basePrice = Math.floor(Math.random() * 50000) + 1999;
    const discount = Math.random() > 0.3 ? Math.floor(Math.random() * 40) + 5 : 0;
    const finalPrice = Math.round(basePrice * (1 - discount / 100));
    const rating = (Math.random() * 2 + 3).toFixed(1);
    
    products.push({
      id: `${slug}-${i}`,
      name: `${brand} ${adjective} ${category.name}`,
      description: `High-quality ${category.name.toLowerCase()} with premium features and excellent performance.`,
      price: finalPrice,
      originalPrice: discount > 0 ? basePrice : null,
      discount: discount,
      rating: parseFloat(rating),
      reviewCount: Math.floor(Math.random() * 500) + 50,
      image: `https://picsum.photos/seed/${slug}-${i}/400/400`,
      category: category.name,
      categorySlug: slug,
      inStock: Math.random() > 0.1,
      fastDelivery: Math.random() > 0.3,
      brand: brand,
      features: [
        'Premium Quality',
        'Warranty Included',
        'Easy Returns',
        'Free Shipping'
      ]
    });
  }
  
  return products;
};

// Filter options for each category
export const getFilterOptions = (slug) => {
  const baseFilters = {
    priceRange: [
      { label: 'Under ₹5,000', min: 0, max: 5000 },
      { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
      { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
      { label: '₹20,000 - ₹50,000', min: 20000, max: 50000 },
      { label: 'Over ₹50,000', min: 50000, max: 1000000 }
    ],
    brands: ['Apple', 'Samsung', 'Sony', 'Bose', 'Dell', 'HP', 'LG', 'Philips', 'JBL', 'Logitech'],
    ratings: [
      { label: '4★ & above', value: 4 },
      { label: '3★ & above', value: 3 },
      { label: '2★ & above', value: 2 },
      { label: '1★ & above', value: 1 }
    ],
    availability: [
      { label: 'In Stock', value: 'in-stock' },
      { label: 'Fast Delivery', value: 'fast-delivery' }
    ]
  };
  
  // Category-specific filters
  const categorySpecific = {
    'smartphones': {
      ...baseFilters,
      ram: ['4GB', '6GB', '8GB', '12GB', '16GB'],
      storage: ['64GB', '128GB', '256GB', '512GB', '1TB']
    },
    'laptops': {
      ...baseFilters,
      processor: ['Intel i3', 'Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'],
      ram: ['8GB', '16GB', '32GB', '64GB'],
      storage: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB HDD']
    },
    'headphones': {
      ...baseFilters,
      type: ['Over-Ear', 'On-Ear', 'In-Ear', 'True Wireless'],
      connectivity: ['Wired', 'Wireless', 'Bluetooth']
    },
    'gaming': {
      ...baseFilters,
      type: ['Gaming Laptops', 'Gaming Consoles', 'Gaming Accessories', 'Gaming Monitors'],
      platform: ['PC', 'PlayStation', 'Xbox', 'Nintendo']
    }
  };
  
  return categorySpecific[slug] || baseFilters;
};