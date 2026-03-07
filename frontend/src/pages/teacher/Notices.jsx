import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import Input from "../../components/Input";
import axiosInstance from "../../api/axiosInstance";

export default function Notices() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notices, setNotices] = useState([]);

  const fetchNotices = async () => {
    const res = await axiosInstance.get("/teacher/notices");
    setNotices(res.data.data);
  };

  useEffect(() => {
    axiosInstance.get("/teacher/classes").then((res) => setClasses(res.data.data));
    fetchNotices();
  }, []);

  useEffect(() => {
    if (!classId) {
      setStudents([]);
      return;
    }

    axiosInstance.get(`/teacher/class/${classId}/students`).then((res) => setStudents(res.data.data));
  }, [classId]);

  const sendNotice = async () => {
    await axiosInstance.post("/teacher/notices", { studentId, title, message });
    setTitle("");
    setMessage("");
    fetchNotices();
    alert("Notice sent");
  };

  return (
    <Layout>
      <PageTitle
        title="Student Notices"
        subtitle="Send individual academic or administrative notices to assigned learners."
      />

      <section className="card p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Academic Group</label>
            <select className="select-field mt-1" value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">Select group</option>
              {classes.map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Student</label>
            <select className="select-field mt-1" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Select student</option>
              {students.map((item) => (
                <option key={item._id} value={item._id}>{item?.user?.name}</option>
              ))}
            </select>
          </div>
          <Input label="Notice Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="mt-4">
          <label className="label">Message</label>
          <textarea
            className="input-field mt-1 min-h-28"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write an individual notice"
          />
        </div>

        <div className="mt-4">
          <Button onClick={sendNotice}>Send Notice</Button>
        </div>
      </section>

      <section className="card mt-6 p-6">
        <h3 className="text-lg font-semibold text-slate-900">Recent Notices</h3>
        <div className="mt-4 space-y-3">
          {notices.length === 0 ? (
            <p className="text-sm text-slate-500">No notices sent yet.</p>
          ) : (
            notices.map((notice) => (
              <div key={notice._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{notice.title}</p>
                    <p className="text-xs text-slate-500">
                      {notice?.studentId?.user?.name} | {notice?.studentId?.classId?.name || "-"}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(notice.createdAt).toLocaleString()}</p>
                </div>
                <p className="mt-3 text-sm text-slate-700">{notice.message}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  );
}
