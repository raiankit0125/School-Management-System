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

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const bulkUploadTeachers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "CSV file required" });

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
        "Teachers bulk upload completed ✅"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "CSV file required" });

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
        "Students bulk upload completed ✅"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
