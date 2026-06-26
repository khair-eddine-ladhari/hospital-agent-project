import axios from "axios";
import Patient from "../models/Patient.js";
import Chat from "../models/Chat.js";

const PYTHON_SERVICE_URL = "http://localhost:5001";
const MAX_HISTORY = 10;

// GET /api/doctor/patient/:id/chat  — load history
export const getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ patientId: req.params.id });
    res.json({ messages: chat?.messages ?? [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/doctor/patient/:id/chat  — send message
export const sendChatMessage = async (req, res) => {
  try {
    const { query, history } = req.body;
    const { id } = req.params;

    if (!query?.trim()) {
      return res.status(400).json({ message: "query is required" });
    }

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // get or create chat doc
    let chat = await Chat.findOne({ patientId: id });
    if (!chat) {
      chat = await Chat.create({ patientId: id, messages: [] });
    }

    // save user message
    chat.messages.push({ role: "user", content: query });
    await chat.save();

    let response;
    try {
      const ragRes = await axios.post(`${PYTHON_SERVICE_URL}/chat`, {
        query,
        patientData: patient,
        history: chat.messages.slice(-MAX_HISTORY).map(m => ({
          role: m.role,
          content: m.content,
        })),
      });
      response = ragRes.data.response;
    } catch (ragErr) {
      console.error("AI service error:", ragErr.message);
      response = "Sorry, the AI service is currently unavailable.";
    }

    // save assistant message
    const content = typeof response === "object"
      ? `${response.answer ?? ""}${response.opinion ? `\n\n🩺 *${response.opinion}*` : ""}`
      : response;

    chat.messages.push({ role: "assistant", content });
    await chat.save();

    res.json({ response });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


