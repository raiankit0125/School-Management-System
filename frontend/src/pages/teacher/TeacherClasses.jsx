import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    axiosInstance.get("/teacher/classes").then((res) => setClasses(res.data.data));
  }, []);

  return (
    <Layout>
      <PageTitle title="My Classes" subtitle="Review the academic groups assigned to your faculty profile." />
      <section className="hero-panel mb-6 bg-[linear-gradient(135deg,#f7fffb_0%,#e4f7ef_48%,#e9efff_100%)] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(68,99,179,0.1),transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="label text-teal-800/80">Assigned Groups</p>
            <h3 className="mt-3 text-3xl font-semibold text-slate-900">Your active teaching groups are organized here.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Use this view to confirm which groups are assigned to your account before marking attendance, uploading marks, or sending notices.
            </p>
          </div>
          <div className="metric-card">
            <p className="label">Total Groups</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{classes.length}</p>
          </div>
        </div>
      </section>
      <Table
        columns={[
          { key: "name", title: "Class Name", render: (c) => c.name },
          { key: "id", title: "Class ID", render: (c) => c._id },
        ]}
        data={classes}
      />
    </Layout>
  );
}
