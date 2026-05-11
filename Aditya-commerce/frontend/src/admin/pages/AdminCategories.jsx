import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const AdminCategories = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const adminRole = localStorage.getItem('adminRole') || 'admin'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [icon, setIcon] = useState('')
  const [sortOrder, setSortOrder] = useState(0)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/admin/categories', { headers: { token: adminToken } })
      if (res.data.success) {
        setCategories(res.data.categories || [])
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
    fetchCategories()
  }, [adminToken])

  const addCategory = async (e) => {
    e.preventDefault()
    if (adminRole !== 'superadmin') {
      toast.info('Only Super Admin can add categories')
      return
    }
    setSaving(true)
    try {
      const res = await axios.post(
        backendUrl + '/api/admin/categories/add',
        { name, slug, icon, sortOrder },
        { headers: { token: adminToken } }
      )
      if (res.data.success) {
        toast.success(res.data.message || 'Added')
        setName('')
        setSlug('')
        setIcon('')
        setSortOrder(0)
        await fetchCategories()
      } else {
        toast.error(res.data.message)
      }
    } catch (e2) {
      toast.error(e2.message)
    } finally {
      setSaving(false)
    }
  }

  const updateCategory = async (id, patch) => {
    if (adminRole !== 'superadmin') {
      toast.info('Only Super Admin can update categories')
      return
    }
    try {
      const res = await axios.post(backendUrl + '/api/admin/categories/update', { id, ...patch }, { headers: { token: adminToken } })
      if (res.data.success) {
        toast.success(res.data.message || 'Updated')
        await fetchCategories()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  const removeCategory = async (id) => {
    if (adminRole !== 'superadmin') {
      toast.info('Only Super Admin can remove categories')
      return
    }
    try {
      const res = await axios.post(backendUrl + '/api/admin/categories/remove', { id }, { headers: { token: adminToken } })
      if (res.data.success) {
        toast.success(res.data.message || 'Removed')
        await fetchCategories()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  const rows = useMemo(() => categories || [], [categories])

  return (
    <div className='w-full'>
      <div className='flex items-end justify-between'>
        <div>
          <p className='text-lg font-semibold text-gray-900'>Categories</p>
          <p className='text-sm text-gray-600'>Add, edit, and disable categories (DB-backed).</p>
        </div>
        <button
          type='button'
          onClick={fetchCategories}
          className='rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50'
        >
          Refresh
        </button>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12'>
        <div className='lg:col-span-4'>
          <form onSubmit={addCategory} className='rounded-2xl border border-gray-200 bg-white p-6'>
            <p className='text-base font-semibold text-gray-900'>Add Category</p>
            <p className='mt-1 text-sm text-gray-600'>Super admin only.</p>
            <div className='mt-4 space-y-3'>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                placeholder='Name (e.g., Electronics)'
                required
                disabled={adminRole !== 'superadmin'}
              />
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                placeholder='Slug (optional, e.g., electronics)'
                disabled={adminRole !== 'superadmin'}
              />
              <input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                placeholder='Icon (optional)'
                disabled={adminRole !== 'superadmin'}
              />
              <input
                type='number'
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value || 0))}
                className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                placeholder='Sort order'
                disabled={adminRole !== 'superadmin'}
              />
              <button
                type='submit'
                disabled={saving || adminRole !== 'superadmin'}
                className='w-full rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60'
              >
                {saving ? 'Saving...' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>

        <div className='lg:col-span-8'>
          <div className='rounded-2xl border border-gray-200 bg-white overflow-hidden'>
            <div className='hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] bg-gray-50 px-4 py-3 text-sm text-gray-700'>
              <b>Name</b>
              <b>Slug</b>
              <b>Active</b>
              <b>Order</b>
              <b className='text-center'>Action</b>
            </div>

            {loading ? (
              <div className='p-6 text-sm text-gray-600'>Loading...</div>
            ) : (
              <div className='flex flex-col'>
                {rows.map((c) => (
                  <div
                    key={c._id}
                    className='grid grid-cols-1 gap-3 border-t px-4 py-4 text-sm md:grid-cols-[2fr_2fr_1fr_1fr_1fr] md:items-center'
                  >
                    <div>
                      <p className='font-semibold text-gray-900'>{c.name}</p>
                      {c.icon && <p className='text-xs text-gray-500'>{c.icon}</p>}
                    </div>
                    <p className='text-gray-700'>{c.slug}</p>
                    <div>
                      <input
                        type='checkbox'
                        checked={c.isActive !== false}
                        disabled={adminRole !== 'superadmin'}
                        onChange={() => updateCategory(c._id, { isActive: !(c.isActive !== false) })}
                      />
                    </div>
                    <input
                      type='number'
                      value={Number(c.sortOrder || 0)}
                      disabled={adminRole !== 'superadmin'}
                      onChange={(e) => updateCategory(c._id, { sortOrder: Number(e.target.value || 0) })}
                      className='w-24 rounded-lg border border-gray-300 px-2 py-1 text-sm'
                    />
                    <div className='flex items-center justify-end gap-2 md:justify-center'>
                      <button
                        type='button'
                        disabled={adminRole !== 'superadmin'}
                        onClick={() => removeCategory(c._id)}
                        className='rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60'
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {rows.length === 0 && <div className='p-6 text-sm text-gray-600'>No categories yet.</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCategories
