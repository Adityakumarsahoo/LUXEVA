import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

const authUser = async (req, res, next) => {

    const { token } = req.headers;

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized Login Again' })
    }

    try {

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        const userId = token_decode?.id
        if (!userId) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }

        const user = await userModel.findById(userId).select('role status isBlocked').lean()
        if (!user) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        if (user.isBlocked) {
            return res.json({ success: false, message: 'Account blocked by admin' })
        }

        req.user = { id: userId, role: user.role || 'customer', status: user.status || 'active' }
        req.body.userId = userId
        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export const requireRole = (...roles) => {
    const allowed = new Set(roles.flat().filter(Boolean))
    return (req, res, next) => {
        const role = req.user?.role
        if (!role || allowed.size === 0) return res.json({ success: false, message: 'Not Authorized' })
        if (!allowed.has(role)) return res.json({ success: false, message: 'Not Authorized' })
        next()
    }
}

export const requireStatus = (...statuses) => {
    const allowed = new Set(statuses.flat().filter(Boolean))
    return (req, res, next) => {
        const status = req.user?.status
        if (!status || allowed.size === 0) return res.json({ success: false, message: 'Not Authorized' })
        if (!allowed.has(status)) {
            if (status === 'pending') return res.json({ success: false, message: 'Account pending approval by admin' })
            if (status === 'rejected') return res.json({ success: false, message: 'Account registration was rejected' })
            if (status === 'suspended') return res.json({ success: false, message: 'Account has been suspended' })
            return res.json({ success: false, message: 'Not Authorized' })
        }
        next()
    }
}

export default authUser
