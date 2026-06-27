// routes/admin.routes.js
import express from 'express'
import passport from 'passport'
import rolesMiddleware  from '../middleware/roles.middleware.js'
import {
  createDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor
  
} from '../controllers_for_web/admin.controller.js'

const router = express.Router()

const auth = passport.authenticate('jwt', { session: false })
const adminOnly = rolesMiddleware(['admin'])

router.post('/doctors',              auth, adminOnly, createDoctor)
router.get('/doctors',               auth, adminOnly, getDoctors)
router.put('/doctors/:id',           auth, adminOnly, updateDoctor)
router.delete('/doctors/:id',           auth, adminOnly, deleteDoctor)

export default router