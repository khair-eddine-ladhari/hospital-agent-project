import axios from "axios";
import Chat from "../models/Chat.js";
import Patient from "../models/Patient.js";
const MAX_HISTORY = 10;

const PYTHON_SERVICE_URL = "http://localhost:5001";

const patientStatusRouter = async (req, res) => {
  try {
    const message = "what the status of the patient?";
    const patientId = "6a343e0d341591d60033a9ac";

    // get or create chat for this user
    let chat = await Chat.findOne({ userId: patientId });

    if (!chat) {
      chat = await Chat.create({
        userId: patientId,
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
   
if (!patient) {
  return res.status(404).json({ message: "Patient not found" });
}

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
  content: typeof response === "object" ? JSON.stringify(response) : response  // ← fix
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