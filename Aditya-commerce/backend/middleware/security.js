import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
import cors from 'cors'

// Security middleware configuration
export const securityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.cloudinary.com"],
        connectSrc: ["'self'", "https://api.razorpay.com", "https://*.stripe.com"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }))

  // Enable CORS with specific origin
  const envOriginList = String(process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const defaultOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]
    .map((s) => String(s || '').trim())
    .filter(Boolean)

  const allowedOrigins = Array.from(new Set([...envOriginList, ...defaultOrigins]))

  const corsOptions = {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      return cb(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'token', 'Authorization'],
    optionsSuccessStatus: 200,
  }
  app.use(cors(corsOptions))

  // Rate limiting for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
  })

  // Apply to authentication routes
  app.use('/api/user/login', authLimiter)
  app.use('/api/user/register', authLimiter)
  app.use('/api/user/admin', authLimiter)

  // General rate limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  })

  // Apply to all routes except authentication
  app.use('/api', generalLimiter)

  // Slow down repeated requests
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests at full speed
    delayMs: 100 // Add 100ms of delay per request after 50
  })

  app.use(speedLimiter)

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize())

  // Data sanitization against XSS
  app.use(xss())

  // Prevent parameter pollution
  app.use(hpp({
    whitelist: [
      'price',
      'rating',
      'category',
      'subCategory',
      'bestseller',
      'stockQuantity'
    ]
  }))

  // Security headers
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY')
    
    // Enable XSS protection in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block')
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff')
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Permissions policy
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    next()
  })
}

// Input validation middleware
export const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      })
    }
    
    next()
  }
}

// File upload validation
export const validateFileUpload = (req, res, next) => {
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  const maxFiles = parseInt(process.env.MAX_FILES) || 5
  
  if (req.files) {
    const files = Object.values(req.files).flat()
    
    // Check file count
    if (files.length > maxFiles) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxFiles} files allowed`
      })
    }
    
    // Check file sizes
    for (const file of files) {
      if (file.size > maxFileSize) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} exceeds maximum size of ${maxFileSize / (1024 * 1024)}MB`
        })
      }
      
      // Check file types
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm'
      ]
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File type ${file.mimetype} not allowed`
        })
      }
    }
  }
  
  next()
}

// Logging middleware for security events
export const securityLogger = (req, res, next) => {
  const securityEvents = [
    'login_failed',
    'login_success',
    'register_attempt',
    'admin_access',
    'file_upload',
    'payment_attempt'
  ]
  
  // Log security-relevant events
  if (securityEvents.some(event => req.path.includes(event) || req.method === 'POST' && req.path.includes('/api'))) {
    console.log(`[SECURITY] ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.headers['user-agent']}`)
  }
  
  next()
}
