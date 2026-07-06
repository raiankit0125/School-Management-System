import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { todayAttendanceStatus } from "../controllers/teacher.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { bulkUploadMarks } from "../controllers/teacher.controller.js";
import { bulkUploadAttendance } from "../controllers/teacher.controller.js";

import {
  myProfile,
  myClasses,
  getStudentsByClass,
  getClassAttendanceSummary,
  markAttendance,
  notifyLowAttendance,
  uploadMarks,
  sendStudentNotice,
  sendClassNotification,
  getTeacherNotices,
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.use(protect, authorize("TEACHER"));

router.get("/me", myProfile);
router.get("/classes", myClasses);
router.get("/class/:classId/students", getStudentsByClass);

router.post("/attendance", markAttendance);
router.get("/attendance-summary/:classId", getClassAttendanceSummary);
router.post("/attendance-summary/:classId/notify", notifyLowAttendance);
router.post("/marks", uploadMarks);
router.get("/attendance-status", todayAttendanceStatus);
router.post("/bulk/marks", upload.single("file"), bulkUploadMarks);
router.post("/bulk/attendance", upload.single("file"), bulkUploadAttendance);
router.get("/notices", getTeacherNotices);
router.post("/notices", sendStudentNotice);
router.post("/notifications", sendClassNotification);



export default router;
