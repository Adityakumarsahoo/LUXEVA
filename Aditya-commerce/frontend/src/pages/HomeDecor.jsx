import React from 'react'
import Collection from './Collection'

const HomeDecor = () => {
  return (
    <Collection
      preset={{
        title: 'Home & Kitchen',
        breadcrumb: 'Home / Home & Kitchen',
        countLabel: 'Products Found',
        filters: { mainCategory: 'home-kitchen' },
        remote: true,
      }}
    />
  )
}

export default HomeDecor
