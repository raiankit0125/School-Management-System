import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["UNREAD", "READ"],
      default: "UNREAD",
    },
  },
  { timestamps: true }
);

export const Notice = mongoose.model("Notice", noticeSchema);
