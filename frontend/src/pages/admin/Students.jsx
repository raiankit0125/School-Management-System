import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";

const createInitialForm = () => ({
  name: "",
  email: "",
  classId: "",
  rollNo: "",
  phone: "",
  address: "",
  dob: "",
  gender: "",
  city: "",
  state: "",
  pincode: "",
  guardianName: "",
  guardianPhone: "",
  admissionNo: "",
  section: "",
  previousSchool: "",
  medicalNotes: "",
  transportMode: "",
  notes: "",
});

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4">
      <p className="label">{label}</p>
      <p className="mt-2 text-sm text-slate-700">{value || "-"}</p>
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState(createInitialForm());

  const fetchData = async () => {
    const [studentsRes, classesRes] = await Promise.all([
      axiosInstance.get("/admin/students"),
      axiosInstance.get("/admin/classes"),
    ]);
    setStudents(studentsRes.data.data);
    setClasses(classesRes.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(createInitialForm());
  };

  const createStudent = async () => {
    try {
      await axiosInstance.post("/admin/student", form);
      resetForm();
      fetchData();
      alert("Student added successfully");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create student");
    }
  };

  const startEdit = (student) => {
    setEditingId(student._id);
    setSelectedStudent(student);
    setForm({
      name: student?.user?.name || "",
      email: student?.user?.email || "",
      classId: student?.classId?._id || "",
      rollNo: student?.rollNo || "",
      phone: student?.phone || "",
      address: student?.address || "",
      dob: student?.dob ? String(student.dob).slice(0, 10) : "",
      gender: student?.gender || "",
      city: student?.city || "",
      state: student?.state || "",
      pincode: student?.pincode || "",
      guardianName: student?.guardianName || "",
      guardianPhone: student?.guardianPhone || "",
      admissionNo: student?.admissionNo || "",
      section: student?.section || "",
      previousSchool: student?.previousSchool || "",
      medicalNotes: student?.medicalNotes || "",
      transportMode: student?.transportMode || "",
      notes: student?.notes || "",
    });
  };

  const updateStudent = async () => {
    try {
      await axiosInstance.put(`/admin/student/${editingId}`, form);
      resetForm();
      fetchData();
      alert("Student updated successfully");
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  const deleteStudent = async (studentId) => {
    const ok = window.confirm("Delete this student? This will remove linked account and records.");
    if (!ok) return;
    await axiosInstance.delete(`/admin/student/${studentId}`);
    if (selectedStudent?._id === studentId) setSelectedStudent(null);
    fetchData();
    alert("Student deleted successfully");
  };

  const filteredStudents = students.filter((student) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const values = [
      student?.user?.name,
      student?.user?.email,
      student?.rollNo,
      student?.phone,
      student?.address,
      student?.guardianName,
      student?.guardianPhone,
      student?.admissionNo,
      student?.section,
      student?.classId?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return values.includes(q);
  });

  return (
    <Layout>
      <PageTitle
        title="Student Management"
        subtitle="Admin controls student onboarding, class assignment, search, and profile visibility."
      />

      <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.7)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_32%)]" />
        <div className="relative grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-sky-700/80">Student Admission Desk</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              Student registration, profile review, and class assignment from one admin panel.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Admin adds students, assigns classes, reviews guardians and contact details, searches records,
              and opens full information instantly.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="label">Total Students</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{students.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="label">Admin Flow</p>
                <p className="mt-2 text-sm text-slate-700">Create, assign class, edit, search, view, delete</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="label">Reset Password</p>
                <p className="mt-2 text-sm text-slate-700">Admin can resend reset credentials by email anytime</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <img
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80"
              alt="Students in class"
              className="h-44 w-full rounded-[24px] object-cover shadow-xl sm:h-full"
            />
            <img
              src="https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=900&q=80"
              alt="Student learning"
              className="h-44 w-full rounded-[24px] object-cover shadow-xl sm:translate-y-10"
            />
          </div>
        </div>
      </section>

      <section className="card mt-6 p-6">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {editingId ? "Edit Student Profile" : "Add Student Profile"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Faculty assignment still stays with admin through the class section.
            </p>
          </div>
          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900">
            Student and faculty both remain under admin control.
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Student Name" value={form.name} onChange={(e) => setField("name", e.target.value)} />
            <Input label="Email Address" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
            <div>
              <label className="label">Class</label>
              <select className="select-field mt-1" value={form.classId} onChange={(e) => setField("classId", e.target.value)}>
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Roll No" value={form.rollNo} onChange={(e) => setField("rollNo", e.target.value)} />
            <Input label="Admission No" value={form.admissionNo} onChange={(e) => setField("admissionNo", e.target.value)} />
            <Input label="Section" value={form.section} onChange={(e) => setField("section", e.target.value)} />
            <Input label="Phone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
            <Input label="Date of Birth" type="date" value={form.dob} onChange={(e) => setField("dob", e.target.value)} />
            <div>
              <label className="label">Gender</label>
              <select className="select-field mt-1" value={form.gender} onChange={(e) => setField("gender", e.target.value)}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input label="City" value={form.city} onChange={(e) => setField("city", e.target.value)} />
            <Input label="State" value={form.state} onChange={(e) => setField("state", e.target.value)} />
            <Input label="Pincode" value={form.pincode} onChange={(e) => setField("pincode", e.target.value)} />
            <Input label="Guardian Name" value={form.guardianName} onChange={(e) => setField("guardianName", e.target.value)} />
            <Input label="Guardian Phone" value={form.guardianPhone} onChange={(e) => setField("guardianPhone", e.target.value)} />
            <Input label="Transport Mode" value={form.transportMode} onChange={(e) => setField("transportMode", e.target.value)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="label">Address</label>
              <textarea
                className="input-field mt-1 min-h-28"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Full address"
              />
            </div>
            <div>
              <label className="label">Previous School</label>
              <textarea
                className="input-field mt-1 min-h-28"
                value={form.previousSchool}
                onChange={(e) => setField("previousSchool", e.target.value)}
                placeholder="Last attended school details"
              />
            </div>
            <div>
              <label className="label">Medical Notes</label>
              <textarea
                className="input-field mt-1 min-h-28"
                value={form.medicalNotes}
                onChange={(e) => setField("medicalNotes", e.target.value)}
                placeholder="Allergy, health note, medication, or concern"
              />
            </div>
            <div>
              <label className="label">Admin Notes</label>
              <textarea
                className="input-field mt-1 min-h-28"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Internal student notes"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {editingId ? (
              <>
                <Button onClick={updateStudent}>Save Student Changes</Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </>
            ) : (
              <Button onClick={createStudent}>Create Student Profile</Button>
            )}
          </div>
        </div>
      </section>

      <section className="card mt-6 p-4">
        <Input
          label="Search Students"
          placeholder="Search by name, email, class, roll no, guardian, phone, admission number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {selectedStudent ? (
        <section className="card mt-6 p-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="label">Student Details</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                {selectedStudent?.user?.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Full profile visible here after search or selection.
              </p>
            </div>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close Details</Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <DetailItem label="Email" value={selectedStudent?.user?.email} />
            <DetailItem label="Class" value={selectedStudent?.classId?.name} />
            <DetailItem label="Roll No" value={selectedStudent?.rollNo} />
            <DetailItem label="Admission No" value={selectedStudent?.admissionNo} />
            <DetailItem label="Section" value={selectedStudent?.section} />
            <DetailItem label="Phone" value={selectedStudent?.phone} />
            <DetailItem label="Guardian Name" value={selectedStudent?.guardianName} />
            <DetailItem label="Guardian Phone" value={selectedStudent?.guardianPhone} />
            <DetailItem label="DOB" value={selectedStudent?.dob ? String(selectedStudent.dob).slice(0, 10) : ""} />
            <DetailItem label="Gender" value={selectedStudent?.gender} />
            <DetailItem label="Transport" value={selectedStudent?.transportMode} />
            <DetailItem label="Pincode" value={selectedStudent?.pincode} />
            <DetailItem label="Address" value={selectedStudent?.address} />
            <DetailItem label="Previous School" value={selectedStudent?.previousSchool} />
            <DetailItem label="Medical Notes" value={selectedStudent?.medicalNotes} />
            <DetailItem label="Admin Notes" value={selectedStudent?.notes} />
          </div>
        </section>
      ) : null}

      <section className="mt-6">
        <Table
          columns={[
            { key: "name", title: "Student", render: (student) => student?.user?.name || "-" },
            { key: "email", title: "Email", render: (student) => student?.user?.email || "-" },
            { key: "class", title: "Class", render: (student) => student?.classId?.name || "-" },
            { key: "rollNo", title: "Roll No", render: (student) => student?.rollNo || "-" },
            { key: "guardian", title: "Guardian", render: (student) => student?.guardianName || "-" },
            {
              key: "actions",
              title: "Actions",
              render: (student) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setSelectedStudent(student)}>
                    View Details
                  </Button>
                  <Button variant="outline" onClick={() => startEdit(student)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await axiosInstance.post(`/admin/resend/${student.user._id}`);
                        alert("Reset credentials sent successfully");
                      } catch (err) {
                        alert(err?.response?.data?.message || "Reset mail failed");
                      }
                    }}
                  >
                    Send Reset Mail
                  </Button>
                  <Button variant="danger" onClick={() => deleteStudent(student._id)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredStudents}
        />
      </section>
    </Layout>
  );
}
