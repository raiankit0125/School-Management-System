import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Button from "./Button";

export default function NotificationBar({ role }) {
  const [notifications, setNotifications] = useState([]);

  const canShow = ["TEACHER", "STUDENT"].includes(role);

  useEffect(() => {
    if (!canShow) return;
    axiosInstance
      .get("/user/notifications")
      .then((res) => setNotifications(res.data.data || []))
      .catch(() => setNotifications([]));
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
    <section className="mb-6 rounded-[26px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label text-slate-500">Notifications</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            {unreadCount ? `${unreadCount} new update${unreadCount > 1 ? "s" : ""}` : "No new updates"}
          </h3>
        </div>
        <div className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
          {notifications.length}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500">Joining and birthday updates will appear here automatically.</p>
        ) : (
          notifications.slice(0, 4).map((item) => (
            <div
              key={item._id}
              className={`rounded-2xl border p-3 ${
                item.read ? "border-slate-200 bg-slate-50/80" : "border-teal-200 bg-teal-50/70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{item.message}</p>
                  {item.eventDate ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {item.eventDate}
                    </p>
                  ) : null}
                </div>
                {!item.read ? (
                  <Button variant="outline" onClick={() => markRead(item._id)}>
                    Read
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
