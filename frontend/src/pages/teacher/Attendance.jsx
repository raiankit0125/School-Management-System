import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import axiosInstance from "../../api/axiosInstance";

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    axiosInstance.get("/teacher/classes").then((res) => setClasses(res.data.data));
  }, []);

  useEffect(() => {
    if (!classId) return;
    axiosInstance.get(`/teacher/class/${classId}/students`).then((res) => {
      setStudents(res.data.data);
      const initial = {};
      res.data.data.forEach((s) => (initial[s._id] = "PRESENT"));
      setStatusMap(initial);
    });
  }, [classId]);

  const saveAttendance = async () => {
    const records = Object.keys(statusMap).map((studentId) => ({
      studentId,
      status: statusMap[studentId],
    }));

    await axiosInstance.post("/teacher/attendance", { classId, date, records });
    alert("Attendance Saved ✅");
  };

  return (
    <Layout>
      <PageTitle title="Mark Attendance" subtitle="Handle daily attendance with class-wise control and a cleaner faculty workflow." />

      <section className="hero-panel mb-6 bg-[linear-gradient(135deg,#f7fffb_0%,#e1f8f0_44%,#e5edff_100%)] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,76,129,0.1),transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="label text-teal-800/80">Attendance Workflow</p>
            <h3 className="mt-3 text-3xl font-semibold text-slate-900">Record attendance class-wise with fast daily updates.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Select an assigned class, mark present or absent, and save one clean attendance sheet for the day.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <p className="label">Assigned Groups</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{classes.length}</p>
            </div>
            <div className="metric-card">
              <p className="label">Loaded Learners</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{students.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="card p-6 mb-6 grid md:grid-cols-3 gap-4">
        <div>
          <label className="label">Class</label>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="select-field mt-1">
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field mt-1" />
        </div>

        <div className="flex items-end">
          <Button onClick={saveAttendance} className="w-full">Save Attendance</Button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Students</h3>

        {students.map((s) => (
          <div key={s._id} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
            <div>
              <p className="font-semibold text-slate-900">{s?.user?.name}</p>
              <p className="text-sm text-slate-500">{s?.rollNo || ""}</p>
            </div>

            <select
              value={statusMap[s._id] || "PRESENT"}
              onChange={(e) => setStatusMap({ ...statusMap, [s._id]: e.target.value })}
              className="select-field max-w-[160px]"
            >
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>
        ))}
      </div>
    </Layout>
  );
}
