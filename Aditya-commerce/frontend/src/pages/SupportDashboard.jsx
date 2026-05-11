import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'
import { formatINR } from '../utils/money'

const SupportDashboard = () => {
  const { backendUrl, token, userProfile, navigate } = useContext(ShopContext)
  const formatPrice = (v) => formatINR(v)

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [note, setNote] = useState({})

  const canUse = userProfile?.role === 'support' && userProfile?.status === 'active'

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token])

  const fetchRefunds = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await axios.post(backendUrl + '/api/order/support/refunds', {}, { headers: { token } })
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
    if (token && canUse) fetchRefunds()
  }, [token, canUse])

  const updateRefund = async (orderId, refundStatus) => {
    try {
      const res = await axios.post(
        backendUrl + '/api/order/support/refund-status',
        { orderId, refundStatus, refundNote: note[orderId] || '' },
        { headers: { token } }
      )
      if (res.data.success) {
        toast.success(res.data.message || 'Updated')
        await fetchRefunds()
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
          <p className='text-lg font-semibold text-gray-900'>Customer Support Dashboard</p>
          <p className='mt-2 text-sm text-gray-600'>This account is not approved as active Customer Support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='border-t pt-10'>
      <div className='rounded-3xl border border-gray-200 bg-white p-6'>
        <div className='flex items-end justify-between gap-3'>
          <div>
            <p className='text-lg font-semibold text-gray-900'>Customer Support Dashboard</p>
            <p className='text-sm text-gray-600'>Handle refunds and customer issues.</p>
          </div>
          <button
            type='button'
            onClick={fetchRefunds}
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
                    <p className='mt-1 text-sm text-gray-600'>
                      Refund: <span className='font-medium text-gray-900'>{o.refundStatus || 'Requested'}</span>
                    </p>
                    {o.refundNote && <p className='mt-1 text-sm text-gray-600'>Customer note: {o.refundNote}</p>}
                  </div>
                  <div className='flex flex-col gap-2 sm:w-80'>
                    <textarea
                      value={note[o._id] || ''}
                      onChange={(e) => setNote((p) => ({ ...p, [o._id]: e.target.value }))}
                      className='w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10'
                      rows={2}
                      placeholder='Support note'
                    />
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => updateRefund(o._id, 'Approved')}
                        className='flex-1 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white'
                      >
                        Approve
                      </button>
                      <button
                        type='button'
                        onClick={() => updateRefund(o._id, 'Rejected')}
                        className='flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50'
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className='rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600'>No refund requests.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SupportDashboard
