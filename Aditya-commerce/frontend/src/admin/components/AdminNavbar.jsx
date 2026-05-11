import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Search } from 'lucide-react'
import axios from 'axios'

const AdminNavbar = ({ setAdminToken }) => {
  const navigate = useNavigate()
  const role = localStorage.getItem('adminRole') || 'admin'
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const adminToken = localStorage.getItem('adminToken') || ''
  const [unread, setUnread] = useState(0)

  const refreshUnread = async () => {
    if (!adminToken) return
    try {
      const res = await axios.get(backendUrl + '/api/notification/admin/list', { headers: { token: adminToken }, params: { limit: 1 } })
      if (res.data?.success) setUnread(Number(res.data.unreadCount || 0))
    } catch {}
  }

  useEffect(() => {
    refreshUnread()
    const t = setInterval(() => refreshUnread(), 20000)
    return () => clearInterval(t)
  }, [adminToken])

  const logout = () => {
    setAdminToken('')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRole')
    navigate('/')
  }

  return (
    <div className='sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200'>
      <div className='px-4 sm:px-6 lg:px-10 py-4'>
        <div className='flex items-center gap-4'>
          <div className='flex-1 min-w-0'>
            <div className='relative max-w-xl'>
              <div className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'>
                <Search className='h-[18px] w-[18px]' />
              </div>
              <input
                type='text'
                placeholder='Search or type command...'
                className='h-11 w-full rounded-2xl border border-slate-200 bg-white/80 pl-12 pr-20 text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100'
              />
              <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black text-slate-500'>
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => navigate('/admin/notifications')}
              className='relative h-11 w-11 rounded-2xl border border-slate-200 bg-white/80 text-slate-600 hover:bg-white transition'
              aria-label='Notifications'
            >
              <Bell className='h-5 w-5 mx-auto' />
              {unread > 0 ? (
                <span className='absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center'>
                  {unread > 99 ? '99+' : unread}
                </span>
              ) : null}
            </button>

            <div className='hidden sm:flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 h-11'>
              <span className='h-2 w-2 rounded-full bg-emerald-500' />
              <span className='text-[10px] font-black tracking-widest uppercase text-slate-700'>{role}</span>
            </div>

            <button
              onClick={logout}
              className='h-11 px-4 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-900/15 inline-flex items-center gap-2'
              type='button'
            >
              <LogOut className='h-4 w-4' />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminNavbar
