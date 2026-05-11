import careerApplicationModel from '../models/careerApplicationModel.js'
import notificationModel from '../models/notificationModel.js'

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())

const applyCareer = async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim()
    const email = normalizeEmail(req.body?.email)
    const phone = String(req.body?.phone || '').trim()
    const role = String(req.body?.role || '').trim()
    const department = String(req.body?.department || '').trim()
    const positionId = String(req.body?.positionId || '').trim()
    const positionTitle = String(req.body?.positionTitle || '').trim()
    const portfolioUrl = String(req.body?.portfolioUrl || '').trim()
    const resumeUrl = String(req.body?.resumeUrl || '').trim()
    const coverLetter = String(req.body?.coverLetter || '').trim()

    if (!name) return res.json({ success: false, message: 'Name is required' })
    if (!isValidEmail(email)) return res.json({ success: false, message: 'Enter a valid email address' })
    if (!positionTitle) return res.json({ success: false, message: 'Select a position' })
    if (coverLetter && coverLetter.length > 4000) return res.json({ success: false, message: 'Cover letter is too long' })

    const doc = await careerApplicationModel.create({
      name,
      email,
      phone,
      role,
      department,
      positionId,
      positionTitle,
      portfolioUrl,
      resumeUrl,
      coverLetter,
    })

    await notificationModel.create({
      scope: 'admin',
      type: 'career_application',
      title: 'New Career Application',
      message: `${name} applied for ${positionTitle}`,
      meta: { applicationId: String(doc._id), email, positionTitle, department },
      read: false,
    })

    res.json({ success: true, message: 'Application submitted successfully' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to submit application' })
  }
}

const listCareerApplications = async (req, res) => {
  try {
    const limit = Math.min(300, Math.max(1, Number(req.query?.limit || 80)))
    const status = String(req.query?.status || '').trim()
    const search = String(req.query?.search || '').trim()
    const query = {}
    if (status) query.status = status
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { positionTitle: { $regex: search, $options: 'i' } },
      ]
    }
    const applications = await careerApplicationModel.find(query).sort({ createdAt: -1 }).limit(limit).lean()
    res.json({ success: true, applications })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to load applications' })
  }
}

const updateCareerApplicationStatus = async (req, res) => {
  try {
    const { id, status } = req.body
    if (!id) return res.json({ success: false, message: 'id is required' })
    if (!['new', 'reviewed', 'shortlisted', 'rejected'].includes(String(status || ''))) {
      return res.json({ success: false, message: 'Invalid status' })
    }
    await careerApplicationModel.findByIdAndUpdate(id, { status })
    res.json({ success: true, message: 'Updated' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Failed to update application' })
  }
}

export { applyCareer, listCareerApplications, updateCareerApplicationStatus }

