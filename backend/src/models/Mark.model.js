import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    subject: { type: String, required: true },
    marks: { type: Number, required: true },
    maxMarks: { type: Number, default: 100 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }
  },
  { timestamps: true }
);

export const Mark = mongoose.model("Mark", markSchema);
