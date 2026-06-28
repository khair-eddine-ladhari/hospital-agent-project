import axios from "axios";
import User from "../models/User.js";

const SERVICES_AGENT_URL =process.env.AI_SERVICE_URL;

const servicesChatRouter = async (req, res) => {
  try {
    const { query, history = [] } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ message: "query is required" });
    }

    const doctors = await User.find(
      { role: "doctor" },
      { name: 1, email: 1, specialty: 1, schedule: 1, _id: 1 }
    ).lean();

    let aiResponse;
    try {
      const aiRes = await axios.post(`${SERVICES_AGENT_URL}/services-chat`, {
        query,
        doctors,
        history,
      });
      aiResponse = aiRes.data.response;
    } catch (aiErr) {
      console.error("Services agent error:", aiErr.message);
      return res.status(502).json({ message: "Services assistant is currently unavailable." });
    }

    res.json({ response: aiResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { servicesChatRouter };
