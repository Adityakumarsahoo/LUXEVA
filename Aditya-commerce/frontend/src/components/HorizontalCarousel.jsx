import React, { useEffect, useMemo, useRef, useState } from 'react'

const HorizontalCarousel = ({
  children,
  itemWidthClass = 'w-[260px]',
  showDots = false,
  autoplayMs = 0,
  gapClass = 'gap-4',
  scrollerClassName = '',
  hideArrows = false,
}) => {
  const scrollerRef = useRef(null)
  const [pageCount, setPageCount] = useState(0)
  const [activePage, setActivePage] = useState(0)

  const scrollBy = (dir) => {
    const node = scrollerRef.current
    if (!node) return
    const step = Math.max(260, Math.floor(node.clientWidth * 0.9))
    node.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const scrollToPage = (pageIndex) => {
    const node = scrollerRef.current
    if (!node) return
    node.scrollTo({ left: pageIndex * node.clientWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return

    const update = () => {
      const pages = Math.max(1, Math.ceil(node.scrollWidth / node.clientWidth))
      setPageCount(pages)
      setActivePage(Math.min(pages - 1, Math.round(node.scrollLeft / node.clientWidth)))
    }

    update()
    const onScroll = () => update()
    node.addEventListener('scroll', onScroll, { passive: true })

    const ro = new ResizeObserver(() => update())
    ro.observe(node)

    return () => {
      node.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [children])

  useEffect(() => {
    if (!autoplayMs || autoplayMs < 1200) return
    const node = scrollerRef.current
    if (!node) return
    if (pageCount <= 1) return

    const id = window.setInterval(() => {
      const next = activePage + 1 >= pageCount ? 0 : activePage + 1
      scrollToPage(next)
    }, autoplayMs)

    return () => window.clearInterval(id)
  }, [autoplayMs, activePage, pageCount])

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => scrollBy(-1)}
        className={`hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 border border-gray-200 shadow-sm items-center justify-center hover:bg-white ${hideArrows ? 'md:hidden' : ''}`}
        aria-label='Scroll left'
      >
        <span className='text-lg text-gray-700'>‹</span>
      </button>

      <div
        ref={scrollerRef}
        className={`flex ${gapClass} overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 ${scrollerClassName}`}
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className={`${itemWidthClass} snap-start flex-shrink-0`}>
            {child}
          </div>
        ))}
      </div>

      <button
        type='button'
        onClick={() => scrollBy(1)}
        className={`hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 border border-gray-200 shadow-sm items-center justify-center hover:bg-white ${hideArrows ? 'md:hidden' : ''}`}
        aria-label='Scroll right'
      >
        <span className='text-lg text-gray-700'>›</span>
      </button>

      {showDots && pageCount > 1 && (
        <div className='mt-4 flex items-center justify-center gap-2'>
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type='button'
              onClick={() => scrollToPage(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === activePage ? 'bg-gray-800' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HorizontalCarousel
