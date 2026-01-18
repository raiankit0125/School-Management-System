import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/Student.model.js";
import { ClassModel } from "../models/Class.model.js";
import { Attendance } from "../models/Attendance.model.js";
import { Mark } from "../models/Mark.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parseUploadedFile } from "../utils/parseFile.js";

export const myProfile = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id }).populate("user", "-password");
  return res.json(new ApiResponse(200, teacher, "Teacher profile"));
};

export const myClasses = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  const classes = await ClassModel.find({ teacher: teacher._id });
  return res.json(new ApiResponse(200, classes, "Assigned classes"));
};

export const getStudentsByClass = async (req, res) => {
  const { classId } = req.params;
  const students = await Student.find({ classId })
    .populate("user", "-password")
    .populate("classId");
  return res.json(new ApiResponse(200, students, "Students by class"));
};

export const markAttendance = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  const { classId, date, records } = req.body;
  // records: [{studentId, status}]

  const ops = records.map((r) => ({
    updateOne: {
      filter: { classId, studentId: r.studentId, date },
      update: { $set: { status: r.status, markedBy: teacher._id } },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(ops);
  return res.json(new ApiResponse(200, null, "Attendance saved"));
};

export const uploadMarks = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  const { classId, subject, marksList, maxMarks } = req.body;
  // marksList: [{studentId, marks}]

  const docs = marksList.map((m) => ({
    classId,
    studentId: m.studentId,
    subject,
    marks: m.marks,
    maxMarks: maxMarks || 100,
    uploadedBy: teacher._id,
  }));

  await Mark.insertMany(docs);
  return res.status(201).json(new ApiResponse(201, null, "Marks uploaded"));
};

export const todayAttendanceStatus = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // teacher ki classes
  const classes = await ClassModel.find({ teacher: teacher._id }).select("_id name");

  // check attendance record count
  const classIds = classes.map((c) => c._id);

  const todayCount = await Attendance.countDocuments({
    classId: { $in: classIds },
    date: today,
    markedBy: teacher._id,
  });

  return res.json(
    new ApiResponse(
      200,
      {
        today,
        totalClasses: classes.length,
        attendanceMarked: todayCount > 0,
        markedCount: todayCount,
      },
      "Today attendance status"
    )
  );
};

export const bulkUploadMarks = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "CSV file required" });

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const { classId, subject, maxMarks } = req.body;
    if (!classId || !subject) {
      return res.status(400).json({ message: "classId and subject are required" });
    }

    // ✅ Security: teacher can upload only for assigned class
    const cls = await ClassModel.findOne({ _id: classId, teacher: teacher._id });
    if (!cls) return res.status(403).json({ message: "You are not assigned to this class" });

    const rows = await parseUploadedFile(req.file);

    let created = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rollNo = String(row.rollNo || "").trim();
      const marks = Number(row.marks);

      if (!rollNo || Number.isNaN(marks)) {
        failed++;
        errors.push({ row: i + 1, rollNo, reason: "rollNo/marks invalid" });
        continue;
      }

      // find student of that class by rollNo
      const student = await Student.findOne({ classId, rollNo });
      if (!student) {
        failed++;
        errors.push({ row: i + 1, rollNo, reason: "student not found in class" });
        continue;
      }

      // ✅ UPSERT (no duplicates)
      await Mark.findOneAndUpdate(
        { classId, studentId: student._id, subject },
        {
          classId,
          studentId: student._id,
          subject,
          marks,
          maxMarks: Number(maxMarks || 100),
          uploadedBy: teacher._id,
        },
        { upsert: true, new: true }
      );

      created++;
    }

    return res.json(
      new ApiResponse(
        200,
        { total: rows.length, created, failed, errors },
        "Marks bulk upload completed ✅"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const bulkUploadAttendance = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "CSV file required" });

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const { classId, date } = req.body;

    if (!classId || !date) {
      return res.status(400).json({ message: "classId and date are required" });
    }

    // ✅ teacher only for assigned class
    const cls = await ClassModel.findOne({ _id: classId, teacher: teacher._id });
    if (!cls) return res.status(403).json({ message: "You are not assigned to this class" });

    const rows = await parseCsvBuffer(req.file.buffer);

    let created = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const rollNo = String(row.rollNo || "").trim();
      const status = String(row.status || "").trim().toUpperCase(); // PRESENT/ABSENT

      if (!rollNo || !["PRESENT", "ABSENT"].includes(status)) {
        failed++;
        errors.push({ row: i + 1, rollNo, reason: "rollNo/status invalid" });
        continue;
      }

      const student = await Student.findOne({ classId, rollNo });
      if (!student) {
        failed++;
        errors.push({ row: i + 1, rollNo, reason: "student not found in class" });
        continue;
      }

      // ✅ UPSERT attendance (no duplicates)
      await Attendance.findOneAndUpdate(
        { classId, studentId: student._id, date },
        {
          classId,
          studentId: student._id,
          date,
          status,
          markedBy: teacher._id,
        },
        { upsert: true, new: true }
      );

      created++;
    }

    return res.json(
      new ApiResponse(
        200,
        { total: rows.length, created, failed, errors },
        "Attendance bulk upload completed ✅"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

