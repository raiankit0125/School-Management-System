import { Student } from "../models/Student.model.js";
import { Attendance } from "../models/Attendance.model.js";
import { Mark } from "../models/Mark.model.js";
import { Notice } from "../models/Notice.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const myProfile = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id })
    .populate("user", "-password")
    .populate("classId");
  return res.json(new ApiResponse(200, student, "Student profile"));
};

export const myAttendance = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  const list = await Attendance.find({ studentId: student._id }).sort({ date: -1 });
  return res.json(new ApiResponse(200, list, "My attendance"));
};

export const myMarks = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  const list = await Mark.find({ studentId: student._id }).sort({ createdAt: -1 });
  return res.json(new ApiResponse(200, list, "My marks"));
};

export const myNotices = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  const list = await Notice.find({ studentId: student._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "teacherId",
      populate: { path: "user", select: "name email" },
    });

  return res.json(new ApiResponse(200, list, "My notices"));
};
