import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";



export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    classId: "",
    rollNo: "",
    phone: "",
    address: "",
  });

  const fetchData = async () => {
    const s = await axiosInstance.get("/admin/students");
    const c = await axiosInstance.get("/admin/classes");
    setStudents(s.data.data);
    setClasses(c.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createStudent = async () => {
    try {
      await axiosInstance.post("/admin/student", form);
      setForm({ name: "", email: "", password: "", classId: "", rollNo: "", phone: "", address: "" });
      fetchData();
      alert("Student Added ✅");
    } catch (err) {
      console.log("CREATE STUDENT ERROR:", err?.response?.data);
      alert(err?.response?.data?.message || "Failed to create student");
    }
  };


  return (
    <Layout>
      <PageTitle title="Students" subtitle="Add & manage students" />

      <div className="bg-white border rounded-2xl p-6 shadow mb-6">
        <h3 className="font-bold mb-4">Add Student</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <div>
            <label className="text-sm text-gray-600">Class</label>
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              className="w-full border rounded-xl p-3 mt-1"
            >
              <option value="">Select class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <Input label="Roll No" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <div className="mt-4">
          <Button onClick={createStudent}>Add Student</Button>
        </div>
      </div>

      <Table
        columns={[
          { key: "name", title: "Name", render: (s) => s?.user?.name },
          { key: "email", title: "Email", render: (s) => s?.user?.email },
          { key: "rollNo", title: "Roll No", render: (s) => s?.rollNo || "-" },
          { key: "class", title: "Class", render: (s) => s?.classId?.name || "-" },

          {
            key: "actions",
            title: "Actions",
            render: (s) => (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await axiosInstance.post(`/admin/resend/${s.user._id}`);
                    alert("Credentials resent ✅");
                  } catch (err) {
                    alert(err?.response?.data?.message || "Resend failed");
                  }
                }}
              >
                Resend Mail
              </Button>
            ),
          },
        ]}
        data={students}
      />
    </Layout>
  );
}
