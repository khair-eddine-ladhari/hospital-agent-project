import { indexNoteForSearch } from "./rag.js"; // import at the top of the file
import Patient from "../models/Patient.js";
const confirmNoteRouter = async (req, res) => {
  try {
    const { patientId, rawNote, symptoms, diagnoses, medications } = req.body;

    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ message: "Patient not 1 found" });

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

    // ↓ THIS is the call. Grab the note that was just added — Mongoose
    // auto-assigns it an _id once patient.save() runs.
    const newNote = patient.notes[patient.notes.length - 1];

    indexNoteForSearch({
      noteId: newNote._id.toString(),
      patientId: patient.patientId,
      patientName: patient.fullName,   // adjust to your actual schema field
      content: summary,
      date: newNote.createdAt,
      doctor: req.body.doctor || "unknown",
    });
    // ← notice: no `await` here. Fire-and-forget on purpose — indexing
    // shouldn't make the doctor wait before getting "Saved" back.

    res.json({ message: "Saved", patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export default confirmNoteRouter