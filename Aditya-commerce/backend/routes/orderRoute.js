import express from 'express'
import {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, sellerOrders, sellerUpdateStatus, updateStatus, verifyStripe, verifyRazorpay, assignDeliveryPartner, deliveryOrders, updateDeliveryStatus, warehouseOrders, updateWarehouseStatus, requestRefund, supportRefundQueue, supportResolveRefund} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import authUser, { requireRole, requireStatus } from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,updateStatus)
orderRouter.post('/assign-delivery',adminAuth,assignDeliveryPartner)

// Payment Features
orderRouter.post('/place',authUser,placeOrder)
orderRouter.post('/stripe',authUser,placeOrderStripe)
orderRouter.post('/razorpay',authUser,placeOrderRazorpay)

// User Feature 
orderRouter.post('/userorders',authUser,userOrders)
orderRouter.post('/refund',authUser,requestRefund)

// Seller
orderRouter.post('/seller/list', authUser, requireRole('seller'), requireStatus('active'), sellerOrders)
orderRouter.post('/seller/status', authUser, requireRole('seller'), requireStatus('active'), sellerUpdateStatus)

// verify payment
orderRouter.post('/verifyStripe',authUser, verifyStripe)
orderRouter.post('/verifyRazorpay',authUser, verifyRazorpay)

// Delivery Partner
orderRouter.post('/delivery/assigned',authUser,requireRole('delivery'),requireStatus('active'),deliveryOrders)
orderRouter.post('/delivery/status',authUser,requireRole('delivery'),requireStatus('active'),updateDeliveryStatus)

// Warehouse
orderRouter.post('/warehouse/list',authUser,requireRole('warehouse'),requireStatus('active'),warehouseOrders)
orderRouter.post('/warehouse/status',authUser,requireRole('warehouse'),requireStatus('active'),updateWarehouseStatus)

// Support
orderRouter.post('/support/refunds',authUser,requireRole('support'),requireStatus('active'),supportRefundQueue)
orderRouter.post('/support/refund-status',authUser,requireRole('support'),requireStatus('active'),supportResolveRefund)

export default orderRouter
