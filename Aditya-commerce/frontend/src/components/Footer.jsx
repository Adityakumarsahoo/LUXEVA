import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='mt-16'>
      <div className='rounded-[2.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden'>
        <div className='grid grid-cols-1 md:grid-cols-12 gap-10 p-8 sm:p-10'>
          <div className='md:col-span-5'>
            <Link to='/' onClick={() => scrollTo(0, 0)} className='inline-flex items-center'>
              <img src={assets.logo} className='h-10 w-auto object-contain' alt='' />
            </Link>
            <p className='mt-4 text-sm font-semibold text-slate-500 max-w-md'>
              A modern, premium storefront experience with curated products, fast browsing, and clean UX across Fashion,
              Electronics, Home & Kitchen, and Lifestyle.
            </p>
            <div className='mt-6 flex flex-wrap gap-2'>
              {[
                { label: 'Fashion', to: '/fashion/clothing' },
                { label: 'Electronics', to: '/electronics/mobiles' },
                { label: 'Home & Kitchen', to: '/home-kitchen/furniture' },
                { label: 'Collection', to: '/collection' },
              ].map((c) => (
                <Link
                  key={c.to}
                  to={c.to}
                  onClick={() => scrollTo(0, 0)}
                  className='inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-4 text-[11px] font-black tracking-widest uppercase text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition'
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <div className='md:col-span-3'>
            <p className='text-[11px] font-black tracking-[0.35em] text-slate-400 uppercase'>Company</p>
            <ul className='mt-5 space-y-3 text-sm font-semibold text-slate-700'>
              <li>
                <Link to='/' onClick={() => scrollTo(0, 0)} className='hover:text-slate-900 transition-colors'>
                  Home
                </Link>
              </li>
              <li>
                <Link to='/about' onClick={() => scrollTo(0, 0)} className='hover:text-slate-900 transition-colors'>
                  About us
                </Link>
              </li>
              <li>
                <Link to='/contact' onClick={() => scrollTo(0, 0)} className='hover:text-slate-900 transition-colors'>
                  Contact
                </Link>
              </li>
              <li>
                <Link to='/careers' onClick={() => scrollTo(0, 0)} className='hover:text-slate-900 transition-colors'>
                  Careers
                </Link>
              </li>
              <li>
                <Link to='/blog' onClick={() => scrollTo(0, 0)} className='hover:text-slate-900 transition-colors'>
                  Blog
                </Link>
              </li>
              <li>
                <Link to='/shipping-info' onClick={() => scrollTo(0, 0)} className='hover:text-slate-900 transition-colors'>
                  Delivery
                </Link>
              </li>
              <li>
                <Link to='/privacy-policy' onClick={() => scrollTo(0, 0)} className='hover:text-slate-900 transition-colors'>
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>

          <div className='md:col-span-4'>
            <p className='text-[11px] font-black tracking-[0.35em] text-slate-400 uppercase'>Get in touch</p>
            <div className='mt-5 space-y-3 text-sm font-semibold text-slate-700'>
              <a href='tel:1800260366' className='block hover:text-slate-900 transition-colors'>
                1800 - 260 - 366
              </a>
              <a href='mailto:support@luxeva.com' className='block hover:text-slate-900 transition-colors'>
                support@luxeva.com
              </a>
              <div className='pt-3'>
                <p className='text-xs font-black tracking-widest uppercase text-slate-400'>Support</p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {[
                    { label: 'Help Center', to: '/help-center' },
                    { label: 'Returns', to: '/returns-exchanges' },
                    { label: 'Size Guide', to: '/size-guide' },
                    { label: 'Shipping', to: '/shipping-info' },
                  ].map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => scrollTo(0, 0)}
                      className='inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-4 text-[11px] font-black tracking-widest uppercase text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition'
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='border-t border-slate-200 bg-slate-50 px-8 sm:px-10 py-5'>
          <p className='text-center text-xs font-semibold text-slate-500'>
            Copyright 2025 © LUXEVA — All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
