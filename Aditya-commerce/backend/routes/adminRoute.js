import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import {
  getSettings,
  updateSettings,
  listUsers,
  setUserRole,
  toggleUserBlock,
  getStats,
  listTransactions,
  getReports,
  updateUserStatus,
  deleteUser,
  getUserProfile,
} from '../controllers/adminController.js'
import upload from '../middleware/categoryUpload.js'
import {
  adminListCategories,
  adminCategoryTree,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminUploadCategoryImages,
  adminListSections,
  adminCreateSection,
  adminUpdateSection,
  adminDeleteSection,
  adminUploadSectionImages,
} from '../controllers/adminCategoryController.js'

const adminRouter = express.Router()

adminRouter.get('/stats', adminAuth, getStats)
adminRouter.get('/reports', adminAuth, getReports)
adminRouter.get('/transactions', adminAuth, listTransactions)
adminRouter.get('/settings', adminAuth, getSettings)
adminRouter.post('/settings', adminAuth, updateSettings)

adminRouter.get('/users', adminAuth, listUsers)
adminRouter.post('/users/role', adminAuth, setUserRole)
adminRouter.post('/users/block', adminAuth, toggleUserBlock)
adminRouter.post('/users/status', adminAuth, updateUserStatus)
adminRouter.post('/users/delete', adminAuth, deleteUser)
adminRouter.get('/users/profile/:userId', adminAuth, getUserProfile)

adminRouter.get('/categories', adminAuth, adminListCategories)
adminRouter.get('/categories/tree', adminAuth, adminCategoryTree)
adminRouter.post('/categories/add', adminAuth, adminCreateCategory)
adminRouter.post('/categories/create', adminAuth, adminCreateCategory)
adminRouter.post('/categories/update', adminAuth, adminUpdateCategory)
adminRouter.post('/categories/remove', adminAuth, adminDeleteCategory)
adminRouter.post('/categories/delete', adminAuth, adminDeleteCategory)
adminRouter.post(
  '/categories/images',
  adminAuth,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'gallery', maxCount: 12 },
    { name: 'promoImages', maxCount: 12 },
  ]),
  adminUploadCategoryImages
)

adminRouter.get('/category-sections', adminAuth, adminListSections)
adminRouter.post('/category-sections/create', adminAuth, adminCreateSection)
adminRouter.post('/category-sections/update', adminAuth, adminUpdateSection)
adminRouter.post('/category-sections/delete', adminAuth, adminDeleteSection)
adminRouter.post('/category-sections/images', adminAuth, upload.fields([{ name: 'images', maxCount: 12 }]), adminUploadSectionImages)

export default adminRouter
