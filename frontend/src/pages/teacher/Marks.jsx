import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import Input from "../../components/Input";
import axiosInstance from "../../api/axiosInstance";
import { isPositiveNumber } from "../../utils/formValidation";

export default function Marks() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState("Math");
  const [maxMarks, setMaxMarks] = useState(100);
  const [marksMap, setMarksMap] = useState({});

  useEffect(() => {
    axiosInstance.get("/teacher/classes").then((res) => setClasses(res.data.data));
  }, []);

  useEffect(() => {
    if (!classId) return;
    axiosInstance.get(`/teacher/class/${classId}/students`).then((res) => {
      setStudents(res.data.data);
      const init = {};
      res.data.data.forEach((s) => (init[s._id] = 0));
      setMarksMap(init);
    });
  }, [classId]);

  const uploadMarks = async () => {
    if (!classId) {
      alert("Select a class first");
      return;
    }
    if (!subject.trim()) {
      alert("Subject is required");
      return;
    }
    if (!isPositiveNumber(maxMarks)) {
      alert("Max marks must be a positive number");
      return;
    }
    const invalidMarks = Object.values(marksMap).some((value) => {
      const mark = Number(value);
      return !Number.isFinite(mark) || mark < 0 || mark > Number(maxMarks);
    });
    if (invalidMarks) {
      alert("Each student's marks must be between 0 and max marks");
      return;
    }

    const marksList = Object.keys(marksMap).map((studentId) => ({
      studentId,
      marks: Number(marksMap[studentId]),
    }));

    await axiosInstance.post("/teacher/marks", {
      classId,
      subject,
      maxMarks,
      marksList,
    });

    alert("Marks Uploaded ✅");
  };

  return (
    <Layout>
      <PageTitle title="Upload Marks" subtitle="Upload subject-wise marks with a faculty-first evaluation workflow." />

      <section className="hero-panel mb-6 bg-[linear-gradient(135deg,#f7fbff_0%,#e1ecff_42%,#fff2e7_100%)] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(68,99,179,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.12),transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="label text-sky-800/80">Assessment Upload</p>
            <h3 className="mt-3 text-3xl font-semibold text-slate-900">Publish marks cleanly across assigned classes and subjects.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Choose a class, set the subject and full marks, then enter student scores in one focused evaluation panel.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <p className="label">Assigned Groups</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{classes.length}</p>
            </div>
            <div className="metric-card">
              <p className="label">Loaded Learners</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{students.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="card p-6 mb-6 grid md:grid-cols-4 gap-4">
        <div>
          <label className="label">Class</label>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="select-field mt-1">
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <Input label="Max Marks" type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} required />

        <div className="flex items-end">
          <Button onClick={uploadMarks} className="w-full">Upload</Button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Marks</h3>

        {students.map((s) => (
          <div key={s._id} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
            <div>
              <p className="font-semibold text-slate-900">{s?.user?.name}</p>
              <p className="text-sm text-slate-500">{s?.rollNo || ""}</p>
            </div>

            <input
              type="number"
              min="0"
              max={maxMarks}
              className="input-field w-28"
              value={marksMap[s._id] ?? 0}
              onChange={(e) => setMarksMap({ ...marksMap, [s._id]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </Layout>
  );
}
