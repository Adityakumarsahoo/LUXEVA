import React from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart3, Bell, Briefcase, CreditCard, LayoutDashboard, Layers, List, Mail, Settings, ShoppingCart, Users, Plus } from 'lucide-react'
import { assets } from '../../assets/assets'

const AdminSidebar = () => {
  const nav = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { to: '/admin/subscriptions', icon: Mail, label: 'Subscribers' },
    { to: '/admin/add', icon: Plus, label: 'Add Items' },
    { to: '/admin/list', icon: List, label: 'List Items' },
    { to: '/admin/categories', icon: Layers, label: 'Categories' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { to: '/admin/careers', icon: Briefcase, label: 'Careers' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className='w-[290px] min-h-screen border-r border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 self-start'>
      <div className='px-6 py-6'>
        <div className='flex items-center gap-3'>
          <div className='h-11 w-11 rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden'>
            <img src={assets.logo} alt='Logo' className='h-9 w-9 object-contain' />
          </div>
          <div className='min-w-0'>
            <div className='text-sm font-black tracking-tight text-slate-900 truncate'>Admin Panel</div>
            <div className='text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase'>Console</div>
          </div>
        </div>

        <div className='mt-8'>
          <div className='text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase'>Menu</div>
          <div className='mt-3 space-y-1.5'>
            {nav.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
                to={item.to}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${
                    'bg-white/80 border border-slate-200 text-slate-700 group-hover:bg-white'
                  }`}
                >
                  <item.icon className='h-5 w-5' />
                </span>
                <p className='font-black tracking-tight text-sm'>{item.label}</p>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
