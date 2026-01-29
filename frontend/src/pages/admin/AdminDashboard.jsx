import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axiosInstance.get("/admin/dashboard").then((res) => setStats(res.data.data));
  }, []);

  const Card = ({ title, value }) => (
    <div className="card p-6">
      <p className="text-slate-500 text-sm">{title}</p>
      <h2 className="text-3xl font-bold mt-2 text-slate-900">{value}</h2>
    </div>
  );

  return (
    <Layout>
      <PageTitle title="Admin Dashboard" subtitle="Overview of school data" />

      <div className="grid md:grid-cols-3 gap-6">
        <Card title="Total Teachers" value={stats?.totalTeachers ?? 0} />
        <Card title="Total Students" value={stats?.totalStudents ?? 0} />
        <Card title="Total Classes" value={stats?.totalClasses ?? 0} />
      </div>
    </Layout>
  );
}
