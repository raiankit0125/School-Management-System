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
  markAttendance,
  uploadMarks,
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.use(protect, authorize("TEACHER"));

router.get("/me", myProfile);
router.get("/classes", myClasses);
router.get("/class/:classId/students", getStudentsByClass);

router.post("/attendance", markAttendance);
router.post("/marks", uploadMarks);
router.get("/attendance-status", todayAttendanceStatus);
router.post("/bulk/marks", upload.single("file"), bulkUploadMarks);
router.post("/bulk/attendance", upload.single("file"), bulkUploadAttendance);



export default router;
