


import express from 'express'
import { login, getMe } from '../controllers_for_web/auth.controller.js'
import passport from '../middleware/passport.js' // ✅ use passport instead
import rolesMiddleware from '../middleware/roles.middleware.js'
const router = express.Router()


router.post('/login', login)
router.get('/me', passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), getMe) // ✅ use passport
export default router