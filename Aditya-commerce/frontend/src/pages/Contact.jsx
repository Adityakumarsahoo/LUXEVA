import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react'

const Contact = () => {
  const supportPhoneDisplay = '1800 - 260 - 366'
  const supportPhoneTel = '1800260366'
  const supportEmail = 'support@luxeva.com'

  return (
    <div className='border-t'>
      <div className='text-center text-2xl pt-10'>
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <section className='mt-10 mb-12'>
        <div className='rounded-[2.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden'>
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50' />
            <div className='absolute -right-28 -top-28 h-96 w-96 rounded-full bg-sky-400/10 blur-[120px]' />
            <div className='absolute -left-28 -bottom-28 h-96 w-96 rounded-full bg-blue-400/10 blur-[120px]' />

            <div className='relative p-7 sm:p-10'>
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch'>
                <div className='lg:col-span-5'>
                  <div className='h-full rounded-[2.25rem] border border-slate-200 bg-white overflow-hidden shadow-sm'>
                    <img className='w-full h-full object-cover' src={assets.contact_img} alt='Contact LUXEVA' />
                  </div>
                </div>

                <div className='lg:col-span-7 flex flex-col'>
                  <div className='inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[10px] font-black tracking-[0.35em] uppercase text-slate-500 backdrop-blur'>
                    LUXEVA SUPPORT
                  </div>
                  <p className='mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900'>We’re here to help</p>
                  <p className='mt-3 text-sm font-semibold text-slate-500 max-w-2xl'>
                    Reach out for order queries, product help, returns, or partnership requests. We respond with a clean, premium support experience.
                  </p>

                  <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <a
                      href={`tel:${supportPhoneTel}`}
                      className='group rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm hover:bg-white transition'
                    >
                      <div className='flex items-start gap-3'>
                        <span className='mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50'>
                          <Phone className='h-5 w-5 text-slate-800' />
                        </span>
                        <div className='min-w-0'>
                          <p className='text-[11px] font-black tracking-[0.25em] uppercase text-slate-400'>Phone</p>
                          <p className='mt-2 text-sm font-black text-slate-900'>{supportPhoneDisplay}</p>
                          <p className='mt-1 text-xs font-semibold text-slate-500'>Call support</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href={`mailto:${supportEmail}`}
                      className='group rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm hover:bg-white transition'
                    >
                      <div className='flex items-start gap-3'>
                        <span className='mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50'>
                          <Mail className='h-5 w-5 text-slate-800' />
                        </span>
                        <div className='min-w-0'>
                          <p className='text-[11px] font-black tracking-[0.25em] uppercase text-slate-400'>Email</p>
                          <p className='mt-2 text-sm font-black text-slate-900 break-all'>{supportEmail}</p>
                          <p className='mt-1 text-xs font-semibold text-slate-500'>Write to us</p>
                        </div>
                      </div>
                    </a>

                    <div className='rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm'>
                      <div className='flex items-start gap-3'>
                        <span className='mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50'>
                          <MapPin className='h-5 w-5 text-slate-800' />
                        </span>
                        <div className='min-w-0'>
                          <p className='text-[11px] font-black tracking-[0.25em] uppercase text-slate-400'>Address</p>
                          <p className='mt-2 text-sm font-black text-slate-900'>754005 Near Chandaka</p>
                          <p className='mt-1 text-xs font-semibold text-slate-500'>Bhubaneswar, Odisha, IND</p>
                        </div>
                      </div>
                    </div>

                    <div className='rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm'>
                      <div className='flex items-start gap-3'>
                        <span className='mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50'>
                          <Clock className='h-5 w-5 text-slate-800' />
                        </span>
                        <div className='min-w-0'>
                          <p className='text-[11px] font-black tracking-[0.25em] uppercase text-slate-400'>Hours</p>
                          <p className='mt-2 text-sm font-black text-slate-900'>Mon–Sat</p>
                          <p className='mt-1 text-xs font-semibold text-slate-500'>10:00 AM – 7:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='mt-6 flex flex-wrap gap-3'>
                    <Link
                      to='/careers'
                      onClick={() => scrollTo(0, 0)}
                      className='inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-5 text-white text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98]'
                    >
                      Explore Careers
                      <ArrowUpRight className='h-4 w-4' />
                    </Link>
                    <a
                      href={`mailto:${supportEmail}`}
                      className='inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-slate-700 text-[11px] font-black tracking-widest uppercase hover:bg-slate-50 transition-all active:scale-[0.98]'
                    >
                      Email Support
                    </a>
                  </div>

                  <div className='mt-7 rounded-2xl border border-slate-200 bg-white/70 px-5 py-4 text-xs font-semibold text-slate-500'>
                    For faster help, include your order ID and registered phone/email.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsletterBox />
    </div>
  )
}

export default Contact
