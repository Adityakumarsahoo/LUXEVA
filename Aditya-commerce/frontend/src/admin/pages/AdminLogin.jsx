import axios from 'axios'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'

const AdminLogin = ({ setAdminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
      if (response.data.success) {
        setAdminToken(response.data.token)
        localStorage.setItem('adminRole', response.data.role || 'admin')
        toast.success((response.data.role || 'admin').toUpperCase() + ' login successful')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center px-4'>
      <div className='w-full max-w-5xl rounded-[3rem] border border-sky-100 bg-white shadow-2xl shadow-sky-900/10 overflow-hidden'>
        <div className='grid grid-cols-1 md:grid-cols-2'>
          <div className='hidden md:flex bg-sky-600 text-white p-12 relative overflow-hidden flex-col justify-between'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent' />
            <div className='absolute -right-24 -top-24 w-96 h-96 bg-white/10 rounded-full blur-[120px]' />
            <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-white/10 rounded-full blur-[120px]' />
            <div className='relative z-10'>
              <img src={assets.logo} className='w-32' alt='Logo' />
              <p className='mt-10 text-[10px] font-black tracking-[0.35em] text-sky-100 uppercase'>Secure Access</p>
              <h1 className='mt-3 text-4xl font-black tracking-tighter uppercase leading-[0.95]'>Admin Login</h1>
              <p className='mt-4 text-sm font-semibold text-sky-100/90 max-w-sm'>
                Manage products, categories, users, reports, and payments with a premium admin console.
              </p>
            </div>
            <div className='relative z-10'>
              <div className='rounded-2xl bg-white/10 border border-white/20 p-4'>
                <p className='text-[10px] font-black tracking-widest uppercase'>Best Practice</p>
                <p className='mt-1 text-[11px] font-semibold text-sky-100/90'>Use a strong password and keep admin credentials private.</p>
              </div>
            </div>
          </div>

          <div className='p-8 sm:p-12'>
            <div className='md:hidden mb-10 flex items-center justify-center'>
              <img src={assets.logo} className='w-28' alt='Logo' />
            </div>
            <div className='flex items-end justify-between gap-4'>
              <div>
                <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Admin Console</p>
                <h2 className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>Welcome Back</h2>
                <p className='mt-2 text-sm font-semibold text-slate-500'>Login to access the admin dashboard.</p>
              </div>
              <span className='hidden sm:inline-flex items-center gap-2 rounded-2xl bg-sky-50 border border-sky-100 px-4 py-2'>
                <span className='h-2 w-2 rounded-full bg-sky-500' />
                <span className='text-[10px] font-black tracking-widest uppercase text-sky-700'>Secure</span>
              </span>
            </div>

            <form onSubmit={onSubmitHandler} className='mt-10 space-y-4'>
              <div className='space-y-1'>
                <p className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Email Address</p>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className='w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold text-slate-900'
                  type='email'
                  placeholder='admin@email.com'
                  required
                />
              </div>
              <div className='space-y-1'>
                <p className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Password</p>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className='w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold text-slate-900'
                  type='password'
                  placeholder='Enter your password'
                  required
                />
              </div>

              <button
                className='mt-2 w-full h-12 rounded-2xl text-white bg-slate-900 hover:bg-black disabled:opacity-60 transition-all active:scale-[0.98] font-black tracking-widest uppercase shadow-lg shadow-slate-900/15'
                type='submit'
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
