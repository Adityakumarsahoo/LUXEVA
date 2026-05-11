import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import { createBlogPost, deleteBlogPost, getBlogPostBySlug, listAdminBlogPosts, listBlogPosts, updateBlogPost } from '../controllers/blogController.js'

const blogRouter = express.Router()

blogRouter.get('/posts', listBlogPosts)
blogRouter.get('/posts/:slug', getBlogPostBySlug)

blogRouter.get('/admin/posts', adminAuth, listAdminBlogPosts)
blogRouter.post('/admin/posts/create', adminAuth, createBlogPost)
blogRouter.post('/admin/posts/update', adminAuth, updateBlogPost)
blogRouter.post('/admin/posts/delete', adminAuth, deleteBlogPost)

export default blogRouter

