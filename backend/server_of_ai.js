


import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import patientStatusRouter from './routes/patient_status.js'
import connectDB from './config/db.js'


dotenv.config()
connectDB()

const app = express()



// ── CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use('/api/patientStatus', patientStatusRouter)


const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))