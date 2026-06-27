import { useCallback, useEffect, useState } from "react";
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
  const [threshold, setThreshold] = useState(75);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axiosInstance.get("/teacher/classes").then((res) => setClasses(res.data.data));
  }, []);

  const fetchSummary = useCallback(async (selectedClassId = classId) => {
    if (!selectedClassId) return;
    const res = await axiosInstance.get(`/teacher/attendance-summary/${selectedClassId}?threshold=${threshold}`);
    setSummary(res.data.data);
  }, [classId, threshold]);

  useEffect(() => {
    if (!classId) return;
    axiosInstance.get(`/teacher/class/${classId}/students`).then((res) => {
      setStudents(res.data.data);
      const initial = {};
      res.data.data.forEach((s) => (initial[s._id] = "PRESENT"));
      setStatusMap(initial);
    });
    Promise.resolve().then(() => fetchSummary(classId));
  }, [classId, fetchSummary]);

  const saveAttendance = async () => {
    if (!classId) {
      alert("Select a class first");
      return;
    }
    if (!date) {
      alert("Attendance date is required");
      return;
    }

    const records = Object.keys(statusMap).map((studentId) => ({
      studentId,
      status: statusMap[studentId],
    }));

    await axiosInstance.post("/teacher/attendance", { classId, date, records });
    await fetchSummary();
    alert("Attendance saved");
  };

  const sendLowAttendanceAlerts = async () => {
    if (!classId) {
      alert("Select a class first");
      return;
    }
    const res = await axiosInstance.post(`/teacher/attendance-summary/${classId}/notify`, { threshold });
    await fetchSummary();
    alert(`${res.data.data.sentCount} low attendance alert(s) sent`);
  };

  const lowAttendance = summary?.lowAttendance || [];

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

      <section className="card mb-6 p-5 lg:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px] lg:items-end">
          <div>
            <p className="label">Attendance Percentage</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {summary ? `${summary.className} summary` : "Select a class to view percentage"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Set the required percentage and send alerts to students currently below that limit.
            </p>
          </div>
          <div>
            <label className="label">Required %</label>
            <input
              type="number"
              min="1"
              max="100"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              onBlur={() => fetchSummary()}
              className="input-field mt-1"
            />
          </div>
          <Button onClick={sendLowAttendanceAlerts} disabled={!classId} className="w-full">
            Send Low Alerts
          </Button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="metric-card">
            <p className="label">Marked Days</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{summary?.totalMarkedDays || 0}</p>
          </div>
          <div className="metric-card">
            <p className="label">Below Required</p>
            <p className="mt-2 text-3xl font-semibold text-rose-600">{lowAttendance.length}</p>
          </div>
          <div className="metric-card">
            <p className="label">Required Limit</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{threshold || 0}%</p>
          </div>
        </div>

        {summary?.students?.length ? (
          <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200 bg-white/80">
            <table className="min-w-full text-left">
              <thead className="table-head">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Roll</th>
                  <th className="p-3">Present</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {summary.students.map((student) => {
                  const below = student.percentage < Number(threshold || 0);
                  return (
                    <tr key={student.studentId} className="border-t border-slate-100">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {student.profileImage ? (
                            <img src={student.profileImage} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-100" />
                          )}
                          <span className="font-semibold text-slate-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600">{student.rollNo || "-"}</td>
                      <td className="p-3 text-sm text-slate-600">{student.present}</td>
                      <td className="p-3 text-sm text-slate-600">{student.totalMarkedDays}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${below ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {student.percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

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
