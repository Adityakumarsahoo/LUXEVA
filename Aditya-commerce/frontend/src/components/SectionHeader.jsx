import React from 'react'

const SectionHeader = ({ title, subtitle, onViewAll }) => {
  return (
    <div className='flex items-end justify-between gap-6 group'>
      <div className='relative'>
        <div className='flex items-center gap-2'>
          <span className='h-1.5 w-1.5 rounded-full bg-slate-900 group-hover:scale-125 transition-transform duration-300' />
          <p className='text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase'>{title}</p>
        </div>
        {subtitle ? <p className='mt-2 text-sm font-semibold text-slate-900 tracking-tight'>{subtitle}</p> : null}
      </div>
      
      {onViewAll && (
        <button 
          onClick={onViewAll}
          className='text-[10px] font-black tracking-widest text-slate-900 uppercase border-b-2 border-sky-600 pb-0.5 hover:text-sky-600 transition-colors'
        >
          View All
        </button>
      )}
    </div>
  )
}

export default SectionHeader

