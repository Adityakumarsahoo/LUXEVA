import notificationModel from '../models/notificationModel.js'

const listAdminNotifications = async (req, res) => {
  try {
    const limit = Math.min(300, Math.max(1, Number(req.query?.limit || 80)))
    const unreadOnly = String(req.query?.unreadOnly || '') === 'true'
    const type = String(req.query?.type || '').trim()

    const query = { scope: 'admin' }
    if (unreadOnly) query.read = false
    if (type) query.type = type

    const notifications = await notificationModel.find(query).sort({ createdAt: -1 }).limit(limit).lean()
    const unreadCount = await notificationModel.countDocuments({ scope: 'admin', read: false })

    res.json({ success: true, notifications, unreadCount })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to load notifications' })
  }
}

const markAdminNotificationRead = async (req, res) => {
  try {
    const { id, read } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })
    await notificationModel.findByIdAndUpdate(id, { read: read !== false })
    res.json({ success: true, message: 'Updated' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to update notification' })
  }
}

const markAdminAllRead = async (req, res) => {
  try {
    await notificationModel.updateMany({ scope: 'admin', read: false }, { $set: { read: true } })
    res.json({ success: true, message: 'All marked as read' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to update notifications' })
  }
}

const deleteAdminNotification = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })
    await notificationModel.findByIdAndDelete(id)
    res.json({ success: true, message: 'Deleted' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to delete notification' })
  }
}

export { listAdminNotifications, markAdminNotificationRead, markAdminAllRead, deleteAdminNotification }

