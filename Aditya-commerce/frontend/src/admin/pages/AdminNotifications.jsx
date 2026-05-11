import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Bell, CheckCircle2, Trash2, RefreshCcw, Filter, UserPlus, Briefcase, ShoppingCart, Mail } from 'lucide-react'

const typeMeta = (t) => {
  const type = String(t || '')
  if (type === 'seller_approval') return { icon: UserPlus, color: 'bg-amber-100 text-amber-700', label: 'Approvals' }
  if (type === 'career_application') return { icon: Briefcase, color: 'bg-sky-100 text-sky-700', label: 'Careers' }
  if (type === 'order') return { icon: ShoppingCart, color: 'bg-emerald-100 text-emerald-700', label: 'Orders' }
  if (type === 'subscription') return { icon: Mail, color: 'bg-indigo-100 text-indigo-700', label: 'Subscriptions' }
  return { icon: Bell, color: 'bg-slate-100 text-slate-700', label: 'General' }
}

const AdminNotifications = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [loading, setLoading] = useState(true)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [type, setType] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/notification/admin/list', {
        headers: { token: adminToken },
        params: { unreadOnly: unreadOnly ? true : undefined, type: type === 'all' ? undefined : type, limit: 120 },
      })
      if (res.data?.success) {
        setNotifications(res.data.notifications || [])
        setUnreadCount(Number(res.data.unreadCount || 0))
      } else toast.error(res.data?.message || 'Failed to load notifications')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [adminToken, unreadOnly, type])

  const groupedCount = useMemo(() => {
    const c = { all: notifications.length }
    for (const n of notifications) {
      const k = String(n.type || 'generic')
      c[k] = (c[k] || 0) + 1
    }
    return c
  }, [notifications])

  const markRead = async (id) => {
    try {
      const res = await axios.post(backendUrl + '/api/notification/admin/read', { id, read: true }, { headers: { token: adminToken } })
      if (res.data?.success) fetchNotifications()
      else toast.error(res.data?.message || 'Failed to update')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const markAllRead = async () => {
    try {
      const res = await axios.post(backendUrl + '/api/notification/admin/read-all', {}, { headers: { token: adminToken } })
      if (res.data?.success) fetchNotifications()
      else toast.error(res.data?.message || 'Failed to update')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const remove = async (id) => {
    try {
      const res = await axios.post(backendUrl + '/api/notification/admin/delete', { id }, { headers: { token: adminToken } })
      if (res.data?.success) fetchNotifications()
      else toast.error(res.data?.message || 'Failed to delete')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const types = [
    { id: 'all', label: 'All' },
    { id: 'seller_approval', label: 'Approvals' },
    { id: 'career_application', label: 'Careers' },
    { id: 'order', label: 'Orders' },
    { id: 'subscription', label: 'Subscriptions' },
  ]

  return (
    <div className='w-full'>
      <div className='rounded-[2.5rem] border border-sky-100 bg-white shadow-sm overflow-hidden'>
        <div className='relative p-8'>
          <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50' />
          <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
          <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />
          <div className='relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6'>
            <div>
              <p className='text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase'>Notifications</p>
              <p className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>Admin Inbox</p>
              <p className='mt-2 text-sm font-semibold text-slate-500'>Seller approvals, career applications, orders, and subscriptions.</p>
            </div>
            <div className='flex flex-col sm:flex-row gap-3'>
              <button
                type='button'
                onClick={fetchNotifications}
                className='h-11 px-5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-[11px] font-black tracking-widest uppercase hover:bg-slate-50 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2'
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type='button'
                onClick={markAllRead}
                className='h-11 px-5 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-900/15'
              >
                Mark All Read
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-wrap items-center gap-2'>
          {types.map((t) => (
            <button
              key={t.id}
              type='button'
              onClick={() => setType(t.id)}
              className={`h-10 px-4 rounded-2xl border text-[11px] font-black tracking-widest uppercase transition ${
                type === t.id ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.label} {groupedCount[t.id === 'all' ? 'all' : t.id] ? `(${groupedCount[t.id === 'all' ? 'all' : t.id]})` : ''}
            </button>
          ))}
        </div>
        <div className='flex items-center gap-3'>
          <div className='inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3'>
            <div className='h-9 w-9 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center'>
              <Bell className='w-4 h-4 text-rose-700' />
            </div>
            <div className='leading-tight'>
              <p className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Unread</p>
              <p className='text-sm font-black text-slate-900'>{unreadCount}</p>
            </div>
          </div>
          <button
            type='button'
            onClick={() => setUnreadOnly((v) => !v)}
            className={`h-11 px-5 rounded-2xl border text-[11px] font-black tracking-widest uppercase transition inline-flex items-center gap-2 ${
              unreadOnly ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className='w-4 h-4' />
            {unreadOnly ? 'Unread Only' : 'All'}
          </button>
        </div>
      </div>

      <div className='mt-6 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm'>
        {loading ? (
          <div className='p-8 text-sm font-semibold text-slate-600'>Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div className='p-8 text-sm font-semibold text-slate-600'>No notifications.</div>
        ) : (
          <div className='divide-y divide-slate-100'>
            {notifications.map((n) => {
              const meta = typeMeta(n.type)
              const Icon = meta.icon
              return (
                <div key={n._id} className='p-6 sm:p-7 hover:bg-slate-50/60 transition'>
                  <div className='flex items-start gap-4'>
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${meta.color}`}>
                      <Icon className='w-6 h-6' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <p className='text-sm font-black text-slate-900 truncate'>{n.title}</p>
                          <p className='mt-1 text-sm font-semibold text-slate-600 leading-relaxed'>{n.message}</p>
                          <div className='mt-2 flex flex-wrap items-center gap-2'>
                            <span className='rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black tracking-widest uppercase text-slate-700'>
                              {meta.label}
                            </span>
                            {!n.read ? (
                              <span className='rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-black tracking-widest uppercase text-rose-700'>
                                Unread
                              </span>
                            ) : (
                              <span className='rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black tracking-widest uppercase text-slate-600'>
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          {!n.read ? (
                            <button
                              type='button'
                              onClick={() => markRead(n._id)}
                              className='h-10 w-10 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition inline-flex items-center justify-center'
                              title='Mark read'
                            >
                              <CheckCircle2 className='w-5 h-5' />
                            </button>
                          ) : null}
                          <button
                            type='button'
                            onClick={() => remove(n._id)}
                            className='h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-rose-700 transition inline-flex items-center justify-center'
                            title='Delete'
                          >
                            <Trash2 className='w-5 h-5' />
                          </button>
                        </div>
                      </div>
                      <p className='mt-2 text-[11px] font-semibold text-slate-400'>
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminNotifications

