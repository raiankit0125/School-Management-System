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
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

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

  const startEdit = (s) => {
    setEditingId(s._id);
    setForm({
      name: s?.user?.name || "",
      email: s?.user?.email || "",
      password: "",
      classId: s?.classId?._id || "",
      rollNo: s?.rollNo || "",
      phone: s?.phone || "",
      address: s?.address || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", email: "", password: "", classId: "", rollNo: "", phone: "", address: "" });
  };

  const updateStudent = async () => {
    try {
      await axiosInstance.put(`/admin/student/${editingId}`, {
        name: form.name,
        email: form.email,
        classId: form.classId,
        rollNo: form.rollNo,
        phone: form.phone,
        address: form.address,
      });
      setEditingId(null);
      setForm({ name: "", email: "", password: "", classId: "", rollNo: "", phone: "", address: "" });
      fetchData();
      alert("Student Updated ✅");
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  const deleteStudent = async (studentId) => {
    const ok = window.confirm("Delete this student? This will remove their account and records.");
    if (!ok) return;
    await axiosInstance.delete(`/admin/student/${studentId}`);
    fetchData();
    alert("Student Deleted ✅");
  };

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const name = s?.user?.name?.toLowerCase() || "";
    const email = s?.user?.email?.toLowerCase() || "";
    const rollNo = s?.rollNo?.toLowerCase() || "";
    const phone = s?.phone?.toLowerCase() || "";
    const address = s?.address?.toLowerCase() || "";
    const className = s?.classId?.name?.toLowerCase() || "";
    return (
      name.includes(q) ||
      email.includes(q) ||
      rollNo.includes(q) ||
      phone.includes(q) ||
      address.includes(q) ||
      className.includes(q)
    );
  });


  return (
    <Layout>
      <PageTitle title="Students" subtitle="Add & manage students" />

      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {editingId ? "Edit Student" : "Add Student"}
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {!editingId ? (
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          ) : null}

          <div>
            <label className="label">Class</label>
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              className="select-field mt-1"
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
          {editingId ? (
            <div className="flex gap-2">
              <Button onClick={updateStudent}>Save Changes</Button>
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
            </div>
          ) : (
            <Button onClick={createStudent}>Add Student</Button>
          )}
        </div>
      </div>

      <div className="card p-4 mb-4">
        <Input
          label="Search"
          placeholder="Search by name, email, class, roll no, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
              <div className="flex gap-2">
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
                <Button variant="outline" onClick={() => startEdit(s)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => deleteStudent(s._id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        data={filteredStudents}
      />
    </Layout>
  );
}
