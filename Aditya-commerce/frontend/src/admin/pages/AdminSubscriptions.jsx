import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Mail, RefreshCcw, Search } from 'lucide-react'

const AdminSubscriptions = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [subscriptions, setSubscriptions] = useState([])

  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/subscription/list', {
        headers: { token: adminToken },
        params: { limit: 200 },
      })
      if (res.data?.success) setSubscriptions(res.data.subscriptions || [])
      else toast.error(res.data?.message || 'Failed to load subscriptions')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [adminToken])

  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    if (!q) return subscriptions
    return subscriptions.filter((s) => String(s?.email || '').toLowerCase().includes(q))
  }, [subscriptions, query])

  return (
    <div className='w-full'>
      <div className='rounded-[2.5rem] border border-sky-100 bg-white shadow-sm overflow-hidden'>
        <div className='relative p-8'>
          <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50' />
          <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
          <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />
          <div className='relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6'>
            <div>
              <p className='text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase'>Newsletter</p>
              <p className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>Subscribers</p>
              <p className='mt-2 text-sm font-semibold text-slate-500'>Emails captured from the storefront newsletter form.</p>
            </div>
            <button
              type='button'
              onClick={fetchSubscriptions}
              className='h-11 px-5 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20 flex items-center gap-2'
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3'>
          <div className='h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center'>
            <Mail className='w-5 h-5 text-indigo-700' />
          </div>
          <div className='leading-tight'>
            <p className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Total</p>
            <p className='text-base font-black text-slate-900'>{loading ? '—' : subscriptions.length}</p>
          </div>
        </div>

        <div className='relative w-full sm:max-w-md'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search email...'
            className='w-full h-11 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 outline-none transition hover:border-slate-300'
          />
        </div>
      </div>

      <div className='mt-6 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm'>
        {loading ? (
          <div className='p-8 text-sm font-semibold text-slate-600'>Loading subscribers…</div>
        ) : filtered.length === 0 ? (
          <div className='p-8 text-sm font-semibold text-slate-600'>No subscribers found.</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='bg-slate-50 border-b border-slate-200'>
                <tr>
                  <th className='text-left px-6 py-4 text-[10px] font-black tracking-[0.35em] uppercase text-slate-400'>Email</th>
                  <th className='text-left px-6 py-4 text-[10px] font-black tracking-[0.35em] uppercase text-slate-400'>Subscribed</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {filtered.map((s) => (
                  <tr key={s._id} className='hover:bg-slate-50/60 transition'>
                    <td className='px-6 py-5'>
                      <div className='text-sm font-black text-slate-900'>{s.email}</div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='text-sm font-semibold text-slate-600'>
                        {s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSubscriptions

