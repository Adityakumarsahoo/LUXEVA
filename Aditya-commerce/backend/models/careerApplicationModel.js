import mongoose from 'mongoose'

const careerApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, default: '' },
    department: { type: String, default: '' },
    positionId: { type: String, default: '' },
    positionTitle: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    status: { type: String, enum: ['new', 'reviewed', 'shortlisted', 'rejected'], default: 'new' },
  },
  { timestamps: true }
)

careerApplicationSchema.index({ email: 1, createdAt: -1 })

const careerApplicationModel =
  mongoose.models.careerApplication || mongoose.model('careerApplication', careerApplicationSchema)

export default careerApplicationModel

