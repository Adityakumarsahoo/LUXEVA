import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import notificationModel from "../models/notificationModel.js";

const createToken = (user) => {
    return jwt.sign({ id: String(user._id), role: user.role || 'customer' }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" })
        }

        // If a role is specified during login, ensure it matches
        if (role && user.role !== role) {
            return res.json({ success: false, message: `This account is not registered as a ${role}` })
        }

        if (user.isBlocked) {
            return res.json({ success: false, message: "Account blocked by admin" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            user.activityStatus = 'online';
            await user.save();
            const token = createToken(user)
            res.json({ 
                success: true, 
                token, 
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            })
        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        const normalizedRole = String(role || 'customer').toLowerCase()
        if (normalizedRole === 'admin') {
            return res.json({ success: false, message: "Admin accounts can't be created using Sign Up" })
        }

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (min 8 chars)" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Sellers, Delivery Partners, Support Staff, and Warehouse require approval
        const needsApproval = ['seller', 'delivery', 'support', 'warehouse'].includes(normalizedRole);
        const status = needsApproval ? 'pending' : 'active';

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            role: normalizedRole || 'customer',
            phone: phone || "",
            status
        })

        const user = await newUser.save()

        if (needsApproval) {
            await notificationModel.create({
                scope: 'admin',
                type: 'seller_approval',
                title: 'New Approval Request',
                message: `${name} requested ${normalizedRole} access`,
                meta: { userId: String(user._id), role: normalizedRole, email },
                read: false,
            })
        }

        const token = createToken(user)
        res.json({ 
            success: true, 
            token,
            pending: needsApproval,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const {email,password} = req.body
        const superEmail = process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL
        const superPassword = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD

        if (email === superEmail && password === superPassword) {
            const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET);
            res.json({success:true,token, role: 'admin'})
        } else if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET);
            res.json({success:true,token, role: 'admin'})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const getProfile = async (req, res) => {
    try {
        const { userId } = req.body
        const user = await userModel.findById(userId).select('-password').lean()
        if (!user) return res.json({ success: false, message: 'User not found' })
        res.json({ success: true, user })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Forgot Password Logic (Mock OTP)
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // In a real app, send OTP via email. For now, we'll return it for demo purposes or log it.
        console.log(`OTP for ${email}: ${otp}`);
        
        res.json({ success: true, message: "OTP sent to your email (check console for demo)" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await userModel.findOne({ 
            email, 
            otp, 
            otpExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.json({ success: false, message: "Invalid or expired OTP" });
        }

        res.json({ success: true, message: "OTP verified" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await userModel.findOne({ 
            email, 
            otp, 
            otpExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.json({ success: false, message: "Invalid or expired OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export { loginUser, registerUser, adminLogin, getProfile, forgotPassword, verifyOTP, resetPassword }
