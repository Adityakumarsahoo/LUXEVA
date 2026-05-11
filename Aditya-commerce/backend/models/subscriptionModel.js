import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
)

subscriptionSchema.pre('save', function (next) {
  if (this.email) this.email = String(this.email).trim().toLowerCase()
  next()
})

const subscriptionModel = mongoose.models.subscription || mongoose.model('subscription', subscriptionSchema)

export default subscriptionModel
