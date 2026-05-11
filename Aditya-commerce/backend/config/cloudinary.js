import {v2 as cloudinary } from "cloudinary"

const connectCloudinary = async () => {

    const cloudName = process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY
    const apiSecret =
        process.env.CLOUDINARY_SECRET_KEY ||
        process.env.CLOUDINARY_API_SECRET ||
        process.env.CLOUDINARY_SECRET

    const looksPlaceholder = (v) => {
        const s = String(v || '').trim()
        if (!s) return true
        return /^your_/i.test(s) || s.includes('your_actual_') || s.includes('your-cloudinary')
    }

    if (looksPlaceholder(cloudName) || looksPlaceholder(apiKey) || looksPlaceholder(apiSecret)) {
        if (String(process.env.REQUIRE_CLOUDINARY || '').toLowerCase() === 'true' || process.env.NODE_ENV === 'production') {
            throw new Error(
                'Cloudinary credentials are not configured. Please set CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET_KEY in backend/.env (and restart the backend).'
            )
        }
        console.warn(
            'Cloudinary is not configured. Upload endpoints may fail until you set CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET_KEY in backend/.env.'
        )
        return false
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
    })

    return true
}

export default connectCloudinary;
