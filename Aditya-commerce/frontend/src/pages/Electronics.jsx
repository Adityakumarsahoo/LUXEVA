import React from 'react'
import Collection from './Collection'

const Electronics = () => {
  return (
    <Collection
      preset={{
        title: 'Electronics',
        breadcrumb: 'Home / Electronics',
        countLabel: 'Products Found',
        filters: { mainCategory: 'electronics' },
        remote: true,
      }}
    />
  )
}

export default Electronics
