import express from 'express'
import { listCategoryTree, resolveCategoryPath } from '../controllers/categoryController.js'

const categoryRouter = express.Router()

categoryRouter.get('/tree', listCategoryTree)
categoryRouter.get('/resolve', resolveCategoryPath)

export default categoryRouter
