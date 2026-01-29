import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

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

  const startEdit = (t) => {
    setEditingId(t._id);
    setForm({
      name: t?.user?.name || "",
      email: t?.user?.email || "",
      password: "",
      subject: t?.subject || "",
      phone: t?.phone || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", email: "", password: "", subject: "", phone: "" });
  };

  const updateTeacher = async () => {
    await axiosInstance.put(`/admin/teacher/${editingId}`, {
      name: form.name,
      email: form.email,
      subject: form.subject,
      phone: form.phone,
    });
    setEditingId(null);
    setForm({ name: "", email: "", password: "", subject: "", phone: "" });
    fetchTeachers();
    alert("Teacher Updated ✅");
  };

  const deleteTeacher = async (teacherId) => {
    const ok = window.confirm("Delete this teacher? This will remove their account and records.");
    if (!ok) return;
    await axiosInstance.delete(`/admin/teacher/${teacherId}`);
    fetchTeachers();
    alert("Teacher Deleted ✅");
  };

  const filteredTeachers = teachers.filter((t) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const name = t?.user?.name?.toLowerCase() || "";
    const email = t?.user?.email?.toLowerCase() || "";
    const subject = t?.subject?.toLowerCase() || "";
    const phone = t?.phone?.toLowerCase() || "";
    return name.includes(q) || email.includes(q) || subject.includes(q) || phone.includes(q);
  });

  return (
    <Layout>
      <PageTitle title="Teachers" subtitle="Add & manage teachers" />

      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {editingId ? "Edit Teacher" : "Add Teacher"}
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {!editingId ? (
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          ) : null}
          <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <div className="mt-4">
          {editingId ? (
            <div className="flex gap-2">
              <Button onClick={updateTeacher}>Save Changes</Button>
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
            </div>
          ) : (
            <Button onClick={createTeacher}>Add Teacher</Button>
          )}
        </div>
      </div>

      <div className="card p-4 mb-4">
        <Input
          label="Search"
          placeholder="Search by name, email, subject, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        columns={[
          { key: "name", title: "Name", render: (t) => t?.user?.name },
          { key: "email", title: "Email", render: (t) => t?.user?.email },
          { key: "subject", title: "Subject", render: (t) => t?.subject || "-" },
          { key: "phone", title: "Phone", render: (t) => t?.phone || "-" },
          {
            key: "actions",
            title: "Actions",
            render: (t) => (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => startEdit(t)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await axiosInstance.post(`/admin/resend/${t.user._id}`);
                      alert("Credentials resent ✅");
                    } catch (err) {
                      alert(err?.response?.data?.message || "Resend failed");
                    }
                  }}
                >
                  Resend Mail
                </Button>
                <Button variant="danger" onClick={() => deleteTeacher(t._id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        data={filteredTeachers}
      />
    </Layout>
  );
}
