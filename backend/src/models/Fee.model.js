import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    mode: { type: String, default: "Cash", trim: true },
    receiptNumber: { type: String, required: true, unique: true, trim: true },
  },
  { _id: true }
);

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    totalFee: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["Paid", "Partial", "Due"],
      default: "Due",
    },
    paymentHistory: { type: [paymentSchema], default: [] },
  },
  { timestamps: true }
);

export const Fee = mongoose.model("Fee", feeSchema);
