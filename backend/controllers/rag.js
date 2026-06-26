



import axios from "axios";

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:5004";

/**
 * Call this from confirmNoteRouter, right after patient.save() succeeds.
 * Fire-and-forget on failure — indexing breaking should never block a
 * note from being saved to the patient's record.
 */
export async function indexNoteForSearch({ noteId, patientId, patientName, content, date, doctor }) {
  try {
    await axios.post(`${RAG_SERVICE_URL}/index-note`, {
      noteId,
      patientId,
      patientName,
      content,
      date,
      doctor,
    });
  } catch (err) {
    console.error("Note indexing failed (note was still saved):", err.message);
  }
}

// POST /api/search-notes  { question: "has anyone mentioned chest pain this week" }
export const searchNotesRouter = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "question is required" });
    }

    const ragRes = await axios.post(`${RAG_SERVICE_URL}/search-notes`, {
  question,
  doctor: req.user._id.toString(), // 👈 only search this doctor's notes
  topK: 5,
});

    res.json(ragRes.data);
  } catch (err) {
    console.error("RAG search error:", err.message);
    res.status(502).json({ message: "Note search service is currently unavailable." });
  }
};