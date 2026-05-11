import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CategoryMegaMenu = ({ isOpen, onClose }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const fashionColumns = [
    {
      title: 'Men',
      items: [
        { label: 'Clothing', to: '/fashion/clothing' },
        { label: 'Footwear', to: '/fashion/footwear' },
        { label: 'Accessories', to: '/fashion/accessories' },
      ],
    },
    {
      title: 'Women',
      items: [
        { label: 'Ethnic Wear', to: '/fashion/ethnic-wear' },
        { label: 'Western Wear', to: '/fashion/western-wear' },
        { label: 'Beauty', to: '/fashion/beauty' },
      ],
    },
    {
      title: 'Kids',
      items: [
        { label: 'Boys', to: '/fashion/boys' },
        { label: 'Girls', to: '/fashion/girls' },
        { label: 'Baby Care', to: '/fashion/baby-care' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          transition={{ duration: 0.3 }}
          className="absolute top-full left-0 right-0 z-50 mt-2"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm" onClick={onClose} />
          
          {/* Mega Menu Container */}
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200 p-10 rounded-[3rem] overflow-hidden"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div className="mx-auto max-w-7xl grid grid-cols-4 gap-12">
                {fashionColumns.map((col) => (
                  <div key={col.title} className="space-y-6">
                    <Link
                      to="/fashion"
                      onClick={onClose}
                      className="text-[11px] font-black tracking-[0.3em] text-sky-600 uppercase hover:text-sky-400 transition-colors flex items-center gap-2"
                    >
                      <span className="w-4 h-px bg-sky-200" />
                      {col.title}
                    </Link>

                    <ul className="space-y-4">
                      {col.items.map((item) => (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            onClick={onClose}
                            className="text-sm font-bold text-slate-500 hover:text-sky-600 flex items-center gap-3 group/item transition-all"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/item:bg-sky-500 group-hover/item:scale-125 transition-all" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="col-span-1 bg-sky-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden group/card shadow-xl shadow-sky-600/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover/card:scale-150 transition-transform duration-700" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse" />
                      <p className="text-[10px] font-black tracking-[0.3em] text-sky-100">LIMITED DEALS</p>
                    </div>
                    <h3 className="text-2xl font-black leading-tight uppercase tracking-tighter">Up to 60% Off<br/>New Arrivals</h3>
                  </div>

                  <Link
                    to="/collection"
                    state={{
                      filters: {
                        mainCategory: ['fashion', 'electronics', 'home-kitchen', 'lifestyle'],
                        allCollections: true,
                        collectionTitle: 'All Collections',
                        collectionEyebrow: 'Shop',
                      },
                    }}
                    onClick={onClose}
                    className="relative z-10 w-full py-4 bg-white text-sky-600 rounded-2xl text-[11px] font-black tracking-[0.2em] hover:bg-sky-50 transition-all active:scale-95 shadow-lg text-center"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryMegaMenu;
