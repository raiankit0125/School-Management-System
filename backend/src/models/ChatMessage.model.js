import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, default: "", trim: true },
    attachment: {
      filename: { type: String, default: "" },
      mimetype: { type: String, default: "" },
      size: { type: Number, default: 0 },
      dataUrl: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
