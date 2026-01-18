import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
    phone: "",
  });

  const fetchTeachers = async () => {
    const res = await axiosInstance.get("/admin/teachers");
    setTeachers(res.data.data);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const createTeacher = async () => {
    await axiosInstance.post("/admin/teacher", form);
    setForm({ name: "", email: "", password: "", subject: "", phone: "" });
    fetchTeachers();
    alert("Teacher Added ✅");
  };

  return (
    <Layout>
      <PageTitle title="Teachers" subtitle="Add & manage teachers" />

      <div className="bg-white border rounded-2xl p-6 shadow mb-6">
        <h3 className="font-bold mb-4">Add Teacher</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <div className="mt-4">
          <Button onClick={createTeacher}>Add Teacher</Button>
        </div>
      </div>

      <Table
        columns={[
          { key: "name", title: "Name", render: (t) => t?.user?.name },
          { key: "email", title: "Email", render: (t) => t?.user?.email },
          { key: "subject", title: "Subject", render: (t) => t?.subject || "-" },
          { key: "phone", title: "Phone", render: (t) => t?.phone || "-" },
        ]}
        data={teachers}
      />
    </Layout>
  );
}
