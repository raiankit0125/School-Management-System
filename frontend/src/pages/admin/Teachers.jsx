import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Table from "../../components/Table";
import axiosInstance from "../../api/axiosInstance";
import { digitsOnly, isEmail, validatePhone, validatePincode } from "../../utils/formValidation";

const DEVICE_OPTIONS = ["Laptop / Desktop", "Tablet", "Smartphone"];
const QUALIFICATION_OPTIONS = ["B.Sc", "M.Sc", "B.Ed", "M.Ed", "Others"];

const createInitialForm = () => ({
  name: "",
  email: "",
  subject: "",
  phone: "",
  alternatePhone: "",
  dob: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  qualification: "",
  specialization: "",
  certifications: "",
  experienceYears: "",
  designation: "",
  institutions: "",
  onlineExperience: "",
  onlineExperienceDetails: "",
  devices: [],
  techRating: "",
  demoReady: "",
  demoTopic: "",
  whyBst: "",
  comments: "",
  declarationAccepted: false,
  signature: "",
  declarationDate: "",
});

function CheckboxGroup({ title, options, values, onToggle }) {
  return (
    <div>
      <p className="label">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <label
              key={option}
              className={`cursor-pointer rounded-full border px-3 py-2 text-sm transition ${
                active
                  ? "border-teal-500 bg-teal-50 text-teal-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => onToggle(option)}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4">
      <p className="label">{label}</p>
      <p className="mt-2 text-sm text-slate-700">{value || "-"}</p>
    </div>
  );
}

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form, setForm] = useState(createInitialForm());

  const fetchTeachers = async () => {
    const res = await axiosInstance.get("/admin/teachers");
    setTeachers(res.data.data);
  };

  useEffect(() => {
    Promise.resolve().then(fetchTeachers);
  }, []);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setDigitsField = (key, value, maxLength) => {
    setField(key, digitsOnly(value, maxLength));
  };

  const validateTeacherForm = () => {
    if (!form.name.trim()) return "Faculty name is required";
    if (!isEmail(form.email)) return "Enter a valid email address";
    const phoneError = validatePhone(form.phone, "Mobile number");
    if (phoneError) return phoneError;
    const alternatePhoneError = validatePhone(form.alternatePhone, "Alternate mobile");
    if (alternatePhoneError) return alternatePhoneError;
    const pincodeError = validatePincode(form.pincode);
    if (pincodeError) return pincodeError;
    if (form.experienceYears && (!Number.isFinite(Number(form.experienceYears)) || Number(form.experienceYears) < 0)) {
      return "Experience must be 0 or more";
    }
    return "";
  };

  const toggleArrayValue = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(createInitialForm());
  };

  const buildCredentialAlert = (label, responseData) => {
    const credentials = responseData?.data?.credentials;

    if (!credentials?.tempPassword) {
      return `${label} successfully`;
    }

    const mailNote = credentials.emailSent === false
      ? `\nMail issue: ${credentials.mailError || "Email could not be delivered"}`
      : credentials.mailQueued
        ? "\nEmail has been queued in background."
        : "\nEmail sent successfully.";

    return `${label} successfully\nEmail: ${credentials.email}\nTemporary Password: ${credentials.tempPassword}${mailNote}`;
  };

  const createTeacher = async () => {
    try {
      const validationMessage = validateTeacherForm();
      if (validationMessage) {
        alert(validationMessage);
        return;
      }
      const res = await axiosInstance.post("/admin/teacher", form);
      resetForm();
      fetchTeachers();
      alert(buildCredentialAlert("Faculty added", res.data));
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to create faculty";
      if (message === "Teacher already exists") {
        setSearch(form.email || form.name || "");
        alert("A faculty account with this email already exists. Search below and edit the existing record.");
        return;
      }
      alert(message);
    }
  };

  const startEdit = (teacher) => {
    setEditingId(teacher._id);
    setSelectedTeacher(teacher);
    setForm({
      name: teacher?.user?.name || "",
      email: teacher?.user?.email || "",
      subject: teacher?.subject || "",
      phone: teacher?.phone || "",
      alternatePhone: teacher?.alternatePhone || "",
      dob: teacher?.dob ? String(teacher.dob).slice(0, 10) : "",
      gender: teacher?.gender || "",
      address: teacher?.address || "",
      city: teacher?.city || "",
      state: teacher?.state || "",
      pincode: teacher?.pincode || "",
      qualification: teacher?.qualification || "",
      specialization: teacher?.specialization || "",
      certifications: teacher?.certifications || "",
      experienceYears: teacher?.experienceYears || "",
      designation: teacher?.designation || "",
      institutions: teacher?.institutions || "",
      onlineExperience: teacher?.onlineExperience || "",
      onlineExperienceDetails: teacher?.onlineExperienceDetails || "",
      devices: teacher?.devices || [],
      techRating: teacher?.techRating || "",
      demoReady: teacher?.demoReady || "",
      demoTopic: teacher?.demoTopic || "",
      whyBst: teacher?.whyBst || "",
      comments: teacher?.comments || "",
      declarationAccepted: Boolean(teacher?.declarationAccepted),
      signature: teacher?.signature || "",
      declarationDate: teacher?.declarationDate ? String(teacher.declarationDate).slice(0, 10) : "",
    });
  };

  const updateTeacher = async () => {
    try {
      const validationMessage = validateTeacherForm();
      if (validationMessage) {
        alert(validationMessage);
        return;
      }
      await axiosInstance.put(`/admin/teacher/${editingId}`, form);
      resetForm();
      fetchTeachers();
      alert("Faculty updated successfully");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update faculty");
    }
  };

  const deleteTeacher = async (teacherId) => {
    const ok = window.confirm("Delete this faculty profile? This removes linked account and records.");
    if (!ok) return;
    await axiosInstance.delete(`/admin/teacher/${teacherId}`);
    if (selectedTeacher?._id === teacherId) setSelectedTeacher(null);
    fetchTeachers();
    alert("Faculty deleted successfully");
  };

  const filteredTeachers = teachers.filter((teacher) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const values = [
      teacher?.user?.name,
      teacher?.user?.email,
      teacher?.subject,
      teacher?.phone,
      teacher?.designation,
      teacher?.qualification,
      teacher?.specialization,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return values.includes(q);
  });

  return (
    <Layout>
      <PageTitle
        title="Faculty Management"
        subtitle="Admin-controlled faculty registration aligned to the reference form."
      />

      <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-slate-950 text-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.9)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.24),transparent_28%)]" />
        <div className="relative grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-teal-200/80">Faculty Registration Desk</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
              A stronger faculty onboarding screen with full admin control.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Personal info, qualification, experience, online readiness, demo status,
              and declaration are all managed here.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Faculty Profiles</p>
                <p className="mt-2 text-3xl font-semibold">{teachers.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Admin Control</p>
                <p className="mt-2 text-sm text-slate-200">Create, edit, search, view, reset mail, assign, delete</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Profile Coverage</p>
                <p className="mt-2 text-sm text-slate-200">Personal, academic, operations, demo, declaration</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
              alt="Faculty collaboration"
              className="h-44 w-full rounded-[24px] object-cover shadow-2xl sm:h-full"
            />
            <img
              src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80"
              alt="Teacher in classroom"
              className="h-44 w-full rounded-[24px] object-cover shadow-2xl sm:translate-y-10"
            />
          </div>
        </div>
      </section>

      <section className="card mt-6 p-6">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {editingId ? "Edit Faculty Profile" : "Add Faculty Profile"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Login credentials are still created and controlled by admin only.
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Reference page fields have been adapted into this admin form.
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Full Name" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
            <Input label="Email Address" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} required />
            <Input label="Primary Subject" value={form.subject} onChange={(e) => setField("subject", e.target.value)} />
            <Input label="Mobile Number" type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => setDigitsField("phone", e.target.value, 10)} />
            <Input label="Alternate Mobile" type="tel" inputMode="numeric" maxLength={10} value={form.alternatePhone} onChange={(e) => setDigitsField("alternatePhone", e.target.value, 10)} />
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
            <Input label="Pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={(e) => setDigitsField("pincode", e.target.value, 6)} />
            <Input label="Designation" value={form.designation} onChange={(e) => setField("designation", e.target.value)} />
            <Input label="Experience (Years)" type="number" min="0" value={form.experienceYears} onChange={(e) => setField("experienceYears", e.target.value)} />
          </div>

          <div>
            <label className="label">Address</label>
            <textarea
              className="input-field mt-1 min-h-28"
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Complete residential address"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label">Qualification</label>
              <select
                className="select-field mt-1"
                value={form.qualification}
                onChange={(e) => setField("qualification", e.target.value)}
              >
                <option value="">Select qualification</option>
                {QUALIFICATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Specialization" value={form.specialization} onChange={(e) => setField("specialization", e.target.value)} />
            <Input label="Certifications" value={form.certifications} onChange={(e) => setField("certifications", e.target.value)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <CheckboxGroup
              title="Available Devices"
              options={DEVICE_OPTIONS}
              values={form.devices}
              onToggle={(value) => toggleArrayValue("devices", value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label">Online Teaching Experience</label>
              <select
                className="select-field mt-1"
                value={form.onlineExperience}
                onChange={(e) => setField("onlineExperience", e.target.value)}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="label">Tech Comfort Rating</label>
              <select
                className="select-field mt-1"
                value={form.techRating}
                onChange={(e) => setField("techRating", e.target.value)}
              >
                <option value="">Select rating</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={String(value)}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ready For Demo Class</label>
              <select className="select-field mt-1" value={form.demoReady} onChange={(e) => setField("demoReady", e.target.value)}>
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <Input label="Demo Topic" value={form.demoTopic} onChange={(e) => setField("demoTopic", e.target.value)} />
            <Input label="Signature" value={form.signature} onChange={(e) => setField("signature", e.target.value)} />
            <Input label="Declaration Date" type="date" value={form.declarationDate} onChange={(e) => setField("declarationDate", e.target.value)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="label">Institutions Worked With</label>
              <textarea
                className="input-field mt-1 min-h-28"
                value={form.institutions}
                onChange={(e) => setField("institutions", e.target.value)}
                placeholder="Previous school, academy, coaching, or institute details"
              />
            </div>
            <div>
              <label className="label">Online Experience Details</label>
              <textarea
                className="input-field mt-1 min-h-28"
                value={form.onlineExperienceDetails}
                onChange={(e) => setField("onlineExperienceDetails", e.target.value)}
                placeholder="Platforms used, batches handled, or process notes"
              />
            </div>
            <div>
              <label className="label">Why BST Akademii?</label>
              <textarea
                className="input-field mt-1 min-h-28"
                value={form.whyBst}
                onChange={(e) => setField("whyBst", e.target.value)}
                placeholder="Reason for joining"
              />
            </div>
            <div>
              <label className="label">Comments</label>
              <textarea
                className="input-field mt-1 min-h-28"
                value={form.comments}
                onChange={(e) => setField("comments", e.target.value)}
                placeholder="Any additional note"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.declarationAccepted}
              onChange={(e) => setField("declarationAccepted", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>
              I hereby declare that all information provided is true to the best of my knowledge.
            </span>
          </label>

          <div className="flex flex-wrap gap-3">
            {editingId ? (
              <>
                <Button onClick={updateTeacher}>Save Faculty Changes</Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </>
            ) : (
              <Button onClick={createTeacher}>Create Faculty Profile</Button>
            )}
          </div>
        </div>
      </section>

      <section className="card mt-6 p-4">
        <Input
          label="Search Faculty"
          placeholder="Search by name, email, specialization, subject, class, designation"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {selectedTeacher ? (
        <section className="card mt-6 p-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="label">Faculty Details</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                {selectedTeacher?.user?.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search karne ke baad ya table se select karne par full information yahan dikhegi.
              </p>
            </div>
            <Button variant="outline" onClick={() => setSelectedTeacher(null)}>Close Details</Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <DetailItem label="Email" value={selectedTeacher?.user?.email} />
            <DetailItem label="Primary Subject" value={selectedTeacher?.subject} />
            <DetailItem label="Qualification" value={selectedTeacher?.qualification} />
            <DetailItem label="Specialization" value={selectedTeacher?.specialization} />
            <DetailItem label="Designation" value={selectedTeacher?.designation} />
            <DetailItem label="Experience" value={selectedTeacher?.experienceYears} />
            <DetailItem label="Phone" value={selectedTeacher?.phone} />
            <DetailItem label="Alternate Phone" value={selectedTeacher?.alternatePhone} />
            <DetailItem label="DOB" value={selectedTeacher?.dob ? String(selectedTeacher.dob).slice(0, 10) : ""} />
            <DetailItem label="Gender" value={selectedTeacher?.gender} />
            <DetailItem label="City / State" value={[selectedTeacher?.city, selectedTeacher?.state].filter(Boolean).join(", ")} />
            <DetailItem label="Pincode" value={selectedTeacher?.pincode} />
            <DetailItem label="Devices" value={selectedTeacher?.devices?.join(", ")} />
            <DetailItem label="Online Experience" value={selectedTeacher?.onlineExperience} />
            <DetailItem label="Online Details" value={selectedTeacher?.onlineExperienceDetails} />
            <DetailItem label="Demo Ready" value={selectedTeacher?.demoReady} />
            <DetailItem label="Demo Topic" value={selectedTeacher?.demoTopic} />
            <DetailItem label="Why Join" value={selectedTeacher?.whyBst} />
            <DetailItem label="Address" value={selectedTeacher?.address} />
            <DetailItem label="Institutions" value={selectedTeacher?.institutions} />
            <DetailItem label="Comments" value={selectedTeacher?.comments} />
          </div>
        </section>
      ) : null}

      <section className="mt-6">
        <Table
          columns={[
            { key: "name", title: "Faculty", render: (teacher) => teacher?.user?.name || "-" },
            { key: "email", title: "Email", render: (teacher) => teacher?.user?.email || "-" },
            { key: "subject", title: "Primary Subject", render: (teacher) => teacher?.subject || "-" },
            { key: "qualification", title: "Qualification", render: (teacher) => teacher?.qualification || "-" },
            { key: "experience", title: "Experience", render: (teacher) => teacher?.experienceYears || "-" },
            {
              key: "actions",
              title: "Actions",
              render: (teacher) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setSelectedTeacher(teacher)}>
                    View Details
                  </Button>
                  <Button variant="outline" onClick={() => startEdit(teacher)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const res = await axiosInstance.post(`/admin/resend/${teacher.user._id}`);
                        alert(buildCredentialAlert("Faculty reset credentials generated", res.data));
                      } catch (err) {
                        alert(err?.response?.data?.message || "Reset mail failed");
                      }
                    }}
                  >
                    Send Reset Mail
                  </Button>
                  <Button variant="danger" onClick={() => deleteTeacher(teacher._id)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredTeachers}
        />
      </section>
    </Layout>
  );
}
