import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'
import { formatINR } from '../utils/money'

const WarehouseDashboard = () => {
  const { backendUrl, token, userProfile, navigate } = useContext(ShopContext)
  const formatPrice = (v) => formatINR(v)

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])

  const canUse = userProfile?.role === 'warehouse' && userProfile?.status === 'active'

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token])

  const fetchQueue = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await axios.post(backendUrl + '/api/order/warehouse/list', {}, { headers: { token } })
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
  }

  useEffect(() => {
    if (token && canUse) fetchQueue()
  }, [token, canUse])

  const updateStatus = async (orderId, status) => {
    try {
      const res = await axios.post(backendUrl + '/api/order/warehouse/status', { orderId, status }, { headers: { token } })
      if (res.data.success) {
        toast.success(res.data.message || 'Updated')
        await fetchQueue()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (!canUse) {
    return (
      <div className='border-t pt-10'>
        <div className='rounded-3xl border border-gray-200 bg-white p-6'>
          <p className='text-lg font-semibold text-gray-900'>Warehouse Dashboard</p>
          <p className='mt-2 text-sm text-gray-600'>This account is not approved as an active Warehouse Manager.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='border-t pt-10'>
      <div className='rounded-3xl border border-gray-200 bg-white p-6'>
        <div className='flex items-end justify-between gap-3'>
          <div>
            <p className='text-lg font-semibold text-gray-900'>Warehouse Dashboard</p>
            <p className='text-sm text-gray-600'>Packaging queue and stock movement.</p>
          </div>
          <button
            type='button'
            onClick={fetchQueue}
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
                  </div>
                  <div className='flex items-center gap-3'>
                    <button
                      type='button'
                      onClick={() => updateStatus(o._id, 'Packing')}
                      className='rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50'
                    >
                      Mark Packing
                    </button>
                    <button
                      type='button'
                      onClick={() => updateStatus(o._id, 'Shipped')}
                      className='rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white'
                    >
                      Mark Shipped
                    </button>
                  </div>
                </div>
                <div className='mt-4 text-sm text-gray-700'>
                  {o.items?.slice(0, 8).map((it, idx) => (
                    <p key={idx} className='py-0.5'>
                      {it.name} x {it.quantity} <span className='text-gray-500'>{it.size}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className='rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600'>No orders in queue.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default WarehouseDashboard
