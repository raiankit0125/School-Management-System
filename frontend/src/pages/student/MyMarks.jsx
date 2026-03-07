import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";

export default function MyMarks() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axiosInstance.get("/student/marks").then((res) => setData(res.data.data));
  }, []);

  return (
    <Layout>
      <PageTitle title="My Marks" subtitle="See subject-wise marks and uploaded results in a clearer academic report view." />
      <section className="hero-panel mb-6 bg-[linear-gradient(135deg,#fff8ef_0%,#e8efff_46%,#eefbf7_100%)] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,119,87,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(68,99,179,0.12),transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="label text-sky-800/80">Marks Overview</p>
            <h3 className="mt-3 text-3xl font-semibold text-slate-900">Follow your subject performance in one place.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              View uploaded marks, compare scores against total marks, and keep your academic progress easy to understand.
            </p>
          </div>
          <div className="metric-card">
            <p className="label">Uploaded Results</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{data.length}</p>
          </div>
        </div>
      </section>
      <Table
        columns={[
          { key: "subject", title: "Subject", render: (m) => m.subject },
          { key: "marks", title: "Marks", render: (m) => `${m.marks} / ${m.maxMarks}` },
          { key: "date", title: "Uploaded", render: (m) => new Date(m.createdAt).toLocaleString() },
        ]}
        data={data}
      />
    </Layout>
  );
}
