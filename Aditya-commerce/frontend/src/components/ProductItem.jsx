import React, { useMemo } from 'react'
import { normalizeProductImages } from '../utils/defaultProducts'
import ProductCard from './ProductCard'

const ProductItem = ({ product, id, image, name, price }) => {
  const normalized = useMemo(() => {
    const fallbackProduct = { _id: id, image, name, price }
    return normalizeProductImages(product || fallbackProduct)
  }, [product, id, image, name, price])

  return (
    <ProductCard product={normalized} size='sm' />
  )
}

export default ProductItem
