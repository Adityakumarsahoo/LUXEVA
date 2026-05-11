import express from 'express'
import upload from '../middleware/multer.js'
import authUser, { requireRole, requireStatus } from '../middleware/auth.js'
import { listMyProducts, addMyProduct, updateMyProduct, removeMyProduct } from '../controllers/sellerController.js'

const sellerRouter = express.Router()

sellerRouter.get('/products', authUser, requireRole('seller'), requireStatus('active'), listMyProducts)
sellerRouter.post(
  '/product/add',
  authUser,
  requireRole('seller'),
  requireStatus('active'),
  upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]),
  addMyProduct
)
sellerRouter.post(
  '/product/update',
  authUser,
  requireRole('seller'),
  requireStatus('active'),
  upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]),
  updateMyProduct
)
sellerRouter.post('/product/remove', authUser, requireRole('seller'), requireStatus('active'), removeMyProduct)

export default sellerRouter
