import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/Student.model.js";
import { ClassModel } from "../models/Class.model.js";
import { ChatMessage } from "../models/ChatMessage.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllowedContactIds = async (user) => {
  if (user.role === "ADMIN") {
    const contacts = await User.find({ role: { $in: ["TEACHER", "STUDENT"] } }).select("_id");
    return contacts.map((item) => String(item._id));
  }

  if (user.role === "TEACHER") {
    const teacher = await Teacher.findOne({ user: user._id }).select("_id");
    if (!teacher) return [];

    const classes = await ClassModel.find({ teacher: teacher._id }).select("_id");
    const classIds = classes.map((item) => item._id);
    const students = await Student.find({ classId: { $in: classIds } }).select("user");
    const admins = await User.find({ role: "ADMIN" }).select("_id");

    return [
      ...admins.map((item) => String(item._id)),
      ...students.map((item) => String(item.user)),
    ];
  }

  if (user.role === "STUDENT") {
    const student = await Student.findOne({ user: user._id }).select("classId");
    if (!student?.classId) return [];

    const cls = await ClassModel.findById(student.classId).select("teacher");
    if (!cls?.teacher) return [];

    const teacher = await Teacher.findById(cls.teacher).select("user");
    return teacher?.user ? [String(teacher.user)] : [];
  }

  return [];
};

export const getChatContacts = async (req, res) => {
  const allowedIds = await getAllowedContactIds(req.user);
  const contacts = await User.find({ _id: { $in: allowedIds } }).select("_id name email role");
  return res.json(new ApiResponse(200, contacts, "Chat contacts"));
};

export const getChatThread = async (req, res) => {
  const { otherUserId } = req.params;
  const allowedIds = await getAllowedContactIds(req.user);

  if (!allowedIds.includes(String(otherUserId))) {
    return res.status(403).json({ message: "You cannot access this chat thread" });
  }

  const messages = await ChatMessage.find({
    $or: [
      { sender: req.user._id, recipient: otherUserId },
      { sender: otherUserId, recipient: req.user._id },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("sender", "name role email")
    .populate("recipient", "name role email");

  return res.json(new ApiResponse(200, messages, "Chat thread"));
};

export const sendChatMessage = async (req, res) => {
  const { recipientId, body } = req.body;
  const allowedIds = await getAllowedContactIds(req.user);

  if (!recipientId || !body?.trim()) {
    return res.status(400).json({ message: "recipientId and body are required" });
  }

  if (!allowedIds.includes(String(recipientId))) {
    return res.status(403).json({ message: "You cannot send messages to this user" });
  }

  if (!mongoose.Types.ObjectId.isValid(recipientId)) {
    return res.status(400).json({ message: "Invalid recipient" });
  }

  const message = await ChatMessage.create({
    sender: req.user._id,
    recipient: recipientId,
    body: body.trim(),
  });

  const populated = await ChatMessage.findById(message._id)
    .populate("sender", "name role email")
    .populate("recipient", "name role email");

  return res.status(201).json(new ApiResponse(201, populated, "Message sent"));
};
