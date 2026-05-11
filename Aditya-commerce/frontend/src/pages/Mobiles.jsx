import React from 'react'
import Collection from './Collection'

const Mobiles = () => {
  return (
    <Collection
      preset={{
        title: 'Mobiles',
        breadcrumb: 'Home / Electronics / Mobiles',
        countLabel: 'Products Found',
        filters: { mainCategory: 'electronics', section: 'mobiles' },
        remote: true,
      }}
    />
  )
}

export default Mobiles
