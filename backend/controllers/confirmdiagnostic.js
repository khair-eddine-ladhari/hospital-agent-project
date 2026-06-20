
import axios from "axios";
import Patient from "../models/Patient.js";

const NOTE_SERVICE_URL = "http://localhost:5002";




const confirmNoteRouter = async (req, res) => {
  try {
    const { patientId, rawNote, symptoms, diagnoses, medications } = req.body;

    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const summary = [
      rawNote.trim(),
      "",
      `Symptoms: ${symptoms?.length ? symptoms.join(", ") : "none"}`,
    ].join("\n");

    patient.notes.push({ content: summary });
    if (diagnoses?.length) {
      patient.diagnoses.push(...diagnoses.map(name => ({ name })));
    }
    if (medications?.length) {
      patient.medications.push(...medications.map(name => ({ name })));
    }

    await patient.save();
    res.json({ message: "Saved", patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export default confirmNoteRouter;