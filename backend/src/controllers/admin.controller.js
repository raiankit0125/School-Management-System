import { User } from "../models/User.model.js";
import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/Student.model.js";
import { ClassModel } from "../models/Class.model.js";
import { Attendance } from "../models/Attendance.model.js";
import { Mark } from "../models/Mark.model.js";
import { SystemNotification } from "../models/SystemNotification.model.js";
import { Fee } from "../models/Fee.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generatePassword } from "../utils/generatePassword.js";
import { queueMail, sendMail } from "../utils/sendMail.js";
import { newAccountTemplate } from "../utils/emailTemplates.js";
import {
  isValidEmail,
  normalizeEmail,
  normalizeText,
  validateOptionalPhone,
  validateOptionalPincode,
} from "../utils/validation.js";
import {
  createJoiningNotification,
  syncBirthdayNotification,
} from "../utils/systemNotifications.js";

const uniqueIds = (items = []) => [...new Set(items.filter(Boolean).map((item) => String(item)))];

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

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  return ["true", "yes", "1", "on"].includes(String(value || "").trim().toLowerCase());
};

const getProfileImageDataUrl = (file) => {
  if (!file) return "";
  if (!file.mimetype?.startsWith("image/")) {
    const error = new Error("Profile picture must be an image file");
    error.statusCode = 400;
    throw error;
  }
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
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
  declarationAccepted: parseBoolean(body.declarationAccepted),
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

const validateFacultyPayload = (body = {}) => {
  const phoneError = validateOptionalPhone(body.phone, "Mobile number");
  if (phoneError) return phoneError;
  const alternatePhoneError = validateOptionalPhone(body.alternatePhone, "Alternate mobile");
  if (alternatePhoneError) return alternatePhoneError;
  const pincodeError = validateOptionalPincode(body.pincode);
  if (pincodeError) return pincodeError;
  if (
    body.experienceYears &&
    (!Number.isFinite(Number(body.experienceYears)) || Number(body.experienceYears) < 0)
  ) {
    return "Experience must be 0 or more";
  }
  return "";
};

const validateStudentPayload = (body = {}) => {
  const phoneError = validateOptionalPhone(body.phone, "Phone");
  if (phoneError) return phoneError;
  const guardianPhoneError = validateOptionalPhone(body.guardianPhone, "Guardian phone");
  if (guardianPhoneError) return guardianPhoneError;
  const pincodeError = validateOptionalPincode(body.pincode);
  if (pincodeError) return pincodeError;
  return "";
};

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

const getMailFailureMessage = (error) => {
  const message = String(error?.message || "").toLowerCase();

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return "SMTP is not configured on the server";
  }

  if (message.includes("invalid login") || message.includes("authentication")) {
    return "SMTP login failed. Check SMTP_USER and SMTP_PASS";
  }

  if (message.includes("missing credentials")) {
    return "SMTP credentials are missing on the server";
  }

  if (message.includes("timeout") || message.includes("etimedout")) {
    return "Mail server timeout. Try again in a moment";
  }

  return error?.message || "Unable to send reset email";
};

const buildCredentialPayload = ({ email, emailSent = null, mailQueued = null, mailError = "" }) => ({
  email,
  emailSent,
  mailQueued,
  mailError,
});

const sanitizeUser = (user) => {
  const safeUser = user?.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  return safeUser;
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
    const name = normalizeText(req.body.name);
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!name || !normalizedEmail) {
      return res.status(400).json({ message: "name and email are required" });
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }
    const profileImage = getProfileImageDataUrl(req.file);
    const validationMessage = validateFacultyPayload(req.body);
    if (validationMessage) return res.status(400).json({ message: validationMessage });

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    const tempPassword = generatePassword(10);

    user = await User.create({
      name,
      email: normalizedEmail,
      password: tempPassword,
      profileImage,
      role: "TEACHER",
      mustChangePassword: true,
    });

    const teacher = await Teacher.create({
      user: user._id,
      ...buildFacultyPayload(req.body),
    });

    await createJoiningNotification({ userId: user._id, name, role: "TEACHER" });
    await syncBirthdayNotification({ userId: user._id, name, dob: teacher.dob });

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
          {
            user: sanitizeUser(user),
            teacher,
            credentials: buildCredentialPayload({
              email: normalizedEmail,
              mailQueued: true,
            }),
          },
          "Teacher created successfully. Credentials email queued."
        )
      );
  } catch (error) {
    if (user?._id) {
      await User.findByIdAndDelete(user._id).catch(() => {});
    }
    console.error("Create Teacher Error:", error);
    return res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

export const getTeachers = async (req, res) => {
  const teachers = await Teacher.find().populate("user", "-password");
  return res.json(new ApiResponse(200, teachers, "Teachers list"));
};

export const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const name = normalizeText(req.body.name);
    const normalizedEmail = normalizeEmail(req.body.email);

    const teacher = await Teacher.findById(teacherId).populate("user");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }
    const profileImage = getProfileImageDataUrl(req.file);
    const validationMessage = validateFacultyPayload(req.body);
    if (validationMessage) return res.status(400).json({ message: validationMessage });

    if (normalizedEmail && normalizedEmail !== teacher.user.email) {
      const exists = await User.findOne({ email: normalizedEmail });
      if (exists) return res.status(400).json({ message: "Email already in use" });
    }

    if (name) teacher.user.name = name;
    if (normalizedEmail) teacher.user.email = normalizedEmail;
    if (profileImage) teacher.user.profileImage = profileImage;
    if (parseBoolean(req.body.removeProfileImage)) teacher.user.profileImage = "";
    await teacher.user.save();

    Object.assign(teacher, buildFacultyPayload(req.body));
    await teacher.save();
    await syncBirthdayNotification({ userId: teacher.user._id, name: teacher.user.name, dob: teacher.dob });

    return res.json(new ApiResponse(200, teacher, "Teacher updated"));
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

