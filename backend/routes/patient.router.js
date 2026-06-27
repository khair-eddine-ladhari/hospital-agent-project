





import express from 'express'
import { getMyPatients } from '../controllers_for_web/patients.controller.js'
import passport from '../middleware/passport.js' // ✅ use passport instead
import rolesMiddleware from '../middleware/roles.middleware.js'
import { getPatientById, getPatientNotes, addPatientNote } from "../controllers_for_web/patients.controller.js";
import { getChatHistory, sendChatMessage } from "../controllers/patient_status.js";
import { deletePatient } from "../controllers_for_web/patients.controller.js";
import Patient from '../models/Patient.js'; // adjust path as needed
import { createPatient } from "../controllers_for_web/patients.controller.js";
import addstatus from '../controllers/addstatus.js'
const router = express.Router()



router.get('/doctor/patients', passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), getMyPatients) // ✅ use passport



router.get("/doctor/patient/:id",        passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), getPatientById);
router.get("/doctor/patient/:id/notes",   passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), getPatientNotes);
router.post("/doctor/patient/:id/notes", passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), addPatientNote);



router.get("/doctor/patient/:id/chat",   passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), getChatHistory);
router.post("/doctor/patient/:id/chat",  passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), sendChatMessage);




router.post("/doctor/patients",  passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), createPatient);


router.delete("/doctor/patients/:id", passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']), deletePatient);





router.put("/doctor/patients/:id",  passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']),addstatus);
export default router