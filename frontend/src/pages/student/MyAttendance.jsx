import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";

export default function MyAttendance() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axiosInstance.get("/student/attendance").then((res) => setData(res.data.data));
  }, []);

  return (
    <Layout>
      <PageTitle title="My Attendance" subtitle="View your attendance history with a cleaner student progress view." />
      <section className="hero-panel mb-6 bg-[linear-gradient(135deg,#f8fbff_0%,#e5eeff_45%,#eefbf6_100%)] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(68,99,179,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.1),transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="label text-sky-800/80">Attendance Overview</p>
            <h3 className="mt-3 text-3xl font-semibold text-slate-900">Track your class presence with clarity.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review your date-wise attendance records and keep an eye on your academic consistency throughout the term.
            </p>
          </div>
          <div className="metric-card">
            <p className="label">Attendance Entries</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{data.length}</p>
          </div>
        </div>
      </section>
      <Table
        columns={[
          { key: "date", title: "Date", render: (a) => a.date },
          { key: "status", title: "Status", render: (a) => a.status },
        ]}
        data={data}
      />
    </Layout>
  );
}
