import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    orderId: { type: String, default: '' },
    userId: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'inr' },
    method: { type: String, default: '' },
    status: { type: String, default: 'created' },
    provider: { type: String, default: '' },
    providerRef: { type: String, default: '' },
    raw: { type: Object, default: {} },
    isRefund: { type: Boolean, default: false },
    refundStatus: { type: String, default: '' },
    refundAmount: { type: Number, default: 0 },
  },
  { minimize: false, timestamps: true }
)

const transactionModel = mongoose.models.transaction || mongoose.model('transaction', transactionSchema)

export default transactionModel
