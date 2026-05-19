import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function NotificationBell({ role }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const canShow = ["TEACHER", "STUDENT"].includes(role);

  const fetchNotifications = () => {
    if (!canShow) return;
    axiosInstance
      .get("/user/notifications")
      .then((res) => setNotifications(res.data.data || []))
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    fetchNotifications();
    if (!canShow) return undefined;
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, [canShow]);

  if (!canShow) return null;

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markRead = async (notificationId) => {
    await axiosInstance.put(`/user/notifications/${notificationId}/read`);
    setNotifications((current) =>
      current.map((item) => (item._id === notificationId ? { ...item, read: true } : item))
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition hover:bg-white"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[11px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.55)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="label">Notifications</p>
              <p className="text-sm font-semibold text-slate-900">
                {unreadCount ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {notifications.length}
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto p-3">
            {notifications.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">
                New admin updates, DOJ reminders, and birthday reminders will appear here.
              </p>
            ) : (
              notifications.slice(0, 12).map((item) => (
                <button
                  type="button"
                  key={item._id}
                  onClick={() => !item.read && markRead(item._id)}
                  className={`mb-2 w-full rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
                    item.read ? "border-slate-200 bg-slate-50" : "border-teal-200 bg-teal-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{item.message}</p>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {item.audience || item.eventDate || item.type}
                      </p>
                    </div>
                    {!item.read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-500" /> : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