export const createStudent = async (req, res) => {
  let user = null;
  try {
    const name = normalizeText(req.body.name);
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!name || !normalizedEmail) {
      return res.status(400).json({ message: "name and email are required" });
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }
    const profileImage = getProfileImageDataUrl(req.file);
    const validationMessage = validateStudentPayload(req.body);
    if (validationMessage) return res.status(400).json({ message: validationMessage });

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ message: "Student already exists" });

    const tempPassword = generatePassword(10);

    user = await User.create({
      name,
      email: normalizedEmail,
      password: tempPassword,
      profileImage,
      role: "STUDENT",
      mustChangePassword: true,
    });

    const student = await Student.create({
      user: user._id,
      ...buildStudentPayload(req.body),
    });

    await createJoiningNotification({ userId: user._id, name, role: "STUDENT" });
    await syncBirthdayNotification({ userId: user._id, name, dob: student.dob });

    queueAccountCredentialsMail({
      name,
      role: "STUDENT",
      email: normalizedEmail,
      tempPassword,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          user: sanitizeUser(user),
          student,
          credentials: buildCredentialPayload({
            email: normalizedEmail,
            mailQueued: true,
          }),
        },
        "Student created successfully. Credentials email queued."
      )
    );
  } catch (error) {
    if (user?._id) {
      await User.findByIdAndDelete(user._id).catch(() => {});
    }
    return res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
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

    try {
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

      return res.json(
        new ApiResponse(
          200,
          {
            credentials: buildCredentialPayload({
              email: user.email,
              emailSent: true,
            }),
          },
          "Credentials resent"
        )
      );
    } catch (error) {
      return res.json(
        new ApiResponse(
          200,
          {
            credentials: buildCredentialPayload({
              email: user.email,
              emailSent: false,
              mailError: getMailFailureMessage(error),
            }),
          },
          "Credentials reset completed, but email could not be delivered."
        )
      );
    }
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};


export const getStudents = async (req, res) => {
  const students = await Student.find()
    .populate("user", "-password")
    .populate("classId");
  const fees = await Fee.find({ student: { $in: students.map((student) => student._id) } });
  const feeByStudentId = new Map(fees.map((fee) => [String(fee.student), fee]));
  const studentsWithFee = students.map((student) => {
    const data = student.toObject();
    data.fee = feeByStudentId.get(String(student._id)) || {
      totalFee: 0,
      paidAmount: 0,
      dueAmount: 0,
      status: "Due",
      paymentHistory: [],
    };
    return data;
  });
  return res.json(new ApiResponse(200, studentsWithFee, "Students list"));
};

