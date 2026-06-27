import axios from "axios";
import User from "../models/User.js";
import ChatHistory from "../models/chathistory.js";

const SERVICES_AGENT_URL = "http://localhost:5003";
const MAX_HISTORY_MESSAGES = 10; // keep last 10 turns (5 user + 5 assistant)

const servicesChatRouter = async (req, res) => {
  try {
    const { query } = req.body;
    const sessionId = "507f1f77bcf86cd799439011"; // from your auth/login state

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ message: "query is required" });
    }

    // Find existing session, or create a new one if this is the first message
    let session = await ChatHistory.findOne({ sessionId });
    if (!session) {
      session = new ChatHistory({ sessionId, messages: [] });
    }

    // Shape history for the Python agent: just {role, content}, no createdAt/Mongo noise
    const historyForAI = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

  const doctors = await User.find(
  { role: 'doctor' },
  { name: 1, email: 1, specialty: 1, schedule: 1, _id: 1 }
).lean();

    let aiResponse;
    try {
      const aiRes = await axios.post(`${SERVICES_AGENT_URL}/services-chat`, {
        query,
        doctors,
        history: historyForAI,
      });
      aiResponse = aiRes.data.response;
    } catch (aiErr) {
      console.error("Services agent error:", aiErr.message);
      return res
        .status(502)
        .json({ message: "Services assistant is currently unavailable." });
    }

    // Append this turn, then trim to the cap (keep only the most recent N)
    session.messages.push({ role: "user", content: query });
    session.messages.push({ role: "assistant", content: aiResponse.answer });
    if (session.messages.length > MAX_HISTORY_MESSAGES) {
      session.messages = session.messages.slice(-MAX_HISTORY_MESSAGES);
    }

    await session.save();

    res.json({ response: aiResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Let the frontend clear a session (e.g. "New conversation" button)
const clearServicesHistoryRouter = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }
    await ChatHistory.deleteOne({ sessionId });
    res.json({ message: "History cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { servicesChatRouter, clearServicesHistoryRouter };