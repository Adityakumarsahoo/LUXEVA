import React from 'react'
import { motion } from 'framer-motion'
import ProductItem from './ProductItem'

const ElectronicsCard = ({ product, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <ProductItem product={product} />
    </motion.div>
  )
}

export default ElectronicsCard
