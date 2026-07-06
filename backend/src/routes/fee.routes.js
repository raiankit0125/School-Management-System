import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  downloadMyReceipt,
  downloadReceipt,
  getMyFee,
  getStudentFeeById,
  searchFeeRecords,
  sendFeeNotification,
  updateStudentFee,
} from "../controllers/fee.controller.js";

const router = express.Router();

router.get("/me", protect, authorize("STUDENT"), getMyFee);
router.get("/me/receipt/:paymentId", protect, authorize("STUDENT"), downloadMyReceipt);

router.get("/admin/search", protect, authorize("ADMIN"), searchFeeRecords);
router.get("/admin/student/:studentId", protect, authorize("ADMIN"), getStudentFeeById);
router.put("/admin/student/:studentId", protect, authorize("ADMIN"), updateStudentFee);
router.post("/admin/student/:studentId/notification", protect, authorize("ADMIN"), sendFeeNotification);
router.get("/admin/student/:studentId/receipt/:paymentId", protect, authorize("ADMIN"), downloadReceipt);

export default router;
