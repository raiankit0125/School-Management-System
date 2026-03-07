import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { myProfile, myAttendance, myMarks, myNotices } from "../controllers/student.controller.js";

const router = express.Router();

router.use(protect, authorize("STUDENT"));

router.get("/me", myProfile);
router.get("/attendance", myAttendance);
router.get("/marks", myMarks);
router.get("/notices", myNotices);

export default router;
