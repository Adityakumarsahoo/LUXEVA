import React, { useContext, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'
import ProductCardSkeleton from './ProductCardSkeleton'

const TrendingProducts = () => {
  const { products, loadingProducts } = useContext(ShopContext)

  const trending = useMemo(() => {
    const hasTag = (item, tag) => {
      const direct = Array.isArray(item?.collectionType) ? item.collectionType : []
      const attr = (item?.attributes && typeof item.attributes === 'object') ? item.attributes : {}
      const fromAttr = Array.isArray(attr?.collectionType) ? attr.collectionType : []
      return [...direct, ...fromAttr].some((t) => String(t || '').toLowerCase() === String(tag || '').toLowerCase())
    }
    const tagged = products.filter((p) => hasTag(p, 'Trending'))
    if (tagged.length) return tagged.slice(0, 8)
    const sorted = products
      .slice()
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return sorted.slice(0, 8)
  }, [products])

  return (
    <div className='my-2'>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4'>
        {loadingProducts
          ? Array.from({ length: 12 }).map((_, index) => <ProductCardSkeleton key={index} />)
          : trending.map((item) => <ProductItem key={item._id} product={item} />)}
      </div>
    </div>
  )
}

export default TrendingProducts
