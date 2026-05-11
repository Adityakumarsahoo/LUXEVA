import jwt from 'jsonwebtoken'

const adminAuth = async (req,res,next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET);
        const adminEmail = process.env.ADMIN_EMAIL
        const superEmail = process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL
        const role = token_decode?.role
        const email = token_decode?.email
        if (role !== 'admin') {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        if (!email || (email !== adminEmail && email !== superEmail)) {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth
