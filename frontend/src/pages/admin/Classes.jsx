import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const fetchData = async () => {
    const c = await axiosInstance.get("/admin/classes");
    const t = await axiosInstance.get("/admin/teachers");
    setClasses(c.data.data);
    setTeachers(t.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createClass = async () => {
    await axiosInstance.post("/admin/class", { name, teacherId });
    setName("");
    setTeacherId("");
    fetchData();
    alert("Class Created ✅");
  };

  return (
    <Layout>
      <PageTitle title="Classes" subtitle="Create classes & assign teacher" />

      <div className="bg-white border rounded-2xl p-6 shadow mb-6">
        <h3 className="font-bold mb-4">Create Class</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Class Name (e.g. 10-A)" value={name} onChange={(e) => setName(e.target.value)} />

          <div>
            <label className="text-sm text-gray-600">Assign Teacher</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full border rounded-xl p-3 mt-1"
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t?.user?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={createClass}>Create Class</Button>
        </div>
      </div>

      <Table
        columns={[
          { key: "name", title: "Class Name", render: (c) => c.name },
          { key: "teacher", title: "Teacher", render: (c) => c?.teacher?.user?.name || "Not assigned" },
        ]}
        data={classes}
      />
    </Layout>
  );
}
