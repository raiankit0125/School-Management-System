import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  changePassword,
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  getIndianHolidays,
  getNotifications,
  markNotificationRead,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/change-password", protect, changePassword);
router.get("/notifications", protect, getNotifications);
router.put("/notifications/:notificationId/read", protect, markNotificationRead);
router.get("/calendar-events", protect, getCalendarEvents);
router.post("/calendar-events", protect, createCalendarEvent);
router.delete("/calendar-events/:eventId", protect, deleteCalendarEvent);
router.get("/holidays", protect, getIndianHolidays);

export default router;
