import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react'
import { CATEGORY_TREE, getLabels } from '../config/categoryTree'

const toText = (v) => String(v || '').trim().toLowerCase()

const buildLeaves = () => {
  const leaves = []
  for (const [mainSlug, main] of Object.entries(CATEGORY_TREE)) {
    for (const [sectionSlug, section] of Object.entries(main.sections || {})) {
      for (const [categorySlug, cat] of Object.entries(section.categories || {})) {
        leaves.push({
          mainSlug,
          mainLabel: main.label,
          sectionSlug,
          sectionLabel: section.label,
          categorySlug,
          categoryLabel: cat.label,
        })
      }
    }
  }
  return leaves
}

const ALL_LEAVES = buildLeaves()

const iconForMain = (mainSlug) => {
  if (mainSlug === 'fashion') return '👕'
  if (mainSlug === 'electronics') return '📱'
  if (mainSlug === 'home-kitchen') return '🏠'
  if (mainSlug === 'lifestyle') return '🏋️'
  return '🧩'
}

const CategoryTreeSelect = ({
  value,
  onChange,
  buttonClassName = '',
  panelClassName = '',
  placeholder = 'All Categories',
  allowClear = true,
  maxPanelHeightClass = 'max-h-[360px]',
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [expandedMain, setExpandedMain] = useState(() => new Set())
  const [expandedSections, setExpandedSections] = useState(() => new Set())

  const rootRef = useRef(null)

  const current = useMemo(() => {
    const mainSlug = value?.mainCategory || ''
    const sectionSlug = value?.section || ''
    const categorySlug = value?.categorySlug || ''
    const labels = getLabels(mainSlug, sectionSlug, categorySlug)
    const ok = Boolean(labels.mainCategoryLabel && labels.sectionLabel && labels.categoryLabel)
    if (!ok) return null
    return {
      mainSlug,
      sectionSlug,
      categorySlug,
      labels,
      path: `${labels.mainCategoryLabel} / ${labels.sectionLabel} / ${labels.categoryLabel}`,
    }
  }, [value?.mainCategory, value?.section, value?.categorySlug])

  const filtered = useMemo(() => {
    const q = toText(query)
    if (!q) return ALL_LEAVES
    return ALL_LEAVES.filter((l) => {
      const hay = `${l.mainLabel} ${l.sectionLabel} ${l.categoryLabel} ${l.mainSlug} ${l.sectionSlug} ${l.categorySlug}`
      return toText(hay).includes(q)
    })
  }, [query])

  const grouped = useMemo(() => {
    const out = new Map()
    for (const leaf of filtered) {
      if (!out.has(leaf.mainSlug)) out.set(leaf.mainSlug, new Map())
      const secMap = out.get(leaf.mainSlug)
      if (!secMap.has(leaf.sectionSlug)) secMap.set(leaf.sectionSlug, [])
      secMap.get(leaf.sectionSlug).push(leaf)
    }
    return out
  }, [filtered])

  useEffect(() => {
    const onDoc = (e) => {
      if (!open) return
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return
    if (!current) return
    setExpandedMain((prev) => new Set([...prev, current.mainSlug]))
    setExpandedSections((prev) => new Set([...prev, `${current.mainSlug}:${current.sectionSlug}`]))
  }, [open, current?.mainSlug, current?.sectionSlug])

  const selectLeaf = (leaf) => {
    onChange?.({
      mainCategory: leaf.mainSlug,
      section: leaf.sectionSlug,
      categorySlug: leaf.categorySlug,
      sectionLabel: leaf.sectionLabel,
      categoryLabel: leaf.categoryLabel,
      mainCategoryLabel: leaf.mainLabel,
    })
    setOpen(false)
    setQuery('')
  }

  const clear = () => {
    onChange?.(null)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={rootRef} className='relative'>
      <button
        type='button'
        onClick={() => setOpen((s) => !s)}
        className={`h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-left text-sm text-gray-900 flex items-center justify-between gap-3 hover:bg-gray-50 transition ${buttonClassName}`}
      >
        <div className='min-w-0'>
          <p className='truncate font-semibold'>{current ? current.path : placeholder}</p>
          <p className='mt-0.5 truncate text-[11px] text-gray-500'>
            {current ? `Selected: ${current.labels.categoryLabel}` : 'Browse categories, sections, and collections'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {allowClear && current && (
            <span
              role='button'
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                clear()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  clear()
                }
              }}
              className='h-8 w-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50'
            >
              <X className='h-4 w-4 text-gray-500' />
            </span>
          )}
          <span className='h-8 w-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center'>
            <ChevronDown className={`h-4 w-4 text-gray-700 transition ${open ? 'rotate-180' : ''}`} />
          </span>
        </div>
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 w-full rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-black/10 overflow-hidden ${panelClassName}`}
        >
          <div className='p-4 border-b border-gray-100'>
            <div className='flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2'>
              <Search className='h-4 w-4 text-gray-500' />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search categories...'
                className='w-full bg-transparent text-sm outline-none'
              />
            </div>
          </div>

          <div className={`overflow-y-auto ${maxPanelHeightClass}`}>
            <div className='p-2'>
              {Array.from(grouped.entries()).map(([mainSlug, sectionMap]) => {
                const mainMeta = CATEGORY_TREE[mainSlug]
                const mainOpen = expandedMain.has(mainSlug)
                const mainCount = Array.from(sectionMap.values()).reduce((acc, arr) => acc + arr.length, 0)
                return (
                  <div key={mainSlug} className='rounded-2xl overflow-hidden'>
                    <button
                      type='button'
                      onClick={() =>
                        setExpandedMain((prev) => {
                          const next = new Set(prev)
                          if (next.has(mainSlug)) next.delete(mainSlug)
                          else next.add(mainSlug)
                          return next
                        })
                      }
                      className='w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 transition'
                    >
                      <div className='flex items-center gap-3 min-w-0'>
                        <span className='h-9 w-9 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-sm'>
                          {iconForMain(mainSlug)}
                        </span>
                        <div className='min-w-0 text-left'>
                          <p className='text-sm font-semibold text-gray-900 truncate'>{mainMeta?.label || mainSlug}</p>
                          <p className='text-[11px] text-gray-500 truncate'>{mainCount} categories</p>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-500 transition ${mainOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {mainOpen && (
                      <div className='pl-2 pb-2'>
                        {Array.from(sectionMap.entries()).map(([sectionSlug, leaves]) => {
                          const key = `${mainSlug}:${sectionSlug}`
                          const secOpen = expandedSections.has(key)
                          const sectionMeta = mainMeta?.sections?.[sectionSlug]
                          return (
                            <div key={key} className='mt-1 rounded-2xl overflow-hidden'>
                              <button
                                type='button'
                                onClick={() =>
                                  setExpandedSections((prev) => {
                                    const next = new Set(prev)
                                    if (next.has(key)) next.delete(key)
                                    else next.add(key)
                                    return next
                                  })
                                }
                                className='w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 transition'
                              >
                                <div className='min-w-0 text-left'>
                                  <p className='text-[13px] font-semibold text-gray-900 truncate'>{sectionMeta?.label || sectionSlug}</p>
                                  <p className='text-[11px] text-gray-500 truncate'>{leaves.length} items</p>
                                </div>
                                <ChevronRight className={`h-4 w-4 text-gray-400 transition ${secOpen ? 'rotate-90' : ''}`} />
                              </button>

                              {secOpen && (
                                <div className='px-2 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-2'>
                                  {leaves
                                    .slice()
                                    .sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel))
                                    .map((leaf) => {
                                      const active =
                                        current?.mainSlug === leaf.mainSlug &&
                                        current?.sectionSlug === leaf.sectionSlug &&
                                        current?.categorySlug === leaf.categorySlug
                                      return (
                                        <button
                                          key={`${leaf.mainSlug}:${leaf.sectionSlug}:${leaf.categorySlug}`}
                                          type='button'
                                          onClick={() => selectLeaf(leaf)}
                                          className={`rounded-2xl border px-3 py-2 text-left transition ${
                                            active
                                              ? 'border-sky-200 bg-sky-50'
                                              : 'border-gray-200 bg-white hover:bg-gray-50'
                                          }`}
                                        >
                                          <p className='text-[13px] font-semibold text-gray-900'>{leaf.categoryLabel}</p>
                                          <p className='mt-0.5 text-[11px] text-gray-500'>{leaf.mainLabel} · {leaf.sectionLabel}</p>
                                        </button>
                                      )
                                    })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {filtered.length === 0 && (
                <div className='p-6 text-sm text-gray-600'>No categories found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryTreeSelect

