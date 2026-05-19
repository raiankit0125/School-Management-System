import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import axiosInstance from "../../api/axiosInstance";

const audienceOptions = [
  { value: "ALL", label: "Whole School / College" },
  { value: "TEACHERS", label: "All Faculty" },
  { value: "STUDENTS", label: "All Students" },
  { value: "CLASS", label: "One Class" },
  { value: "TEACHER", label: "One Faculty" },
  { value: "STUDENT", label: "One Student" },
];

export default function AdminNotifications() {
  const [targets, setTargets] = useState({ classes: [], teachers: [], students: [] });
  const [form, setForm] = useState({
    audience: "ALL",
    targetId: "",
    type: "ANNOUNCEMENT",
    title: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/admin/notification-targets")
      .then((res) => setTargets(res.data.data || { classes: [], teachers: [], students: [] }))
      .catch(() => setTargets({ classes: [], teachers: [], students: [] }));
  }, []);

  const targetOptions = useMemo(() => {
    if (form.audience === "CLASS") {
      return targets.classes.map((item) => ({ value: item._id, label: item.name }));
    }
    if (form.audience === "TEACHER") {
      return targets.teachers.map((item) => ({
        value: item._id,
        label: `${item.name || "Faculty"}${item.subject ? ` - ${item.subject}` : ""}`,
      }));
    }
    if (form.audience === "STUDENT") {
      return targets.students.map((item) => ({
        value: item._id,
        label: `${item.name || "Student"}${item.className ? ` - ${item.className}` : ""}${item.rollNo ? ` / ${item.rollNo}` : ""}`,
      }));
    }
    return [];
  }, [form.audience, targets]);

  const needsTarget = ["CLASS", "TEACHER", "STUDENT"].includes(form.audience);

  const setField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "audience" ? { targetId: "" } : {}),
    }));
    setResult("");
  };

  const sendNotification = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    if (needsTarget && !form.targetId) return;

    setSending(true);
    try {
      const res = await axiosInstance.post("/admin/notifications", form);
      setResult(`Sent to ${res.data.data?.sentCount || 0} recipient(s).`);
      setForm((current) => ({ ...current, title: "", message: "" }));
    } catch (err) {
      setResult(err?.response?.data?.message || "Unable to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <PageTitle
        title="Send Notifications"
        subtitle="Broadcast admin updates to faculty, students, classes, or one selected user."
      />

      <section className="hero-panel mb-6 bg-[linear-gradient(135deg,#f8fbff_0%,#eefbf7_48%,#fff4e8_100%)] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.12),transparent_24%)]" />
        <div className="relative">
          <p className="label text-teal-800/80">Admin Broadcast Desk</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-slate-900">
            Send one clean update to the right academic audience.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Choose the audience first, then write the message. Recipients will see it in their notification bell with an unread count.
          </p>
        </div>
      </section>

      <form onSubmit={sendNotification} className="card p-5 lg:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <label>
            <span className="label">Audience</span>
            <select
              className="select-field mt-2"
              value={form.audience}
              onChange={(event) => setField("audience", event.target.value)}
            >
              {audienceOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {needsTarget ? (
            <label>
              <span className="label">Target</span>
              <select
                className="select-field mt-2"
                value={form.targetId}
                onChange={(event) => setField("targetId", event.target.value)}
              >
                <option value="">Select target</option>
                {targetOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label>
            <span className="label">Priority</span>
            <select
              className="select-field mt-2"
              value={form.type}
              onChange={(event) => setField("type", event.target.value)}
            >
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="URGENT">Urgent</option>
              <option value="SYSTEM">General</option>
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <label>
            <span className="label">Title</span>
            <input
              className="input-field mt-2"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="Exam schedule, fee reminder, staff meeting..."
            />
          </label>
          <label>
            <span className="label">Message</span>
            <textarea
              className="input-field mt-2 min-h-32"
              value={form.message}
              onChange={(event) => setField("message", event.target.value)}
              placeholder="Write the notification message."
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-600">
            {result || "Teacher and student recipients will get this in their bell notification panel."}
          </p>
          <button type="submit" disabled={sending} className="btn btn-primary min-w-44 disabled:opacity-60">
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </form>
    </Layout>
  );
}
