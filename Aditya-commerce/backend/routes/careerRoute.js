import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import { applyCareer, listCareerApplications, updateCareerApplicationStatus } from '../controllers/careerController.js'

const careerRouter = express.Router()

careerRouter.post('/apply', applyCareer)
careerRouter.get('/admin/applications', adminAuth, listCareerApplications)
careerRouter.post('/admin/applications/status', adminAuth, updateCareerApplicationStatus)

export default careerRouter

