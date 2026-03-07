import { User } from "../models/User.model.js";
import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/Student.model.js";
import { ClassModel } from "../models/Class.model.js";
import { Attendance } from "../models/Attendance.model.js";
import { Mark } from "../models/Mark.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generatePassword } from "../utils/generatePassword.js";
import { queueMail, sendMail } from "../utils/sendMail.js";
import { newAccountTemplate } from "../utils/emailTemplates.js";

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildFacultyPayload = (body = {}) => ({
  subject: body.subject || "",
  phone: body.phone || "",
  alternatePhone: body.alternatePhone || "",
  dob: body.dob || null,
  gender: body.gender || "",
  address: body.address || "",
  city: body.city || "",
  state: body.state || "",
  pincode: body.pincode || "",
  qualification: body.qualification || "",
  specialization: body.specialization || "",
  certifications: body.certifications || "",
  certificates: body.certificates || "",
  subjects: normalizeList(body.subjects),
  preferredClasses: normalizeList(body.preferredClasses),
  experienceYears: body.experienceYears || "",
  designation: body.designation || "",
  institutions: body.institutions || "",
  onlineExperience: body.onlineExperience || "",
  onlineExperienceDetails: body.onlineExperienceDetails || "",
  preferredTimings: normalizeList(body.preferredTimings),
  timeSlots: body.timeSlots || "",
  hoursPerWeek: body.hoursPerWeek || "",
  devices: normalizeList(body.devices),
  internetOptions: normalizeList(body.internetOptions),
  techRating: body.techRating || "",
  demoReady: body.demoReady || "",
  demoTopic: body.demoTopic || "",
  whyBst: body.whyBst || "",
  comments: body.comments || "",
  declarationAccepted: Boolean(body.declarationAccepted),
  signature: body.signature || "",
  declarationDate: body.declarationDate || null,
});

const buildStudentPayload = (body = {}) => ({
  classId: body.classId || null,
  rollNo: body.rollNo || "",
  phone: body.phone || "",
  address: body.address || "",
  dob: body.dob || null,
  gender: body.gender || "",
  city: body.city || "",
  state: body.state || "",
  pincode: body.pincode || "",
  guardianName: body.guardianName || "",
  guardianPhone: body.guardianPhone || "",
  admissionNo: body.admissionNo || "",
  section: body.section || "",
  previousSchool: body.previousSchool || "",
  medicalNotes: body.medicalNotes || "",
  transportMode: body.transportMode || "",
  notes: body.notes || "",
});

const queueAccountCredentialsMail = ({ name, role, email, tempPassword }) => {
  queueMail({
    to: email,
    subject: `Your ${role} Account Credentials`,
    html: newAccountTemplate({
      name,
      role,
      email,
      tempPassword,
    }),
    label: role,
  });
};

export const getDashboard = async (req, res) => {
  const totalTeachers = await User.countDocuments({ role: "TEACHER" });
  const totalStudents = await User.countDocuments({ role: "STUDENT" });
  const totalClasses = await ClassModel.countDocuments();

  return res.json(new ApiResponse(200, { totalTeachers, totalStudents, totalClasses }, "Dashboard data"));
};

