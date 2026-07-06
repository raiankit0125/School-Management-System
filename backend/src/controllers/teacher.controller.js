import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/Student.model.js";
import { ClassModel } from "../models/Class.model.js";
import { Attendance } from "../models/Attendance.model.js";
import { Mark } from "../models/Mark.model.js";
import { Notice } from "../models/Notice.model.js";
import { SystemNotification } from "../models/SystemNotification.model.js";
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
  const teacher = await Teacher.findOne({ user: req.user._id });
  const assignedClass = await ClassModel.findOne({ _id: classId, teacher: teacher?._id });
  if (!assignedClass) {
    return res.status(403).json({ message: "You are not assigned to this academic group" });
  }
  const students = await Student.find({ classId })
    .populate("user", "-password")
    .populate("classId");
  return res.json(new ApiResponse(200, students, "Students by class"));
};

export const markAttendance = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  const { classId, date, records } = req.body;
  const assignedClass = await ClassModel.findOne({ _id: classId, teacher: teacher?._id });
  if (!assignedClass) {
    return res.status(403).json({ message: "You are not assigned to this academic group" });
  }
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
  const assignedClass = await ClassModel.findOne({ _id: classId, teacher: teacher?._id });
  if (!assignedClass) {
    return res.status(403).json({ message: "You are not assigned to this academic group" });
  }
  // marksList: [{studentId, marks}]

  for (const item of marksList) {
    await Mark.findOneAndUpdate(
      { classId, studentId: item.studentId, subject },
      {
        classId,
        studentId: item.studentId,
        subject,
        marks: item.marks,
        maxMarks: maxMarks || 100,
        uploadedBy: teacher._id,
      },
      { upsert: true, new: true }
    );
  }

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

const buildAttendanceSummary = async ({ classId, teacherId }) => {
  const cls = await ClassModel.findOne({ _id: classId, teacher: teacherId });
  if (!cls) return null;

  const [students, records] = await Promise.all([
    Student.find({ classId }).populate("user", "name email profileImage").sort({ rollNo: 1 }),
    Attendance.find({ classId }),
  ]);

  const totalMarkedDays = new Set(records.map((item) => item.date)).size;
  const countsByStudent = records.reduce((acc, item) => {
    const key = String(item.studentId);
    if (!acc[key]) acc[key] = { present: 0, absent: 0, total: 0 };
    acc[key].total += 1;
    if (item.status === "PRESENT") acc[key].present += 1;
    if (item.status === "ABSENT") acc[key].absent += 1;
    return acc;
  }, {});

  return {
    classId,
    className: cls.name,
    totalMarkedDays,
    students: students.map((student) => {
      const stats = countsByStudent[String(student._id)] || { present: 0, absent: 0, total: 0 };
      const percentage = totalMarkedDays > 0 ? Math.round((stats.present / totalMarkedDays) * 100) : 0;
      return {
        studentId: student._id,
        userId: student.user?._id,
        name: student.user?.name,
        email: student.user?.email,
        profileImage: student.user?.profileImage,
        rollNo: student.rollNo,
        present: stats.present,
        absent: Math.max(totalMarkedDays - stats.present, stats.absent),
        totalMarkedDays,
        percentage,
      };
    }),
  };
};

