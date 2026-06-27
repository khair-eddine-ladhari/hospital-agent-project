import User from '../models/User.js'
import bcrypt from 'bcryptjs'

// ── POST /api/admin/doctors ─────────────────────────────────────────────────
// Create a new doctor account
export const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialty, schedule } = req.body

    if (!name || !email || !password || !specialty) {
      return res.status(400).json({ message: 'Name, email, password and specialty are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const hashed = await bcrypt.hash(password, 10)

    const doctor = await User.create({
      name,
      email,
      password: hashed,
      specialty,
      schedule: schedule || [],
      role: 'doctor',
      isActive: true,
    })

    res.status(201).json({
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
      schedule: doctor.schedule,
      isActive: doctor.isActive,
      role: doctor.role,
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── GET /api/admin/doctors ──────────────────────────────────────────────────
// List all doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password').lean()
    res.json(doctors)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── PUT /api/admin/doctors/:id ──────────────────────────────────────────────
// Edit a doctor (name, specialty, schedule, isActive)
export const updateDoctor = async (req, res) => {
  try {
    const { name, specialty, schedule, isActive, password } = req.body

    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' })
    }

    if (name)      doctor.name      = name
    if (specialty) doctor.specialty = specialty
    if (schedule)  doctor.schedule  = schedule
    if (typeof isActive === 'boolean') doctor.isActive = isActive

    // allow password reset by admin
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' })
      }
      doctor.password = await bcrypt.hash(password, 10)
    }

    await doctor.save()

    res.json({
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
      schedule: doctor.schedule,
      isActive: doctor.isActive,
      role: doctor.role,
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── DELETE /api/admin/doctors/:id ──────────────────────────────────────────
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findOneAndDelete({ _id: req.params.id, role: 'doctor' })
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' })
    }
    res.json({ message: 'Doctor deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}