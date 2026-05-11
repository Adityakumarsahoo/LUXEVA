import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatINR } from '../../utils/money'
import { CreditCard, RefreshCcw, Search } from 'lucide-react'

const AdminPayments = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [query, setQuery] = useState('')

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/admin/transactions', { headers: { token: adminToken } })
      if (res.data.success) {
        setTransactions(res.data.transactions || [])
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
    fetchTransactions()
  }, [adminToken])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return transactions
    return transactions.filter((t) => {
      const hay = `${t.orderId || ''} ${t.userId || ''} ${t.method || ''} ${t.status || ''} ${t.provider || ''} ${t.providerRef || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [transactions, query])

  return (
    <div className='w-full'>
      <div className='rounded-[2.5rem] border border-sky-100 bg-white shadow-sm overflow-hidden'>
        <div className='relative p-8'>
          <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50' />
          <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
          <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />
          <div className='relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6'>
            <div>
              <p className='text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase'>Payments</p>
              <p className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>Transactions</p>
              <p className='mt-2 text-sm font-semibold text-slate-500'>Audit payment events for COD / Stripe / Razorpay.</p>
            </div>
            <button
              type='button'
              onClick={fetchTransactions}
              className='h-11 px-5 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20 flex items-center gap-2'
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative w-full'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search by order / user / method / status…'
            className='w-full h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all'
          />
        </div>
        <div className='inline-flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3'>
          <div className='h-9 w-9 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center'>
            <CreditCard className='w-4 h-4 text-sky-700' />
          </div>
          <div className='leading-tight'>
            <p className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Total</p>
            <p className='text-sm font-black text-slate-900'>{filtered.length}</p>
          </div>
        </div>
      </div>

      <div className='mt-6 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm'>
        <div className='hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] bg-slate-50 px-6 py-4 text-[11px] font-black tracking-widest text-slate-500 uppercase'>
          <div>Order</div>
          <div>User</div>
          <div>Method</div>
          <div>Status</div>
          <div>Amount</div>
        </div>

        {loading ? (
          <div className='p-6 text-sm font-semibold text-slate-500'>Loading transactions…</div>
        ) : (
          <div className='flex flex-col'>
            {filtered.map((t) => (
              <div
                key={t._id}
                className='grid grid-cols-1 gap-2 border-t border-slate-100 px-6 py-5 text-sm md:grid-cols-[2fr_2fr_1fr_1fr_1fr] md:items-center hover:bg-slate-50/60 transition-colors'
              >
                <div>
                  <p className='font-black text-slate-900'>{t.orderId ? String(t.orderId).slice(-6).toUpperCase() : '-'}</p>
                  <p className='text-[11px] font-semibold text-slate-500'>{t.provider ? `${t.provider}:${t.providerRef || '-'}` : '-'}</p>
                </div>
                <p className='text-slate-700 font-semibold'>{t.userId ? String(t.userId).slice(-8).toUpperCase() : '-'}</p>
                <p className='text-slate-700 font-semibold'>{t.method || '-'}</p>
                <p className='text-slate-700 font-semibold'>{t.status || '-'}</p>
                <p className='font-black text-slate-900'>{formatINR(t.amount || 0)}</p>
              </div>
            ))}
            {filtered.length === 0 && <div className='p-6 text-sm font-semibold text-slate-500'>No transactions found.</div>}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPayments
