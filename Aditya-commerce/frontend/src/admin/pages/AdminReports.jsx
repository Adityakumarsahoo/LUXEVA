import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatINR } from '../../utils/money'
import { BarChart3, Boxes, RefreshCcw, ReceiptText, TrendingUp } from 'lucide-react'

const AdminReports = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState({ revenueByDay: [], topProducts: [], revenueByCategory: [] })

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/admin/reports', { headers: { token: adminToken } })
      if (res.data.success) {
        setReports(res.data.reports || { revenueByDay: [], topProducts: [], revenueByCategory: [] })
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
    fetchReports()
  }, [adminToken])

  const totals = useMemo(() => {
    const rev = (reports.revenueByDay || []).reduce((sum, d) => sum + (d.revenue || 0), 0)
    const ord = (reports.revenueByDay || []).reduce((sum, d) => sum + (d.orders || 0), 0)
    return { rev, ord }
  }, [reports])

  const chart = useMemo(() => {
    const days = Array.isArray(reports.revenueByDay) ? reports.revenueByDay.slice() : []
    const maxRev = Math.max(1, ...days.map((d) => Number(d?.revenue || 0)))
    const items = days.map((d) => ({
      key: String(d?._id || ''),
      orders: Number(d?.orders || 0),
      revenue: Number(d?.revenue || 0),
      h: Math.max(6, Math.round((Number(d?.revenue || 0) / maxRev) * 100)),
    }))

    const last = items[items.length - 1]
    const prev = items[items.length - 2]
    const delta = last && prev ? Math.round(((last.revenue - prev.revenue) / Math.max(1, prev.revenue)) * 100) : 0

    return { items, maxRev, today: last || null, delta }
  }, [reports.revenueByDay])

  const target = useMemo(() => {
    const base = Math.max(1, Number(totals.rev || 0))
    const t = Math.round((base * 1.32) / 10) * 10
    return Math.max(20000, t)
  }, [totals.rev])

  const targetPct = useMemo(() => {
    const pct = (Number(totals.rev || 0) / Math.max(1, target)) * 100
    return Math.max(0, Math.min(100, Math.round(pct * 100) / 100))
  }, [totals.rev, target])

  return (
    <div className='w-full'>
      <div className='flex items-end justify-between gap-6'>
        <div>
          <div className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Reports</div>
          <div className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>Analytics</div>
          <div className='mt-2 text-sm font-semibold text-slate-500'>Sales insights, revenue, and top-selling products.</div>
        </div>
        <button
          type='button'
          onClick={fetchReports}
          className='h-11 px-5 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20 flex items-center gap-2'
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className='mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500'>Loading…</div>
      ) : (
        <div className='mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12'>
          <div className='xl:col-span-8 grid grid-cols-1 gap-6 sm:grid-cols-2'>
            {[
              { label: 'Revenue (14 days)', value: formatINR(totals.rev), icon: TrendingUp, delta: chart.delta, deltaTone: chart.delta >= 0 ? 'emerald' : 'rose' },
              { label: 'Orders (14 days)', value: totals.ord, icon: ReceiptText, delta: 0, deltaTone: 'slate' },
              { label: 'Top Products', value: (reports.topProducts || []).length, icon: Boxes, delta: 0, deltaTone: 'slate' },
              { label: 'Categories', value: (reports.revenueByCategory || []).length, icon: BarChart3, delta: 0, deltaTone: 'slate' },
            ].map((card) => {
              const deltaBadge =
                card.deltaTone === 'emerald'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : card.deltaTone === 'rose'
                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200'

              return (
                <div key={card.label} className='rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='min-w-0'>
                      <div className='text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase'>{card.label}</div>
                      <div className='mt-3 text-3xl font-black tracking-tighter text-slate-900 truncate'>{card.value}</div>
                    </div>
                    <div className='h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700'>
                      <card.icon className='h-6 w-6' />
                    </div>
                  </div>
                  {card.deltaTone !== 'slate' && (
                    <div className='mt-5'>
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black tracking-widest uppercase ${deltaBadge}`}>
                        {card.delta >= 0 ? `+${card.delta}%` : `${card.delta}%`}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}

            <div className='sm:col-span-2 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <div className='text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase'>Monthly Sales</div>
                  <div className='mt-2 text-lg font-black text-slate-900'>Revenue by Day</div>
                  <div className='mt-1 text-sm font-semibold text-slate-500'>Last 14 days (paid orders).</div>
                </div>
              </div>

              <div className='mt-6'>
                <div className='h-40 flex items-end gap-2'>
                  {chart.items.map((d) => (
                    <div key={d.key} className='flex-1 min-w-0 flex flex-col items-center gap-2'>
                      <div className='w-full rounded-2xl bg-slate-100 overflow-hidden'>
                        <div className='w-full bg-sky-600 rounded-2xl' style={{ height: `${d.h}%` }} />
                      </div>
                      <div className='text-[10px] font-black tracking-widest text-slate-400 uppercase truncate w-full text-center'>
                        {String(d.key).slice(5)}
                      </div>
                    </div>
                  ))}
                  {chart.items.length === 0 && <div className='text-sm font-semibold text-slate-500'>No data.</div>}
                </div>
              </div>
            </div>
          </div>

          <div className='xl:col-span-4 space-y-6'>
            <div className='rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <div className='text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase'>Monthly Target</div>
                  <div className='mt-2 text-lg font-black text-slate-900'>Target you’ve set for this month</div>
                </div>
              </div>

              <div className='mt-6 flex items-center justify-center'>
                <div
                  className='h-44 w-44 rounded-full flex items-center justify-center'
                  style={{
                    background: `conic-gradient(#3b82f6 ${targetPct}%, #e5e7eb 0)`,
                  }}
                >
                  <div className='h-[150px] w-[150px] rounded-full bg-white flex flex-col items-center justify-center text-center'>
                    <div className='text-3xl font-black tracking-tighter text-slate-900'>{targetPct.toFixed(2)}%</div>
                    <div className='mt-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-[10px] font-black tracking-widest uppercase'>
                      {chart.delta >= 0 ? '+10%' : '-10%'}
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-6 text-sm font-semibold text-slate-500 text-center'>
                You earned {formatINR(totals.rev)} in the last 14 days. Keep up your good work!
              </div>

              <div className='mt-6 grid grid-cols-3 gap-3'>
                <div className='rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center'>
                  <div className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Target</div>
                  <div className='mt-2 text-sm font-black text-slate-900'>{formatINR(target)}</div>
                </div>
                <div className='rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center'>
                  <div className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Revenue</div>
                  <div className='mt-2 text-sm font-black text-slate-900'>{formatINR(totals.rev)}</div>
                </div>
                <div className='rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center'>
                  <div className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Today</div>
                  <div className='mt-2 text-sm font-black text-slate-900'>{formatINR(chart.today?.revenue || 0)}</div>
                </div>
              </div>
            </div>

            <div className='rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm'>
              <div className='text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase'>Categories</div>
              <div className='mt-2 text-lg font-black text-slate-900'>Revenue by Category</div>
              <div className='mt-1 text-sm font-semibold text-slate-500'>Based on paid order items.</div>
              <div className='mt-5 space-y-2'>
                {(reports.revenueByCategory || []).slice(0, 6).map((c) => (
                  <div key={c._id} className='flex items-center justify-between gap-4 text-sm rounded-2xl border border-slate-200 px-4 py-3'>
                    <div className='text-slate-700 font-bold truncate'>{c._id}</div>
                    <div className='flex items-center gap-3'>
                      <div className='text-slate-500 font-semibold'>Qty {c.quantity || 0}</div>
                      <div className='font-black text-slate-900'>{formatINR(c.revenue || 0)}</div>
                    </div>
                  </div>
                ))}
                {(reports.revenueByCategory || []).length === 0 && <div className='text-sm font-semibold text-slate-500'>No data.</div>}
              </div>
            </div>
          </div>

          <div className='xl:col-span-12 rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-sm'>
            <div className='flex items-center justify-between px-6 py-6'>
              <div>
                <div className='text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase'>Top Products</div>
                <div className='mt-2 text-lg font-black text-slate-900'>Top Selling Products</div>
                <div className='mt-1 text-sm font-semibold text-slate-500'>Top items by revenue.</div>
              </div>
            </div>
            <div className='hidden md:grid grid-cols-[3fr_2fr_1fr_1fr] bg-slate-50 px-6 py-4 text-[11px] font-black tracking-widest text-slate-500 uppercase border-t border-slate-200'>
              <div>Product</div>
              <div>Category</div>
              <div>Qty</div>
              <div>Revenue</div>
            </div>
            <div className='flex flex-col'>
              {(reports.topProducts || []).map((p) => (
                <div key={p._id} className='grid grid-cols-1 gap-2 border-t border-slate-200 px-6 py-5 text-sm md:grid-cols-[3fr_2fr_1fr_1fr] md:items-center hover:bg-slate-50/60 transition-colors'>
                  <div>
                    <p className='font-black text-slate-900'>{p.name || 'Product'}</p>
                    <p className='text-[11px] font-semibold text-slate-500'>{p.subCategory || ''}</p>
                  </div>
                  <p className='text-slate-700 font-semibold'>{p.category || 'Uncategorized'}</p>
                  <p className='text-slate-700 font-semibold'>{p.quantity || 0}</p>
                  <p className='font-black text-slate-900'>{formatINR(p.revenue || 0)}</p>
                </div>
              ))}
              {(reports.topProducts || []).length === 0 && <div className='p-6 text-sm font-semibold text-slate-500'>No data.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReports
