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

export const myAttendanceSummary = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate("classId", "name");
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!student.classId?._id) {
      return res.json(
        new ApiResponse(200, { className: "", totalMarkedDays: 0, present: 0, absent: 0, percentage: 0 }, "My attendance summary")
      );
    }

    const [classRecords, ownRecords] = await Promise.all([
      Attendance.find({ classId: student.classId._id }).select("date"),
      Attendance.find({ studentId: student._id }),
    ]);

    const totalMarkedDays = new Set(classRecords.map((item) => item.date)).size;
    const present = ownRecords.filter((item) => item.status === "PRESENT").length;
    const percentage = totalMarkedDays > 0 ? Math.round((present / totalMarkedDays) * 100) : 0;

    return res.json(
      new ApiResponse(
        200,
        {
          className: student.classId.name,
          totalMarkedDays,
          present,
          absent: Math.max(totalMarkedDays - present, 0),
          percentage,
        },
        "My attendance summary"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
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
