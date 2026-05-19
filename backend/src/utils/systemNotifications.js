import { SystemNotification } from "../models/SystemNotification.model.js";

const toDateKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const birthdayDateForYear = (dob, year) => {
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const createJoiningNotification = async ({ userId, name, role }) => {
  if (!userId) return null;
  const normalizedRole = String(role || "user").toLowerCase();
  const today = new Date().toISOString().slice(0, 10);

  return SystemNotification.findOneAndUpdate(
    { recipient: userId, type: "JOINING", eventDate: today },
    {
      recipient: userId,
      type: "JOINING",
      eventDate: today,
      title: "Welcome to Academic Hub",
      message: `${name || "Your"} ${normalizedRole} account has been created. Please log in, change your password, and start using your workspace.`,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const syncBirthdayNotification = async ({ userId, name, dob }) => {
  if (!userId || !dob) return null;

  const today = new Date().toISOString().slice(0, 10);
  const currentYear = new Date().getUTCFullYear();
  let eventDate = birthdayDateForYear(dob, currentYear);
  if (eventDate && eventDate < today) {
    eventDate = birthdayDateForYear(dob, currentYear + 1);
  }
  if (!eventDate) return null;

  await SystemNotification.deleteMany({
    recipient: userId,
    type: "BIRTHDAY",
    eventDate: { $ne: eventDate, $gte: today },
  });

  return SystemNotification.findOneAndUpdate(
    { recipient: userId, type: "BIRTHDAY", eventDate },
    {
      recipient: userId,
      type: "BIRTHDAY",
      eventDate,
      title: "Birthday Reminder",
      message: `Happy Birthday ${name || "there"}! Wishing you a wonderful day and a successful academic year.`,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const ensureTodaysBirthdayNotification = async ({ userId, name, dob }) => {
  if (!userId || !dob) return null;
  const today = new Date().toISOString().slice(0, 10);
  const eventDate = birthdayDateForYear(dob, new Date().getUTCFullYear());
  if (eventDate !== today) return null;
  return syncBirthdayNotification({ userId, name, dob });
};

export const profileCalendarEvents = ({ name, role, createdAt, dob }) => {
  const events = [];
  const joiningDate = toDateKey(createdAt);
  const currentYear = new Date().getUTCFullYear();
  const birthday = birthdayDateForYear(dob, currentYear);
  const label = role === "TEACHER" ? "Faculty" : role === "STUDENT" ? "Student" : role;

  if (joiningDate) {
    events.push({
      date: joiningDate,
      title: `${label} Joining`,
      message: `${name || label} joined the portal on this date.`,
      type: "JOINING",
    });
  }

  if (birthday) {
    events.push({
      date: birthday,
      title: `${label} Birthday`,
      message: `${name || label}'s birthday reminder.`,
      type: "BIRTHDAY",
    });
  }

  return events;
};
