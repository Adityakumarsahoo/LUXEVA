import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    cartData: { type: Object, default: {} },
    role: { 
        type: String, 
        enum: ['customer', 'admin', 'seller', 'delivery', 'support', 'warehouse'], 
        default: 'customer' 
    },
    status: { 
        type: String, 
        enum: ['active', 'pending', 'rejected', 'suspended'], 
        default: 'active' 
    },
    isBlocked: { type: Boolean, default: false },
    activityStatus: { type: String, default: 'offline' },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
}, { minimize: false, timestamps: true })

const userModel = mongoose.models.user || mongoose.model('user',userSchema);

export default userModel
