import { indexNoteForSearch } from "./rag.js";
import Patient from "../models/Patient.js";

const confirmNoteRouter = async (req, res) => {
  try {
    const { patientId, rawNote, structured } = req.body;
    // structured = { symptoms, diagnosis, medications, icd10 }

    const patient = await Patient.findById(patientId); // ✅ use _id
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // ✅ build the note using correct schema shape
    const newNoteData = {
      text: rawNote,
      structured: {
        symptoms:    structured?.symptoms    ?? [],
        diagnosis:   structured?.diagnosis   ?? [],
        medications: structured?.medications ?? [],
        icd10:       structured?.icd10       ?? null,
      },
    };

    patient.notes.push(newNoteData);

    // ✅ merge into patient-level arrays without duplicates
    if (structured?.diagnosis?.length) {
      const existing = new Set(patient.diagnoses);
      structured.diagnosis.forEach(d => existing.add(d));
      patient.diagnoses = [...existing];
    }
    if (structured?.medications?.length) {
      const existing = new Set(patient.medications);
      structured.medications.forEach(m => existing.add(m));
      patient.medications = [...existing];
    }
    if (structured?.symptoms?.length) {
      const existing = new Set(patient.symptoms);
      structured.symptoms.forEach(s => existing.add(s));
      patient.symptoms = [...existing];
    }

    patient.lastVisit = new Date();
    await patient.save();

    const savedNote = patient.notes[patient.notes.length - 1];

    // fire-and-forget RAG indexing
    indexNoteForSearch({
      noteId:      savedNote._id.toString(),
      patientId:   patient._id.toString(),
      patientName: patient.fullName,
      content:     rawNote,
      date:        savedNote.createdAt,
      doctor: req.user?._id?.toString() ?? "unknown",
    });

    res.json({ message: "Saved", note: savedNote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default confirmNoteRouter;