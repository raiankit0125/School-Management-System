import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const YEAR = 2026;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const typeStyles = {
  HOLIDAY: "border-sky-200 bg-sky-50 text-sky-800",
  JOINING: "border-emerald-200 bg-emerald-50 text-emerald-800",
  BIRTHDAY: "border-rose-200 bg-rose-50 text-rose-800",
  ACADEMIC: "border-violet-200 bg-violet-50 text-violet-800",
  EXAM: "border-orange-200 bg-orange-50 text-orange-800",
  MEETING: "border-indigo-200 bg-indigo-50 text-indigo-800",
};

const typeDotStyles = {
  HOLIDAY: "bg-sky-500",
  JOINING: "bg-emerald-500",
  BIRTHDAY: "bg-rose-500",
  ACADEMIC: "bg-violet-500",
  EXAM: "bg-orange-500",
  MEETING: "bg-indigo-500",
};

const eventImages = [
  {
    match: ["diwali", "dhanteras"],
    image: "https://images.unsplash.com/photo-1605292356183-a77d0a9c9d1d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["holi"],
    image: "https://images.unsplash.com/photo-1615886456782-2b15f7a96e36?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["christmas"],
    image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["birthday"],
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["joining"],
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
];

const fallbackImage =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));

const dateKey = (monthIndex, day) =>
  `${YEAR}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const getEventImage = (items) => {
  const text = items.map((item) => `${item.title} ${item.type}`).join(" ").toLowerCase();
  return eventImages.find((entry) => entry.match.some((word) => text.includes(word)))?.image || fallbackImage;
};

export default function HolidayCalendar({ className = "" }) {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    date: "",
    type: "ACADEMIC",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const currentDate = new Date();
  const initialMonth = currentDate.getFullYear() === YEAR ? currentDate.getMonth() : 0;
  const initialDate =
    currentDate.getFullYear() === YEAR ? currentDate.toISOString().slice(0, 10) : `${YEAR}-01-01`;
  const [monthIndex, setMonthIndex] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const canManageEvents = user?.role === "ADMIN";

  const fetchCalendarEvents = () =>
    axiosInstance
      .get("/user/calendar-events")
      .then((res) => setEvents(res.data.data || []))
      .catch(() => setEvents([]));

  useEffect(() => {
    axiosInstance
      .get(`/user/holidays?year=${YEAR}`)
      .then((res) => setHolidays(res.data.data || []))
      .catch(() => {
        setHolidays([]);
        setError("Holiday data is temporarily unavailable.");
      });

    fetchCalendarEvents();
  }, []);

  const allItems = useMemo(
    () =>
      [...events, ...holidays]
        .filter((item) => item.date)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events, holidays]
  );

  const itemsByDate = useMemo(() => {
    const grouped = new Map();
    allItems.forEach((item) => {
      grouped.set(item.date, [...(grouped.get(item.date) || []), item]);
    });
    return grouped;
  }, [allItems]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(YEAR, monthIndex, 1).getDay();
    const daysInMonth = new Date(YEAR, monthIndex + 1, 0).getDate();
    return [
      ...Array.from({ length: firstDay }, (_, index) => ({ key: `blank-${index}`, day: null })),
      ...Array.from({ length: daysInMonth }, (_, index) => ({
        key: `day-${index + 1}`,
        day: index + 1,
        date: dateKey(monthIndex, index + 1),
      })),
    ];
  }, [monthIndex]);

  const selectedItems = itemsByDate.get(selectedDate) || [];
  const monthItems = allItems.filter((item) =>
    item.date.startsWith(`${YEAR}-${String(monthIndex + 1).padStart(2, "0")}`)
  );
  const selectedImage = getEventImage(selectedItems);

  const changeMonth = (direction) => {
    setMonthIndex((current) => {
      const next = Math.min(11, Math.max(0, current + direction));
      setSelectedDate(dateKey(next, 1));
      return next;
    });
  };

  const saveEvent = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.date) return;

    setSaving(true);
    try {
      await axiosInstance.post("/user/calendar-events", form);
      setForm({ title: "", date: "", type: "ACADEMIC", message: "" });
      setSelectedDate(form.date);
      await fetchCalendarEvents();
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to add calendar event");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!eventId) return;
    if (!confirm("Delete this calendar event?")) return;
    await axiosInstance.delete(`/user/calendar-events/${eventId}`);
    await fetchCalendarEvents();
  };

  return (
    <section className={`rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)] backdrop-blur ${className}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="label text-slate-500">Calendar 2026</p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-900">Holidays and academic events</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Select a date to see Google Calendar holidays, DOJ reminders, birthdays, and academic events.
          </p>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">IN</span>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,720px)_minmax(300px,1fr)]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              disabled={monthIndex === 0}
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Prev
            </button>
            <p className="text-base font-semibold text-slate-900">
              {MONTHS[monthIndex]} {YEAR}
            </p>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              disabled={monthIndex === 11}
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-center">
            {WEEK_DAYS.map((day) => (
              <p key={day} className="py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {day}
              </p>
            ))}
            {calendarCells.map((cell) => {
              if (!cell.day) return <span key={cell.key} className="h-16 rounded-2xl" />;
              const dayItems = itemsByDate.get(cell.date) || [];
              const hasHoliday = dayItems.some((item) => item.type === "HOLIDAY");
              const isSelected = selectedDate === cell.date;
              const dotTypes = [...new Set(dayItems.map((item) => item.type))].slice(0, 3);

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelectedDate(cell.date)}
                  className={`relative h-16 rounded-2xl text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-lg"
                      : hasHoliday
                      ? "bg-sky-50 text-sky-800 hover:bg-sky-100"
                      : dayItems.length
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "bg-slate-50/70 text-slate-600 hover:bg-slate-100"
                  }`}
                  title={dayItems.map((item) => item.title).join(", ")}
                >
                  {cell.day}
                  {dayItems.length ? (
                    <span className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-0.5">
                      {dotTypes.map((type) => (
                        <span
                          key={type}
                          className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : typeDotStyles[type] || "bg-slate-400"}`}
                        />
                      ))}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">Holiday</span>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">Academic</span>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">Exam</span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">Meeting</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Joining</span>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">Birthday</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
          <div className="relative h-44 overflow-hidden">
            <img src={selectedImage} alt="Selected event" className="h-full w-full object-cover transition duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Selected date</p>
              <h4 className="mt-1 text-2xl font-semibold">{formatDate(selectedDate)}</h4>
            </div>
          </div>

          <div className="space-y-4 p-4">
            {error ? <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">{error}</p> : null}

            <div>
              <p className="label">Events</p>
              <div className="mt-3 space-y-2">
                {selectedItems.length === 0 ? (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                    No holiday, DOJ, birthday, or academic event on this date.
                  </p>
                ) : (
                  selectedItems.map((item, index) => (
                    <div
                      key={`${item.type}-${item.date}-${index}`}
                      className={`rounded-2xl border p-3 ${typeStyles[item.type] || "border-slate-200 bg-white text-slate-700"}`}
                    >
                      <p className="text-sm font-semibold">{item.title}</p>
                      {item.message ? <p className="mt-1 text-xs leading-5 opacity-80">{item.message}</p> : null}
                      {canManageEvents && item.source === "manual" ? (
                        <button
                          type="button"
                          onClick={() => deleteEvent(item._id)}
                          className="mt-3 rounded-xl border border-current px-3 py-1 text-xs font-semibold opacity-80 transition hover:opacity-100"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {canManageEvents ? (
        <form onSubmit={saveEvent} className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <label className="flex-1">
              <span className="label">Event Title</span>
              <input
                className="input-field mt-2"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Parent meeting, exam, celebration..."
              />
            </label>
            <label>
              <span className="label">Date</span>
              <input
                type="date"
                className="input-field mt-2"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </label>
            <label>
              <span className="label">Type</span>
              <select
                className="select-field mt-2"
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="ACADEMIC">Academic</option>
                <option value="EXAM">Exam</option>
                <option value="MEETING">Meeting</option>
                <option value="HOLIDAY">Holiday</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary min-w-32 disabled:opacity-60"
            >
              {saving ? "Adding..." : "Add Event"}
            </button>
          </div>
          <label className="mt-4 block">
            <span className="label">Details</span>
            <textarea
              className="input-field mt-2 min-h-24"
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              placeholder="Short information shown to teachers and students."
            />
          </label>
        </form>
      ) : null}

      <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4">
        <p className="label">This Month</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {monthItems.length === 0 ? (
            <p className="text-sm text-slate-500">No holidays or events in this month.</p>
          ) : (
            monthItems.map((item, index) => (
              <button
                type="button"
                onClick={() => setSelectedDate(item.date)}
                key={`${item.type}-${item.date}-${index}`}
                className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${typeStyles[item.type] || "border-slate-200 bg-slate-50 text-slate-700"}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{formatDate(item.date)}</p>
                <p className="mt-1 text-sm font-semibold">{item.title}</p>
                {item.message && item.message !== item.title ? (
                  <p className="mt-1 text-xs leading-5 opacity-80">{item.message}</p>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
