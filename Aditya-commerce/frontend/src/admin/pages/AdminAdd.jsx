import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../../context/ShopContext'
import { getLabels } from '../../config/categoryTree'
import CategoryTreeSelect from '../../components/CategoryTreeSelect'

const AdminAdd = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const { refreshProducts } = useContext(ShopContext)

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [mrp, setMrp] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [brand, setBrand] = useState('')
  const [mainCategory, setMainCategory] = useState('fashion')
  const [section, setSection] = useState('men')
  const [categorySlug, setCategorySlug] = useState('clothing')
  const [productType, setProductType] = useState('Topwear')
  const [collectionType, setCollectionType] = useState([])
  const [colors, setColors] = useState([])
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])
  const [stockQuantity, setStockQuantity] = useState(50)
  const [inStock, setInStock] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)
  const [imageUrls, setImageUrls] = useState('')
  const [videoUrls, setVideoUrls] = useState('')
  const [saving, setSaving] = useState(false)

  const labels = getLabels(mainCategory, section, categorySlug)
  const derivedGender = mainCategory === 'fashion' ? labels.sectionLabel : ''
  const derivedFashionCategory = mainCategory === 'fashion' ? labels.categoryLabel : ''

  const collectionOptions = ['New Arrivals', 'Trending', 'Best Seller', 'Discount Deals', 'Featured', 'Recommended']
  const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Beige', hex: '#E5D3B3' },
    { name: 'Purple', hex: '#A855F7' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Yellow', hex: '#FACC15' },
    { name: 'Grey', hex: '#9CA3AF' },
  ]

  const sizeOptions =
    mainCategory === 'fashion' && categorySlug === 'footwear'
      ? ['6', '7', '8', '9', '10']
      : mainCategory === 'fashion'
        ? ['S', 'M', 'L', 'XL', 'XXL']
        : mainCategory === 'electronics' && (categorySlug === 'smartphones' || categorySlug === 'tablets')
          ? ['64GB', '128GB', '256GB']
          : ['1']

  const toggleSize = (size) => {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  const toggleCollection = (value) => {
    setCollectionType((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  const toggleColor = (value) => {
    setColors((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  const onPickCategory = (next) => {
    if (!next?.mainCategory || !next?.section || !next?.categorySlug) return
    setMainCategory(next.mainCategory)
    setSection(next.section)
    setCategorySlug(next.categorySlug)
    setSizes([])
    setProductType('Topwear')
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()

      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      if (mrp) formData.append('mrp', mrp)
      if (discountPercent) formData.append('discountPercent', discountPercent)
      if (brand) formData.append('brand', brand)
      const computedCategory =
        mainCategory === 'fashion' ? labels.sectionLabel : mainCategory === 'home-kitchen' ? 'Home' : labels.mainCategoryLabel
      const computedSubCategory = labels.categoryLabel || 'General'

      formData.append('category', computedCategory)
      formData.append('subCategory', computedSubCategory)
      formData.append('mainCategory', mainCategory)
      formData.append('section', section)
      formData.append('categorySlug', categorySlug)
      formData.append('sectionLabel', labels.sectionLabel || '')
      formData.append('categoryLabel', labels.categoryLabel || '')

      formData.append('collectionType', JSON.stringify(collectionType))
      formData.append('colors', JSON.stringify(colors))

      formData.append('attributes', JSON.stringify({
        mainCategory,
        section,
        categorySlug,
        ...(mainCategory === 'fashion' ? { fashionCategory: derivedFashionCategory, gender: derivedGender } : {}),
        productType,
        collectionType,
        colors,
      }))
      formData.append('bestseller', bestseller)
      formData.append('sizes', JSON.stringify(sizes.length ? sizes : ['M']))
      formData.append('stockQuantity', String(stockQuantity ?? 0))
      formData.append('inStock', inStock ? 'true' : 'false')
      formData.append('isAvailable', isAvailable ? 'true' : 'false')

      const urlImgs = imageUrls
        .split(/\r?\n|,/)
        .map((v) => v.trim())
        .filter(Boolean)
      const urlVids = videoUrls
        .split(/\r?\n|,/)
        .map((v) => v.trim())
        .filter(Boolean)
      if (urlImgs.length) formData.append('imageUrls', JSON.stringify(urlImgs))
      if (urlVids.length) formData.append('videoUrls', JSON.stringify(urlVids))

      image1 && formData.append('image1', image1)
      image2 && formData.append('image2', image2)
      image3 && formData.append('image3', image3)
      image4 && formData.append('image4', image4)

      const response = await axios.post(backendUrl + '/api/product/add', formData, {
        headers: { token: adminToken },
      })

      if (response.data.success) {
        toast.success(response.data.message || 'Product added')
        refreshProducts?.()
        setName('')
        setDescription('')
        setPrice('')
        setMrp('')
        setDiscountPercent('')
        setBrand('')
        setMainCategory('fashion')
        setSection('men')
        setCategorySlug('clothing')
        setProductType('Topwear')
        setCollectionType([])
        setColors([])
        setBestseller(false)
        setSizes([])
        setStockQuantity(50)
        setInStock(true)
        setIsAvailable(true)
        setImageUrls('')
        setVideoUrls('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const UploadBox = ({ image, setImage, id }) => (
    <label
      htmlFor={id}
      className='w-20 h-20 rounded-xl border border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer overflow-hidden'
    >
      {image ? (
        <img className='w-full h-full object-cover' src={URL.createObjectURL(image)} alt='' />
      ) : (
        <span className='text-xs text-gray-500'>Upload</span>
      )}
      <input onChange={(e) => setImage(e.target.files?.[0])} type='file' id={id} hidden />
    </label>
  )

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4'>
      <div className='w-full max-w-3xl bg-white rounded-2xl border border-gray-200 p-6'>
        <p className='text-lg font-semibold text-gray-900'>Add Product</p>
        <p className='text-sm text-gray-600 mt-1'>Upload images, set pricing, and publish to the store.</p>

        <div className='mt-5'>
          <p className='mb-2 text-sm font-medium text-gray-700'>Upload Images</p>
          <div className='flex gap-2 flex-wrap'>
            <UploadBox image={image1} setImage={setImage1} id='image1' />
            <UploadBox image={image2} setImage={setImage2} id='image2' />
            <UploadBox image={image3} setImage={setImage3} id='image3' />
            <UploadBox image={image4} setImage={setImage4} id='image4' />
          </div>
        </div>

        <div className='mt-5 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='w-full'>
            <p className='mb-2 text-sm font-medium text-gray-700'>Product Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              className='w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20'
              type='text'
              placeholder='Premium Product'
              required
            />
          </div>

          <div>
            <p className='mb-2 text-sm font-medium text-gray-700'>Price</p>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              className='w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20'
              type='number'
              placeholder='499'
              required
            />
          </div>

          <div>
            <p className='mb-2 text-sm font-medium text-gray-700'>MRP (optional)</p>
            <input
              onChange={(e) => setMrp(e.target.value)}
              value={mrp}
              className='w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20'
              type='number'
              placeholder='799'
            />
          </div>

          <div>
            <p className='mb-2 text-sm font-medium text-gray-700'>Discount % (optional)</p>
            <input
              onChange={(e) => setDiscountPercent(e.target.value)}
              value={discountPercent}
              className='w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20'
              type='number'
              placeholder='20'
            />
          </div>

          <div>
            <p className='mb-2 text-sm font-medium text-gray-700'>Brand (optional)</p>
            <input
              onChange={(e) => setBrand(e.target.value)}
              value={brand}
              className='w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20'
              type='text'
              placeholder='Nike / GAP'
            />
          </div>

          <div>
            <p className='mb-2 text-sm font-medium text-gray-700'>Stock quantity</p>
            <input
              onChange={(e) => setStockQuantity(Number(e.target.value || 0))}
              value={stockQuantity}
              className='w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20'
              type='number'
              placeholder='50'
            />
          </div>

          <div className='md:col-span-2'>
            <p className='mb-2 text-sm font-medium text-gray-700'>Description</p>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              className='w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20'
              placeholder='Write product details...'
              required
            />
          </div>

          <div className='md:col-span-2'>
            <p className='mb-2 text-sm font-medium text-gray-700'>All Categories</p>
            <CategoryTreeSelect
              value={{ mainCategory, section, categorySlug }}
              onChange={onPickCategory}
              allowClear={false}
              placeholder='Pick a category'
              maxPanelHeightClass='max-h-[460px]'
            />
          </div>

          {mainCategory === 'fashion' && categorySlug === 'clothing' && (
            <div>
              <p className='mb-2 text-sm font-medium text-gray-700'>Product Type</p>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className='w-full rounded-xl border border-gray-300 px-3 py-2'
              >
                {['Topwear', 'Bottomwear', 'Winterwear'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <p className='mb-2 text-sm font-medium text-gray-700'>Collection Type</p>
            <div className='flex flex-wrap gap-2'>
              {collectionOptions.map((c) => {
                const active = collectionType.includes(c)
                return (
                  <button
                    key={c}
                    type='button'
                    onClick={() => toggleCollection(c)}
                    className={`px-4 py-2 rounded-full text-[11px] font-black tracking-widest uppercase transition-all ${
                      active
                        ? 'text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 shadow-lg shadow-pink-600/20 ring-2 ring-pink-600/20'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className='mb-2 text-sm font-medium text-gray-700'>Colors (optional)</p>
            <div className='flex flex-wrap gap-2'>
              {colorOptions.map((c) => {
                const active = colors.includes(c.name)
                return (
                  <button
                    key={c.name}
                    type='button'
                    onClick={() => toggleColor(c.name)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-black tracking-widest uppercase transition-all ${
                      active ? 'border-slate-900 ring-2 ring-slate-900/10 bg-white' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full border ${c.name === 'White' ? 'border-slate-300' : 'border-transparent'}`}
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className={active ? 'text-slate-900' : 'text-slate-700'}>{c.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className='mt-5'>
          <p className='mb-2 text-sm font-medium text-gray-700'>Sizes</p>
          <div className='flex gap-2 flex-wrap'>
            {sizeOptions.map((s) => (
              <button
                type='button'
                key={s}
                onClick={() => toggleSize(s)}
                className={`px-3 py-1 rounded-lg border ${
                  sizes.includes(s) ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <label className='flex items-center gap-2 text-sm text-gray-700'>
            <input onChange={() => setBestseller((prev) => !prev)} checked={bestseller} type='checkbox' />
            Mark as bestseller
          </label>
          <label className='flex items-center gap-2 text-sm text-gray-700'>
            <input onChange={() => setInStock((prev) => !prev)} checked={inStock} type='checkbox' />
            In stock
          </label>
          <label className='flex items-center gap-2 text-sm text-gray-700'>
            <input onChange={() => setIsAvailable((prev) => !prev)} checked={isAvailable} type='checkbox' />
            Available
          </label>
        </div>

        <div className='mt-5'>
          <p className='mb-2 text-sm font-medium text-gray-700'>Image URLs (comma or new line)</p>
          <textarea
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            className='w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20'
            rows={2}
            placeholder='https://...'
          />
        </div>

        <div className='mt-4'>
          <p className='mb-2 text-sm font-medium text-gray-700'>Video URLs (comma or new line)</p>
          <textarea
            value={videoUrls}
            onChange={(e) => setVideoUrls(e.target.value)}
            className='w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20'
            rows={2}
            placeholder='https://...'
          />
        </div>

        <button
          type='submit'
          disabled={saving}
          className='mt-6 w-36 py-3 rounded-xl bg-gray-900 text-white hover:bg-black disabled:opacity-60'
        >
          {saving ? 'Saving...' : 'Add Product'}
        </button>
      </div>
    </form>
  )
}

export default AdminAdd
