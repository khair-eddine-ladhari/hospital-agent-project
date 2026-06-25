


// controllers/patient.controller.js
import Patient from '../models/Patient.js'

// GET /api/doctor/patients — only patients assigned to the logged-in doctor
export const getMyPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ assignedDoctor: req.user._id })
    res.json(patients)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/doctor/patient/:id
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      assignedDoctor: req.user._id,   // only the assigned doctor can access
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    res.status(200).json({ patient });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// GET /api/doctor/patient/:id/notes
export const getPatientNotes = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      assignedDoctor: req.user._id,
    }).select("notes");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // newest first
    const notes = [...patient.notes].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({ notes });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// POST /api/doctor/patient/:id/notes
export const addPatientNote = async (req, res) => {
  try {
    const { text, structured } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Note text is required." });
    }

    const patient = await Patient.findOne({
      _id: req.params.id,
      assignedDoctor: req.user._id,
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    patient.notes.push({ text, structured });
    patient.lastVisit = new Date();
    await patient.save();

    // return the note that was just added (last in array)
    const savedNote = patient.notes[patient.notes.length - 1];

    res.status(201).json({ note: savedNote });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};