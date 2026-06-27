import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import sanitizeHtml from 'sanitize-html'

import connectDB from './config/db.js'
import structuringRouter from './controllers/diagnostics.js'
import timelineRouter from "./controllers/timeline.js"
import { servicesChatRouter, clearServicesHistoryRouter } from "./controllers/agent_faq.js"
import { searchNotesRouter } from "./controllers/rag.js"
import confirmNoteRouter from "./controllers/confirmdiagnostic.js"
import authRoutes from "./routes/auth.routes.js"
import patinetsRouter from "./routes/patient.router.js"
import passport from "./middleware/passport.js"
import rolesMiddleware from "./middleware/roles.middleware.js"
import adminRoutes from './routes/admin.router.js'

dotenv.config()
connectDB()

const app = express()

// ── 1. Security headers
app.use(helmet())

// ── 2. CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

// ── 3. Body parsing with size limit
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ── 4. Sanitize body (XSS + NoSQL injection) — no req.query mutation
const sanitizeObject = (obj) => {
  for (const key in obj) {
    // Strip MongoDB operators from keys
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key]
      continue
    }
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeHtml(obj[key], { allowedTags: [], allowedAttributes: {} })
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key])
    }
  }
}

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') sanitizeObject(req.body)
  next()
})

// ── 5. Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many auth attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', generalLimiter)
app.use('/api/auth', authLimiter)

// ── 6. Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
  })
}

// ── 7. Auth shorthand
const auth = [passport.authenticate('jwt', { session: false }), rolesMiddleware(['admin', 'doctor'])]

// ── Routes
app.post("/api/doctor/structure-note",          ...auth, structuringRouter)
app.post("/api/doctor/confirm-note",            ...auth, confirmNoteRouter)
app.get( "/api/patient/:patientId/timeline",    ...auth, timelineRouter)
app.post("/api/doctor/search-notes",            ...auth, searchNotesRouter)

app.post("/api/services-chat",       servicesChatRouter)
app.post("/api/services-chat/clear", clearServicesHistoryRouter)

app.use('/api/auth',  authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/',      patinetsRouter)

// ── 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// ── Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500
  const message = process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  res.status(status).json({ message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))