import React, { useMemo } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import Collection from './Collection'

const normalize = (slug) =>
  String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')

const toTitle = (value) =>
  String(value || '')
    .trim()
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const ROUTES = {
  fashion: {
    title: 'Fashion',
    sub: {
      clothing: {
        title: 'Clothing',
        filters: {
          mainCategory: 'fashion',
          categorySlug: 'clothing',
        },
      },
      footwear: { title: 'Footwear', filters: { mainCategory: 'fashion', categorySlug: 'footwear' } },
      accessories: { title: 'Accessories', filters: { mainCategory: 'fashion', categorySlug: 'accessories' } },
      'ethnic-wear': { title: 'Ethnic Wear', filters: { mainCategory: 'fashion', categorySlug: 'ethnic-wear' } },
      'western-wear': { title: 'Western Wear', filters: { mainCategory: 'fashion', categorySlug: 'western-wear' } },
      beauty: { title: 'Beauty', filters: { mainCategory: 'fashion', categorySlug: 'beauty' } },
      boys: { title: 'Boys', filters: { mainCategory: 'fashion', categorySlug: 'boys' } },
      girls: { title: 'Girls', filters: { mainCategory: 'fashion', categorySlug: 'girls' } },
      'baby-care': { title: 'Baby Care', filters: { mainCategory: 'fashion', categorySlug: 'baby-care' } },
    },
  },
  electronics: {
    title: 'Electronics',
    sub: {
      smartphones: { title: 'Smartphones', filters: { mainCategory: 'electronics', section: 'mobiles', categorySlug: 'smartphones' } },
      tablets: { title: 'Tablets', filters: { mainCategory: 'electronics', section: 'mobiles', categorySlug: 'tablets' } },
      accessories: { title: 'Accessories', filters: { mainCategory: 'electronics', section: 'mobiles', categorySlug: 'accessories' } },
      laptops: { title: 'Laptops', filters: { mainCategory: 'electronics', section: 'computing', categorySlug: 'laptops' } },
      gaming: { title: 'Gaming', filters: { mainCategory: 'electronics', section: 'computing', categorySlug: 'gaming' } },
      monitors: { title: 'Monitors', filters: { mainCategory: 'electronics', section: 'computing', categorySlug: 'monitors' } },
      headphones: { title: 'Headphones', filters: { mainCategory: 'electronics', section: 'audio', categorySlug: 'headphones' } },
      speakers: { title: 'Speakers', filters: { mainCategory: 'electronics', section: 'audio', categorySlug: 'speakers' } },
      soundbars: { title: 'Soundbars', filters: { mainCategory: 'electronics', section: 'audio', categorySlug: 'soundbars' } },
    },
  },
  'home-kitchen': {
    title: 'Home & Kitchen',
    sub: {
      furniture: { title: 'Furniture', filters: { mainCategory: 'home-kitchen', section: 'decor', categorySlug: 'furniture' } },
      lighting: { title: 'Lighting', filters: { mainCategory: 'home-kitchen', section: 'decor', categorySlug: 'lighting' } },
      'home-decor': { title: 'Home Decor', filters: { mainCategory: 'home-kitchen', section: 'decor', categorySlug: 'home-decor' } },
      appliances: { title: 'Appliances', filters: { mainCategory: 'home-kitchen', section: 'kitchen', categorySlug: 'appliances' } },
      'kitchen-items': { title: 'Kitchen Items', filters: { mainCategory: 'home-kitchen', section: 'kitchen', categorySlug: 'kitchen-items' } },
      storage: { title: 'Storage', filters: { mainCategory: 'home-kitchen', section: 'kitchen', categorySlug: 'storage' } },
      bathroom: { title: 'Bathroom', filters: { mainCategory: 'home-kitchen', section: 'living', categorySlug: 'bathroom' } },
      'smart-home': { title: 'Smart Home', filters: { mainCategory: 'home-kitchen', section: 'living', categorySlug: 'smart-home' } },
      grocery: { title: 'Grocery', filters: { mainCategory: 'home-kitchen', section: 'living', categorySlug: 'grocery' } },
    },
  },
  lifestyle: {
    title: 'Lifestyle',
    sub: {
      gym: { title: 'Gym Collection', filters: { mainCategory: 'lifestyle', section: 'sports', categorySlug: 'gym' } },
      cricket: { title: 'Cricket Collection', filters: { mainCategory: 'lifestyle', section: 'sports', categorySlug: 'cricket' } },
      football: { title: 'Football Collection', filters: { mainCategory: 'lifestyle', section: 'sports', categorySlug: 'football' } },
      'story-books': { title: 'Story Books Collection', filters: { mainCategory: 'lifestyle', section: 'books', categorySlug: 'story-books' } },
      technology: { title: 'Technology Books Collection', filters: { mainCategory: 'lifestyle', section: 'books', categorySlug: 'technology' } },
      business: { title: 'Business Books Collection', filters: { mainCategory: 'lifestyle', section: 'books', categorySlug: 'business' } },
      gaming: { title: 'Gaming Collection', filters: { mainCategory: 'lifestyle', section: 'toys', categorySlug: 'gaming' } },
      'action-figures': { title: 'Action Figures Collection', filters: { mainCategory: 'lifestyle', section: 'toys', categorySlug: 'action-figures' } },
      learning: { title: 'Learning Collection', filters: { mainCategory: 'lifestyle', section: 'toys', categorySlug: 'learning' } },
    },
  },
  mobiles: {
    title: 'Mobiles',
    sub: {
      smartphones: { title: 'Smartphones', filters: { mainCategory: 'electronics', section: 'mobiles', categorySlug: 'smartphones' } },
      tablets: { title: 'Tablets', filters: { mainCategory: 'electronics', section: 'mobiles', categorySlug: 'tablets' } },
      accessories: { title: 'Accessories', filters: { mainCategory: 'electronics', section: 'mobiles', categorySlug: 'accessories' } },
    },
  },
  beauty: {
    title: 'Beauty',
    sub: {
      skincare: { title: 'Skincare', filters: { category: ['Beauty'], subCategory: ['Skincare'] } },
      makeup: { title: 'Makeup', filters: { category: ['Beauty'], subCategory: ['Makeup'] } },
      haircare: { title: 'Hair Care', filters: { category: ['Beauty'], subCategory: ['Hair Care'] } },
      fragrances: { title: 'Fragrances', filters: { category: ['Beauty'], subCategory: ['Fragrances'] } },
      'personal-care': { title: 'Personal Care', filters: { category: ['Beauty'], subCategory: ['Personal Care'] } },
    },
  },
  sports: { title: 'Sports', sub: { all: { title: 'Sports', filters: { search: 'sports' } } } },
  toys: { title: 'Toys', sub: { all: { title: 'Toys', filters: { search: 'toys' } } } },
  grocery: { title: 'Grocery', sub: { all: { title: 'Grocery', filters: { search: 'grocery' } } } },
}

const CategoryListing = () => {
  const params = useParams()
  const location = useLocation()
  const categoryFromPath = String(location.pathname || '').split('/').filter(Boolean)[0] || ''
  const categorySlug = normalize(params.categorySlug || categoryFromPath)
  const subSlug = normalize(params.subSlug)

  const preset = useMemo(() => {
    const cat = ROUTES[categorySlug]
    if (!cat) return null
    const sub = cat.sub?.[subSlug]
    if (!sub) return null
    return {
      title: sub.title,
      countLabel: 'Products Found',
      breadcrumb: `Home / ${cat.title} / ${toTitle(subSlug)}`,
      filters: sub.filters || {},
      remote: true,
    }
  }, [categorySlug, subSlug])

  if (!preset) return <Navigate to={`/${categorySlug || 'collection'}`} replace />
  return <Collection preset={preset} />
}

export default CategoryListing
