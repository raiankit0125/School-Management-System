import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import { Link } from "react-router-dom";

const tiles = [
  {
    title: "Faculty Operations",
    copy: "Register faculty, map academic groups, and activate marks and attendance workflows.",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80",
    link: "/admin/teachers",
  },
  {
    title: "Student Lifecycle",
    copy: "Onboard students, assign classes, and keep guardians and admissions information visible.",
    image: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=900&q=80",
    link: "/admin/students",
  },
  {
    title: "Communication Center",
    copy: "Support operational communication across admin, faculty, and students from one place.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    link: "/admin/chat",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axiosInstance.get("/admin/dashboard").then((res) => setStats(res.data.data));
  }, []);

  return (
    <Layout>
      <PageTitle
        title="Admin Dashboard"
        subtitle="Professional academic operations view for schools, colleges, and training institutes."
      />

      <section className="relative overflow-hidden rounded-[34px] bg-slate-950 px-6 py-8 text-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.95)] lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.25),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.2),transparent_28%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-teal-200/70">Academic Command Center</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight">
              Control admissions, faculty enablement, progress tracking, and communication from one dashboard.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Admin sets up faculty, assigns classes, manages student records, and activates the workflows that faculty and students use after password reset.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="float-card rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400">Faculty</p>
              <p className="mt-3 text-4xl font-semibold">{stats?.totalTeachers ?? 0}</p>
            </div>
            <div className="float-card rounded-3xl border border-white/10 bg-white/5 p-5 [animation-delay:0.6s]">
              <p className="text-xs uppercase tracking-wider text-slate-400">Students</p>
              <p className="mt-3 text-4xl font-semibold">{stats?.totalStudents ?? 0}</p>
            </div>
            <div className="float-card rounded-3xl border border-white/10 bg-white/5 p-5 [animation-delay:1.2s]">
              <p className="text-xs uppercase tracking-wider text-slate-400">Groups</p>
              <p className="mt-3 text-4xl font-semibold">{stats?.totalClasses ?? 0}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.title} to={tile.link} className="card overflow-hidden p-0 transition hover:-translate-y-1">
            <img src={tile.image} alt={tile.title} className="h-48 w-full object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900">{tile.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{tile.copy}</p>
            </div>
          </Link>
        ))}
      </section>
    </Layout>
  );
}
