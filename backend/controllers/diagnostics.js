import axios from "axios";

const NOTE_SERVICE_URL = process.env.AI_SERVICE_URL;
console.log("AI_SERVICE_URL:", process.env.AI_SERVICE_URL);

const structuringRouter = async (req, res) => {
  try {
    const { note } = req.body; // ✅ read from request body

    if (!note?.trim()) {
      return res.status(400).json({ message: "note is required" });
    }

    let structured;
    try {
      const aiRes = await axios.post(`${NOTE_SERVICE_URL}/structure-note`, { note });
      structured = aiRes.data.response;
    } catch (aiErr) {
      console.error("Note structuring service error:", aiErr.message);
      return res.status(502).json({ message: "Note structuring service is currently unavailable." });
    }

    // ✅ shape the frontend expects: res.data.response
    res.json({ response: structured });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default structuringRouter;