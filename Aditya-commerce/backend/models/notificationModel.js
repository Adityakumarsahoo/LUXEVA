import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ['admin'], default: 'admin' },
    type: { type: String, default: 'generic' },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    meta: { type: Object, default: {} },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const notificationModel = mongoose.models.notification || mongoose.model('notification', notificationSchema)

export default notificationModel

