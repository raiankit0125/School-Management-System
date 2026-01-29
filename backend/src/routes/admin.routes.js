import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { resendCredentials } from "../controllers/admin.controller.js";
import {
  getDashboard,
  createTeacher,
  getTeachers,
  updateTeacher,
  createStudent,
  getStudents,
  updateStudent,
  createClass,
  getClasses,
  updateClass,
  deleteClass,
  deleteTeacher,
  deleteStudent,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, authorize("ADMIN"));

router.get("/dashboard", getDashboard);

router.post("/teacher", createTeacher);
router.get("/teachers", getTeachers);
router.put("/teacher/:teacherId", updateTeacher);
router.delete("/teacher/:teacherId", deleteTeacher);

router.post("/student", createStudent);
router.get("/students", getStudents);
router.put("/student/:studentId", updateStudent);
router.delete("/student/:studentId", deleteStudent);

router.post("/class", createClass);
router.get("/classes", getClasses);
router.put("/class/:classId", updateClass);
router.delete("/class/:classId", deleteClass);
router.post("/resend/:userId", resendCredentials);

export default router;
