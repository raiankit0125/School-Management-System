import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import axiosInstance from "../../api/axiosInstance";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axiosInstance.get("/student/me").then((res) => setProfile(res.data.data));
  }, []);

  return (
    <Layout>
      <PageTitle title="Student Dashboard" subtitle="Profile overview" />
      <div className="card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Name</p>
            <p className="text-lg font-semibold text-slate-900">{profile?.user?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="text-lg font-semibold text-slate-900">{profile?.user?.email || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Class</p>
            <p className="text-lg font-semibold text-slate-900">{profile?.classId?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Roll No</p>
            <p className="text-lg font-semibold text-slate-900">{profile?.rollNo || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Phone</p>
            <p className="text-lg font-semibold text-slate-900">{profile?.phone || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Address</p>
            <p className="text-lg font-semibold text-slate-900">{profile?.address || "-"}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
