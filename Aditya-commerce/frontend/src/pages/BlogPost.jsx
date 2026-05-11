import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { ShopContext } from '../context/ShopContext'

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return ''
  }
}

const BlogPost = () => {
  const { backendUrl } = useContext(ShopContext)
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState(null)

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/blog/posts/' + encodeURIComponent(slug || ''))
      if (res.data?.success) setPost(res.data.post)
      else toast.error(res.data?.message || 'Post not found')
    } catch (e) {
      toast.error(e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPost()
  }, [slug])

  const html = useMemo(() => {
    const s = String(post?.content || '').trim()
    if (!s) return ''
    if (s.includes('<p') || s.includes('<h') || s.includes('<ul') || s.includes('<br')) return s
    const lines = s.split('\n').map((x) => x.trim()).filter(Boolean)
    return lines.map((l) => `<p>${l.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`).join('')
  }, [post?.content])

  return (
    <div className='pb-20 pt-10 px-1'>
      {loading ? (
        <div className='rounded-[2.75rem] border border-slate-200 bg-white p-10 text-sm font-semibold text-slate-600 shadow-sm'>
          Loading article…
        </div>
      ) : !post ? (
        <div className='rounded-[2.75rem] border border-slate-200 bg-white p-10 text-sm font-semibold text-slate-600 shadow-sm'>
          Article not found.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className='space-y-6'
        >
          <div className='rounded-[2.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden'>
            <div className='relative p-8 sm:p-10'>
              <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50' />
              <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
              <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />

              <div className='relative z-10'>
                <div className='flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur px-4 py-2 text-[10px] font-black tracking-widest text-slate-400 uppercase w-fit'>
                  <Link to='/' className='hover:text-slate-900 transition-colors'>Home</Link>
                  <ChevronRight className='w-3 h-3 opacity-60' />
                  <Link to='/blog' className='hover:text-slate-900 transition-colors'>Blog</Link>
                  <ChevronRight className='w-3 h-3 opacity-60' />
                  <span className='text-slate-900'>{post.category || 'General'}</span>
                </div>

                <p className='mt-6 text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>
                  {post.authorName || 'Editorial'} · {formatDate(post.publishedAt)}
                </p>
                <h1 className='mt-2 text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 leading-[0.95]'>
                  {post.title}
                </h1>
                {post.excerpt ? (
                  <p className='mt-4 text-sm sm:text-base font-semibold text-slate-600 leading-relaxed max-w-3xl'>
                    {post.excerpt}
                  </p>
                ) : null}

                <div className='mt-6 flex flex-wrap gap-2'>
                  {(post.tags || []).slice(0, 6).map((t) => (
                    <span key={t} className='rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5 text-[9px] font-black tracking-widest uppercase text-slate-700'>
                      {t}
                    </span>
                  ))}
                </div>

                <Link
                  to='/blog'
                  className='mt-7 inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-900/15'
                >
                  <ArrowLeft className='w-4 h-4' /> Back to Blog
                </Link>
              </div>
            </div>

            {post.coverImage ? (
              <div className='border-t border-slate-200 bg-slate-50 p-6 sm:p-8'>
                <div className='overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-sm'>
                  <div className='aspect-[16/9]'>
                    <img src={post.coverImage} alt='' loading='lazy' decoding='async' className='h-full w-full object-cover' />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
            <div className='lg:col-span-8 rounded-[2.75rem] border border-slate-200 bg-white p-7 sm:p-10 shadow-sm'>
              <div
                className='text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 [&_p]:font-semibold [&_p]:leading-relaxed [&_h2]:text-2xl [&_h2]:font-black [&_h2]:tracking-tight [&_h2]:text-slate-900 [&_h3]:text-xl [&_h3]:font-black [&_h3]:tracking-tight [&_h3]:text-slate-900'
                dangerouslySetInnerHTML={{ __html: html || '<p>Content coming soon.</p>' }}
              />
            </div>
            <div className='lg:col-span-4 space-y-6'>
              <div className='rounded-[2.75rem] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm'>
                <p className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>About</p>
                <p className='mt-2 text-xl font-black tracking-tight text-slate-900 uppercase'>LUXEVA Editorial</p>
                <p className='mt-3 text-sm font-semibold text-slate-600 leading-relaxed'>
                  Practical reads designed for premium shopping decisions across Fashion, Electronics, Home & Kitchen, and Lifestyle.
                </p>
                <Link
                  to='/collection'
                  className='mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20'
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default BlogPost
