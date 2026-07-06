import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
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
  getNotificationTargets,
  sendAdminNotification,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, authorize("ADMIN"));

router.get("/dashboard", getDashboard);
router.get("/notification-targets", getNotificationTargets);
router.post("/notifications", sendAdminNotification);

router.post("/teacher", upload.single("profileImage"), createTeacher);
router.get("/teachers", getTeachers);
router.put("/teacher/:teacherId", upload.single("profileImage"), updateTeacher);
router.delete("/teacher/:teacherId", deleteTeacher);

router.post("/student", upload.single("profileImage"), createStudent);
router.get("/students", getStudents);
router.put("/student/:studentId", upload.single("profileImage"), updateStudent);
router.delete("/student/:studentId", deleteStudent);

router.post("/class", createClass);
router.get("/classes", getClasses);
router.put("/class/:classId", updateClass);
router.delete("/class/:classId", deleteClass);
router.post("/resend/:userId", resendCredentials);

export default router;