export const createTeacher = async (req, res) => {
  let user = null;
  try {
    const { name, email } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name || !normalizedEmail) {
      return res.status(400).json({ message: "name and email are required" });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    const tempPassword = generatePassword(10);

    user = await User.create({
      name,
      email: normalizedEmail,
      password: tempPassword,
      role: "TEACHER",
      mustChangePassword: true,
    });

    const teacher = await Teacher.create({
      user: user._id,
      ...buildFacultyPayload(req.body),
    });

    queueAccountCredentialsMail({
      name,
      role: "TEACHER",
      email: normalizedEmail,
      tempPassword,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { user, teacher },
          "Teacher created successfully. Credentials email queued."
        )
      );
  } catch (error) {
    if (user?._id) {
      await User.findByIdAndDelete(user._id).catch(() => {});
    }
    console.error("Create Teacher Error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getTeachers = async (req, res) => {
  const teachers = await Teacher.find().populate("user", "-password");
  return res.json(new ApiResponse(200, teachers, "Teachers list"));
};

export const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { name, email } = req.body;

    const teacher = await Teacher.findById(teacherId).populate("user");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    if (email && email !== teacher.user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already in use" });
    }

    if (name) teacher.user.name = name;
    if (email) teacher.user.email = email;
    await teacher.user.save();

    Object.assign(teacher, buildFacultyPayload(req.body));
    await teacher.save();

    return res.json(new ApiResponse(200, teacher, "Teacher updated"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createStudent = async (req, res) => {
  let user = null;
  try {
    const { name, email } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name || !normalizedEmail) {
      return res.status(400).json({ message: "name and email are required" });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ message: "Student already exists" });

    const tempPassword = generatePassword(10);

    user = await User.create({
      name,
      email: normalizedEmail,
      password: tempPassword,
      role: "STUDENT",
      mustChangePassword: true,
    });

    const student = await Student.create({
      user: user._id,
      ...buildStudentPayload(req.body),
    });

    queueAccountCredentialsMail({
      name,
      role: "STUDENT",
      email: normalizedEmail,
      tempPassword,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        { user, student },
        "Student created successfully. Credentials email queued."
      )
    );
  } catch (error) {
    if (user?._id) {
      await User.findByIdAndDelete(user._id).catch(() => {});
    }
    return res.status(500).json({ message: error.message || "Server error" });
  }
};


export const resendCredentials = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const tempPassword = generatePassword(10);
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();

    await sendMail({
      to: user.email,
      subject: `Your ${user.role} Account Credentials`,
      html: newAccountTemplate({
        name: user.name,
        role: user.role,
        email: user.email,
        tempPassword,
      }),
    });

    return res.json(new ApiResponse(200, null, "Credentials resent"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getStudents = async (req, res) => {
  const students = await Student.find()
    .populate("user", "-password")
    .populate("classId");
  return res.json(new ApiResponse(200, students, "Students list"));
};

export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, email } = req.body;

    const student = await Student.findById(studentId).populate("user");
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (email && email !== student.user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already in use" });
    }

    if (name) student.user.name = name;
    if (email) student.user.email = email;
    await student.user.save();

    Object.assign(student, buildStudentPayload(req.body));
    await student.save();

    return res.json(new ApiResponse(200, student, "Student updated"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createClass = async (req, res) => {
  const { name, teacherId } = req.body;

  const cls = await ClassModel.create({
    name,
    teacher: teacherId || null,
  });

  return res.status(201).json(new ApiResponse(201, cls, "Class created"));
};

export const getClasses = async (req, res) => {
  const classes = await ClassModel.find().populate({
    path: "teacher",
    populate: { path: "user", select: "-password" },
  });

  return res.json(new ApiResponse(200, classes, "Classes list"));
};

export const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { name, teacherId } = req.body;

    const cls = await ClassModel.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (name !== undefined) cls.name = name;
    if (teacherId !== undefined) cls.teacher = teacherId || null;
    await cls.save();

    return res.json(new ApiResponse(200, cls, "Class updated"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const cls = await ClassModel.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    await Student.updateMany({ classId }, { $set: { classId: null } });
    await Attendance.deleteMany({ classId });
    await Mark.deleteMany({ classId });

    await ClassModel.findByIdAndDelete(classId);

    return res.json(new ApiResponse(200, null, "Class deleted"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    await ClassModel.updateMany({ teacher: teacherId }, { $set: { teacher: null } });
    await Attendance.deleteMany({ markedBy: teacherId });
    await Mark.deleteMany({ uploadedBy: teacherId });

    await Teacher.findByIdAndDelete(teacherId);
    await User.findByIdAndDelete(teacher.user);

    return res.json(new ApiResponse(200, null, "Teacher deleted"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await Attendance.deleteMany({ studentId });
    await Mark.deleteMany({ studentId });

    await Student.findByIdAndDelete(studentId);
    await User.findByIdAndDelete(student.user);

    return res.json(new ApiResponse(200, null, "Student deleted"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