export const getClassAttendanceSummary = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const summary = await buildAttendanceSummary({
      classId: req.params.classId,
      teacherId: teacher._id,
    });
    if (!summary) return res.status(403).json({ message: "You are not assigned to this class" });

    const threshold = Number(req.query.threshold || 75);
    return res.json(
      new ApiResponse(
        200,
        {
          ...summary,
          threshold,
          lowAttendance: summary.students.filter((student) => student.percentage < threshold),
        },
        "Attendance percentage summary"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const notifyLowAttendance = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const threshold = Number(req.body.threshold || 75);
    if (!Number.isFinite(threshold) || threshold < 1 || threshold > 100) {
      return res.status(400).json({ message: "Threshold must be between 1 and 100" });
    }

    const summary = await buildAttendanceSummary({
      classId: req.params.classId,
      teacherId: teacher._id,
    });
    if (!summary) return res.status(403).json({ message: "You are not assigned to this class" });

    const lowAttendance = summary.students.filter((student) => student.percentage < threshold && student.userId);
    if (lowAttendance.length === 0) {
      return res.json(new ApiResponse(200, { sentCount: 0, threshold }, "No students below threshold"));
    }

    const notifications = await SystemNotification.insertMany(
      lowAttendance.map((student) => ({
        recipient: student.userId,
        sender: req.user._id,
        title: "Attendance below required percentage",
        message: `Your attendance in ${summary.className} is ${student.percentage}%. Required attendance is ${threshold}%. Please improve your attendance.`,
        type: "URGENT",
        audience: `Class ${summary.className}`,
      }))
    );

    return res.json(
      new ApiResponse(
        200,
        { sentCount: notifications.length, threshold, lowAttendance },
        "Low attendance alerts sent"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const bulkUploadMarks = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File required" });

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
    if (!req.file) return res.status(400).json({ message: "File required" });

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const { classId, date } = req.body;

    if (!classId || !date) {
      return res.status(400).json({ message: "classId and date are required" });
    }

    // ✅ teacher only for assigned class
    const cls = await ClassModel.findOne({ _id: classId, teacher: teacher._id });
    if (!cls) return res.status(403).json({ message: "You are not assigned to this class" });

    const rows = await parseUploadedFile(req.file);

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

export const sendStudentNotice = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  const { studentId, title, message } = req.body;

  if (!studentId || !title?.trim() || !message?.trim()) {
    return res.status(400).json({ message: "studentId, title and message are required" });
  }

  const student = await Student.findById(studentId).populate("classId");
  if (!student) return res.status(404).json({ message: "Student not found" });

  const allowedClass = await ClassModel.findOne({ _id: student.classId?._id, teacher: teacher?._id });
  if (!allowedClass) {
    return res.status(403).json({ message: "You can notify only your assigned students" });
  }

  const notice = await Notice.create({
    teacherId: teacher._id,
    studentId,
    title: title.trim(),
    message: message.trim(),
  });

  return res.status(201).json(new ApiResponse(201, notice, "Notice sent"));
};

export const sendClassNotification = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const classId = String(req.body.classId || "").trim();
    const studentId = String(req.body.studentId || "").trim();
    const title = String(req.body.title || "").trim();
    const message = String(req.body.message || "").trim();
    const category = String(req.body.category || "ACADEMIC").trim().toUpperCase();

    if (!classId || !title || !message) {
      return res.status(400).json({ message: "classId, title and message are required" });
    }

    const allowedClass = await ClassModel.findOne({ _id: classId, teacher: teacher._id });
    if (!allowedClass) {
      return res.status(403).json({ message: "You can notify only your assigned class" });
    }

    const allowedCategories = ["ACADEMIC", "ASSIGNMENT", "SCHEDULE", "EXAM", "REMINDER"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid notification category" });
    }

    let students = [];
    if (studentId) {
      const student = await Student.findOne({ _id: studentId, classId }).select("user");
      if (!student) return res.status(404).json({ message: "Student not found in this class" });
      students = [student];
    } else {
      students = await Student.find({ classId }).select("user");
    }

    if (students.length === 0) {
      return res.status(400).json({ message: "No students found for this target" });
    }

    const notifications = await SystemNotification.insertMany(
      students.map((student) => ({
        recipient: student.user,
        sender: req.user._id,
        title,
        message,
        type: category === "REMINDER" ? "SYSTEM" : "ANNOUNCEMENT",
        audience: studentId ? "Selected student" : `Class ${allowedClass.name}`,
      }))
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        { sentCount: notifications.length, audience: studentId ? "Selected student" : `Class ${allowedClass.name}` },
        "Notification sent"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getTeacherNotices = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  const notices = await Notice.find({ teacherId: teacher?._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "studentId",
      populate: [{ path: "user", select: "name email" }, { path: "classId", select: "name" }],
    });

  return res.json(new ApiResponse(200, notices, "Teacher notices"));
};

