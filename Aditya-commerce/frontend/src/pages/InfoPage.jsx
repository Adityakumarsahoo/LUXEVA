import React, { useContext, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, ChevronRight, ShieldCheck, PackageSearch, RotateCcw, Truck, Ruler, BookOpen, Briefcase } from 'lucide-react'
import { ShopContext } from '../context/ShopContext'
import Collection from './Collection'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

const toTitle = (value) =>
  String(value || '')
    .trim()
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const InfoPage = ({ slug: slugProp }) => {
  const params = useParams()
  const slug = String(slugProp || params.slug || '').trim().toLowerCase()
  const navigate = useNavigate()
  const { token } = useContext(ShopContext)

  const cfg = useMemo(() => {
    const map = {
      careers: {
        title: 'Careers',
        eyebrow: 'Company',
        icon: Briefcase,
        subtitle: 'Build the future of premium commerce with us.',
      },
      blog: {
        title: 'Blog',
        eyebrow: 'Company',
        icon: BookOpen,
        subtitle: 'Stories, updates, and product insights.',
      },
      'privacy-policy': {
        title: 'Privacy Policy',
        eyebrow: 'Company',
        icon: ShieldCheck,
        subtitle: 'How we collect, use, and protect your information.',
      },
      'help-center': {
        title: 'Help Center',
        eyebrow: 'Support',
        icon: PackageSearch,
        subtitle: 'Quick help for orders, returns, and account support.',
      },
      'returns-exchanges': {
        title: 'Returns & Exchanges',
        eyebrow: 'Support',
        icon: RotateCcw,
        subtitle: 'Easy returns with clear steps and faster support.',
        requiresLogin: true,
      },
      'shipping-info': {
        title: 'Shipping Info',
        eyebrow: 'Support',
        icon: Truck,
        subtitle: 'Delivery timelines, locations, and order status details.',
        requiresLogin: true,
      },
      'size-guide': {
        title: 'Size Guide',
        eyebrow: 'Support',
        icon: Ruler,
        subtitle: 'Find your best fit across clothing and footwear.',
      },
      'new-arrivals': {
        title: 'New Arrivals',
        eyebrow: 'Shop',
        subtitle: 'Fresh drops across Fashion, Electronics, Home & Kitchen, and Lifestyle.',
        embeddedCollection: {
          title: 'New Arrivals',
          countLabel: 'Products Found',
          remote: true,
          filters: {
            allCollections: true,
            mainCategory: ['fashion', 'electronics', 'home-kitchen', 'lifestyle'],
            collectionTitle: 'New Arrivals',
            collectionEyebrow: 'Shop',
          },
        },
      },
    }
    return map[slug] || null
  }, [slug])

  if (!cfg) {
    return (
      <div className='py-24'>
        <div className='rounded-[2.5rem] border border-slate-200 bg-white p-10 text-center shadow-sm'>
          <p className='text-sm font-black text-slate-900'>This page does not exist.</p>
          <button
            type='button'
            onClick={() => navigate('/')}
            className='mt-6 h-11 px-6 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-[0.25em] uppercase hover:bg-black transition-all active:scale-[0.98]'
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (cfg.requiresLogin && !token) {
    return (
      <div className='py-24'>
        <div className='rounded-[2.5rem] border border-slate-200 bg-white p-10 text-center shadow-sm'>
          <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Secure Access</p>
          <p className='mt-2 text-2xl font-black tracking-tighter text-slate-900'>{cfg.title}</p>
          <p className='mt-3 text-sm font-semibold text-slate-500'>Please log in to access this page.</p>
          <button
            type='button'
            onClick={() => navigate('/login')}
            className='mt-6 h-11 px-6 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-[0.25em] uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20'
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  if (cfg.embeddedCollection) {
    return <Collection preset={cfg.embeddedCollection} />
  }

  const Icon = cfg.icon

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={slug}
        variants={pageVariants}
        initial='initial'
        animate='animate'
        exit='exit'
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className='pb-20 pt-10 px-1'
      >
        <div className='rounded-[2.75rem] border border-sky-100 bg-white shadow-sm overflow-hidden'>
          <div className='relative p-8 sm:p-10'>
            <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50' />
            <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
            <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />

            <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
              <div className='min-w-0'>
                <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur px-4 py-2 text-[10px] font-black tracking-widest text-slate-400 uppercase'>
                  <Link to='/' className='hover:text-slate-900 transition-colors'>Home</Link>
                  <ChevronRight className='w-3 h-3 opacity-60' />
                  <span className='text-slate-900'>{toTitle(cfg.eyebrow)}</span>
                  <ChevronRight className='w-3 h-3 opacity-60' />
                  <span className='text-slate-900'>{cfg.title}</span>
                </div>

                <div className='mt-6 flex items-start gap-4'>
                  {Icon ? (
                    <div className='h-12 w-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center'>
                      <Icon className='w-6 h-6 text-sky-700' />
                    </div>
                  ) : null}
                  <div className='min-w-0'>
                    <p className='text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase'>{cfg.eyebrow}</p>
                    <h1 className='mt-2 text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase'>
                      {cfg.title}
                    </h1>
                    <p className='mt-3 text-sm font-semibold text-slate-500 max-w-2xl'>{cfg.subtitle}</p>
                  </div>
                </div>
              </div>

              <button
                type='button'
                onClick={() => navigate('/collection')}
                className='h-11 px-5 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-900/15 inline-flex items-center justify-center gap-2'
              >
                Browse Products <ArrowRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>

        {slug === 'size-guide' ? (
          <div className='mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6'>
            <div className='lg:col-span-7 rounded-[2.5rem] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm'>
              <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Clothing</p>
              <p className='mt-2 text-2xl font-black tracking-tight text-slate-900 uppercase'>Size Chart</p>
              <div className='mt-6 overflow-x-auto'>
                <table className='w-full min-w-[520px] text-left border-collapse'>
                  <thead>
                    <tr className='text-[11px] font-black tracking-widest uppercase text-slate-500'>
                      <th className='py-3 pr-4'>Size</th>
                      <th className='py-3 pr-4'>Chest (in)</th>
                      <th className='py-3 pr-4'>Waist (in)</th>
                      <th className='py-3 pr-4'>Fit</th>
                    </tr>
                  </thead>
                  <tbody className='text-sm font-semibold text-slate-700'>
                    {[
                      { s: 'XS', c: '32–34', w: '26–28', f: 'Slim' },
                      { s: 'S', c: '35–37', w: '29–31', f: 'Regular' },
                      { s: 'M', c: '38–40', w: '32–34', f: 'Regular' },
                      { s: 'L', c: '41–43', w: '35–37', f: 'Relaxed' },
                      { s: 'XL', c: '44–46', w: '38–40', f: 'Relaxed' },
                      { s: 'XXL', c: '47–49', w: '41–43', f: 'Relaxed' },
                    ].map((r) => (
                      <tr key={r.s} className='border-t border-slate-100'>
                        <td className='py-3 pr-4 font-black text-slate-900'>{r.s}</td>
                        <td className='py-3 pr-4'>{r.c}</td>
                        <td className='py-3 pr-4'>{r.w}</td>
                        <td className='py-3 pr-4'>{r.f}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className='lg:col-span-5 rounded-[2.5rem] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm'>
              <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Footwear</p>
              <p className='mt-2 text-2xl font-black tracking-tight text-slate-900 uppercase'>Size Chart</p>
              <div className='mt-6 overflow-x-auto'>
                <table className='w-full min-w-[420px] text-left border-collapse'>
                  <thead>
                    <tr className='text-[11px] font-black tracking-widest uppercase text-slate-500'>
                      <th className='py-3 pr-4'>UK</th>
                      <th className='py-3 pr-4'>EU</th>
                      <th className='py-3 pr-4'>Foot (cm)</th>
                    </tr>
                  </thead>
                  <tbody className='text-sm font-semibold text-slate-700'>
                    {[
                      { uk: '6', eu: '40', cm: '25.0' },
                      { uk: '7', eu: '41', cm: '25.7' },
                      { uk: '8', eu: '42', cm: '26.4' },
                      { uk: '9', eu: '43', cm: '27.0' },
                      { uk: '10', eu: '44', cm: '27.7' },
                      { uk: '11', eu: '45', cm: '28.4' },
                    ].map((r) => (
                      <tr key={r.uk} className='border-t border-slate-100'>
                        <td className='py-3 pr-4 font-black text-slate-900'>{r.uk}</td>
                        <td className='py-3 pr-4'>{r.eu}</td>
                        <td className='py-3 pr-4'>{r.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className='mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6'>
            <div className='lg:col-span-8 rounded-[2.5rem] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm'>
              <p className='text-sm font-semibold text-slate-600 leading-relaxed'>
                This page is ready for production content. Add your official policy text, career openings, or help articles here.
              </p>
            </div>
            <div className='lg:col-span-4 rounded-[2.5rem] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm'>
              <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Quick Links</p>
              <div className='mt-5 space-y-2'>
                {[
                  { label: 'Shop New Arrivals', to: '/new-arrivals' },
                  { label: 'Help Center', to: '/help-center' },
                  { label: 'Contact Us', to: '/contact' },
                ].map((l) => (
                  <button
                    key={l.to}
                    type='button'
                    onClick={() => navigate(l.to)}
                    className='w-full text-left rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition'
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default InfoPage

