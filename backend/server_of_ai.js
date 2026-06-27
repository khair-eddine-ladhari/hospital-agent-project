import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import connectDB from './config/db.js'
import structuringRouter from './controllers/diagnostics.js'
import timelineRouter from "./controllers/timeline.js";
import { servicesChatRouter, clearServicesHistoryRouter } from "./controllers/agent_faq.js";
import { searchNotesRouter } from "./controllers/rag.js"; // import searchNotesRouter from "./controllers/rag.js";
import confirmNoteRouter from "./controllers/confirmdiagnostic.js";
import authRoutes from "./routes/auth.routes.js";
import patinetsRouter from "./routes/patient.router.js";
import passport from "./middleware/passport.js";
import rolesMiddleware from "./middleware/roles.middleware.js";

dotenv.config()
connectDB()

const app = express()
app.use(express.json()) 


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});// ← don't forget this, needed to parse request body

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))



app.post("/api/doctor/structure-note", passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']),structuringRouter); // ✅ add this line // ← use app.post directly



// --- 3. Confirm note (doctor reviews/edits, THIS saves) ---
// Also triggers indexNoteForSearch() internally after save — not a separate route
app.post("/api/doctor/confirm-note", passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']),confirmNoteRouter);




app.get("/api/patient/:patientId/timeline", passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']),timelineRouter);


app.post("/api/services-chat",servicesChatRouter);
app.post("/api/services-chat/clear",clearServicesHistoryRouter);



app.post("/api/doctor/search-notes", passport.authenticate('jwt', { session: false }),rolesMiddleware(['admin', 'doctor']) ,searchNotesRouter);








// ── Routes
app.use('/api/auth', authRoutes)
app.use('/api/',patinetsRouter)
















const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))