import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const YEAR = 2026;

const eventImages = {
  HOLIDAY: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
  JOINING: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
  BIRTHDAY: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
  ACADEMIC: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
  EXAM: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80",
  MEETING: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
};

const typeLabels = {
  HOLIDAY: "Holiday",
  JOINING: "DOJ",
  BIRTHDAY: "Birthday",
  ACADEMIC: "Academic",
  EXAM: "Exam",
  MEETING: "Meeting",
};

const typeStyles = {
  HOLIDAY: "bg-sky-50 text-sky-700",
  JOINING: "bg-emerald-50 text-emerald-700",
  BIRTHDAY: "bg-rose-50 text-rose-700",
  ACADEMIC: "bg-violet-50 text-violet-700",
  EXAM: "bg-orange-50 text-orange-700",
  MEETING: "bg-indigo-50 text-indigo-700",
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));

export default function DashboardEvents() {
  const [profileEvents, setProfileEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/user/calendar-events")
      .then((res) => setProfileEvents(res.data.data || []))
      .catch(() => setProfileEvents([]));
    axiosInstance
      .get(`/user/holidays?year=${YEAR}`)
      .then((res) => setHolidays(res.data.data || []))
      .catch(() => setHolidays([]));
  }, []);

  const events = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...holidays, ...profileEvents]
      .filter((item) => ["HOLIDAY", "JOINING", "BIRTHDAY", "ACADEMIC", "EXAM", "MEETING"].includes(item.type))
      .filter((item) => item.date?.startsWith(String(YEAR)))
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter((item) => item.date >= today)
      .slice(0, 5);
  }, [holidays, profileEvents]);

  return (
    <section className="card mt-6 overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-slate-200/70 bg-white/70 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="label">Upcoming Events</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">Holiday, DOJ, birthday and academic updates</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
          {events.length} upcoming
        </span>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming holiday, joining, or birthday updates found.</p>
        ) : (
          events.map((event, index) => (
            <article
              key={`${event.type}-${event.date}-${index}`}
              className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_35px_-30px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_-32px_rgba(15,23,42,0.5)]"
            >
              <div className="relative h-28 overflow-hidden">
                <img
                  src={eventImages[event.type] || eventImages.HOLIDAY}
                  alt={event.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${typeStyles[event.type] || "bg-slate-50 text-slate-700"}`}>
                  {typeLabels[event.type] || event.type}
                </span>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{formatDate(event.date)}</p>
                <h4 className="mt-2 text-sm font-semibold text-slate-900">{event.title}</h4>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{event.message}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