export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const name = normalizeText(req.body.name);
    const normalizedEmail = normalizeEmail(req.body.email);

    const student = await Student.findById(studentId).populate("user");
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }
    const profileImage = getProfileImageDataUrl(req.file);
    const validationMessage = validateStudentPayload(req.body);
    if (validationMessage) return res.status(400).json({ message: validationMessage });

    if (normalizedEmail && normalizedEmail !== student.user.email) {
      const exists = await User.findOne({ email: normalizedEmail });
      if (exists) return res.status(400).json({ message: "Email already in use" });
    }

    if (name) student.user.name = name;
    if (normalizedEmail) student.user.email = normalizedEmail;
    if (profileImage) student.user.profileImage = profileImage;
    if (parseBoolean(req.body.removeProfileImage)) student.user.profileImage = "";
    await student.user.save();

    Object.assign(student, buildStudentPayload(req.body));
    await student.save();
    await syncBirthdayNotification({ userId: student.user._id, name: student.user.name, dob: student.dob });

    return res.json(new ApiResponse(200, student, "Student updated"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createClass = async (req, res) => {
  const { name, teacherId } = req.body;
  const className = normalizeText(name);

  if (!className) return res.status(400).json({ message: "Class name is required" });

  const cls = await ClassModel.create({
    name: className,
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
    const className = normalizeText(name);

    const cls = await ClassModel.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (name !== undefined) {
      if (!className) return res.status(400).json({ message: "Class name is required" });
      cls.name = className;
    }
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
    await Fee.deleteOne({ student: studentId });

    await Student.findByIdAndDelete(studentId);
    await User.findByIdAndDelete(student.user);

    return res.json(new ApiResponse(200, null, "Student deleted"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getNotificationTargets = async (req, res) => {
  try {
    const [classes, teachers, students] = await Promise.all([
      ClassModel.find().sort({ name: 1 }).populate("teacher", "user"),
      Teacher.find().populate("user", "name email role").sort({ createdAt: -1 }),
      Student.find().populate("user", "name email role").populate("classId", "name").sort({ createdAt: -1 }),
    ]);

    return res.json(
      new ApiResponse(
        200,
        {
          classes: classes.map((item) => ({
            _id: item._id,
            name: item.name,
          })),
          teachers: teachers.map((item) => ({
            _id: item._id,
            userId: item.user?._id,
            name: item.user?.name,
            email: item.user?.email,
            subject: item.subject,
          })),
          students: students.map((item) => ({
            _id: item._id,
            userId: item.user?._id,
            name: item.user?.name,
            email: item.user?.email,
            classId: item.classId?._id,
            className: item.classId?.name,
            rollNo: item.rollNo,
          })),
        },
        "Notification targets"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const sendAdminNotification = async (req, res) => {
  try {
    const title = normalizeText(req.body.title);
    const message = normalizeText(req.body.message);
    const audience = String(req.body.audience || "ALL").trim().toUpperCase();
    const targetId = String(req.body.targetId || "").trim();
    const type = String(req.body.type || "ANNOUNCEMENT").trim().toUpperCase();

    if (!title) return res.status(400).json({ message: "Notification title is required" });
    if (!message) return res.status(400).json({ message: "Notification message is required" });
    if (!["ANNOUNCEMENT", "URGENT", "SYSTEM"].includes(type)) {
      return res.status(400).json({ message: "Invalid notification type" });
    }

    let recipientIds = [];
    let audienceLabel = audience;

    if (audience === "ALL") {
      const users = await User.find({ role: { $in: ["TEACHER", "STUDENT"] } }).select("_id");
      recipientIds = users.map((item) => item._id);
      audienceLabel = "Whole school / college";
    } else if (audience === "TEACHERS") {
      const users = await User.find({ role: "TEACHER" }).select("_id");
      recipientIds = users.map((item) => item._id);
      audienceLabel = "All faculty";
    } else if (audience === "STUDENTS") {
      const users = await User.find({ role: "STUDENT" }).select("_id");
      recipientIds = users.map((item) => item._id);
      audienceLabel = "All students";
    } else if (audience === "CLASS") {
      if (!targetId) return res.status(400).json({ message: "Class is required" });
      const cls = await ClassModel.findById(targetId);
      if (!cls) return res.status(404).json({ message: "Class not found" });
      const [students, teacher] = await Promise.all([
        Student.find({ classId: targetId }).select("user"),
        cls.teacher ? Teacher.findById(cls.teacher).select("user") : null,
      ]);
      recipientIds = [...students.map((item) => item.user), teacher?.user];
      audienceLabel = `Class ${cls.name}`;
    } else if (audience === "TEACHER") {
      if (!targetId) return res.status(400).json({ message: "Faculty is required" });
      const teacher = await Teacher.findById(targetId).populate("user", "name");
      if (!teacher) return res.status(404).json({ message: "Faculty not found" });
      recipientIds = [teacher.user?._id];
      audienceLabel = teacher.user?.name || "Faculty";
    } else if (audience === "STUDENT") {
      if (!targetId) return res.status(400).json({ message: "Student is required" });
      const student = await Student.findById(targetId).populate("user", "name");
      if (!student) return res.status(404).json({ message: "Student not found" });
      recipientIds = [student.user?._id];
      audienceLabel = student.user?.name || "Student";
    } else {
      return res.status(400).json({ message: "Invalid audience" });
    }

    const uniqueRecipientIds = uniqueIds(recipientIds);
    if (uniqueRecipientIds.length === 0) {
      return res.status(400).json({ message: "No recipients found for this target" });
    }

    const notifications = await SystemNotification.insertMany(
      uniqueRecipientIds.map((recipient) => ({
        recipient,
        sender: req.user._id,
        title,
        message,
        type,
        audience: audienceLabel,
      }))
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          sentCount: notifications.length,
          audience: audienceLabel,
        },
        "Notification sent"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
