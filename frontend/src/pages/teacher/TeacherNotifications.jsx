import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import axiosInstance from "../../api/axiosInstance";

const categories = [
  { value: "ACADEMIC", label: "Academic Update" },
  { value: "ASSIGNMENT", label: "Assignment Submission" },
  { value: "SCHEDULE", label: "Schedule Change" },
  { value: "EXAM", label: "Exam / Test" },
  { value: "REMINDER", label: "Reminder" },
];

export default function TeacherNotifications() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    classId: "",
    studentId: "",
    category: "ACADEMIC",
    title: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/teacher/classes")
      .then((res) => setClasses(res.data.data || []))
      .catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    if (!form.classId) {
      setStudents([]);
      return;
    }

    axiosInstance
      .get(`/teacher/class/${form.classId}/students`)
      .then((res) => setStudents(res.data.data || []))
      .catch(() => setStudents([]));
  }, [form.classId]);

  const selectedClass = useMemo(
    () => classes.find((item) => item._id === form.classId),
    [classes, form.classId]
  );

  const setField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "classId" ? { studentId: "" } : {}),
    }));
    setResult("");
  };

  const sendNotification = async (event) => {
    event.preventDefault();
    if (!form.classId || !form.title.trim() || !form.message.trim()) return;

    setSending(true);
    try {
      const res = await axiosInstance.post("/teacher/notifications", form);
      setResult(`Sent to ${res.data.data?.sentCount || 0} student(s).`);
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
        subtitle="Notify your assigned class or selected learners about assignments, schedules, exams, and reminders."
      />

      <section className="hero-panel mb-6 bg-[linear-gradient(135deg,#f7fffb_0%,#e6f4ff_48%,#fff4e8_100%)] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.12),transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="label text-teal-800/80">Faculty Notification Desk</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-slate-900">
              Send focused updates to your students without leaving the faculty workspace.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Choose an assigned class, optionally pick one student, and send a clear update to their notification bell.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <p className="label">Assigned Groups</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{classes.length}</p>
            </div>
            <div className="metric-card">
              <p className="label">Selected Class</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{selectedClass?.name || "-"}</p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={sendNotification} className="card p-5 lg:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <label>
            <span className="label">Class</span>
            <select
              className="select-field mt-2"
              value={form.classId}
              onChange={(event) => setField("classId", event.target.value)}
            >
              <option value="">Select class</option>
              {classes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="label">Student</span>
            <select
              className="select-field mt-2"
              value={form.studentId}
              onChange={(event) => setField("studentId", event.target.value)}
              disabled={!form.classId}
            >
              <option value="">Whole class</option>
              {students.map((item) => (
                <option key={item._id} value={item._id}>
                  {item?.user?.name || "Student"}{item.rollNo ? ` / ${item.rollNo}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="label">Type</span>
            <select
              className="select-field mt-2"
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
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
              placeholder="Assignment due, practical schedule, class test..."
            />
          </label>
          <label>
            <span className="label">Message</span>
            <textarea
              className="input-field mt-2 min-h-32"
              value={form.message}
              onChange={(event) => setField("message", event.target.value)}
              placeholder="Write the notification message for students."
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-600">
            {result || "Students will see this in their bell notification panel."}
          </p>
          <button type="submit" disabled={sending} className="btn btn-primary min-w-44 disabled:opacity-60">
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </form>
    </Layout>
  );
}
