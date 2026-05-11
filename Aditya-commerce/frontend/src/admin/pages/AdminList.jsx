import axios from 'axios'
import React, { useCallback, useEffect, useMemo, useState, useContext } from 'react'
import { toast } from 'react-toastify'
import { ShopContext } from '../../context/ShopContext'
import { DEFAULT_PLACEHOLDER_IMAGE, normalizeProductImages } from '../../utils/defaultProducts'
import { formatINR } from '../../utils/money'
import CategoryTreeSelect from '../../components/CategoryTreeSelect'
import { getLabels } from '../../config/categoryTree'

const AdminList = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const formatPrice = (value) => formatINR(value)

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const { products: contextProducts } = useContext(ShopContext)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [viewMode, setViewMode] = useState('grouped')

  const [editing, setEditing] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editImages, setEditImages] = useState([null, null, null, null])
  const [editImageUrls, setEditImageUrls] = useState('')
  const [editVideoUrls, setEditVideoUrls] = useState('')
  const [replaceImages, setReplaceImages] = useState(false)

  const fetchList = async () => {
    setLoading(true)
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        const apiItems = Array.isArray(response.data.products) ? response.data.products : []
        
        // Merge with contextProducts if apiItems is empty or doesn't contain default products
        let items = apiItems
        if (items.length === 0 && contextProducts && contextProducts.length > 0) {
          items = contextProducts
        }

        setList(items.reverse().map(normalizeProductImages))
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const categoryPathFor = useCallback((p) => {
    const main = String(p?.mainCategory || '').trim()
    const section = String(p?.section || '').trim()
    const leaf = String(p?.categorySlug || '').trim()
    if (main && section && leaf) {
      const labels = getLabels(main, section, leaf)
      if (labels.mainCategoryLabel && labels.sectionLabel && labels.categoryLabel) {
        return `${labels.mainCategoryLabel} / ${labels.sectionLabel} / ${labels.categoryLabel}`
      }
    }
    const a = String(p?.category || '').trim()
    const b = String(p?.subCategory || '').trim()
    if (a && b) return `${a} / ${b}`
    return a || 'Uncategorized'
  }, [])

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase()
    return list.filter((p) => {
      if (categoryFilter?.mainCategory) {
        const okMain = String(p?.mainCategory || '').toLowerCase() === String(categoryFilter.mainCategory || '').toLowerCase()
        if (!okMain) return false
        if (categoryFilter.section) {
          const okSection = String(p?.section || '').toLowerCase() === String(categoryFilter.section || '').toLowerCase()
          if (!okSection) return false
        }
        if (categoryFilter.categorySlug) {
          const okLeaf = String(p?.categorySlug || '').toLowerCase() === String(categoryFilter.categorySlug || '').toLowerCase()
          if (!okLeaf) return false
        }
      }
      if (!q) return true
      const hay = `${p.name || ''} ${p.category || ''} ${p.subCategory || ''} ${p.brand || ''} ${categoryPathFor(p)}`.toLowerCase()
      return hay.includes(q)
    })
  }, [list, query, categoryFilter, categoryPathFor])

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize))
  const paged = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const start = (safePage - 1) * pageSize
    return filteredList.slice(start, start + pageSize)
  }, [filteredList, page, totalPages])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const p of filteredList) {
      const c = categoryPathFor(p)
      if (!map.has(c)) map.set(c, [])
      map.get(c).push(p)
    }
    return Array.from(map.entries()).sort(([a], [b]) => String(a).localeCompare(String(b)))
  }, [filteredList, categoryPathFor])

  useEffect(() => {
    setPage(1)
  }, [query, categoryFilter])

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token: adminToken } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const duplicateProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/duplicate', { id }, { headers: { token: adminToken } })
      if (response.data.success) {
        toast.success(response.data.message || 'Duplicated')
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const openEdit = (product) => {
    setEditing({
      _id: product._id,
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      bestseller: Boolean(product.bestseller),
      stockQuantity: Number.isFinite(product.stockQuantity) ? product.stockQuantity : 0,
      inStock: product.inStock !== undefined ? Boolean(product.inStock) : true,
      isAvailable: product.isAvailable !== undefined ? Boolean(product.isAvailable) : true,
      deliveryEnabled: product.deliveryEnabled !== undefined ? Boolean(product.deliveryEnabled) : true,
      deliveryPincodes: Array.isArray(product.deliveryPincodes) ? product.deliveryPincodes : [],
      image: Array.isArray(product.image) ? product.image : [],
      videos: Array.isArray(product.videos) ? product.videos : [],
    })
    setEditImages([null, null, null, null])
    setEditImageUrls('')
    setEditVideoUrls('')
    setReplaceImages(false)
  }

  const toggleSize = (size) => {
    setEditing((prev) => {
      if (!prev) return prev
      const next = prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size]
      return { ...prev, sizes: next }
    })
  }

  const saveEdit = async () => {
    if (!editing?._id) return
    setSavingEdit(true)
    try {
      const formData = new FormData()
      formData.append('id', editing._id)
      formData.append('name', editing.name)
      formData.append('description', editing.description)
      formData.append('price', String(editing.price ?? ''))
      formData.append('category', editing.category)
      formData.append('subCategory', editing.subCategory)
      formData.append('sizes', JSON.stringify(editing.sizes || []))
      formData.append('bestseller', editing.bestseller ? 'true' : 'false')
      formData.append('stockQuantity', String(editing.stockQuantity ?? 0))
      formData.append('inStock', editing.inStock ? 'true' : 'false')
      formData.append('isAvailable', editing.isAvailable ? 'true' : 'false')
      formData.append('deliveryEnabled', editing.deliveryEnabled ? 'true' : 'false')
      formData.append('deliveryPincodes', JSON.stringify(editing.deliveryPincodes || []))
      formData.append('replaceImages', replaceImages ? 'true' : 'false')

      const urlImgs = editImageUrls
        .split(/\r?\n|,/)
        .map((v) => v.trim())
        .filter(Boolean)
      const urlVids = editVideoUrls
        .split(/\r?\n|,/)
        .map((v) => v.trim())
        .filter(Boolean)
      if (urlImgs.length) formData.append('imageUrls', JSON.stringify(urlImgs))
      if (urlVids.length) formData.append('videoUrls', JSON.stringify(urlVids))

      editImages.forEach((f, idx) => {
        if (f) formData.append(`image${idx + 1}`, f)
      })

      const response = await axios.post(backendUrl + '/api/product/update', formData, { headers: { token: adminToken } })
      if (response.data.success) {
        toast.success(response.data.message || 'Updated')
        setEditing(null)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSavingEdit(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className='w-full max-w-4xl'>
      <div className='flex items-end justify-between'>
        <div>
          <p className='text-lg font-semibold text-gray-900'>All Products</p>
          <p className='text-sm text-gray-600'>Search, edit, duplicate, and manage inventory.</p>
        </div>
        <button
          type='button'
          onClick={fetchList}
          className='rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50'
        >
          Refresh
        </button>
      </div>

      <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-1 gap-2'>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search products...'
            className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
          />
          <div className='w-full sm:w-[380px]'>
            <CategoryTreeSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder='All Categories'
              maxPanelHeightClass='max-h-[420px]'
            />
          </div>
          <div className='hidden sm:flex rounded-xl border border-gray-200 bg-white overflow-hidden'>
            <button
              type='button'
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-2 text-sm font-semibold ${viewMode === 'grouped' ? 'bg-gray-900 text-white' : 'text-gray-800 hover:bg-gray-50'}`}
            >
              Grouped
            </button>
            <button
              type='button'
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm font-semibold ${viewMode === 'table' ? 'bg-gray-900 text-white' : 'text-gray-800 hover:bg-gray-50'}`}
            >
              Table
            </button>
          </div>
        </div>
        <div className='text-sm text-gray-600'>
          Showing <span className='font-semibold text-gray-900'>{filteredList.length}</span> items
        </div>
      </div>

      {viewMode === 'grouped' ? (
        <div className='mt-4 space-y-3'>
          {loading ? (
            <div className='rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600'>Loading...</div>
          ) : (
            <>
              {grouped.map(([cat, items]) => (
                <details key={cat} open className='rounded-2xl border border-gray-200 bg-white overflow-hidden'>
                  <summary className='cursor-pointer select-none bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 flex items-center justify-between'>
                    <span>{cat}</span>
                    <span className='text-xs font-semibold text-gray-600'>{items.length}</span>
                  </summary>
                  <div className='flex flex-col'>
                    {items.map((item) => (
                      <div
                        className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_2fr] items-center gap-2 py-3 px-4 border-t text-sm'
                        key={item._id}
                      >
                        <img className='w-12 h-12 object-cover rounded-lg' src={item.image?.[0] || DEFAULT_PLACEHOLDER_IMAGE} alt='' />
                        <div>
                          <p className='text-gray-900 font-medium'>{item.name}</p>
                          <p className='text-xs text-gray-500'>
                            {item.subCategory} · Stock {Number.isFinite(item.stockQuantity) ? item.stockQuantity : 0} ·{' '}
                            {item.isAvailable === false ? 'Not available' : item.inStock === false ? 'Out of stock' : 'In stock'}
                          </p>
                        </div>
                        <p className='text-gray-600'>{item.category}</p>
                        <p className='text-gray-900 font-medium'>{formatPrice(item.price)}</p>
                        <div className='flex items-center justify-end gap-3 md:justify-center'>
                          <button
                            type='button'
                            onClick={() => openEdit(item)}
                            className='rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50'
                          >
                            Edit
                          </button>
                          <button
                            type='button'
                            onClick={() => duplicateProduct(item._id)}
                            className='rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50'
                          >
                            Duplicate
                          </button>
                          <button
                            type='button'
                            onClick={() => removeProduct(item._id)}
                            className='rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50'
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
              {filteredList.length === 0 && <div className='rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600'>No products found.</div>}
            </>
          )}
        </div>
      ) : (
        <>
          <div className='mt-4 bg-white rounded-2xl border border-gray-200 overflow-hidden'>
            <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_2fr] items-center py-3 px-4 bg-gray-50 text-sm text-gray-700'>
              <b>Image</b>
              <b>Name</b>
              <b>Category</b>
              <b>Price</b>
              <b className='text-center'>Action</b>
            </div>

            {loading ? (
              <div className='p-6 text-sm text-gray-600'>Loading...</div>
            ) : (
              <div className='flex flex-col'>
                {paged.map((item) => (
                  <div
                    className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_2fr] items-center gap-2 py-3 px-4 border-t text-sm'
                    key={item._id}
                  >
                    <img className='w-12 h-12 object-cover rounded-lg' src={item.image?.[0] || DEFAULT_PLACEHOLDER_IMAGE} alt='' />
                    <div>
                      <p className='text-gray-900 font-medium'>{item.name}</p>
                      <p className='text-xs text-gray-500'>
                        {item.subCategory} · Stock {Number.isFinite(item.stockQuantity) ? item.stockQuantity : 0} ·{' '}
                        {item.isAvailable === false ? 'Not available' : item.inStock === false ? 'Out of stock' : 'In stock'}
                      </p>
                    </div>
                    <p className='text-gray-600'>{item.category}</p>
                    <p className='text-gray-900 font-medium'>{formatPrice(item.price)}</p>
                    <div className='flex items-center justify-end gap-3 md:justify-center'>
                      <button
                        type='button'
                        onClick={() => openEdit(item)}
                        className='rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50'
                      >
                        Edit
                      </button>
                      <button
                        type='button'
                        onClick={() => duplicateProduct(item._id)}
                        className='rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50'
                      >
                        Duplicate
                      </button>
                      <button
                        type='button'
                        onClick={() => removeProduct(item._id)}
                        className='rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50'
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {filteredList.length === 0 && <div className='p-6 text-sm text-gray-600'>No products found.</div>}
              </div>
            )}
          </div>

          <div className='mt-4 flex items-center justify-between text-sm'>
            <button
              type='button'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className='rounded-xl border border-gray-200 bg-white px-4 py-2 disabled:opacity-50'
            >
              Prev
            </button>
            <div className='text-gray-700'>
              Page <span className='font-semibold'>{Math.min(page, totalPages)}</span> / {totalPages}
            </div>
            <button
              type='button'
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className='rounded-xl border border-gray-200 bg-white px-4 py-2 disabled:opacity-50'
            >
              Next
            </button>
          </div>
        </>
      )}

      {editing && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-3xl rounded-2xl bg-white shadow-xl'>
            <div className='flex items-center justify-between border-b border-gray-200 px-5 py-4'>
              <div>
                <p className='text-base font-semibold text-gray-900'>Edit Product</p>
                <p className='text-xs text-gray-600'>Update details, inventory, and media.</p>
              </div>
              <button
                type='button'
                onClick={() => setEditing(null)}
                className='rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50'
              >
                Close
              </button>
            </div>

            <div className='max-h-[75vh] overflow-auto p-5'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <p className='mb-2 text-sm font-medium text-gray-700'>Name</p>
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                    className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                  />
                </div>
                <div>
                  <p className='mb-2 text-sm font-medium text-gray-700'>Price</p>
                  <input
                    type='number'
                    value={editing.price}
                    onChange={(e) => setEditing((p) => ({ ...p, price: e.target.value }))}
                    className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                  />
                </div>

                <div className='md:col-span-2'>
                  <p className='mb-2 text-sm font-medium text-gray-700'>Description</p>
                  <textarea
                    value={editing.description}
                    onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                    className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                    rows={3}
                  />
                </div>

                <div>
                  <p className='mb-2 text-sm font-medium text-gray-700'>Category</p>
                  <input
                    value={editing.category}
                    onChange={(e) => setEditing((p) => ({ ...p, category: e.target.value }))}
                    className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                  />
                </div>
                <div>
                  <p className='mb-2 text-sm font-medium text-gray-700'>Sub Category</p>
                  <input
                    value={editing.subCategory}
                    onChange={(e) => setEditing((p) => ({ ...p, subCategory: e.target.value }))}
                    className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                  />
                </div>

                <div>
                  <p className='mb-2 text-sm font-medium text-gray-700'>Stock quantity</p>
                  <input
                    type='number'
                    value={editing.stockQuantity}
                    onChange={(e) => setEditing((p) => ({ ...p, stockQuantity: Number(e.target.value || 0) }))}
                    className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                  />
                </div>
                <div className='flex items-center gap-4'>
                  <label className='flex items-center gap-2 text-sm text-gray-700'>
                    <input
                      type='checkbox'
                      checked={editing.inStock}
                      onChange={() => setEditing((p) => ({ ...p, inStock: !p.inStock }))}
                    />
                    In Stock
                  </label>
                  <label className='flex items-center gap-2 text-sm text-gray-700'>
                    <input
                      type='checkbox'
                      checked={editing.isAvailable}
                      onChange={() => setEditing((p) => ({ ...p, isAvailable: !p.isAvailable }))}
                    />
                    Available
                  </label>
                </div>

                <div className='md:col-span-2'>
                  <p className='mb-2 text-sm font-medium text-gray-700'>Sizes</p>
                  <div className='flex flex-wrap gap-2'>
                    {['S', 'M', 'L', 'XL', 'XXL', '128GB', '256GB'].map((s) => (
                      <button
                        key={s}
                        type='button'
                        onClick={() => toggleSize(s)}
                        className={`rounded-lg border px-3 py-1 text-sm ${
                          editing.sizes.includes(s)
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='md:col-span-2'>
                  <p className='mb-2 text-sm font-medium text-gray-700'>Upload images</p>
                  <div className='flex flex-wrap gap-2'>
                    {editImages.map((img, idx) => (
                      <label
                        key={idx}
                        className='h-20 w-20 cursor-pointer overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white'
                      >
                        {img ? (
                          <img className='h-full w-full object-cover' src={URL.createObjectURL(img)} alt='' />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center text-xs text-gray-500'>Upload</div>
                        )}
                        <input
                          type='file'
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setEditImages((prev) => prev.map((v, i) => (i === idx ? file : v)))
                          }}
                        />
                      </label>
                    ))}
                  </div>
                  <label className='mt-3 flex items-center gap-2 text-sm text-gray-700'>
                    <input type='checkbox' checked={replaceImages} onChange={() => setReplaceImages((p) => !p)} />
                    Replace existing images (instead of appending)
                  </label>
                </div>

                <div className='md:col-span-2'>
                  <p className='mb-2 text-sm font-medium text-gray-700'>Add image URLs (comma or new line)</p>
                  <textarea
                    value={editImageUrls}
                    onChange={(e) => setEditImageUrls(e.target.value)}
                    className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                    rows={2}
                    placeholder='https://...'
                  />
                </div>

                <div className='md:col-span-2'>
                  <p className='mb-2 text-sm font-medium text-gray-700'>Add video URLs (comma or new line)</p>
                  <textarea
                    value={editVideoUrls}
                    onChange={(e) => setEditVideoUrls(e.target.value)}
                    className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                    rows={2}
                    placeholder='https://...'
                  />
                </div>
              </div>
            </div>

            <div className='flex items-center justify-between border-t border-gray-200 px-5 py-4'>
              <div className='text-xs text-gray-600'>ID: {editing._id}</div>
              <button
                type='button'
                onClick={saveEdit}
                disabled={savingEdit}
                className='rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60'
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminList
