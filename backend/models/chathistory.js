import mongoose from "mongoose";

const ChatHistorySchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ChatHistory", ChatHistorySchema);