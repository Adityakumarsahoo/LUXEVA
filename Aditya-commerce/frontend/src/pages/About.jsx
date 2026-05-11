import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div className='pb-6'>
      <div className='pt-8 border-t'>
        <div className='text-center'>
          <Title text1={'ABOUT'} text2={'US'} />
        </div>
      </div>

      <div className='mt-8 overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white shadow-sm'>
        <div className='relative p-7 sm:p-10'>
          <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50' />
          <div className='absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky-400/10 blur-[120px]' />
          <div className='absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-blue-400/10 blur-[120px]' />

          <div className='relative grid grid-cols-1 lg:grid-cols-12 gap-10'>
            <div className='lg:col-span-5'>
              <div className='overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-sm'>
                <img className='w-full h-full object-cover' src={assets.about_img} alt='' />
              </div>
            </div>

            <div className='lg:col-span-7 flex flex-col justify-center'>
              <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>About</p>
              <h2 className='mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900'>LUXEVA</h2>
              <p className='mt-4 text-sm font-semibold text-slate-600 leading-relaxed'>
                LUXEVA was born out of a passion for innovation and a desire to revolutionize the way people shop online.
                Our journey began with a simple idea: to provide a platform where customers can easily discover, explore, and purchase a wide
                range of products from the comfort of their homes.
              </p>
              <p className='mt-4 text-sm font-semibold text-slate-600 leading-relaxed'>
                Since our inception, we&apos;ve worked tirelessly to curate a diverse selection of high-quality products that cater to every
                taste and preference. From fashion and beauty to electronics and home essentials, we offer an extensive collection sourced
                from trusted brands and suppliers.
              </p>

              <div className='mt-7 rounded-[2rem] border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm'>
                <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Our Mission</p>
                <p className='mt-2 text-sm font-semibold text-slate-700 leading-relaxed'>
                  Empower customers with choice, convenience, and confidence—delivering a seamless shopping experience from browsing and
                  ordering to delivery and beyond.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-12'>
        <div className='text-center'>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
        </div>

        <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
          {[
            {
              t: 'Quality Assurance',
              d: 'We meticulously select and vet each product to ensure it meets our stringent quality standards.',
            },
            {
              t: 'Convenience',
              d: 'With our user-friendly interface and hassle-free ordering process, shopping stays fast and simple.',
            },
            {
              t: 'Exceptional Support',
              d: 'Our team is here to assist you every step of the way, ensuring your satisfaction is our top priority.',
            },
          ].map((c) => (
            <div key={c.t} className='rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-sm hover:shadow-lg transition'>
              <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Benefit</p>
              <p className='mt-2 text-xl font-black tracking-tight text-slate-900'>{c.t}</p>
              <p className='mt-3 text-sm font-semibold text-slate-600 leading-relaxed'>{c.d}</p>
            </div>
          ))}
        </div>
      </div>

      <NewsletterBox />
    </div>
  )
}

export default About
