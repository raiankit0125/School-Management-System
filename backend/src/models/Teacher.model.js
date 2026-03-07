import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, default: "" },
    phone: { type: String, default: "" },
    alternatePhone: { type: String, default: "" },
    dob: { type: Date, default: null },
    gender: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    qualification: { type: String, default: "" },
    specialization: { type: String, default: "" },
    certifications: { type: String, default: "" },
    certificates: { type: String, default: "" },
    subjects: { type: [String], default: [] },
    preferredClasses: { type: [String], default: [] },
    experienceYears: { type: String, default: "" },
    designation: { type: String, default: "" },
    institutions: { type: String, default: "" },
    onlineExperience: { type: String, default: "" },
    onlineExperienceDetails: { type: String, default: "" },
    preferredTimings: { type: [String], default: [] },
    timeSlots: { type: String, default: "" },
    hoursPerWeek: { type: String, default: "" },
    devices: { type: [String], default: [] },
    internetOptions: { type: [String], default: [] },
    techRating: { type: String, default: "" },
    demoReady: { type: String, default: "" },
    demoTopic: { type: String, default: "" },
    whyBst: { type: String, default: "" },
    comments: { type: String, default: "" },
    declarationAccepted: { type: Boolean, default: false },
    signature: { type: String, default: "" },
    declarationDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Teacher = mongoose.model("Teacher", teacherSchema);
