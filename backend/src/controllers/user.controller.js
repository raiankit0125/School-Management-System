import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/Student.model.js";
import { SystemNotification } from "../models/SystemNotification.model.js";
import { CalendarEvent } from "../models/CalendarEvent.model.js";
import {
  ensureTodaysBirthdayNotification,
  profileCalendarEvents,
} from "../utils/systemNotifications.js";

const INDIAN_HOLIDAY_CALENDAR_ID = "en.indian#holiday@group.v.calendar.google.com";
const FALLBACK_HOLIDAYS_2026 = [
  { date: "2026-01-01", title: "New Year's Day", message: "New Year's Day", type: "HOLIDAY", source: "fallback" },
  { date: "2026-01-14", title: "Makar Sankranti", message: "Makar Sankranti", type: "HOLIDAY", source: "fallback" },
  { date: "2026-01-26", title: "Republic Day", message: "Republic Day", type: "HOLIDAY", source: "fallback" },
  { date: "2026-03-04", title: "Holi", message: "Holi", type: "HOLIDAY", source: "fallback" },
  { date: "2026-03-20", title: "Eid al-Fitr", message: "Eid al-Fitr", type: "HOLIDAY", source: "fallback" },
  { date: "2026-04-03", title: "Good Friday", message: "Good Friday", type: "HOLIDAY", source: "fallback" },
  { date: "2026-05-01", title: "Labour Day", message: "Labour Day", type: "HOLIDAY", source: "fallback" },
  { date: "2026-05-27", title: "Eid al-Adha", message: "Eid al-Adha", type: "HOLIDAY", source: "fallback" },
  { date: "2026-08-15", title: "Independence Day", message: "Independence Day", type: "HOLIDAY", source: "fallback" },
  { date: "2026-10-02", title: "Gandhi Jayanti", message: "Gandhi Jayanti", type: "HOLIDAY", source: "fallback" },
  { date: "2026-10-20", title: "Dussehra", message: "Dussehra", type: "HOLIDAY", source: "fallback" },
  { date: "2026-11-08", title: "Diwali", message: "Diwali", type: "HOLIDAY", source: "fallback" },
  { date: "2026-12-25", title: "Christmas Day", message: "Christmas Day", type: "HOLIDAY", source: "fallback" },
];

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password are required" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await user.isPasswordCorrect(oldPassword);
    if (!ok) return res.status(400).json({ message: "Old password incorrect" });

    user.password = newPassword; // pre-save hook will hash
    user.mustChangePassword = false;
    user.passwordChangedAt = new Date();

    await user.save();

    return res.json(new ApiResponse(200, null, "Password changed successfully ✅"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getOwnProfile = async (user) => {
  if (user.role === "TEACHER") {
    return Teacher.findOne({ user: user._id }).populate("user", "name email role createdAt");
  }
  if (user.role === "STUDENT") {
    return Student.findOne({ user: user._id }).populate("user", "name email role createdAt");
  }
  return null;
};

export const getNotifications = async (req, res) => {
  try {
    if (["TEACHER", "STUDENT"].includes(req.user.role)) {
      const profile = await getOwnProfile(req.user);
      await ensureTodaysBirthdayNotification({
        userId: req.user._id,
        name: profile?.user?.name,
        dob: profile?.dob,
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const notifications = await SystemNotification.find({
      recipient: req.user._id,
      $or: [{ eventDate: "" }, { eventDate: { $lte: today } }],
    }).sort({ createdAt: -1 });

    return res.json(new ApiResponse(200, notifications, "Notifications"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await SystemNotification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.json(new ApiResponse(200, notification, "Notification marked as read"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getCalendarEvents = async (req, res) => {
  try {
    let profileEvents = [];

    if (req.user.role === "ADMIN") {
      const [teachers, students] = await Promise.all([
        Teacher.find().populate("user", "name role createdAt"),
        Student.find().populate("user", "name role createdAt"),
      ]);

      profileEvents = [
        ...teachers.flatMap((teacher) =>
          profileCalendarEvents({
            name: teacher?.user?.name,
            role: "TEACHER",
            createdAt: teacher?.user?.createdAt,
            dob: teacher?.dob,
          })
        ),
        ...students.flatMap((student) =>
          profileCalendarEvents({
            name: student?.user?.name,
            role: "STUDENT",
            createdAt: student?.user?.createdAt,
            dob: student?.dob,
          })
        ),
      ];
    } else {
      const profile = await getOwnProfile(req.user);
      profileEvents = profileCalendarEvents({
        name: profile?.user?.name,
        role: req.user.role,
        createdAt: profile?.user?.createdAt,
        dob: profile?.dob,
      });
    }

    const manualEvents = await CalendarEvent.find()
      .populate("createdBy", "name role")
      .sort({ date: 1, createdAt: -1 });

    const events = [
      ...profileEvents,
      ...manualEvents.map((event) => ({
        _id: event._id,
        date: event.date,
        title: event.title,
        message: event.message,
        type: event.type,
        source: "manual",
        createdBy: event.createdBy,
      })),
    ];

    return res.json(new ApiResponse(200, events, "Calendar events"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createCalendarEvent = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can add calendar events" });
    }

    const title = String(req.body.title || "").trim();
    const message = String(req.body.message || "").trim();
    const date = String(req.body.date || "").trim();
    const type = String(req.body.type || "ACADEMIC").trim().toUpperCase();

    if (!title) return res.status(400).json({ message: "Event title is required" });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Valid date is required in YYYY-MM-DD format" });
    }

    const allowedTypes = ["ACADEMIC", "EXAM", "MEETING", "HOLIDAY"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid event type" });
    }

    const event = await CalendarEvent.create({
      title,
      message,
      date,
      type,
      createdBy: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, event, "Calendar event added"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteCalendarEvent = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can delete calendar events" });
    }

    const event = await CalendarEvent.findByIdAndDelete(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Calendar event not found" });

    return res.json(new ApiResponse(200, null, "Calendar event deleted"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const normalizeGoogleHoliday = (event) => {
  const date = event?.start?.date || event?.start?.dateTime?.slice(0, 10);
  return {
    date,
    title: event?.summary || "Holiday",
    message: event?.description || event?.summary || "Indian holiday",
    type: "HOLIDAY",
    source: "google-calendar",
  };
};

export const getIndianHolidays = async (req, res) => {
  try {
    const year = Number(req.query.year || new Date().getFullYear());
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ message: "Valid year is required" });
    }

    const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
    if (!apiKey) {
      const fallback = year === 2026 ? FALLBACK_HOLIDAYS_2026 : [];
      return res.json(
        new ApiResponse(
          200,
          fallback,
          "GOOGLE_CALENDAR_API_KEY is not configured. Showing saved fallback holidays."
        )
      );
    }

    const params = new URLSearchParams({
      key: apiKey,
      timeMin: `${year}-01-01T00:00:00+05:30`,
      timeMax: `${year + 1}-01-01T00:00:00+05:30`,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "250",
      timeZone: "Asia/Kolkata",
    });

    const endpoint = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      INDIAN_HOLIDAY_CALENDAR_ID
    )}/events?${params.toString()}`;

    const response = await fetch(endpoint);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const fallback = year === 2026 ? FALLBACK_HOLIDAYS_2026 : [];
      return res.json(
        new ApiResponse(
          200,
          fallback,
          data?.error?.message || "Google Calendar API failed. Showing saved fallback holidays."
        )
      );
    }

    const holidays = (data?.items || [])
      .map(normalizeGoogleHoliday)
      .filter((item) => item.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.json(new ApiResponse(200, holidays, "Indian holidays from Google Calendar"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
