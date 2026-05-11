import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const AdminSettings = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adminRole, setAdminRole] = useState('admin')
  const [allowDefaultDelete, setAllowDefaultDelete] = useState(false)
  const [subscriptions, setSubscriptions] = useState([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/admin/settings', { headers: { token: adminToken } })
      if (res.data.success) {
        setAdminRole(res.data.adminRole || localStorage.getItem('adminRole') || 'admin')
        setAllowDefaultDelete(Boolean(res.data.settings?.allowDefaultDelete))
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
    fetchSettings()
  }, [adminToken])

  const fetchSubscriptions = async () => {
    setSubscriptionsLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/subscription/list?limit=100', { headers: { token: adminToken } })
      if (res.data.success) {
        setSubscriptions(res.data.subscriptions || [])
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubscriptionsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [adminToken])

  const save = async () => {
    if (adminRole !== 'superadmin') {
      toast.info('Only Super Admin can change platform settings')
      return
    }
    setSaving(true)
    try {
      const res = await axios.post(
        backendUrl + '/api/admin/settings',
        { allowDefaultDelete },
        { headers: { token: adminToken } }
      )
      if (res.data.success) {
        toast.success(res.data.message || 'Saved')
        await fetchSettings()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='w-full'>
      <div className='flex items-end justify-between'>
        <div>
          <p className='text-lg font-semibold text-gray-900'>Settings</p>
          <p className='text-sm text-gray-600'>Platform configuration and default-product rules.</p>
        </div>
        <button
          type='button'
          onClick={fetchSettings}
          className='rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50'
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className='mt-4 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600'>Loading...</div>
      ) : (
        <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <div className='rounded-2xl border border-gray-200 bg-white p-6'>
            <p className='text-base font-semibold text-gray-900'>Default Products</p>
            <p className='mt-1 text-sm text-gray-600'>Protect default seed products from deletion.</p>
            <div className='mt-4 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4'>
              <div>
                <p className='text-sm font-semibold text-gray-900'>Allow deleting default products</p>
                <p className='text-xs text-gray-600'>Super admin only</p>
              </div>
              <input
                type='checkbox'
                disabled={adminRole !== 'superadmin'}
                checked={allowDefaultDelete}
                onChange={() => setAllowDefaultDelete((p) => !p)}
              />
            </div>
          </div>

          <div className='rounded-2xl border border-gray-200 bg-white p-6'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-base font-semibold text-gray-900'>Email Subscriptions</p>
                <p className='mt-1 text-sm text-gray-600'>Latest newsletter signups.</p>
              </div>
              <button
                type='button'
                onClick={fetchSubscriptions}
                className='rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50'
              >
                Refresh
              </button>
            </div>

            {subscriptionsLoading ? (
              <div className='mt-4 text-sm text-gray-600'>Loading...</div>
            ) : (
              <div className='mt-4 space-y-2'>
                {subscriptions.slice(0, 12).map((s) => (
                  <div key={s._id} className='flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3'>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-semibold text-gray-900'>{s.email}</p>
                      <p className='text-xs text-gray-600'>{new Date(s.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {subscriptions.length === 0 && <div className='text-sm text-gray-600'>No subscriptions yet.</div>}
              </div>
            )}
          </div>

          <div className='lg:col-span-2 flex items-center justify-end'>
            <button
              type='button'
              onClick={save}
              disabled={saving || adminRole !== 'superadmin'}
              className='rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60'
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSettings
