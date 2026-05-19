import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Layout from "../../components/Layout";
import PageTitle from "../../components/PageTitle";
import { Link } from "react-router-dom";
import DashboardEvents from "../../components/DashboardEvents";

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
    title: "Academic Groups",
    copy: "Organize classes, assign faculty, and keep student groups ready for daily workflows.",
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
    link: "/admin/classes",
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

      <section className="hero-panel bg-[linear-gradient(135deg,#123761_0%,#0f766e_55%,#d69d2c_100%)] px-6 py-8 text-white lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_24%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">Academic Command Center</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight">
              Control admissions, faculty enablement, progress tracking, and communication from one dashboard.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80">
              Admin sets up faculty, assigns classes, manages student records, and activates the workflows that faculty and students use after password reset.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="float-card rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-white/70">Faculty</p>
              <p className="mt-3 text-4xl font-semibold">{stats?.totalTeachers ?? 0}</p>
            </div>
            <div className="float-card rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur [animation-delay:0.6s]">
              <p className="text-xs uppercase tracking-wider text-white/70">Students</p>
              <p className="mt-3 text-4xl font-semibold">{stats?.totalStudents ?? 0}</p>
            </div>
            <div className="float-card rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur [animation-delay:1.2s]">
              <p className="text-xs uppercase tracking-wider text-white/70">Groups</p>
              <p className="mt-3 text-4xl font-semibold">{stats?.totalClasses ?? 0}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.title} to={tile.link} className="card overflow-hidden p-0 transition hover:-translate-y-1.5">
            <img src={tile.image} alt={tile.title} className="h-48 w-full object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900">{tile.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{tile.copy}</p>
            </div>
          </Link>
        ))}
      </section>

      <DashboardEvents />
    </Layout>
  );
}
