import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

import {
  bulkUploadStudents,
  bulkUploadTeachers,
} from "../controllers/bulk.controller.js";

const router = express.Router();

router.use(protect, authorize("ADMIN"));

router.post("/students", upload.single("file"), bulkUploadStudents);
router.post("/teachers", upload.single("file"), bulkUploadTeachers);

export default router;
