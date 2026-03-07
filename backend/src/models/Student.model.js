import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    rollNo: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    dob: { type: Date, default: null },
    gender: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    guardianName: { type: String, default: "" },
    guardianPhone: { type: String, default: "" },
    admissionNo: { type: String, default: "" },
    section: { type: String, default: "" },
    previousSchool: { type: String, default: "" },
    medicalNotes: { type: String, default: "" },
    transportMode: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Student = mongoose.model("Student", studentSchema);
