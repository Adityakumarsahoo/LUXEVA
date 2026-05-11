import subscriptionModel from '../models/subscriptionModel.js'
import notificationModel from '../models/notificationModel.js'

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

const isValidEmail = (email) => {
  const s = String(email || '').trim()
  if (!s) return false
  if (s.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

const subscribe = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email)
    if (!isValidEmail(email)) return res.json({ success: false, message: 'Enter a valid email address' })

    const existing = await subscriptionModel.findOne({ email }).select('_id').lean()
    if (existing) return res.json({ success: false, message: 'This email is already subscribed' })

    await subscriptionModel.create({ email })
    await notificationModel.create({
      scope: 'admin',
      type: 'subscription',
      title: 'New Newsletter Subscriber',
      message: email,
      meta: { email },
      read: false,
    })
    res.json({ success: true, message: 'Subscribed successfully' })
  } catch (error) {
    const msg = String(error?.message || '')
    if (msg.toLowerCase().includes('duplicate')) {
      return res.json({ success: false, message: 'This email is already subscribed' })
    }
    console.log(error)
    res.json({ success: false, message: 'Failed to subscribe' })
  }
}

const listSubscriptions = async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query?.limit || 50)))
    const subscriptions = await subscriptionModel.find({}).sort({ createdAt: -1 }).limit(limit).lean()
    res.json({ success: true, subscriptions })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to load subscriptions' })
  }
}

export { subscribe, listSubscriptions }
