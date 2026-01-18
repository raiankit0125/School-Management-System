import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g. "10-A"
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    },
    { timestamps: true }
);

export const ClassModel = mongoose.model("Class", classSchema);
