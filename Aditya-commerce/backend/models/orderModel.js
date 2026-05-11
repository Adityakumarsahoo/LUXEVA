import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default:'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true , default: false },
    deliveryPartnerId: { type: String, default: '' },
    warehouseManagerId: { type: String, default: '' },
    supportAgentId: { type: String, default: '' },
    statusHistory: { type: Array, default: [] },
    refundRequested: { type: Boolean, default: false },
    refundStatus: { type: String, default: '' },
    refundNote: { type: String, default: '' },
    date: {type: Number, required:true}
})

const orderModel = mongoose.models.order || mongoose.model('order',orderSchema)
export default orderModel;
