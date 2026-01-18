import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Teacher = mongoose.model("Teacher", teacherSchema);
