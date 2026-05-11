export const CATEGORY_TREE = {
  fashion: {
    label: 'Fashion',
    sections: {
      men: {
        label: 'Men',
        categories: {
          clothing: { label: 'Clothing' },
          footwear: { label: 'Footwear' },
          accessories: { label: 'Accessories' },
        },
      },
      women: {
        label: 'Women',
        categories: {
          'ethnic-wear': { label: 'Ethnic Wear' },
          'western-wear': { label: 'Western Wear' },
          beauty: { label: 'Beauty' },
        },
      },
      kids: {
        label: 'Kids',
        categories: {
          boys: { label: 'Boys' },
          girls: { label: 'Girls' },
          'baby-care': { label: 'Baby Care' },
        },
      },
      unisex: {
        label: 'Unisex',
        categories: {
          clothing: { label: 'Clothing' },
          footwear: { label: 'Footwear' },
          accessories: { label: 'Accessories' },
        },
      },
    },
  },
  electronics: {
    label: 'Electronics',
    sections: {
      mobiles: {
        label: 'Mobiles',
        categories: {
          smartphones: { label: 'Smartphones' },
          tablets: { label: 'Tablets' },
          accessories: { label: 'Accessories' },
        },
      },
      computing: {
        label: 'Computing',
        categories: {
          laptops: { label: 'Laptops' },
          gaming: { label: 'Gaming' },
          monitors: { label: 'Monitors' },
        },
      },
      audio: {
        label: 'Audio',
        categories: {
          headphones: { label: 'Headphones' },
          speakers: { label: 'Speakers' },
          soundbars: { label: 'Soundbars' },
        },
      },
    },
  },
  'home-kitchen': {
    label: 'Home & Kitchen',
    sections: {
      decor: {
        label: 'Decor',
        categories: {
          lighting: { label: 'Lighting' },
          furniture: { label: 'Furniture' },
          'home-decor': { label: 'Home Decor' },
        },
      },
      kitchen: {
        label: 'Kitchen',
        categories: {
          appliances: { label: 'Appliances' },
          'kitchen-items': { label: 'Kitchen Items' },
          storage: { label: 'Storage' },
        },
      },
      living: {
        label: 'Living',
        categories: {
          bathroom: { label: 'Bathroom' },
          'smart-home': { label: 'Smart Home' },
          grocery: { label: 'Grocery' },
        },
      },
    },
  },
  lifestyle: {
    label: 'Lifestyle',
    sections: {
      sports: {
        label: 'Sports',
        categories: {
          gym: { label: 'Gym' },
          cricket: { label: 'Cricket' },
          football: { label: 'Football' },
        },
      },
      books: {
        label: 'Books',
        categories: {
          'story-books': { label: 'Story Books' },
          technology: { label: 'Technology' },
          business: { label: 'Business' },
        },
      },
      toys: {
        label: 'Toys',
        categories: {
          gaming: { label: 'Gaming' },
          'action-figures': { label: 'Action Figures' },
          learning: { label: 'Learning Toys' },
        },
      },
    },
  },
}

export const listMainCategories = () =>
  Object.entries(CATEGORY_TREE).map(([slug, v]) => ({ slug, label: v.label }))

export const listSections = (mainSlug) => {
  const main = CATEGORY_TREE[mainSlug]
  if (!main) return []
  return Object.entries(main.sections || {}).map(([slug, v]) => ({ slug, label: v.label }))
}

export const listLeafCategories = (mainSlug, sectionSlug) => {
  const main = CATEGORY_TREE[mainSlug]
  const section = main?.sections?.[sectionSlug]
  if (!section) return []
  return Object.entries(section.categories || {}).map(([slug, v]) => ({ slug, label: v.label }))
}

export const getLabels = (mainSlug, sectionSlug, categorySlug) => {
  const main = CATEGORY_TREE[mainSlug]
  const section = main?.sections?.[sectionSlug]
  const cat = section?.categories?.[categorySlug]
  return {
    mainCategoryLabel: main?.label || '',
    sectionLabel: section?.label || '',
    categoryLabel: cat?.label || '',
  }
}
