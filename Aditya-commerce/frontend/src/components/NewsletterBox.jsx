import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'
import { Mail, ShieldCheck, Sparkles } from 'lucide-react'

const NewsletterBox = () => {
    const { backendUrl } = useContext(ShopContext)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmitHandler = (event) => {
        event.preventDefault();
        const value = String(email || '').trim()
        if (!value) return toast.error('Enter your email')
        setLoading(true)
        axios
          .post(backendUrl + '/api/subscription/subscribe', { email: value })
          .then((res) => {
            if (res.data?.success) {
              toast.success(res.data?.message || 'Subscribed successfully')
              setEmail('')
              return
            }
            toast.error(res.data?.message || 'Failed to subscribe')
          })
          .catch((e) => toast.error(e.message))
          .finally(() => setLoading(false))
    }

  return (
    <section className='mt-16'>
      <div className='relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white shadow-sm'>
        <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50' />
        <div className='absolute -right-28 -top-28 h-80 w-80 rounded-full bg-sky-400/10 blur-[110px]' />
        <div className='absolute -left-28 -bottom-28 h-80 w-80 rounded-full bg-blue-400/10 blur-[110px]' />
        <div className='absolute right-10 top-10 h-20 w-20 rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur shadow-sm' />
        <div className='absolute right-24 top-24 h-12 w-12 rounded-2xl border border-white/60 bg-white/50 backdrop-blur shadow-sm' />

        <div className='relative px-7 sm:px-10 py-8 sm:py-10'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8'>
            <div>
              <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[10px] font-black tracking-[0.35em] uppercase text-slate-500 backdrop-blur'>
                <Sparkles className='w-3.5 h-3.5 text-sky-700' />
                Newsletter
              </div>
              <p className='mt-4 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase'>Subscribe & get 20% off</p>
              <p className='mt-2 text-sm font-semibold text-slate-500 max-w-xl'>
                New arrivals, exclusive deals, and curated category drops—sent in a clean, premium format.
              </p>
              <div className='mt-5 flex flex-wrap gap-2'>
                {[
                  { icon: Mail, label: 'Weekly deals' },
                  { icon: ShieldCheck, label: 'No spam' },
                  { icon: Sparkles, label: 'New arrivals' },
                ].map((b) => (
                  <span
                    key={b.label}
                    className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-[11px] font-black tracking-widest uppercase text-slate-700 backdrop-blur'
                  >
                    <b.icon className='w-4 h-4 text-slate-700' />
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={onSubmitHandler} className='w-full lg:max-w-[560px]'>
              <div className='relative flex flex-col sm:flex-row items-stretch gap-3 rounded-full border border-slate-200 bg-white/85 backdrop-blur p-2 shadow-sm'>
                <div className='absolute inset-0 rounded-full ring-0 ring-sky-300/40 focus-within:ring-4 transition' />
                <input
                  className='relative h-12 w-full flex-1 rounded-full bg-transparent px-5 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400'
                  type='email'
                  placeholder='info@yourmail.com'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type='submit'
                  disabled={loading}
                  className={`relative h-12 px-7 rounded-full bg-slate-900 text-white text-[11px] font-black tracking-[0.25em] uppercase hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-900/15 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Subscribing' : 'Subscribe'}
                </button>
              </div>
              <p className='mt-3 text-[11px] font-semibold text-slate-500'>
                By subscribing, you agree to receive emails. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NewsletterBox
