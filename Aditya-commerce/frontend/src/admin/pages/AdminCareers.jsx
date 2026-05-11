import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Briefcase, RefreshCcw, Search, CheckCircle2, XCircle, Eye } from 'lucide-react'

const AdminCareers = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [active, setActive] = useState(null)

  const fetchApps = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/careers/admin/applications', {
        headers: { token: adminToken },
        params: { search: query || undefined, status: status === 'all' ? undefined : status, limit: 150 },
      })
      if (res.data?.success) setApplications(res.data.applications || [])
      else toast.error(res.data?.message || 'Failed to load applications')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [adminToken, status])

  useEffect(() => {
    const t = setTimeout(() => fetchApps(), 250)
    return () => clearTimeout(t)
  }, [query])

  const filtered = useMemo(() => applications, [applications])

  const setAppStatus = async (id, next) => {
    try {
      const res = await axios.post(
        backendUrl + '/api/careers/admin/applications/status',
        { id, status: next },
        { headers: { token: adminToken } }
      )
      if (res.data?.success) fetchApps()
      else toast.error(res.data?.message || 'Failed to update')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className='w-full'>
      <div className='rounded-[2.5rem] border border-sky-100 bg-white shadow-sm overflow-hidden'>
        <div className='relative p-8'>
          <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50' />
          <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
          <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />
          <div className='relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6'>
            <div>
              <p className='text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase'>Careers</p>
              <p className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>Applications</p>
              <p className='mt-2 text-sm font-semibold text-slate-500'>Review applicants and update status.</p>
            </div>
            <button
              type='button'
              onClick={fetchApps}
              className='h-11 px-5 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20 flex items-center gap-2'
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className='mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='relative w-full lg:max-w-xl'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search by name, email, position…'
            className='w-full h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all'
          />
        </div>
        <div className='flex items-center gap-3'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl'>
            <Briefcase className='w-4 h-4 text-slate-500' />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className='bg-transparent text-[11px] font-black text-slate-700 outline-none tracking-widest uppercase'
            >
              <option value='all'>All Status</option>
              <option value='new'>New</option>
              <option value='reviewed'>Reviewed</option>
              <option value='shortlisted'>Shortlisted</option>
              <option value='rejected'>Rejected</option>
            </select>
          </div>
          <div className='inline-flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3'>
            <div className='h-9 w-9 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center'>
              <Briefcase className='w-4 h-4 text-sky-700' />
            </div>
            <div className='leading-tight'>
              <p className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Total</p>
              <p className='text-sm font-black text-slate-900'>{filtered.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6'>
        <div className='lg:col-span-7 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm'>
          {loading ? (
            <div className='p-8 text-sm font-semibold text-slate-600'>Loading applications…</div>
          ) : filtered.length === 0 ? (
            <div className='p-8 text-sm font-semibold text-slate-600'>No applications found.</div>
          ) : (
            <div className='divide-y divide-slate-100'>
              {filtered.map((a) => (
                <button
                  key={a._id}
                  type='button'
                  onClick={() => setActive(a)}
                  className={`w-full text-left p-6 hover:bg-slate-50/60 transition flex items-start gap-4 ${
                    active?._id === a._id ? 'bg-slate-50/60' : ''
                  }`}
                >
                  <div className='h-12 w-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center'>
                    <Briefcase className='w-6 h-6 text-sky-700' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='text-sm font-black text-slate-900 truncate'>{a.name}</p>
                        <p className='mt-1 text-sm font-semibold text-slate-600 truncate'>{a.positionTitle || '-'}</p>
                        <p className='mt-1 text-[11px] font-semibold text-slate-400'>{a.email}</p>
                      </div>
                      <span className='rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black tracking-widest uppercase text-slate-700'>
                        {a.status}
                      </span>
                    </div>
                    <p className='mt-2 text-[11px] font-semibold text-slate-400'>{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className='lg:col-span-5'>
          <div className='rounded-[2.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden'>
            <div className='relative p-7 sm:p-8'>
              <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50' />
              <div className='relative z-10'>
                <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Details</p>
                {!active ? (
                  <div className='mt-5 rounded-[2rem] border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600'>
                    Select an application to view details.
                  </div>
                ) : (
                  <div className='mt-5 space-y-4'>
                    <div className='rounded-[2rem] border border-slate-200 bg-white p-5'>
                      <p className='text-sm font-black text-slate-900'>{active.name}</p>
                      <p className='mt-1 text-sm font-semibold text-slate-600'>{active.positionTitle || '-'}</p>
                      <p className='mt-2 text-sm font-semibold text-slate-700'>{active.email}</p>
                      {active.phone ? <p className='mt-1 text-sm font-semibold text-slate-700'>{active.phone}</p> : null}
                      {active.portfolioUrl ? (
                        <a href={active.portfolioUrl} target='_blank' rel='noreferrer' className='mt-3 inline-flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-sky-700 hover:text-sky-800 transition'>
                          <Eye className='w-4 h-4' /> Portfolio
                        </a>
                      ) : null}
                      {active.resumeUrl ? (
                        <a href={active.resumeUrl} target='_blank' rel='noreferrer' className='ml-3 mt-3 inline-flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-sky-700 hover:text-sky-800 transition'>
                          <Eye className='w-4 h-4' /> Resume
                        </a>
                      ) : null}
                    </div>

                    {active.coverLetter ? (
                      <div className='rounded-[2rem] border border-slate-200 bg-white p-5'>
                        <p className='text-[10px] font-black tracking-widest uppercase text-slate-400'>Cover Letter</p>
                        <p className='mt-2 text-sm font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed'>{active.coverLetter}</p>
                      </div>
                    ) : null}

                    <div className='grid grid-cols-2 gap-3'>
                      <button
                        type='button'
                        onClick={() => setAppStatus(active._id, 'reviewed')}
                        className='h-11 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2'
                      >
                        <CheckCircle2 className='w-4 h-4' /> Reviewed
                      </button>
                      <button
                        type='button'
                        onClick={() => setAppStatus(active._id, 'shortlisted')}
                        className='h-11 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20 inline-flex items-center justify-center gap-2'
                      >
                        <CheckCircle2 className='w-4 h-4' /> Shortlist
                      </button>
                      <button
                        type='button'
                        onClick={() => setAppStatus(active._id, 'rejected')}
                        className='h-11 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-[11px] font-black tracking-widest uppercase hover:bg-rose-100 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 col-span-2'
                      >
                        <XCircle className='w-4 h-4' /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCareers

