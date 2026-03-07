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
