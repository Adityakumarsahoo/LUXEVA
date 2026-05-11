import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import transactionModel from "../models/transactionModel.js";
import notificationModel from "../models/notificationModel.js";
import productModel from "../models/productModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'

// global variables
const currency = 'inr'
const deliveryCharge = 10

let stripeClient;
const getStripeClient = () => {
    if (stripeClient) return stripeClient;
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
    return stripeClient;
}

let razorpayClient;
const getRazorpayClient = () => {
    if (razorpayClient) return razorpayClient;
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is not set')
    }
    razorpayClient = new razorpay({
        key_id : process.env.RAZORPAY_KEY_ID,
        key_secret : process.env.RAZORPAY_KEY_SECRET,
    })
    return razorpayClient;
}

const enrichOrderItems = async (items) => {
    const list = Array.isArray(items) ? items : []
    const ids = Array.from(
        new Set(
            list
                .map((x) => String(x?.productId || x?._id || '').trim())
                .filter(Boolean)
        )
    )
    if (!ids.length) return list

    const products = await productModel.find({ _id: { $in: ids } }).select('_id sellerId').lean()
    const map = new Map(products.map((p) => [String(p._id), String(p.sellerId || '')]))

    return list.map((x) => {
        const productId = String(x?.productId || x?._id || '').trim()
        const sellerId = String(x?.sellerId || '').trim() || map.get(productId) || ''
        return { ...x, productId, sellerId }
    })
}

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    
    try {
        
        const { userId, items, amount, address} = req.body;
        const enrichedItems = await enrichOrderItems(items)

        const orderData = {
            userId,
            items: enrichedItems,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await notificationModel.create({
            scope: 'admin',
            type: 'order',
            title: 'New Order Created',
            message: `Order ${String(newOrder._id).slice(-6).toUpperCase()} via Razorpay`,
            meta: { orderId: String(newOrder._id), userId: String(userId), method: 'Razorpay', amount: Number(amount) },
            read: false,
        })

        await notificationModel.create({
            scope: 'admin',
            type: 'order',
            title: 'New Order Placed',
            message: `Order ${String(newOrder._id).slice(-6).toUpperCase()} via COD`,
            meta: { orderId: String(newOrder._id), userId: String(userId), method: 'COD', amount: Number(amount) },
            read: false,
        })

        await transactionModel.create({
            orderId: String(newOrder._id),
            userId: String(userId),
            amount: Number(amount),
            currency,
            method: 'COD',
            status: 'pending',
            provider: 'cod',
            providerRef: '',
            raw: {},
        })

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"Order Placed"})


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Stripe Method
const placeOrderStripe = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body
        const { origin } = req.headers;
        const enrichedItems = await enrichOrderItems(items)

        const orderData = {
            userId,
            items: enrichedItems,
            address,
            amount,
            paymentMethod:"Stripe",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await notificationModel.create({
            scope: 'admin',
            type: 'order',
            title: 'New Order Created',
            message: `Order ${String(newOrder._id).slice(-6).toUpperCase()} via Stripe`,
            meta: { orderId: String(newOrder._id), userId: String(userId), method: 'Stripe', amount: Number(amount) },
            read: false,
        })

        const line_items = items.map((item) => ({
            price_data: {
                currency:currency,
                product_data: {
                    name:item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency:currency,
                product_data: {
                    name:'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await getStripeClient().checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:  `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        await transactionModel.create({
            orderId: String(newOrder._id),
            userId: String(userId),
            amount: Number(amount),
            currency,
            method: 'Stripe',
            status: 'created',
            provider: 'stripe',
            providerRef: String(session?.id || ''),
            raw: { sessionId: session?.id || '', url: session?.url || '' },
        })

        res.json({success:true,session_url:session.url});

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Verify Stripe 
const verifyStripe = async (req,res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {payment:true});
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
            await transactionModel.findOneAndUpdate(
                { orderId: String(orderId), provider: 'stripe' },
                { $set: { status: 'paid' } }
            )
            res.json({success: true});
        } else {
            await transactionModel.findOneAndUpdate(
                { orderId: String(orderId), provider: 'stripe' },
                { $set: { status: 'failed' } }
            )
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body
        const enrichedItems = await enrichOrderItems(items)

        const orderData = {
            userId,
            items: enrichedItems,
            address,
            amount,
            paymentMethod:"Razorpay",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt : newOrder._id.toString()
        }

        await getRazorpayClient().orders.create(options, (error,order)=>{
            if (error) {
                console.log(error)
                return res.json({success:false, message: error})
            }
            transactionModel.create({
                orderId: String(newOrder._id),
                userId: String(userId),
                amount: Number(amount),
                currency,
                method: 'Razorpay',
                status: String(order?.status || 'created'),
                provider: 'razorpay',
                providerRef: String(order?.id || ''),
                raw: order || {},
            }).catch(() => {})
            res.json({success:true,order})
        })

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const verifyRazorpay = async (req,res) => {
    try {
        
        const { userId, razorpay_order_id  } = req.body

        const orderInfo = await getRazorpayClient().orders.fetch(razorpay_order_id)
        if (orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt,{payment:true});
            await userModel.findByIdAndUpdate(userId,{cartData:{}})
            await transactionModel.findOneAndUpdate(
                { orderId: String(orderInfo.receipt), provider: 'razorpay' },
                { $set: { status: 'paid', providerRef: String(razorpay_order_id || ''), raw: orderInfo || {} } }
            )
            res.json({ success: true, message: "Payment Successful" })
        } else {
             await transactionModel.findOneAndUpdate(
                { orderId: String(orderInfo.receipt), provider: 'razorpay' },
                { $set: { status: 'failed', providerRef: String(razorpay_order_id || ''), raw: orderInfo || {} } }
             )
             res.json({ success: false, message: 'Payment Failed' });
        }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {
        
        const orders = await orderModel.find({})
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const sellerOrders = async (req, res) => {
    try {
        const sellerId = String(req.user?.id || '').trim()
        if (!sellerId) return res.json({ success: false, message: 'Not Authorized' })

        let orders = await orderModel
            .find({ items: { $elemMatch: { sellerId } } })
            .sort({ date: -1 })

        if (!orders?.length) {
            const recent = await orderModel.find({}).sort({ date: -1 }).limit(250)
            const productIds = Array.from(
                new Set(
                    recent
                        .flatMap((o) => (Array.isArray(o?.items) ? o.items : []))
                        .map((it) => String(it?.productId || it?._id || '').trim())
                        .filter(Boolean)
                )
            )

            const products = productIds.length
                ? await productModel.find({ _id: { $in: productIds } }).select('_id sellerId').lean()
                : []
            const idToSeller = new Map(products.map((p) => [String(p._id), String(p.sellerId || '')]))

            orders = recent.filter((o) => {
                const items = Array.isArray(o?.items) ? o.items : []
                return items.some((it) => {
                    const sid = String(it?.sellerId || '').trim() || idToSeller.get(String(it?.productId || it?._id || '').trim()) || ''
                    return sid === sellerId
                })
            })
        }

        const out = (orders || []).map((o) => {
            const obj = o.toObject ? o.toObject() : o
            const items = Array.isArray(obj?.items) ? obj.items : []
            const sellerItems = items.filter((it) => String(it?.sellerId || '').trim() === sellerId)
            const sellerAmount = sellerItems.reduce((sum, it) => sum + Number(it?.price || 0) * Number(it?.quantity || 1), 0)
            return { ...obj, items: sellerItems, sellerAmount }
        })

        res.json({ success: true, orders: out })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const sellerUpdateStatus = async (req, res) => {
    try {
        const sellerId = String(req.user?.id || '').trim()
        const { orderId, status } = req.body
        if (!sellerId) return res.json({ success: false, message: 'Not Authorized' })
        if (!orderId || !status) return res.json({ success: false, message: 'orderId and status required' })

        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })

        const items = Array.isArray(order?.items) ? order.items : []
        const allMine = items.length > 0 && items.every((it) => String(it?.sellerId || '').trim() === sellerId)
        if (!allMine) return res.json({ success: false, message: 'Not Authorized' })

        await orderModel.findByIdAndUpdate(orderId, {
            status,
            $push: { statusHistory: { at: Date.now(), by: 'seller', status } }
        })
        res.json({ success: true, message: 'Status Updated' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
    try {
        
        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, {
            status,
            $push: { statusHistory: { at: Date.now(), by: 'admin', status } }
        })
        res.json({success:true,message:'Status Updated'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const assignDeliveryPartner = async (req, res) => {
    try {
        const { orderId, deliveryPartnerId } = req.body
        if (!orderId || !deliveryPartnerId) return res.json({ success: false, message: 'orderId and deliveryPartnerId required' })
        await orderModel.findByIdAndUpdate(orderId, {
            deliveryPartnerId,
            $push: { statusHistory: { at: Date.now(), by: 'admin', status: `Assigned delivery: ${deliveryPartnerId}` } }
        })
        res.json({ success: true, message: 'Delivery partner assigned' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const deliveryOrders = async (req, res) => {
    try {
        const userId = req.user?.id
        const orders = await orderModel.find({ deliveryPartnerId: userId }).sort({ date: -1 })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateDeliveryStatus = async (req, res) => {
    try {
        const userId = req.user?.id
        const { orderId, status } = req.body
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (String(order.deliveryPartnerId || '') !== String(userId || '')) {
            return res.json({ success: false, message: 'Not Authorized' })
        }
        await orderModel.findByIdAndUpdate(orderId, {
            status,
            $push: { statusHistory: { at: Date.now(), by: 'delivery', status } }
        })
        res.json({ success: true, message: 'Status Updated' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const warehouseOrders = async (req, res) => {
    try {
        const userId = req.user?.id
        const orders = await orderModel
            .find({ status: { $in: ['Order Placed', 'Packing'] } })
            .sort({ date: -1 })
        const normalized = orders.map((o) => {
            const obj = o.toObject()
            if (!obj.warehouseManagerId) obj.warehouseManagerId = ''
            return obj
        })
        res.json({ success: true, orders: normalized, userId })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateWarehouseStatus = async (req, res) => {
    try {
        const userId = req.user?.id
        const { orderId, status } = req.body
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        const current = String(order.warehouseManagerId || '')
        if (current && current !== String(userId || '')) return res.json({ success: false, message: 'Not Authorized' })
        await orderModel.findByIdAndUpdate(orderId, {
            warehouseManagerId: String(userId),
            status,
            $push: { statusHistory: { at: Date.now(), by: 'warehouse', status } }
        })
        res.json({ success: true, message: 'Status Updated' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const requestRefund = async (req, res) => {
    try {
        const userId = req.user?.id
        const { orderId, note } = req.body
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (String(order.userId) !== String(userId || '')) return res.json({ success: false, message: 'Not Authorized' })
        await orderModel.findByIdAndUpdate(orderId, {
            refundRequested: true,
            refundStatus: 'Requested',
            refundNote: String(note || ''),
            $push: { statusHistory: { at: Date.now(), by: 'user', status: 'Refund Requested' } }
        })
        res.json({ success: true, message: 'Refund requested' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const supportRefundQueue = async (req, res) => {
    try {
        const orders = await orderModel.find({ refundRequested: true }).sort({ date: -1 })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const supportResolveRefund = async (req, res) => {
    try {
        const userId = req.user?.id
        const { orderId, refundStatus, refundNote } = req.body
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        await orderModel.findByIdAndUpdate(orderId, {
            supportAgentId: String(userId),
            refundStatus: String(refundStatus || ''),
            refundNote: String(refundNote || ''),
            $push: { statusHistory: { at: Date.now(), by: 'support', status: `Refund: ${refundStatus}` } }
        })
        res.json({ success: true, message: 'Refund updated' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {verifyRazorpay, verifyStripe ,placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, sellerOrders, sellerUpdateStatus, updateStatus, assignDeliveryPartner, deliveryOrders, updateDeliveryStatus, warehouseOrders, updateWarehouseStatus, requestRefund, supportRefundQueue, supportResolveRefund}
