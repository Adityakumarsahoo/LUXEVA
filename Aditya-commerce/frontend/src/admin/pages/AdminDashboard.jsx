import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatINR } from '../../utils/money'
import { BarChart3, Mail, Package, ReceiptText, RefreshCcw, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const AdminDashboard = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, subscribers: 0, revenue: 0 })

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/admin/stats', { headers: { token: adminToken } })
      if (res.data.success) {
        setStats(res.data.stats || {})
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [adminToken])

  return (
    <div className='w-full'>
      <div className='rounded-[2.5rem] border border-sky-100 bg-white shadow-sm overflow-hidden'>
        <div className='relative p-8'>
          <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50' />
          <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
          <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />
          <div className='relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6'>
            <div>
              <p className='text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase'>Dashboard</p>
              <p className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>Store Overview</p>
              <p className='mt-2 text-sm font-semibold text-slate-500'>Revenue, orders, and user activity insights.</p>
            </div>
            <button
              type='button'
              onClick={fetchStats}
              className='h-11 px-5 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20 flex items-center gap-2'
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5'>
        {[
          { label: 'Products', value: stats.products || 0, icon: Package, tone: 'sky' },
          { label: 'Orders', value: stats.orders || 0, icon: ReceiptText, tone: 'indigo' },
          { label: 'Users', value: stats.users || 0, icon: Users, tone: 'emerald' },
          { label: 'Subscribers', value: stats.subscribers || 0, icon: Mail, tone: 'violet' },
          { label: 'Revenue', value: formatINR(stats.revenue || 0), icon: BarChart3, tone: 'amber' },
        ].map((card) => {
          const tone =
            card.tone === 'sky'
              ? { bg: 'bg-sky-50', border: 'border-sky-100', icon: 'text-sky-700' }
              : card.tone === 'indigo'
                ? { bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'text-indigo-700' }
                : card.tone === 'emerald'
                  ? { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-700' }
                  : card.tone === 'violet'
                    ? { bg: 'bg-violet-50', border: 'border-violet-100', icon: 'text-violet-700' }
                  : { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-700' }

          return (
            <div key={card.label} className='rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all'>
              <div className='flex items-center justify-between gap-4'>
                <div className='min-w-0'>
                  <p className='text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase'>{card.label}</p>
                  <p className='mt-2 text-3xl font-black tracking-tighter text-slate-900 truncate'>
                    {loading ? '—' : card.value}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-2xl ${tone.bg} ${tone.border} border flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${tone.icon}`} />
                </div>
              </div>
              {loading && <div className='mt-4 h-2 w-full rounded-full bg-slate-100 animate-pulse' />}
            </div>
          )
        })}
      </div>

      <div className='mt-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm'>
        <p className='text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase'>Quick Actions</p>
        <div className='mt-4 flex flex-wrap gap-3'>
          {[
            { label: 'Add Product', to: '/admin/add' },
            { label: 'View Orders', to: '/admin/orders' },
            { label: 'Manage Users', to: '/admin/users' },
            { label: 'Subscribers', to: '/admin/subscriptions' },
            { label: 'Reports', to: '/admin/reports' },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className='h-11 px-5 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-900/15 inline-flex items-center'
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
