import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import axiosInstance from "../../api/axiosInstance";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import DashboardEvents from "../../components/DashboardEvents";
import ProfilePhotoManager from "../../components/ProfilePhotoManager";

export default function TeacherDashboard() {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(null);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/teacher/me").then((res) => setProfile(res.data.data));
    axiosInstance.get("/teacher/attendance-status").then((res) => setStatus(res.data.data));
    axiosInstance.get("/teacher/classes").then((res) => setClasses(res.data.data));
  }, []);

  return (
    <Layout>
      <PageTitle
        title="Faculty Dashboard"
        subtitle="Manage attendance, subject-wise marks, student notices, and communication."
      />

      <section className="hero-panel bg-[linear-gradient(135deg,#f7fffb_0%,#dff7f0_38%,#dbe8ff_100%)] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(15,76,129,0.12),transparent_28%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-teal-800/70">Faculty Workspace</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">
              Work class-wise, upload subject marks, manage attendance, and respond to student queries.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Once admin registers and assigns academic groups, faculty can log in, reset password, and handle operational teaching tasks.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => navigate("/teacher/attendance")}>Open Attendance</Button>
              <Button variant="outline" onClick={() => navigate("/teacher/marks")}>Open Marks</Button>
              <Button variant="outline" onClick={() => navigate("/teacher/notices")}>Send Notice</Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <img
              src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80"
              alt="Faculty workspace"
              className="float-card h-52 w-full rounded-[26px] object-cover shadow-xl"
            />
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
              alt="Teaching operations"
              className="float-card h-52 w-full rounded-[26px] object-cover shadow-xl [animation-delay:1s]"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-4">
        <ProfilePhotoManager
          profile={profile}
          onUpdated={(user) => setProfile((current) => ({ ...(current || {}), user }))}
        />
        <div className="metric-card">
          <p className="text-sm text-slate-500">Faculty Name</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{profile?.user?.name || "-"}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-slate-500">Primary Subject</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{profile?.subject || "-"}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-slate-500">Assigned Groups</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{classes.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-slate-500">Attendance Today</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {status?.attendanceMarked ? "Completed" : "Pending"}
          </p>
        </div>
      </section>

      <DashboardEvents />
    </Layout>
  );
}
