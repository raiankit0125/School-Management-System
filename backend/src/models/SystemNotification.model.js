import mongoose from "mongoose";

const systemNotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["JOINING", "BIRTHDAY", "SYSTEM", "ANNOUNCEMENT", "URGENT", "MESSAGE"],
      default: "SYSTEM",
    },
    audience: { type: String, default: "", trim: true },
    eventDate: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

systemNotificationSchema.index(
  { recipient: 1, type: 1, eventDate: 1 },
  { unique: true, partialFilterExpression: { eventDate: { $type: "string", $gt: "" } } }
);

export const SystemNotification = mongoose.model("SystemNotification", systemNotificationSchema);
