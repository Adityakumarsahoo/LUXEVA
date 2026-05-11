import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async () => {

    mongoose.connection.on('connected',() => {
        console.log("DB Connected");
    })

    const rawMongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || 'e-commerce';

    if (!rawMongoUri) {
        throw new Error('MONGODB_URI is not set. Add it to backend/.env');
    }

    const mongoUri = String(rawMongoUri).trim().replace(/^['"]|['"]$/g, '')

    if (/@cluster\.mongodb\.net(?:\/|\?|$)/i.test(mongoUri)) {
        throw new Error(
            'MONGODB_URI looks like a template (…@cluster.mongodb.net…). Replace it with your real MongoDB Atlas host (e.g. …@cluster0.xxxxx.mongodb.net…) or use a local mongodb:// URI.'
        )
    }

    const connectOnce = async () => mongoose.connect(mongoUri, { dbName })

    try {
        await connectOnce()
    } catch (err) {
        if (err?.code === 'ENOTFOUND' && mongoUri.startsWith('mongodb+srv://')) {
            try {
                dns.setServers(['1.1.1.1', '8.8.8.8'])
                await connectOnce()
                return
            } catch (retryErr) {
                const msg = retryErr?.message || retryErr
                throw new Error(
                    `MongoDB SRV DNS lookup failed (ENOTFOUND). Fix your DNS/network or use a non-SRV connection string (mongodb://...) from MongoDB Atlas. Details: ${msg}`
                )
            }
        }
        throw err
    }

}

export default connectDB;
