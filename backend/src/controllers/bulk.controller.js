import { ApiResponse } from "../utils/ApiResponse.js";
import { parseCsvBuffer } from "../utils/parseCsv.js";
import { generatePassword } from "../utils/generatePassword.js";
import { sendMail } from "../utils/sendMail.js";
import { newAccountTemplate } from "../utils/emailTemplates.js";
import { parseUploadedFile } from "../utils/parseFile.js";

import { User } from "../models/User.model.js";
import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/Student.model.js";
import { ClassModel } from "../models/Class.model.js";

const normalize = (s = "") => String(s).trim();
const parseList = (s = "") =>
  String(s)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const bulkUploadTeachers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File required" });

    const rows = await parseUploadedFile(req.file);

    let created = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const name = normalize(row.name);
      const email = normalize(row.email).toLowerCase();
      const subject = normalize(row.subject);
      const phone = normalize(row.phone);
      const alternatePhone = normalize(row.alternatePhone);
      const dob = normalize(row.dob);
      const gender = normalize(row.gender);
      const address = normalize(row.address);
      const city = normalize(row.city);
      const state = normalize(row.state);
      const pincode = normalize(row.pincode);
      const qualification = normalize(row.qualification);
      const specialization = normalize(row.specialization);
      const certifications = normalize(row.certifications);
      const certificates = normalize(row.certificates);
      const subjects = parseList(row.subjects || row.subject);
      const preferredClasses = parseList(row.preferredClasses);
      const experienceYears = normalize(row.experienceYears);
      const designation = normalize(row.designation);
      const institutions = normalize(row.institutions);
      const onlineExperience = normalize(row.onlineExperience);
      const onlineExperienceDetails = normalize(row.onlineExperienceDetails);
      const preferredTimings = parseList(row.preferredTimings);
      const timeSlots = normalize(row.timeSlots);
      const hoursPerWeek = normalize(row.hoursPerWeek);
      const devices = parseList(row.devices);
      const internetOptions = parseList(row.internetOptions);
      const techRating = normalize(row.techRating);
      const demoReady = normalize(row.demoReady);
      const demoTopic = normalize(row.demoTopic);
      const whyBst = normalize(row.whyBst);
      const comments = normalize(row.comments);
      const declarationAccepted = ["true", "yes", "1"].includes(normalize(row.declarationAccepted).toLowerCase());
      const signature = normalize(row.signature);
      const declarationDate = normalize(row.declarationDate);

      // validation
      if (!name || !email) {
        failed++;
        errors.push({ row: i + 1, email, reason: "name/email missing" });
        continue;
      }
      if (!isValidEmail(email)) {
        failed++;
        errors.push({ row: i + 1, email, reason: "invalid email" });
        continue;
      }

      // already exists
      const exists = await User.findOne({ email });
      if (exists) {
        failed++;
        errors.push({ row: i + 1, email, reason: "email already exists" });
        continue;
      }

      // create teacher
      const tempPassword = generatePassword(10);

      const user = await User.create({
        name,
        email,
        password: tempPassword,
        role: "TEACHER",
        mustChangePassword: true,
      });

      await Teacher.create({
        user: user._id,
        subject,
        phone,
        alternatePhone,
        dob: dob || null,
        gender,
        address,
        city,
        state,
        pincode,
        qualification,
        specialization,
        certifications,
        certificates,
        subjects,
        preferredClasses,
        experienceYears,
        designation,
        institutions,
        onlineExperience,
        onlineExperienceDetails,
        preferredTimings,
        timeSlots,
        hoursPerWeek,
        devices,
        internetOptions,
        techRating,
        demoReady,
        demoTopic,
        whyBst,
        comments,
        declarationAccepted,
        signature,
        declarationDate: declarationDate || null,
      });

      // email (do not fail whole import)
      try {
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
      } catch (err) {
        // don't break bulk upload
        console.log("❌ Teacher mail failed:", email, err.message);
      }

      created++;
    }

    return res.json(
      new ApiResponse(
        200,
        { total: rows.length, created, failed, errors },
        "Faculty bulk upload completed"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File required" });

    const rows = await parseUploadedFile(req.file);

    let created = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const name = normalize(row.name);
      const email = normalize(row.email).toLowerCase();
      const className = normalize(row.className); // e.g. 10-A
      const rollNo = normalize(row.rollNo);
      const phone = normalize(row.phone);
      const address = normalize(row.address);
      const dob = normalize(row.dob);
      const gender = normalize(row.gender);
      const city = normalize(row.city);
      const state = normalize(row.state);
      const pincode = normalize(row.pincode);
      const guardianName = normalize(row.guardianName);
      const guardianPhone = normalize(row.guardianPhone);
      const admissionNo = normalize(row.admissionNo);
      const section = normalize(row.section);
      const previousSchool = normalize(row.previousSchool);
      const medicalNotes = normalize(row.medicalNotes);
      const transportMode = normalize(row.transportMode);
      const notes = normalize(row.notes);

      if (!name || !email || !className) {
        failed++;
        errors.push({ row: i + 1, email, reason: "name/email/className missing" });
        continue;
      }
      if (!isValidEmail(email)) {
        failed++;
        errors.push({ row: i + 1, email, reason: "invalid email" });
        continue;
      }

      const exists = await User.findOne({ email });
      if (exists) {
        failed++;
        errors.push({ row: i + 1, email, reason: "email already exists" });
        continue;
      }

      // class find/create
      let cls = await ClassModel.findOne({ name: className });
      if (!cls) cls = await ClassModel.create({ name: className });

      const tempPassword = generatePassword(10);

      const user = await User.create({
        name,
        email,
        password: tempPassword,
        role: "STUDENT",
        mustChangePassword: true,
      });

      await Student.create({
        user: user._id,
        classId: cls._id,
        rollNo,
        phone,
        address,
        dob: dob || null,
        gender,
        city,
        state,
        pincode,
        guardianName,
        guardianPhone,
        admissionNo,
        section,
        previousSchool,
        medicalNotes,
        transportMode,
        notes,
      });

      // email
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
      } catch (err) {
        console.log("❌ Student mail failed:", email, err.message);
      }

      created++;
    }

    return res.json(
      new ApiResponse(
        200,
        { total: rows.length, created, failed, errors },
        "Students bulk upload completed"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
