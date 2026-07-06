import PDFDocument from "pdfkit";
import mongoose from "mongoose";
import { Fee } from "../models/Fee.model.js";
import { Student } from "../models/Student.model.js";
import { SystemNotification } from "../models/SystemNotification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const calculateFeeState = (totalFee = 0, paidAmount = 0) => {
  const total = Math.max(Number(totalFee) || 0, 0);
  const paid = Math.max(Number(paidAmount) || 0, 0);
  const due = Math.max(total - paid, 0);

  if (total > 0 && due === 0) {
    return { totalFee: total, paidAmount: paid, dueAmount: 0, status: "Paid" };
  }

  if (paid > 0) {
    return { totalFee: total, paidAmount: paid, dueAmount: due, status: "Partial" };
  }

  return { totalFee: total, paidAmount: paid, dueAmount: due, status: "Due" };
};

const generateReceiptNumber = () => {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RCPT-${stamp}-${random}`;
};

const getStudentWithUser = (studentId) =>
  Student.findById(studentId).populate("user", "name email role").populate("classId", "name");

const getOrCreateFeeRecord = async (studentId) => {
  const existing = await Fee.findOne({ student: studentId });
  if (existing) return existing;
  return Fee.create({ student: studentId });
};

const ensureStudentOwner = async (req) => {
  const student = await Student.findOne({ user: req.user._id }).populate("user", "name email").populate("classId", "name");
  if (!student) {
    const error = new Error("Student profile not found");
    error.statusCode = 404;
    throw error;
  }
  return student;
};

const populateFee = (query) =>
  query.populate({
    path: "student",
    populate: [
      { path: "user", select: "name email role" },
      { path: "classId", select: "name" },
    ],
  });

export const getStudentFeeById = async (req, res) => {
  try {
    const student = await getStudentWithUser(req.params.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const fee = await getOrCreateFeeRecord(student._id);
    await fee.populate({
      path: "student",
      populate: [
        { path: "user", select: "name email role" },
        { path: "classId", select: "name" },
      ],
    });

    return res.json(new ApiResponse(200, fee, "Student fee record"));
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

export const getMyFee = async (req, res) => {
  try {
    const student = await ensureStudentOwner(req);
    const fee = await getOrCreateFeeRecord(student._id);
    await fee.populate({
      path: "student",
      populate: [
        { path: "user", select: "name email role" },
        { path: "classId", select: "name" },
      ],
    });

    return res.json(new ApiResponse(200, fee, "My fee record"));
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

export const searchFeeRecords = async (req, res) => {
  try {
    const q = String(req.query.q || req.query.name || "").trim();
    const branch = String(req.query.branch || "").trim();
    const year = String(req.query.year || "").trim();

    const students = await Student.find()
      .populate("user", "name email role")
      .populate("classId", "name")
      .sort({ createdAt: -1 });

    const loweredQ = q.toLowerCase();
    const loweredBranch = branch.toLowerCase();
    const loweredYear = year.toLowerCase();

    const filtered = students.filter((student) => {
      const values = [
        student.user?.name,
        student.user?.email,
        student.classId?.name,
        student.section,
        student.rollNo,
        student.admissionNo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const branchValue = String(student.classId?.name || "").toLowerCase();
      const yearValue = String(student.section || student.admissionNo || "").toLowerCase();

      return (
        (!loweredQ || values.includes(loweredQ)) &&
        (!loweredBranch || branchValue.includes(loweredBranch)) &&
        (!loweredYear || yearValue.includes(loweredYear))
      );
    });

    const feeRecords = await Fee.find({ student: { $in: filtered.map((item) => item._id) } });
    const feeByStudentId = new Map(feeRecords.map((fee) => [String(fee.student), fee]));

    const list = filtered.map((student) => {
      const fee = feeByStudentId.get(String(student._id));
      return {
        student,
        fee: fee || calculateFeeState(0, 0),
      };
    });

    return res.json(new ApiResponse(200, list, "Fee records"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateStudentFee = async (req, res) => {
  try {
    const student = await getStudentWithUser(req.params.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const fee = await getOrCreateFeeRecord(student._id);
    const totalFeeProvided = req.body.totalFee !== undefined && req.body.totalFee !== "";
    const paymentAmount = Number(req.body.amount || 0);

    if (totalFeeProvided) {
      const totalFee = Number(req.body.totalFee);
      if (!Number.isFinite(totalFee) || totalFee < 0) {
        return res.status(400).json({ message: "Total fee must be 0 or more" });
      }
      fee.totalFee = totalFee;
    }

    if (req.body.amount !== undefined && req.body.amount !== "") {
      if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
        return res.status(400).json({ message: "Payment amount must be greater than 0" });
      }

      fee.paymentHistory.push({
        amount: paymentAmount,
        date: req.body.date || new Date(),
        mode: req.body.mode || "Cash",
        receiptNumber: generateReceiptNumber(),
      });
    }

    const paidAmount = fee.paymentHistory.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    Object.assign(fee, calculateFeeState(fee.totalFee, paidAmount));
    await fee.save();

    await fee.populate({
      path: "student",
      populate: [
        { path: "user", select: "name email role" },
        { path: "classId", select: "name" },
      ],
    });

    return res.json(new ApiResponse(200, fee, "Fee updated"));
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

export const sendFeeNotification = async (req, res) => {
  try {
    const student = await getStudentWithUser(req.params.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const kind = String(req.body.kind || "").trim().toUpperCase();
    if (!["DUE", "CLEARED"].includes(kind)) {
      return res.status(400).json({ message: "Notification kind must be DUE or CLEARED" });
    }

    const fee = await getOrCreateFeeRecord(student._id);
    const title = kind === "DUE" ? "Fee Due" : "Fee Cleared";
    const message =
      kind === "DUE"
        ? `Your fee due amount is Rs. ${fee.dueAmount}. Please contact admin for payment.`
        : "Your fee has been marked as cleared. Thank you.";

    const notification = await SystemNotification.create({
      recipient: student.user._id,
      sender: req.user._id,
      title,
      message,
      type: "SYSTEM",
      audience: "Fee update",
    });

    return res.status(201).json(new ApiResponse(201, notification, "Fee notification sent"));
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

const writeReceiptPdf = ({ res, fee, payment }) => {
  const student = fee.student;
  const studentUser = student?.user || {};
  const doc = new PDFDocument({ margin: 48 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${payment.receiptNumber}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text("Academic Hub", { align: "center" });
  doc.moveDown(0.4);
  doc.fontSize(15).text("Fee Payment Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(`Receipt No: ${payment.receiptNumber}`);
  doc.text(`Date: ${new Date(payment.date).toLocaleDateString("en-IN")}`);
  doc.moveDown();
  doc.fontSize(12).text(`Student: ${studentUser.name || "-"}`);
  doc.text(`Email: ${studentUser.email || "-"}`);
  doc.text(`Class / Branch: ${student?.classId?.name || "-"}`);
  doc.text(`Roll No: ${student?.rollNo || "-"}`);
  doc.moveDown();
  doc.text(`Payment Mode: ${payment.mode || "-"}`);
  doc.text(`Paid Amount: Rs. ${Number(payment.amount || 0).toFixed(2)}`);
  doc.text(`Total Fee: Rs. ${Number(fee.totalFee || 0).toFixed(2)}`);
  doc.text(`Total Paid: Rs. ${Number(fee.paidAmount || 0).toFixed(2)}`);
  doc.text(`Due Amount: Rs. ${Number(fee.dueAmount || 0).toFixed(2)}`);
  doc.text(`Status: ${fee.status}`);
  doc.moveDown(2);
  doc.fontSize(10).text("This is a system generated receipt.", { align: "center" });
  doc.end();
};

export const downloadReceipt = async (req, res) => {
  try {
    const { studentId, paymentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: "Invalid payment id" });
    }

    const fee = await populateFee(Fee.findOne({ student: studentId }));
    if (!fee) return res.status(404).json({ message: "Fee record not found" });

    const payment = fee.paymentHistory.id(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    return writeReceiptPdf({ res, fee, payment });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const downloadMyReceipt = async (req, res) => {
  try {
    const student = await ensureStudentOwner(req);
    req.params.studentId = student._id;
    return downloadReceipt(req, res);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};
