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
      <div className="bg-white border rounded-2xl p-6 shadow">
        <pre className="text-sm">{JSON.stringify(profile, null, 2)}</pre>
      </div>
    </Layout>
  );
}
