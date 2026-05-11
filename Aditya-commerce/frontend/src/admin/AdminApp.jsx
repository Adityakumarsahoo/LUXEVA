import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminNavbar from './components/AdminNavbar'
import AdminSidebar from './components/AdminSidebar'
import AdminLogin from './pages/AdminLogin'
import AdminAdd from './pages/AdminAdd'
import AdminList from './pages/AdminList'
import AdminOrders from './pages/AdminOrders'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminSettings from './pages/AdminSettings'
import AdminCategories from './pages/AdminCategories'
import AdminPayments from './pages/AdminPayments'
import AdminReports from './pages/AdminReports'
import AdminNotifications from './pages/AdminNotifications'
import AdminCareers from './pages/AdminCareers'
import AdminSubscriptions from './pages/AdminSubscriptions'

const AdminApp = () => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '')

  useEffect(() => {
    localStorage.setItem('adminToken', adminToken)
  }, [adminToken])

  if (!adminToken) {
    return <AdminLogin setAdminToken={setAdminToken} />
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='flex min-h-screen'>
        <div className='hidden lg:block'>
          <AdminSidebar />
        </div>
        <div className='flex-1 min-w-0 flex flex-col'>
          <AdminNavbar setAdminToken={setAdminToken} />
          <div className='flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 text-slate-700'>
            <Routes>
              <Route path='/' element={<Navigate to='dashboard' replace />} />
              <Route path='dashboard' element={<AdminDashboard adminToken={adminToken} />} />
              <Route path='add' element={<AdminAdd adminToken={adminToken} />} />
              <Route path='list' element={<AdminList adminToken={adminToken} />} />
              <Route path='categories' element={<AdminCategories adminToken={adminToken} />} />
              <Route path='orders' element={<AdminOrders adminToken={adminToken} />} />
              <Route path='payments' element={<AdminPayments adminToken={adminToken} />} />
              <Route path='reports' element={<AdminReports adminToken={adminToken} />} />
              <Route path='notifications' element={<AdminNotifications adminToken={adminToken} />} />
              <Route path='subscriptions' element={<AdminSubscriptions adminToken={adminToken} />} />
              <Route path='careers' element={<AdminCareers adminToken={adminToken} />} />
              <Route path='users' element={<AdminUsers adminToken={adminToken} />} />
              <Route path='settings' element={<AdminSettings adminToken={adminToken} />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminApp
