import React, { useCallback, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'
import { formatINR } from '../utils/money'

const DeliveryDashboard = () => {
  const { backendUrl, token, userProfile, navigate } = useContext(ShopContext)
  const formatPrice = (v) => formatINR(v)

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])

  const canUse = userProfile?.role === 'delivery' && userProfile?.status === 'active'

  const fetchAssigned = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await axios.post(backendUrl + '/api/order/delivery/assigned', {}, { headers: { token } })
      if (res.data.success) {
        setOrders(res.data.orders || [])
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [backendUrl, token])

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  useEffect(() => {
    if (token && canUse) fetchAssigned()
  }, [token, canUse, fetchAssigned])

  if (userProfile?.role === 'delivery' && userProfile?.status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <p className='text-lg font-semibold text-gray-900'>Delivery Partner Dashboard</p>
        <p className='mt-2 text-sm text-gray-600 italic'>Your delivery partner account is pending admin approval.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg">Back Home</button>
      </div>
    )
  }

  if (!canUse) {
     return (
       <div className='border-t pt-10 text-center'>
         <div className='rounded-3xl border border-gray-200 bg-white p-6'>
           <p className='text-lg font-semibold text-gray-900'>Access Denied</p>
           <p className='mt-2 text-sm text-gray-600'>This account is not authorized as an active Delivery Partner.</p>
           <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg">Back Home</button>
         </div>
       </div>
     )
   }

  const updateStatus = async (orderId, status) => {
    try {
      const res = await axios.post(backendUrl + '/api/order/delivery/status', { orderId, status }, { headers: { token } })
      if (res.data.success) {
        toast.success(res.data.message || 'Updated')
        await fetchAssigned()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className='border-t pt-10'>
      <div className='rounded-3xl border border-gray-200 bg-white p-6'>
        <div className='flex items-end justify-between gap-3'>
          <div>
            <p className='text-lg font-semibold text-gray-900'>Delivery Partner Dashboard</p>
            <p className='text-sm text-gray-600'>View assigned deliveries and update status.</p>
          </div>
          <button
            type='button'
            onClick={fetchAssigned}
            className='rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50'
          >
            Refresh
          </button>
        </div>
      </div>

      <div className='mt-6'>
        {loading ? (
          <div className='rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600'>Loading...</div>
        ) : (
          <div className='space-y-4'>
            {orders.map((o) => (
              <div key={o._id} className='rounded-3xl border border-gray-200 bg-white p-6'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                  <div>
                    <p className='text-sm font-semibold text-gray-900'>Order #{String(o._id).slice(-6).toUpperCase()}</p>
                    <p className='mt-1 text-sm text-gray-600'>Amount: {formatPrice(o.amount)}</p>
                    <p className='mt-1 text-sm text-gray-600'>Status: {o.status}</p>
                    <p className='mt-1 text-sm text-gray-600'>Date: {new Date(o.date).toLocaleString()}</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className='rounded-xl border border-gray-300 p-2 text-sm font-medium'
                    >
                      <option value='Picked'>Picked</option>
                      <option value='Out for delivery'>Out for delivery</option>
                      <option value='Delivered'>Delivered</option>
                    </select>
                  </div>
                </div>
                <div className='mt-4 text-sm text-gray-700'>
                  {o.items?.slice(0, 6).map((it, idx) => (
                    <p key={idx} className='py-0.5'>
                      {it.name} x {it.quantity} <span className='text-gray-500'>{it.size}</span>
                    </p>
                  ))}
                </div>
                <div className='mt-4 text-sm text-gray-600'>
                  <p className='font-medium text-gray-900'>
                    {o.address?.firstName} {o.address?.lastName}
                  </p>
                  <p>
                    {o.address?.street}, {o.address?.city}, {o.address?.state}, {o.address?.country} - {o.address?.zipcode}
                  </p>
                  <p>{o.address?.phone}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className='rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600'>No assigned deliveries yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryDashboard
