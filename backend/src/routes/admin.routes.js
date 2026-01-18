import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { resendCredentials } from "../controllers/admin.controller.js";
import {
  getDashboard,
  createTeacher,
  getTeachers,
  createStudent,
  getStudents,
  createClass,
  getClasses,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, authorize("ADMIN"));

router.get("/dashboard", getDashboard);

router.post("/teacher", createTeacher);
router.get("/teachers", getTeachers);

router.post("/student", createStudent);
router.get("/students", getStudents);

router.post("/class", createClass);
router.get("/classes", getClasses);
router.post("/resend/:userId", resendCredentials);

export default router;
