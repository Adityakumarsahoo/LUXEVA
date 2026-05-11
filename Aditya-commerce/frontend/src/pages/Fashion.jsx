import React, { useContext, useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import ProductItem from '../components/ProductItem'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import Collection from './Collection'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shirt, User, Baby, CloudRain } from 'lucide-react'

const RevealSection = ({ children, delay = 0 }) => {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

const Section = ({ title, subtitle, onViewAll, children, sectionRef, icon: Icon }) => {
  return (
    <section ref={sectionRef} className='mt-24 scroll-mt-32'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-1'>
        <div className='max-w-xl'>
          <div className='flex items-center gap-3 mb-4'>
            {Icon && (
              <div className='p-2 bg-blue-50 rounded-xl'>
                <Icon className='w-5 h-5 text-blue-600' />
              </div>
            )}
            <p className='text-[10px] font-black tracking-[0.3em] text-blue-600 uppercase'>{title}</p>
          </div>
          <h2 className='text-3xl font-black tracking-tighter text-slate-900 uppercase mb-3'>{subtitle || title}</h2>
          <div className='h-1 w-12 bg-slate-900 rounded-full' />
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className='flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 hover:text-slate-900 transition-all uppercase group'
          >
            Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
      <div className='mt-6'>{children}</div>
    </section>
  )
}

const Fashion = () => {
  const { products, openCollectionSearch, loadingProducts } = useContext(ShopContext)
  const navigate = useNavigate()
  const { fashionSlug } = useParams()

  const preset = useMemo(() => {
    const s = String(fashionSlug || '').trim().toLowerCase()
    if (!s) return null

    const titleMap = {
      'clothing': 'Clothing',
      'footwear': 'Footwear',
      'accessories': 'Accessories',
      'ethnic-wear': 'Ethnic Wear',
      'western-wear': 'Western Wear',
      'beauty': 'Beauty',
      'boys': 'Boys',
      'girls': 'Girls',
      'baby-care': 'Baby Care',
    }

    const title = titleMap[s]
    if (!title) return { invalid: true }

    return {
      title,
      breadcrumb: `Home / Fashion / ${title}`,
      countLabel: 'Products Found',
      scope: { kind: 'fashion', key: s },
    }
  }, [fashionSlug])

  const men = useMemo(() => products.filter((p) => p.category === 'Men'), [products])
  const women = useMemo(() => products.filter((p) => p.category === 'Women'), [products])
  const kids = useMemo(() => products.filter((p) => p.category === 'Kids'), [products])

  const topwear = useMemo(() => products.filter((p) => p.subCategory === 'Topwear'), [products])
  const bottomwear = useMemo(() => products.filter((p) => p.subCategory === 'Bottomwear'), [products])
  const winterwear = useMemo(() => products.filter((p) => p.subCategory === 'Winterwear'), [products])

  const menRef = useRef(null)
  const womenRef = useRef(null)
  const kidsRef = useRef(null)
  const topwearRef = useRef(null)
  const bottomwearRef = useRef(null)
  const winterwearRef = useRef(null)

  if (preset?.invalid) {
    return (
      <div className='py-20'>
        <div className='rounded-[2.75rem] border border-slate-200 bg-white p-10 text-center'>
          <p className='text-sm font-semibold text-slate-500'>This fashion category does not exist.</p>
          <button
            type='button'
            onClick={() => navigate('/fashion')}
            className='mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98]'
          >
            Back to Fashion
          </button>
        </div>
      </div>
    )
  }

  if (preset) {
    return <Collection preset={preset} />
  }

  const Grid = ({ list }) => (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8'>
      {loadingProducts
        ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
        : list.slice(0, 12).map((p) => <ProductItem key={p._id} product={p} />)}
    </div>
  )

  return (
    <div className='pb-20 pt-10'>
      {/* Premium Hero Header */}
      <RevealSection>
        <div className='relative rounded-[3rem] bg-white border border-sky-100 overflow-hidden min-h-[400px] flex flex-col justify-center p-8 sm:p-16 mb-20 shadow-xl shadow-sky-900/5'>
          <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-transparent to-blue-50' />
          <div className='absolute -right-20 -top-20 w-80 h-80 bg-sky-400/10 rounded-full blur-[100px]' />
          <div className='absolute -left-20 -bottom-20 w-80 h-80 bg-blue-400/10 rounded-full blur-[100px]' />
          
          <div className='relative z-10 max-w-2xl'>
            <div className='flex items-center gap-3 mb-6'>
              <Sparkles className='w-5 h-5 text-sky-600' />
              <p className='text-[10px] font-black tracking-[0.4em] text-sky-600 uppercase'>Curated Collection</p>
            </div>
            <h1 className='text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase mb-8'>
              The Art of <br/> <span className='text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600'>Fashion</span>
            </h1>
            <p className='text-lg text-slate-500 font-medium mb-12 max-w-lg'>
              Experience premium craftsmanship and timeless styles section-by-section.
            </p>

            <div className='flex flex-wrap gap-3'>
              {[
                { label: 'Men', icon: User, onClick: () => openCollectionSearch('', { category: ['Men'] }) },
                { label: 'Women', icon: Sparkles, onClick: () => openCollectionSearch('', { category: ['Women'] }) },
                { label: 'Kids', icon: Baby, onClick: () => openCollectionSearch('', { category: ['Kids'] }) },
                { label: 'Clothing', icon: Shirt, onClick: () => navigate('/fashion/clothing') },
                { label: 'Footwear', icon: CloudRain, onClick: () => navigate('/fashion/footwear') },
                { label: 'Accessories', icon: CloudRain, onClick: () => navigate('/fashion/accessories') },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className='px-6 py-3 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 text-[11px] font-black tracking-widest uppercase hover:bg-sky-600 hover:text-white transition-all duration-300 flex items-center gap-2'
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection>
        <Section
          title="Men's Picks"
          subtitle='Refined Masculinity'
          sectionRef={menRef}
          icon={User}
          onViewAll={() => openCollectionSearch('Men', { category: 'Men' })}
        >
          <Grid list={men} />
        </Section>
      </RevealSection>

      <RevealSection>
        <Section
          title="Women's Picks"
          subtitle='Graceful Elegance'
          sectionRef={womenRef}
          icon={Sparkles}
          onViewAll={() => openCollectionSearch('Women', { category: 'Women' })}
        >
          <Grid list={women} />
        </Section>
      </RevealSection>

      <RevealSection>
        <Section
          title="Kids' Picks"
          subtitle='Playful Comfort'
          sectionRef={kidsRef}
          icon={Baby}
          onViewAll={() => openCollectionSearch('Kids', { category: 'Kids' })}
        >
          <Grid list={kids} />
        </Section>
      </RevealSection>

      <RevealSection>
        <Section
          title='Topwear'
          subtitle='Versatile Essentials'
          sectionRef={topwearRef}
          icon={Shirt}
          onViewAll={() => openCollectionSearch('Topwear', { subCategory: 'Topwear' })}
        >
          <Grid list={topwear} />
        </Section>
      </RevealSection>

      <RevealSection>
        <Section
          title='Bottomwear'
          subtitle='Structured Silhouettes'
          sectionRef={bottomwearRef}
          icon={CloudRain}
          onViewAll={() => openCollectionSearch('Bottomwear', { subCategory: 'Bottomwear' })}
        >
          <Grid list={bottomwear} />
        </Section>
      </RevealSection>

      <RevealSection>
        <Section
          title='Winterwear'
          subtitle='Premium Layering'
          sectionRef={winterwearRef}
          icon={CloudRain}
          onViewAll={() => openCollectionSearch('Winterwear', { subCategory: 'Winterwear' })}
        >
          <Grid list={winterwear} />
        </Section>
      </RevealSection>
    </div>
  )
}

export default Fashion
