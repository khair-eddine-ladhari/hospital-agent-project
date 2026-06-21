import axios from "axios";
import Patient from "../models/Patient.js";

const NOTE_SERVICE_URL = "http://localhost:5002";

const structuringRouter = async (req, res) => {
  try {
       const patientId="507f1f77bcf86cd799439011";
    const note ="Patient presents with fever, cough, and fatigue for 3 days. Diagnosed with community-acquired pneumonia. Started on Azithromycin and Amoxicillin.";

    if (!patientId) return res.status(400).json({ message: "patientId is required" });
    if (!note?.trim()) return res.status(400).json({ message: "note is required" });

    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    let structured;
    try {
      const aiRes = await axios.post(`${NOTE_SERVICE_URL}/structure-note`, { note });
      structured = aiRes.data.response;
    } catch (aiErr) {
      console.error("Note structuring service error:", aiErr.message);
      return res.status(502).json({ message: "Note structuring service is currently unavailable." });
    }

    const missingFields = [];
    if (!structured.symptoms?.length) missingFields.push("symptoms");
    if (!structured.diagnoses?.length) missingFields.push("diagnoses");
    if (!structured.medications?.length) missingFields.push("medications");
    if (!structured.icd10) missingFields.push("icd10");

    // NOT saved yet — just returned for review
    res.json({ structured, missingFields, rawNote: note });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default structuringRouter;


