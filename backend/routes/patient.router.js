





import express from 'express'
import { getMyPatients } from '../controllers_for_web/patients.controller.js'
import passport from '../middleware/passport.js' // ✅ use passport instead
import rolesMiddleware from '../middleware/roles.middleware.js'
import { getPatientById, getPatientNotes, addPatientNote } from "../controllers_for_web/patients.controller.js";
const router = express.Router()



router.get('/doctor/patients', passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), getMyPatients) // ✅ use passport



router.get("/doctor/patient/:id",        passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), getPatientById);
router.get("/doctor/patient/:id/notes",   passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), getPatientNotes);
router.post("/doctor/patient/:id/notes", passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), addPatientNote);



export default router