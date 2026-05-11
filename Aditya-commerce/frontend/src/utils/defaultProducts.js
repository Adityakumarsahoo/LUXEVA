import placeholderImage from '../assets/logo.png'

const titleCase = (value) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ')

const filenameToProductName = (filename, index) => {
  const base = filename.replace(/\.[^.]+$/, '')
  const match = base.match(/(\d+)/)
  if (match) return `Premium Product ${match[1]}`
  return `Premium Product ${index + 1} - ${titleCase(base.replace(/[_-]+/g, ' '))}`
}

const stablePrice = (index) => {
  const base = 399 + (index * 47) % 900
  const rounded = Math.round(base / 10) * 10
  return Math.max(299, Math.min(1999, rounded))
}

const stableRating = (index) => {
  const rating = 3.9 + ((index * 13) % 11) / 10
  return Math.min(4.9, Math.max(3.8, Number(rating.toFixed(1))))
}

const stableReviewCount = (index) => 60 + ((index * 19) % 520)

const resolveImageModules = () => {
  return import.meta.glob('../assets/**/*.{png,jpg,jpeg,webp,gif}', { eager: true, import: 'default' })
}

export const DEFAULT_PLACEHOLDER_IMAGE = placeholderImage

const detectSubCategoryFromPath = (path, filename) => {
  const lowerPath = String(path || '').toLowerCase()
  const lowerFile = String(filename || '').toLowerCase()

  if (lowerPath.includes('/clothing/')) return 'Clothing'
  if (lowerPath.includes('/footwear/')) return 'Footwear'
  if (lowerPath.includes('/accessories/')) return 'Accessories'
  if (lowerPath.includes('/beauty/')) return 'Beauty'
  if (lowerPath.includes('/ethnic-wear/')) return 'Ethnic Wear'
  if (lowerPath.includes('/ethnic wear/')) return 'Ethnic Wear'
  if (lowerPath.includes('/western-wear/')) return 'Western Wear'
  if (lowerPath.includes('/western wear/')) return 'Western Wear'
  if (lowerPath.includes('/boys/')) return 'Boys'
  if (lowerPath.includes('/boys-kids/')) return 'Boys'
  if (lowerPath.includes('/boys kids/')) return 'Boys'
  if (lowerPath.includes('/girls/')) return 'Girls'
  if (lowerPath.includes('/girls-kids/')) return 'Girls'
  if (lowerPath.includes('/girls kids/')) return 'Girls'
  if (lowerPath.includes('/baby-care/')) return 'Baby Care'
  if (lowerPath.includes('/baby care/')) return 'Baby Care'

  if (lowerFile.startsWith('p_img')) return 'Clothing'
  return null
}

const isLikelyMobileImage = (filename) => {
  const base = String(filename || '').toLowerCase()
  if (!base) return false
  if (base.includes('gb ram')) return true
  if (base.includes('phone')) return true
  if (base.includes('galaxy')) return true
  if (base.includes('oneplus')) return true
  if (base.includes('oppo')) return true
  if (base.includes('nothing')) return true
  if (base.includes('vivo')) return true
  if (base.includes('iphone')) return true
  return false
}

export const buildDefaultProductsFromAssets = () => {
  const imageModules = resolveImageModules()
  const imageEntries = Object.entries(imageModules)
    .filter(([path]) => {
      const filename = path.split('/').pop() || ''
      if (isLikelyMobileImage(filename)) return false
      return Boolean(detectSubCategoryFromPath(path, filename))
    })
    .sort(([a], [b]) => a.localeCompare(b))

  const categories = ['Men', 'Women', 'Kids']
  const sizes = ['S', 'M', 'L', 'XL']

  return imageEntries.map(([path, src], index) => {
    const filename = path.split('/').pop() || `product-${index + 1}.png`
    const subCategory = detectSubCategoryFromPath(path, filename) || 'Clothing'
    const category =
      subCategory === 'Beauty'
        ? 'Beauty'
        : subCategory === 'Ethnic Wear' || subCategory === 'Western Wear'
          ? 'Women'
          : subCategory === 'Boys' || subCategory === 'Girls' || subCategory === 'Baby Care'
            ? 'Kids'
            : categories[index % categories.length]
    const date = Date.now() - index * 24 * 60 * 60 * 1000
    const rating = stableRating(index)

    return {
      _id: `default-${index + 1}`,
      name: filenameToProductName(filename, index),
      description:
        'Premium quality product with modern design, durable materials, and a comfortable fit. Hand-picked as an admin default item for a production-like storefront.',
      price: stablePrice(index),
      image: [src || placeholderImage],
      category,
      subCategory,
      sizes:
        subCategory === 'Footwear'
          ? ['6', '7', '8', '9', '10']
          : subCategory === 'Accessories'
            ? ['Free Size']
            : subCategory === 'Beauty'
              ? ['100ml', '200ml']
              : subCategory === 'Baby Care'
                ? ['100g', '200g']
                : sizes,
      bestseller: rating >= 4.6 || index % 7 === 0,
      date,
      rating,
      reviews: stableReviewCount(index),
      isDefault: true,
      recentlyAdded: index < 8,
    }
  })
}

export const normalizeProductImages = (product) => {
  const images = Array.isArray(product?.image) ? product.image.filter(Boolean) : []
  if (images.length > 0) return { ...product, image: images }
  return { ...product, image: [placeholderImage] }
}
