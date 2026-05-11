import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import { listSubscriptions, subscribe } from '../controllers/subscriptionController.js'

const subscriptionRouter = express.Router()

subscriptionRouter.post('/subscribe', subscribe)
subscriptionRouter.get('/list', adminAuth, listSubscriptions)

export default subscriptionRouter
