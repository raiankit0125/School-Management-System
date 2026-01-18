import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import axiosInstance from "../../api/axiosInstance";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/teacher/me").then((res) => setProfile(res.data.data));
    axiosInstance
      .get("/teacher/attendance-status")
      .then((res) => setStatus(res.data.data));
  }, []);

  const StatCard = ({ title, value }) => (
    <div className="bg-white border rounded-2xl p-6 shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-bold mt-2">{value}</h2>
    </div>
  );

  return (
    <Layout>
      <PageTitle title="Teacher Dashboard" subtitle="Quick overview & actions" />

      {/* Top Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <StatCard title="Teacher Name" value={profile?.user?.name || "-"} />
        <StatCard title="Email" value={profile?.user?.email || "-"} />
        <StatCard title="Subject" value={profile?.subject || "-"} />
      </div>

      {/* Attendance Status + Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-2">Today Attendance Status</h3>
          <p className="text-gray-500 text-sm mb-4">
            Date: <b>{status?.today || "-"}</b>
          </p>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-xl font-semibold ${
                status?.attendanceMarked
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {status?.attendanceMarked ? "Marked ✅" : "Not Marked ❌"}
            </span>

            <span className="text-gray-600 text-sm">
              Classes: <b>{status?.totalClasses ?? 0}</b>
            </span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
          <p className="text-gray-500 text-sm mb-4">
            सीधे attendance / marks page खोलो
          </p>

          <div className="flex gap-3">
            <Button onClick={() => navigate("/teacher/attendance")}>
              Mark Attendance
            </Button>

            <Button variant="outline" onClick={() => navigate("/teacher/marks")}>
              Upload Marks
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white border rounded-2xl p-6 shadow">
        <h3 className="text-lg font-bold mb-4">Profile Details</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-semibold">{profile?.phone || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-semibold">{profile?.user?.role || "-"}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
