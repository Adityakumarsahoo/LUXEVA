import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatINR } from '../../utils/money'
import { RefreshCcw, Truck, Wallet2, CalendarDays } from 'lucide-react'

const AdminOrders = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const formatPrice = (value) => formatINR(value)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [deliveryPartners, setDeliveryPartners] = useState([])

  const fetchAllOrders = async () => {
    if (!adminToken) return
    setLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token: adminToken } })
      if (response.data.success) {
        setOrders((response.data.orders || []).reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliveryPartners = async () => {
    if (!adminToken) return
    try {
      const res = await axios.get(backendUrl + '/api/admin/users', { headers: { token: adminToken } })
      if (res.data.success) {
        const list = (res.data.users || []).filter((u) => u.role === 'delivery' && !u.isBlocked)
        setDeliveryPartners(list)
      }
    } catch {}
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: event.target.value },
        { headers: { token: adminToken } }
      )
      if (response.data.success) {
        await fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchAllOrders()
    fetchDeliveryPartners()
  }, [adminToken])

  const assignDelivery = async (orderId, deliveryPartnerId) => {
    try {
      const res = await axios.post(
        backendUrl + '/api/order/assign-delivery',
        { orderId, deliveryPartnerId },
        { headers: { token: adminToken } }
      )
      if (res.data.success) {
        toast.success(res.data.message || 'Assigned')
        await fetchAllOrders()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className='w-full'>
      <div className='rounded-[2.5rem] border border-sky-100 bg-white shadow-sm overflow-hidden'>
        <div className='relative p-8'>
          <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50' />
          <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
          <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />
          <div className='relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6'>
            <div>
              <p className='text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase'>Orders</p>
              <p className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>Order Management</p>
              <p className='mt-2 text-sm font-semibold text-slate-500'>Track orders, assign delivery, and update status.</p>
            </div>
            <button
              type='button'
              onClick={fetchAllOrders}
              className='h-11 px-5 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20 flex items-center gap-2'
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className='mt-6 rounded-[2rem] border border-slate-100 bg-white p-6 text-sm font-semibold text-slate-500'>
          Loading orders…
        </div>
      ) : (
        <div className='mt-6 space-y-4'>
          {orders.map((order) => (
            <div
              key={order._id}
              className='rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all'
            >
              <div className='flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between'>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                    <div className='min-w-0'>
                      <p className='text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase'>Order</p>
                      <p className='mt-1 text-lg font-black text-slate-900 truncate'>
                        #{String(order._id).slice(-6).toUpperCase()}
                      </p>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <span className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-[10px] font-black tracking-widest uppercase'>
                        <Truck className='w-3.5 h-3.5' />
                        {order.status}
                      </span>
                      <span className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black tracking-widest uppercase'>
                        <Wallet2 className='w-3.5 h-3.5' />
                        {order.payment ? 'Paid' : 'Unpaid'}
                      </span>
                      <span className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-black tracking-widest uppercase'>
                        <CalendarDays className='w-3.5 h-3.5' />
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className='mt-5 grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='rounded-[1.5rem] border border-slate-100 bg-white p-5'>
                      <p className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Items</p>
                      <div className='mt-3 space-y-1.5 text-[12px] font-semibold text-slate-700'>
                        {order.items?.map((item, idx) => (
                          <p key={idx} className='flex items-center justify-between gap-3'>
                            <span className='truncate'>{item.name}</span>
                            <span className='shrink-0 text-slate-500'>
                              x{item.quantity} {item.size ? `• ${item.size}` : ''}
                            </span>
                          </p>
                        ))}
                        {(order.items?.length || 0) === 0 && <p className='text-slate-500'>No items.</p>}
                      </div>
                    </div>

                    <div className='rounded-[1.5rem] border border-slate-100 bg-white p-5'>
                      <p className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Delivery</p>
                      <div className='mt-3 text-[12px] font-semibold text-slate-700 space-y-1.5'>
                        <p className='text-slate-900 font-black'>
                          {order.address?.firstName} {order.address?.lastName}
                        </p>
                        <p className='text-slate-600'>
                          {order.address?.street}, {order.address?.city}, {order.address?.state}, {order.address?.country} - {order.address?.zipcode}
                        </p>
                        <p className='text-slate-600'>{order.address?.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='w-full lg:w-[320px] shrink-0 space-y-3'>
                  <div className='rounded-[2rem] border border-slate-100 bg-white p-6'>
                    <p className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>Amount</p>
                    <p className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>{formatPrice(order.amount)}</p>
                    <div className='mt-4 space-y-2 text-[11px] font-bold text-slate-500'>
                      <p>Items: <span className='text-slate-900 font-black'>{order.items?.length || 0}</span></p>
                      <p>Method: <span className='text-slate-900 font-black'>{order.paymentMethod}</span></p>
                    </div>
                  </div>

                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className='w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[11px] font-black tracking-widest uppercase text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all'
                  >
                    <option value='Order Placed'>Order Placed</option>
                    <option value='Packing'>Packing</option>
                    <option value='Shipped'>Shipped</option>
                    <option value='Out for delivery'>Out for delivery</option>
                    <option value='Delivered'>Delivered</option>
                  </select>

                  <select
                    value={order.deliveryPartnerId || ''}
                    onChange={(e) => assignDelivery(order._id, e.target.value)}
                    className='w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-[11px] font-black tracking-widest uppercase text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all'
                  >
                    <option value=''>Assign delivery partner</option>
                    {deliveryPartners.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name || u.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className='rounded-[2rem] border border-slate-100 bg-white p-6 text-sm font-semibold text-slate-500'>
              No orders yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminOrders
