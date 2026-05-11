import React, { useContext, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Briefcase, CheckCircle2, ChevronRight, MapPin, Send, ShieldCheck, Sparkles } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const toTitle = (value) =>
  String(value || '')
    .trim()
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const Careers = () => {
  const { backendUrl, navigate } = useContext(ShopContext)
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    portfolioUrl: '',
    resumeUrl: '',
    coverLetter: '',
  })

  const openings = useMemo(
    () => [
      {
        id: 'growth-marketing',
        title: 'Growth Marketing Associate',
        department: 'Marketing',
        location: 'Mumbai, India',
        type: 'Full-time',
        tags: ['Performance', 'CRM', 'Retention'],
        summary: 'Own acquisition and retention funnels with data-first experiments.',
      },
      {
        id: 'frontend-engineer',
        title: 'Frontend Engineer (React)',
        department: 'Engineering',
        location: 'Remote / India',
        type: 'Full-time',
        tags: ['React', 'Tailwind', 'Performance'],
        summary: 'Build fast, premium shopping experiences with modern UI patterns.',
      },
      {
        id: 'customer-support',
        title: 'Customer Support Specialist',
        department: 'Support',
        location: 'Mumbai, India',
        type: 'Full-time',
        tags: ['Tickets', 'Returns', 'Empathy'],
        summary: 'Deliver high-quality support for orders, returns, and refunds.',
      },
      {
        id: 'ops-delivery',
        title: 'Operations Coordinator (Delivery)',
        department: 'Operations',
        location: 'Mumbai, India',
        type: 'Full-time',
        tags: ['Logistics', 'SLA', 'Coordination'],
        summary: 'Coordinate delivery partner operations and improve fulfillment speed.',
      },
    ],
    []
  )

  const benefits = useMemo(
    () => [
      { title: 'Premium Culture', desc: 'High ownership, fast learning, and a quality-first mindset.' },
      { title: 'Flexible Work', desc: 'Remote-friendly roles and focus on outcomes over hours.' },
      { title: 'Growth Path', desc: 'Clear feedback loops, mentorship, and skill development.' },
      { title: 'Health & Wellness', desc: 'Support for a healthier, balanced routine.' },
    ],
    []
  )

  const applyFor = (job) => {
    setSelected(job)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!selected) return toast.error('Select a position to apply')
    setSubmitting(true)
    try {
      const res = await axios.post(backendUrl + '/api/careers/apply', {
        ...form,
        role: 'candidate',
        department: selected.department,
        positionId: selected.id,
        positionTitle: selected.title,
      })
      if (res.data?.success) {
        toast.success(res.data?.message || 'Application submitted')
        setForm({ name: '', email: '', phone: '', portfolioUrl: '', resumeUrl: '', coverLetter: '' })
        setSelected(null)
      } else toast.error(res.data?.message || 'Failed to submit')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='pb-20 pt-10 px-1'>
      <div className='rounded-[2.75rem] border border-sky-100 bg-white shadow-sm overflow-hidden'>
        <div className='relative p-8 sm:p-10'>
          <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50' />
          <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
          <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />

          <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
            <div className='min-w-0'>
              <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur px-4 py-2 text-[10px] font-black tracking-widest text-slate-400 uppercase'>
                <Link to='/' className='hover:text-slate-900 transition-colors'>Home</Link>
                <ChevronRight className='w-3 h-3 opacity-60' />
                <span className='text-slate-900'>Company</span>
                <ChevronRight className='w-3 h-3 opacity-60' />
                <span className='text-slate-900'>Careers</span>
              </div>

              <div className='mt-6 flex items-start gap-4'>
                <div className='h-12 w-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center'>
                  <Briefcase className='w-6 h-6 text-sky-700' />
                </div>
                <div className='min-w-0'>
                  <p className='text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase'>LUXEVA</p>
                  <h1 className='mt-2 text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase'>
                    Careers
                  </h1>
                  <p className='mt-3 text-sm font-semibold text-slate-500 max-w-2xl'>
                    Join a premium e-commerce team building fast, modern shopping experiences. Explore roles, culture, and apply in minutes.
                  </p>
                </div>
              </div>

              <div className='mt-6 flex flex-wrap gap-2'>
                {['Premium UI', 'Fast Growth', 'Remote Friendly'].map((t) => (
                  <span key={t} className='rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5 text-[9px] font-black tracking-widest uppercase text-slate-700'>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <button
              type='button'
              onClick={() => navigate('/collection')}
              className='h-11 px-5 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-900/15 inline-flex items-center justify-center gap-2'
            >
              Browse Store <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      <div className='mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6'>
        <div className='lg:col-span-7 space-y-6'>
          <div className='rounded-[2.5rem] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm'>
            <div className='flex items-center gap-3'>
              <Sparkles className='w-5 h-5 text-sky-700' />
              <p className='text-2xl font-black tracking-tight text-slate-900 uppercase'>Open Roles</p>
            </div>
            <p className='mt-2 text-sm font-semibold text-slate-500'>Choose a role and apply. Applications appear instantly in Admin Notifications.</p>

            <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {openings.map((job) => {
                const active = selected?.id === job.id
                return (
                  <button
                    key={job.id}
                    type='button'
                    onClick={() => applyFor(job)}
                    className={`text-left rounded-[2rem] border p-5 transition shadow-sm hover:shadow-md ${
                      active ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='text-sm font-black text-slate-900'>{job.title}</p>
                        <p className='mt-1 text-xs font-semibold text-slate-500'>{job.department} · {job.type}</p>
                      </div>
                      {active ? <CheckCircle2 className='w-5 h-5 text-sky-700 shrink-0' /> : null}
                    </div>
                    <div className='mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600'>
                      <MapPin className='w-4 h-4 text-slate-400' /> {job.location}
                    </div>
                    <p className='mt-3 text-sm font-semibold text-slate-600 leading-relaxed'>{job.summary}</p>
                    <div className='mt-4 flex flex-wrap gap-2'>
                      {job.tags.map((t) => (
                        <span key={t} className='rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black tracking-widest uppercase text-slate-700'>
                          {t}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className='rounded-[2.5rem] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm'>
            <div className='flex items-center gap-3'>
              <ShieldCheck className='w-5 h-5 text-sky-700' />
              <p className='text-2xl font-black tracking-tight text-slate-900 uppercase'>Culture & Benefits</p>
            </div>
            <p className='mt-2 text-sm font-semibold text-slate-500'>A modern team that ships, learns, and improves continuously.</p>
            <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {benefits.map((b) => (
                <div key={b.title} className='rounded-[2rem] border border-slate-200 bg-white p-5'>
                  <p className='text-sm font-black text-slate-900'>{b.title}</p>
                  <p className='mt-2 text-sm font-semibold text-slate-600 leading-relaxed'>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='lg:col-span-5'>
          <div className='sticky top-28'>
            <div className='rounded-[2.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden'>
              <div className='relative p-7 sm:p-8'>
                <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50' />
                <div className='relative z-10'>
                  <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Application</p>
                  <p className='mt-2 text-2xl font-black tracking-tight text-slate-900 uppercase'>
                    {selected ? toTitle(selected.title) : 'Select a Role'}
                  </p>
                  <p className='mt-2 text-sm font-semibold text-slate-500'>
                    Fill details and submit. Admin receives a notification instantly.
                  </p>

                  <AnimatePresence mode='wait'>
                    {!selected ? (
                      <motion.div
                        key='empty'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className='mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600'
                      >
                        Choose a job from the Open Roles section to unlock the application form.
                      </motion.div>
                    ) : (
                      <motion.form
                        key='form'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={submit}
                        className='mt-6 space-y-4'
                      >
                        <input
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder='Full name'
                          className='w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all'
                        />
                        <input
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder='Email address'
                          className='w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all'
                        />
                        <input
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder='Phone (optional)'
                          className='w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all'
                        />
                        <input
                          value={form.portfolioUrl}
                          onChange={(e) => setForm((p) => ({ ...p, portfolioUrl: e.target.value }))}
                          placeholder='Portfolio URL (optional)'
                          className='w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all'
                        />
                        <input
                          value={form.resumeUrl}
                          onChange={(e) => setForm((p) => ({ ...p, resumeUrl: e.target.value }))}
                          placeholder='Resume URL (optional)'
                          className='w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all'
                        />
                        <textarea
                          value={form.coverLetter}
                          onChange={(e) => setForm((p) => ({ ...p, coverLetter: e.target.value }))}
                          placeholder='Cover letter (optional)'
                          rows={5}
                          className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all'
                        />

                        <button
                          type='submit'
                          disabled={submitting}
                          className='w-full h-12 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-[0.25em] uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20 inline-flex items-center justify-center gap-2 disabled:opacity-60'
                        >
                          <Send className='w-4 h-4' />
                          {submitting ? 'Submitting…' : 'Apply Now'}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Careers

