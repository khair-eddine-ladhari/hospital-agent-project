import axios from "axios";
import Chat from "../models/Chat.js";
import Patient from "../models/Patient.js";
const MAX_HISTORY = 10;

const PYTHON_SERVICE_URL = "http://localhost:5000";

const patientStatusRouter = async (req, res) => {
  try {
    const { message } = req.body;

    // get or create chat for this user
    let chat = await Chat.findOne({ userId: req.user._id });

    if (!chat) {
      chat = await Chat.create({
        userId: req.user._id,
        messages: []
      });
    }

    // push user message
    chat.messages.push({
      role: "user",
      content: message
    });

    await chat.save();

    let response;
    const patient = await Patient.findById(patientId);

    try {
      const ragRes = await axios.post(`${PYTHON_SERVICE_URL}/chat`, {
        query: message,
        patientData: patient,
        history: chat.messages.slice(-MAX_HISTORY).map(m => ({
          role: m.role,
          content: m.content,
          
        }))
      });

      response = ragRes.data.response;

      // save assistant response
      chat.messages.push({
        role: "assistant",
        content: response
      });

      await chat.save();

    } catch (ragErr) {
      console.error("AI service error:", ragErr.message);
      response = "Sorry, the AI service is currently unavailable.";
    }

    res.json({ response });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default patientStatusRouter