import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, default: "", trim: true },
    date: { type: String, required: true },
    type: {
      type: String,
      enum: ["ACADEMIC", "EXAM", "MEETING", "HOLIDAY"],
      default: "ACADEMIC",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

calendarEventSchema.index({ date: 1, createdAt: -1 });

export const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);
