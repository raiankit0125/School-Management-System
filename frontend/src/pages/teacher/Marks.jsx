import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import Input from "../../components/Input";
import axiosInstance from "../../api/axiosInstance";

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
      <PageTitle title="Upload Marks" subtitle="Select class & upload marks" />

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

        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Input label="Max Marks" type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} />

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
