import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import productModel from '../models/productModel.js'
import orderModel from '../models/orderModel.js'
import settingsModel from '../models/settingsModel.js'
import categoryModel from '../models/categoryModel.js'
import transactionModel from '../models/transactionModel.js'
import subscriptionModel from '../models/subscriptionModel.js'

const getAdminRoleFromToken = (token) => {
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET)
    const adminSig = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
    const superSig =
      (process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL) +
      (process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD)
    if (token_decode === superSig) return 'superadmin'
    if (token_decode === adminSig) return 'admin'
    return null
  } catch {
    return null
  }
}

const requireSuperAdmin = (req, res) => {
  const adminRole = getAdminRoleFromToken(req.headers.token || '')
  if (adminRole !== 'superadmin') {
    res.json({ success: false, message: 'Super admin access required' })
    return null
  }
  return adminRole
}

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[%]/g, 'pct')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getSettings = async (req, res) => {
  try {
    const doc = await settingsModel.findOne({ key: 'platform' }).lean()
    const value = doc?.value || {}
    res.json({
      success: true,
      settings: {
        allowDefaultDelete: Boolean(value.allowDefaultDelete),
      },
      adminRole: getAdminRoleFromToken(req.headers.token || ''),
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const updateSettings = async (req, res) => {
  try {
    const adminRole = requireSuperAdmin(req, res)
    if (!adminRole) return

    const { allowDefaultDelete } = req.body
    const next = {}
    if (allowDefaultDelete !== undefined) next.allowDefaultDelete = String(allowDefaultDelete) === 'true' || allowDefaultDelete === true

    const doc = await settingsModel.findOneAndUpdate(
      { key: 'platform' },
      { $set: { key: 'platform', value: next } },
      { upsert: true, new: true }
    )
    res.json({ success: true, message: 'Settings updated', settings: doc.value, adminRole })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const listUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await userModel
      .find(query)
      .select('_id name email role status phone profileImage isBlocked activityStatus createdAt')
      .sort({ createdAt: -1 })
      .lean()
    res.json({ success: true, users })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    if (!['active', 'pending', 'rejected', 'suspended'].includes(status)) {
      return res.json({ success: false, message: 'Invalid status' });
    }
    await userModel.findByIdAndUpdate(userId, { status });
    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await userModel.findByIdAndDelete(userId);
    res.json({ success: true, message: 'User account deleted' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId).select('-password').lean();
    if (!user) return res.json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

const setUserRole = async (req, res) => {
  try {
    const { userId, role, sellerStatus } = req.body
    if (!userId) return res.json({ success: false, message: 'userId is required' })
    if (!role) return res.json({ success: false, message: 'role is required' })

    const patch = { role: String(role) }
    if (sellerStatus !== undefined) patch.sellerStatus = String(sellerStatus)
    await userModel.findByIdAndUpdate(userId, patch)
    res.json({ success: true, message: 'User updated' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const toggleUserBlock = async (req, res) => {
  try {
    const { userId, isBlocked } = req.body
    if (!userId) return res.json({ success: false, message: 'userId is required' })
    await userModel.findByIdAndUpdate(userId, { isBlocked: String(isBlocked) === 'true' || isBlocked === true })
    res.json({ success: true, message: 'User status updated' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const getStats = async (req, res) => {
  try {
    const [products, orders, users, subscribers] = await Promise.all([
      productModel.countDocuments(),
      orderModel.countDocuments(),
      userModel.countDocuments(),
      subscriptionModel.countDocuments(),
    ])
    const orderAgg = await orderModel.aggregate([
      { $match: { payment: true } },
      { $group: { _id: null, revenue: { $sum: '$amount' } } },
    ])
    const revenue = orderAgg?.[0]?.revenue || 0
    res.json({ success: true, stats: { products, orders, users, subscribers, revenue } })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const listTransactions = async (req, res) => {
  try {
    const transactions = await transactionModel.find({}).sort({ createdAt: -1 }).limit(400).lean()
    res.json({ success: true, transactions })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const getReports = async (req, res) => {
  try {
    const now = Date.now()
    const from = now - 14 * 24 * 60 * 60 * 1000

    const revenueByDay = await orderModel.aggregate([
      { $match: { payment: true, date: { $gte: from } } },
      {
        $addFields: {
          day: { $toDate: '$date' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$day' } },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const topProducts = await orderModel.aggregate([
      { $match: { payment: true } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items._id',
          name: { $first: '$items.name' },
          category: { $first: '$items.category' },
          subCategory: { $first: '$items.subCategory' },
          quantity: { $sum: { $ifNull: ['$items.quantity', 0] } },
          revenue: { $sum: { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] }] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 12 },
    ])

    const revenueByCategory = await orderModel.aggregate([
      { $match: { payment: true } },
      { $unwind: '$items' },
      {
        $group: {
          _id: { $ifNull: ['$items.category', 'Uncategorized'] },
          revenue: { $sum: { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] }] } },
          quantity: { $sum: { $ifNull: ['$items.quantity', 0] } },
        },
      },
      { $sort: { revenue: -1 } },
    ])

    res.json({
      success: true,
      reports: {
        revenueByDay,
        topProducts,
        revenueByCategory,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const listCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({}).sort({ sortOrder: 1, name: 1 }).lean()
    res.json({ success: true, categories })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const addCategory = async (req, res) => {
  try {
    const adminRole = requireSuperAdmin(req, res)
    if (!adminRole) return

    const { name, slug, icon, sortOrder, isActive } = req.body
    const finalName = String(name || '').trim()
    if (!finalName) return res.json({ success: false, message: 'name is required' })
    const finalSlug = slugify(slug || finalName)
    if (!finalSlug) return res.json({ success: false, message: 'slug is required' })

    const created = await categoryModel.create({
      name: finalName,
      slug: finalSlug,
      icon: String(icon || ''),
      sortOrder: Number(sortOrder || 0),
      isActive: isActive === undefined ? true : String(isActive) === 'true' || isActive === true,
    })
    res.json({ success: true, message: 'Category added', category: created })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const updateCategory = async (req, res) => {
  try {
    const adminRole = requireSuperAdmin(req, res)
    if (!adminRole) return

    const { id, name, slug, icon, sortOrder, isActive } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })

    const patch = {}
    if (name !== undefined) patch.name = String(name || '').trim()
    if (slug !== undefined) patch.slug = slugify(slug)
    if (icon !== undefined) patch.icon = String(icon || '')
    if (sortOrder !== undefined) patch.sortOrder = Number(sortOrder || 0)
    if (isActive !== undefined) patch.isActive = String(isActive) === 'true' || isActive === true

    await categoryModel.findByIdAndUpdate(id, patch)
    res.json({ success: true, message: 'Category updated' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const removeCategory = async (req, res) => {
  try {
    const adminRole = requireSuperAdmin(req, res)
    if (!adminRole) return
    const { id } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })
    await categoryModel.findByIdAndDelete(id)
    res.json({ success: true, message: 'Category removed' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export {
  getSettings,
  updateSettings,
  listUsers,
  setUserRole,
  toggleUserBlock,
  getStats,
  listTransactions,
  getReports,
  listCategories,
  addCategory,
  updateCategory,
  removeCategory,
  updateUserStatus,
  deleteUser,
  getUserProfile
}
