import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import { deleteAdminNotification, listAdminNotifications, markAdminAllRead, markAdminNotificationRead } from '../controllers/notificationController.js'

const notificationRouter = express.Router()

notificationRouter.get('/admin/list', adminAuth, listAdminNotifications)
notificationRouter.post('/admin/read', adminAuth, markAdminNotificationRead)
notificationRouter.post('/admin/read-all', adminAuth, markAdminAllRead)
notificationRouter.post('/admin/delete', adminAuth, deleteAdminNotification)

export default notificationRouter

