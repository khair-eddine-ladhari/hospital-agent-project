




// models/Chat.js
import mongoose from 'mongoose'

const ChatSchema = new mongoose.Schema(
  {
    patientId: { type: String, ref: "Patient", required: true },

    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true
        },
        content: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Chat", ChatSchema);