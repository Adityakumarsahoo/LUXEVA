import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'

const ensureDir = (dir) => {
  if (fs.existsSync(dir)) return
  fs.mkdirSync(dir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const base = path.resolve(process.cwd(), 'uploads', 'categories')
    ensureDir(base)
    cb(null, base)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png'
    const safeBase = String(file.originalname || 'file')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
    const stamp = Date.now().toString(36)
    cb(null, `${safeBase || 'image'}-${stamp}${ext}`)
  },
})

const upload = multer({ storage })

export default upload
