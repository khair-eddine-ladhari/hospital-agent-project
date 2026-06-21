// routes/timeline.js
import Patient from "../models/Patient.js";

const timelineRouter = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const events = [];

    events.push({
      date: patient.createdAt,
      type: "admission",
      label: "Admitted",
    });

    patient.diagnoses.forEach((d) => {
      if (!d.name) return; // ← guard: skip empty diagnosis entries
      events.push({
        date: d.date,
        type: "diagnosis",
        label: `Diagnosed with ${d.name}`,
      });
    });

    patient.medications.forEach((m) => {
      if (!m.name) return; // ← guard: skip empty medication entries
      events.push({
        date: m.date,
        type: "medication",
        label: `${m.name} Prescribed`,
      });
    });

    patient.notes.forEach((n) => {
      if (!n.content) return; // ← guard: skip empty notes
      events.push({
        date: n.createdAt,
        type: "note",
        label: n.content.split("\n")[0],
      });
    });

    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ patientId, timeline: events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default timelineRouter;