import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import axiosInstance from "../../api/axiosInstance";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/student/me").then((res) => setProfile(res.data.data));
    axiosInstance.get("/student/attendance").then((res) => setAttendance(res.data.data));
    axiosInstance.get("/student/marks").then((res) => setMarks(res.data.data));
    axiosInstance.get("/student/notices").then((res) => setNotices(res.data.data));
  }, []);

  const presentCount = attendance.filter((item) => item.status === "PRESENT").length;

  return (
    <Layout>
      <PageTitle
        title="Student Dashboard"
        subtitle="Track attendance, subject marks, notices, and connect with your faculty."
      />

      <section className="hero-panel bg-[linear-gradient(135deg,#163d73_0%,#4562b2_58%,#d67a58_100%)] px-6 py-8 text-white lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_24%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-200/70">Learner Dashboard</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight">
              See your progress clearly and reach your faculty whenever you need help.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80">
              Students can only view their attendance and marks, receive notices, and message faculty for academic doubts.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => navigate("/student/attendance")}>View Attendance</Button>
              <Button variant="outline" onClick={() => navigate("/student/marks")}>View Marks</Button>
              <Button variant="outline" onClick={() => navigate("/student/notices")}>Open Notices</Button>
              <Button variant="outline" onClick={() => navigate("/student/chat")}>Message Faculty</Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80"
              alt="Student activity"
              className="float-card h-52 w-full rounded-[26px] object-cover shadow-xl"
            />
            <img
              src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80"
              alt="Learning"
              className="float-card h-52 w-full rounded-[26px] object-cover shadow-xl [animation-delay:1.2s]"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-4">
        <div className="metric-card">
          <p className="text-sm text-slate-500">Academic Group</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{profile?.classId?.name || "-"}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-slate-500">Roll No</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{profile?.rollNo || "-"}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-slate-500">Attendance Present</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{presentCount}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-slate-500">Notices</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{notices.length}</p>
        </div>
      </section>
    </Layout>
  );
}
