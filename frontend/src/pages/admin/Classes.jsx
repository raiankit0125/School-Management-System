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
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const fetchData = async () => {
    const c = await axiosInstance.get("/admin/classes");
    const t = await axiosInstance.get("/admin/teachers");
    setClasses(c.data.data);
    setTeachers(t.data.data);
  };

  useEffect(() => {
    Promise.resolve().then(fetchData);
  }, []);

  const createClass = async () => {
    if (!name.trim()) {
      alert("Class name is required");
      return;
    }
    await axiosInstance.post("/admin/class", { name, teacherId });
    setName("");
    setTeacherId("");
    fetchData();
    alert("Class Created ✅");
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setName(c?.name || "");
    setTeacherId(c?.teacher?._id || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setTeacherId("");
  };

  const updateClass = async () => {
    if (!name.trim()) {
      alert("Class name is required");
      return;
    }
    await axiosInstance.put(`/admin/class/${editingId}`, { name, teacherId });
    setEditingId(null);
    setName("");
    setTeacherId("");
    fetchData();
    alert("Class Updated ✅");
  };

  const deleteClass = async (classId) => {
    const ok = window.confirm("Delete this class? This will clear students and remove marks/attendance.");
    if (!ok) return;
    await axiosInstance.delete(`/admin/class/${classId}`);
    fetchData();
    alert("Class Deleted ✅");
  };

  const filteredClasses = classes.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const name = c?.name?.toLowerCase() || "";
    const teacherName = c?.teacher?.user?.name?.toLowerCase() || "";
    return name.includes(q) || teacherName.includes(q);
  });

  return (
    <Layout>
      <PageTitle title="Classes" subtitle="Create academic groups, assign faculty, and keep class ownership clear." />

      <section className="hero-panel mb-6 bg-[linear-gradient(135deg,#fff7e9_0%,#e6f3ff_48%,#def6ef_100%)] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,76,129,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.1),transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="label text-sky-800/80">Academic Mapping</p>
            <h3 className="mt-3 text-3xl font-semibold text-slate-900">Keep faculty allocation and academic groups structured.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Admin defines class groups, maps faculty ownership, and keeps assignments searchable and editable from one place.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <p className="label">Total Groups</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{classes.length}</p>
            </div>
            <div className="metric-card">
              <p className="label">Assigned Faculty</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{classes.filter((item) => item?.teacher?._id).length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {editingId ? "Edit Class" : "Create Class"}
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Class Name (e.g. 10-A)" value={name} onChange={(e) => setName(e.target.value)} required />

          <div>
            <label className="label">Assign Faculty</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="select-field mt-1"
            >
              <option value="">Select faculty</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t?.user?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          {editingId ? (
            <div className="flex gap-2">
              <Button onClick={updateClass}>Save Changes</Button>
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
            </div>
          ) : (
            <Button onClick={createClass}>Create Class</Button>
          )}
        </div>
      </div>

      <div className="card p-4 mb-4">
        <Input
          label="Search"
          placeholder="Search by class or faculty name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        columns={[
          { key: "name", title: "Class Name", render: (c) => c.name },
          { key: "teacher", title: "Faculty", render: (c) => c?.teacher?.user?.name || "Not assigned" },
          {
            key: "actions",
            title: "Actions",
            render: (c) => (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => startEdit(c)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => deleteClass(c._id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        data={filteredClasses}
      />
    </Layout>
  );
}
