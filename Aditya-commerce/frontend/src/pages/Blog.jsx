import React, { useContext, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { ArrowRight, Bookmark, ChevronRight, Flame, Search } from 'lucide-react'
import { ShopContext } from '../context/ShopContext'

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

const Blog = () => {
  const { backendUrl } = useContext(ShopContext)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [featured, setFeatured] = useState(null)
  const [trending, setTrending] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [featuredRes, trendingRes, listRes] = await Promise.all([
        axios.get(backendUrl + '/api/blog/posts', { params: { featured: true, limit: 1 } }),
        axios.get(backendUrl + '/api/blog/posts', { params: { trending: true, limit: 6 } }),
        axios.get(backendUrl + '/api/blog/posts', { params: { search: search || undefined, category: category === 'All' ? undefined : category, limit: 18 } }),
      ])
      if (featuredRes.data?.success) setFeatured((featuredRes.data.posts || [])[0] || null)
      if (trendingRes.data?.success) setTrending(trendingRes.data.posts || [])
      if (listRes.data?.success) setPosts(listRes.data.posts || [])
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchAll(), 250)
    return () => clearTimeout(t)
  }, [search, category])

  const categories = useMemo(() => {
    const set = new Set(['All'])
    for (const p of posts || []) if (p?.category) set.add(p.category)
    for (const p of trending || []) if (p?.category) set.add(p.category)
    if (featured?.category) set.add(featured.category)
    return Array.from(set)
  }, [posts, trending, featured])

  return (
    <div className='pb-20 pt-10 px-1'>
      <div className='rounded-[2.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden'>
        <div className='relative p-8 sm:p-10'>
          <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50' />
          <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
          <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />

          <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
            <div className='min-w-0'>
              <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur px-4 py-2 text-[10px] font-black tracking-widest text-slate-400 uppercase'>
                <Link to='/' className='hover:text-slate-900 transition-colors'>Home</Link>
                <ChevronRight className='w-3 h-3 opacity-60' />
                <span className='text-slate-900'>Company</span>
                <ChevronRight className='w-3 h-3 opacity-60' />
                <span className='text-slate-900'>Blog</span>
              </div>

              <p className='mt-6 text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase'>LUXEVA Editorial</p>
              <h1 className='mt-2 text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase'>The Blog</h1>
              <p className='mt-3 text-sm font-semibold text-slate-500 max-w-2xl'>
                Trends, guides, and deep dives across fashion, gadgets, home styling, and lifestyle.
              </p>
            </div>

            <div className='w-full lg:w-[420px]'>
              <div className='relative'>
                <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search articles…'
                  className='w-full h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all'
                />
              </div>
              <div className='mt-3 flex flex-wrap gap-2'>
                {categories.slice(0, 8).map((c) => (
                  <button
                    key={c}
                    type='button'
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-3.5 py-1.5 text-[9px] font-black tracking-widest uppercase transition ${
                      category === c ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {featured ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className='mt-8 overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white shadow-sm'
        >
          <div className='grid grid-cols-1 lg:grid-cols-12'>
            <div className='lg:col-span-7 p-7 sm:p-10'>
              <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black tracking-widest uppercase text-slate-700'>
                <Bookmark className='w-4 h-4 text-sky-700' />
                Featured
              </div>
              <p className='mt-4 text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>
                {featured.category} · {formatDate(featured.publishedAt)}
              </p>
              <p className='mt-2 text-3xl sm:text-4xl font-black tracking-tighter text-slate-900'>
                {featured.title}
              </p>
              <p className='mt-4 text-sm font-semibold text-slate-600 leading-relaxed max-w-2xl'>
                {featured.excerpt || 'A premium read curated by the Luxeva editorial team.'}
              </p>
              <Link
                to={`/blog/${featured.slug}`}
                className='mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98]'
              >
                Read Article <ArrowRight className='w-4 h-4' />
              </Link>
            </div>
            <div className='lg:col-span-5 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 sm:p-8'>
              <div className='h-full w-full rounded-[2.25rem] bg-white border border-slate-200 overflow-hidden flex items-center justify-center'>
                {featured.coverImage ? (
                  <img src={featured.coverImage} alt='' loading='lazy' decoding='async' className='h-full w-full object-cover' />
                ) : (
                  <div className='h-full w-full bg-gradient-to-br from-sky-50 via-white to-blue-50' />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      <div className='mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6'>
        <div className='lg:col-span-8'>
          <div className='flex items-end justify-between gap-4'>
            <div>
              <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Latest</p>
              <p className='mt-2 text-2xl font-black tracking-tight text-slate-900 uppercase'>Articles</p>
            </div>
          </div>

          <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm'>
                  <div className='h-40 rounded-2xl bg-slate-100 animate-pulse' />
                  <div className='mt-4 h-4 w-2/3 rounded bg-slate-100 animate-pulse' />
                  <div className='mt-2 h-3 w-full rounded bg-slate-100 animate-pulse' />
                  <div className='mt-2 h-3 w-5/6 rounded bg-slate-100 animate-pulse' />
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className='col-span-2 rounded-[2.5rem] border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-600'>
                No articles found. Publish posts from Admin to populate the blog.
              </div>
            ) : (
              posts.map((p, idx) => (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: Math.min(idx * 0.03, 0.2), ease: [0.22, 1, 0.36, 1] }}
                  className='group rounded-[2.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-xl transition'
                >
                  <div className='relative aspect-[16/10] bg-slate-50 flex items-center justify-center'>
                    {p.coverImage ? (
                      <img src={p.coverImage} alt='' loading='lazy' decoding='async' className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]' />
                    ) : (
                      <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50' />
                    )}
                    <div className='absolute inset-0 bg-gradient-to-tr from-black/65 via-black/10 to-transparent opacity-90' />
                    <div className='absolute left-5 top-5 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-black tracking-widest uppercase text-white backdrop-blur'>
                      {p.category || 'General'}
                    </div>
                  </div>
                  <div className='p-6'>
                    <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>
                      {formatDate(p.publishedAt)} · {p.authorName || 'Editorial'}
                    </p>
                    <p className='mt-2 text-xl font-black tracking-tight text-slate-900 leading-tight'>
                      {p.title}
                    </p>
                    <p className='mt-3 text-sm font-semibold text-slate-600 leading-relaxed line-clamp-3'>
                      {p.excerpt || ''}
                    </p>
                    <Link
                      to={`/blog/${p.slug}`}
                      className='mt-4 inline-flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-sky-700 hover:text-sky-800 transition'
                    >
                      Read <ArrowRight className='w-4 h-4' />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <div className='rounded-[2.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden'>
            <div className='p-7 sm:p-8'>
              <div className='flex items-center gap-3'>
                <Flame className='w-5 h-5 text-rose-600' />
                <p className='text-2xl font-black tracking-tight text-slate-900 uppercase'>Trending</p>
              </div>
              <p className='mt-2 text-sm font-semibold text-slate-500'>Most-read articles this week.</p>
              <div className='mt-6 space-y-3'>
                {(trending || []).slice(0, 6).map((p) => (
                  <Link
                    key={p.slug}
                    to={`/blog/${p.slug}`}
                    className='group block rounded-[2rem] border border-slate-200 bg-white p-4 hover:bg-slate-50 transition'
                  >
                    <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>{p.category || 'General'}</p>
                    <p className='mt-2 text-sm font-black text-slate-900 leading-snug group-hover:text-sky-800 transition'>
                      {p.title}
                    </p>
                    <p className='mt-2 text-xs font-semibold text-slate-500'>{formatDate(p.publishedAt)}</p>
                  </Link>
                ))}
                {!loading && trending.length === 0 ? (
                  <div className='rounded-[2rem] border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600'>
                    No trending posts yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blog

