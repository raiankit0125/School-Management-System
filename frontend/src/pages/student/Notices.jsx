import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import axiosInstance from "../../api/axiosInstance";

export default function StudentNotices() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    axiosInstance.get("/student/notices").then((res) => setNotices(res.data.data));
  }, []);

  return (
    <Layout>
      <PageTitle
        title="My Notices"
        subtitle="Important individual notices shared by your faculty."
      />

      <section className="hero-panel mb-6 bg-[linear-gradient(135deg,#f8fbff_0%,#e7efff_48%,#fff4eb_100%)] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(68,99,179,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.12),transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="label text-sky-800/80">Faculty Notices</p>
            <h3 className="mt-3 text-3xl font-semibold text-slate-900">Review individual messages and academic updates quickly.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Faculty-shared notices stay organized here so you can revisit instructions, reminders, and personal academic guidance.
            </p>
          </div>
          <div className="metric-card">
            <p className="label">Notice Count</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{notices.length}</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="card p-6 text-sm text-slate-500">No notices available.</div>
        ) : (
          notices.map((notice) => (
            <div key={notice._id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{notice.title}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    From {notice?.teacherId?.user?.name || "Faculty"}
                  </p>
                </div>
                <p className="text-xs text-slate-500">{new Date(notice.createdAt).toLocaleString()}</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">{notice.message}</p>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
