import { User } from "../models/User.model.js";
import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/Student.model.js";
import { ClassModel } from "../models/Class.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generatePassword } from "../utils/generatePassword.js";
import { sendMail } from "../utils/sendMail.js";
import { newAccountTemplate } from "../utils/emailTemplates.js";


export const getDashboard = async (req, res) => {
  const totalTeachers = await User.countDocuments({ role: "TEACHER" });
  const totalStudents = await User.countDocuments({ role: "STUDENT" });
  const totalClasses = await ClassModel.countDocuments();

  return res.json(new ApiResponse(200, { totalTeachers, totalStudents, totalClasses }, "Dashboard data"));
};

export const createTeacher = async (req, res) => {
  const { name, email, subject, phone } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Teacher already exists" });

  const tempPassword = generatePassword(10);

  const user = await User.create({
    name,
    email,
    password: tempPassword,
    role: "TEACHER",
    mustChangePassword: true,
  });

  const teacher = await Teacher.create({ user: user._id, subject, phone });

  // ✅ send email
  await sendMail({
    to: email,
    subject: "Your Teacher Account Credentials",
    html: newAccountTemplate({
      name,
      role: "TEACHER",
      email,
      tempPassword,
    }),
  });

  return res.status(201).json(
    new ApiResponse(201, { user, teacher }, "Teacher created & email sent ✅")
  );
};

export const getTeachers = async (req, res) => {
  const teachers = await Teacher.find().populate("user", "-password");
  return res.json(new ApiResponse(200, teachers, "Teachers list"));
};

export const createStudent = async (req, res) => {
  const { name, email, classId, rollNo, phone, address } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Student already exists" });

  const tempPassword = generatePassword(10);

  const user = await User.create({
    name,
    email,
    password: tempPassword,
    role: "STUDENT",
    mustChangePassword: true,
  });

  const student = await Student.create({
    user: user._id,
    classId,
    rollNo,
    phone,
    address,
  });

  // ✅ send email
try {
  await sendMail({
    to: email,
    subject: "Your Student Account Credentials",
    html: newAccountTemplate({
      name,
      role: "STUDENT",
      email,
      tempPassword,
    }),
  });
  console.log("✅ Student mail sent:", email);
} catch (error) {
  console.log("❌ Student mail failed:", error.message);

  // ✅ IMPORTANT: Mail fail ho jaye to bhi student create hona chahiye
  // So we are NOT throwing error
}

  return res.status(201).json(
    new ApiResponse(201, { user, student }, "Student created & email sent ✅")
  );
};


export const resendCredentials = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ new temporary password generate
    const tempPassword = generatePassword(10);
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();

    // ✅ send mail again
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

    return res.json(new ApiResponse(200, null, "Credentials resent ✅"));
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
