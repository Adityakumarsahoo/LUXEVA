import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  Search, Filter, User, Mail, Phone, Calendar, 
  Activity, MoreVertical, CheckCircle, XCircle, 
  Trash2, Shield, Eye, ShieldAlert, ChevronLeft, ChevronRight, RefreshCcw
} from 'lucide-react'

const AdminUsers = ({ adminToken }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all') // all, customers, sellers, delivery, support
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const tabs = [
    { id: 'all', label: 'All Users', role: null },
    { id: 'customers', label: 'Customers', role: 'customer' },
    { id: 'sellers', label: 'Sellers', role: 'seller' },
    { id: 'delivery', label: 'Delivery', role: 'delivery' },
    { id: 'support', label: 'Support', role: 'support' },
  ]

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/admin/users', { 
        headers: { token: adminToken },
        params: { search, role: tabs.find(t => t.id === activeTab)?.role || undefined }
      })
      if (res.data.success) {
        setUsers(res.data.users || [])
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
    fetchUsers()
  }, [adminToken, activeTab, search])

  const filteredUsers = useMemo(() => {
    let result = users;
    if (statusFilter !== 'all') {
      result = result.filter(u => u.status === statusFilter);
    }
    return result;
  }, [users, statusFilter])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const handleStatusUpdate = async (userId, status) => {
    try {
      const res = await axios.post(backendUrl + '/api/admin/users/status', { userId, status }, { headers: { token: adminToken } })
      if (res.data.success) {
        toast.success(res.data.message)
        fetchUsers()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) return
    try {
      const res = await axios.post(backendUrl + '/api/admin/users/delete', { userId }, { headers: { token: adminToken } })
      if (res.data.success) {
        toast.success(res.data.message)
        fetchUsers()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  const toggleBlock = async (userId, isBlocked) => {
    try {
      const res = await axios.post(backendUrl + '/api/admin/users/block', { userId, isBlocked }, { headers: { token: adminToken } })
      if (res.data.success) {
        toast.success(res.data.message)
        fetchUsers()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className='rounded-[2.5rem] border border-sky-100 bg-white shadow-sm overflow-hidden'>
        <div className='relative p-8'>
          <div className='absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50' />
          <div className='absolute -right-24 -top-24 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px]' />
          <div className='absolute -left-24 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]' />
          <div className='relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6'>
            <div>
              <p className='text-[10px] font-black tracking-[0.35em] text-sky-600 uppercase'>Users</p>
              <h1 className='mt-2 text-3xl font-black tracking-tighter text-slate-900'>User Management</h1>
              <p className='mt-2 text-sm font-semibold text-slate-500'>Manage roles, approvals, and account access.</p>
            </div>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
              <div className='relative w-full sm:w-[340px]'>
                <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                <input 
                  type="text"
                  placeholder="Search by name, email, phone…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold text-slate-900"
                />
              </div>
              <button 
                type="button"
                onClick={fetchUsers}
                className="h-12 px-5 rounded-2xl bg-sky-600 text-white text-[11px] font-black tracking-widest uppercase hover:bg-sky-700 transition-all active:scale-[0.98] shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1); }}
            className={`px-6 py-3 text-sm font-bold whitespace-nowrap transition-all relative ${
              activeTab === tab.id ? 'text-sky-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Filters & Stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="bg-transparent text-sm font-black text-slate-700 outline-none tracking-widest uppercase"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">{paginatedUsers.length}</span> of <span className="font-bold text-slate-900">{filteredUsers.length}</span> users
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">User Profile</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Role & Status</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Registered</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-sm text-slate-500">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">
                    <p className="text-slate-500 italic">No users found matching your criteria.</p>
                  </td>
                </tr>
              ) : paginatedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {user?.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user?.name}</p>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${user?.activityStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {user?.activityStatus || 'offline'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {user.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                        {user.role}
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          user.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          user.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.status}
                        </span>
                        {user.isBlocked && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                            Blocked
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(user._id, 'active')}
                            title="Approve"
                            className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(user._id, 'rejected')}
                            title="Reject"
                            className="p-2 text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {user.status === 'active' && (
                        <button 
                          onClick={() => toggleBlock(user._id, !user.isBlocked)}
                          title={user.isBlocked ? "Unblock" : "Block"}
                          className={`p-2 rounded-xl transition-colors ${user.isBlocked ? 'text-sky-700 hover:bg-sky-50' : 'text-amber-700 hover:bg-amber-50'}`}
                        >
                          {user.isBlocked ? <Shield className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                        </button>
                      )}

                      <button 
                        onClick={() => handleDelete(user._id)}
                        title="Delete Account"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      <button 
                        title="View Full Profile"
                        className="p-2 text-slate-400 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button 
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
              className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                    page === i + 1 ? 'bg-sky-600 text-white shadow-md shadow-sky-200' : 'text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:pointer-events-none"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
