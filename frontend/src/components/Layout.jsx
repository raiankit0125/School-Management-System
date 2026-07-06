import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import SiteFooter from "./SiteFooter";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const shellClass =
    user?.role === "ADMIN"
      ? "app-shell-admin"
      : user?.role === "TEACHER"
      ? "app-shell-teacher"
      : "app-shell-student";

  const roleAccent =
    user?.role === "ADMIN"
      ? "from-[#0f4c81] via-[#0f766e] to-[#c4931c]"
      : user?.role === "TEACHER"
      ? "from-[#0f766e] via-[#0f5f8c] to-[#d97757]"
      : "from-[#0f5f8c] via-[#4463b3] to-[#d97757]";

  const backgroundImage =
    user?.role === "ADMIN"
      ? "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80"
      : user?.role === "TEACHER"
      ? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80"
      : "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=80";

  const roleVisual =
    user?.role === "ADMIN"
      ? {
          label: "Operations Studio",
          copy: "Admissions, assignments, and communication in one view.",
          image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
        }
      : user?.role === "TEACHER"
      ? {
          label: "Faculty Flow",
          copy: "Teaching tools, attendance, and learner communication.",
          image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
        }
      : {
          label: "Learner Space",
          copy: "Progress, notices, and academic support in one place.",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
        };

  const links =
    user?.role === "ADMIN"
      ? [
          { name: "Dashboard", to: "/admin" },
          { name: "Faculty", to: "/admin/teachers" },
          { name: "Students", to: "/admin/students" },
          { name: "Fees", to: "/admin/fees" },
          { name: "Bulk Upload", to: "/admin/bulk-upload" },
          { name: "Classes", to: "/admin/classes" },
          { name: "Notifications", to: "/admin/notifications" },
          { name: "Calendar", to: "/admin/calendar" },
          { name: "Messages", to: "/admin/chat" },
        ]
      : user?.role === "TEACHER"
      ? [
          { name: "Dashboard", to: "/teacher" },
          { name: "Academic Groups", to: "/teacher/classes" },
          { name: "Attendance", to: "/teacher/attendance" },
          { name: "Bulk Marks", to: "/teacher/bulk-marks" },
          { name: "Bulk Attendance", to: "/teacher/bulk-attendance" },
          { name: "Marks", to: "/teacher/marks" },
          { name: "Notices", to: "/teacher/notices" },
          { name: "Notifications", to: "/teacher/notifications" },
          { name: "Calendar", to: "/teacher/calendar" },
          { name: "Messages", to: "/teacher/chat" },
        ]
      : [
          { name: "Dashboard", to: "/student" },
          { name: "My Attendance", to: "/student/attendance" },
          { name: "My Marks", to: "/student/marks" },
          { name: "My Fees", to: "/student/fees" },
          { name: "My Notices", to: "/student/notices" },
          { name: "Calendar", to: "/student/calendar" },
          { name: "Messages", to: "/student/chat" },
        ];

  return (
    <div className={`app-shell ${shellClass} relative flex w-full min-w-0 overflow-x-hidden`}>
      <div className="workspace-backdrop">
        <div
          className="workspace-backdrop-image"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="workspace-backdrop-tint" />
      </div>
      {/* Sidebar */}
      <aside className="relative hidden w-80 flex-col gap-8 border-r border-white/20 bg-slate-950/40 p-5 shadow-[10px_0_45px_-34px_rgba(15,23,42,0.5)] backdrop-blur-xl lg:flex">
        <div className={`rounded-[28px] bg-gradient-to-br ${roleAccent} p-6 text-white shadow-xl`}>
          <p className="text-xs uppercase tracking-widest text-white/70">Portal</p>
          <h2 className="mt-2 text-3xl font-semibold">Academic Hub</h2>
          <p className="mt-2 text-sm text-white/80">Built for schools, colleges, and modern academic teams</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/90">
            <div className="rounded-2xl bg-white/10 px-3 py-3">
              <p className="uppercase tracking-[0.2em] text-white/60">Role</p>
              <p className="mt-2 text-sm font-semibold">{user?.role}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-3">
              <p className="uppercase tracking-[0.2em] text-white/60">Status</p>
              <p className="mt-2 text-sm font-semibold">Active Session</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? "sidebar-link-active"
                    : "sidebar-link-idle"
                }`
              }
            >
              {l.name}
            </NavLink>
          ))}
        </nav>

        <div className="role-visual-card float-card [animation-duration:7.5s]">
          <img src={roleVisual.image} alt={roleVisual.label} className="h-36 w-full rounded-[22px] object-cover" />
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">{roleVisual.label}</p>
            <p className="mt-2 text-sm leading-6 text-white/80">{roleVisual.copy}</p>
          </div>
        </div>

        <div className="mt-auto rounded-[26px] border border-white/25 bg-white/10 p-5 text-white shadow-[0_20px_45px_-36px_rgba(15,23,42,0.36)] backdrop-blur">
          <p className="text-xs text-white/55">Signed in as</p>
          <p className="mt-1 text-base font-semibold text-white">{user?.name}</p>
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">{user?.role}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-10 w-full border-b border-white/45 bg-white/70 px-3 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{user?.role} Workspace</h1>
              <p className="truncate text-sm text-slate-600">{user?.name}</p>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
              <select
                className="select-field min-w-0 lg:hidden"
                value={links.find((link) => link.to === location.pathname)?.to || ""}
                onChange={(event) => event.target.value && navigate(event.target.value)}
              >
                <option value="">Open section</option>
                {links.map((link) => (
                  <option key={link.to} value={link.to}>
                    {link.name}
                  </option>
                ))}
              </select>

              <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/75 px-3 py-2 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.4)] md:flex">
                <img src={roleVisual.image} alt={roleVisual.label} className="h-11 w-11 rounded-2xl object-cover" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{roleVisual.label}</p>
                  <p className="text-sm font-semibold text-slate-800">{user?.role}</p>
                </div>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
                <ThemeToggle />
                <NotificationBell role={user?.role} />
                <Button
                  variant="danger"
                  className="whitespace-nowrap"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full min-w-0 overflow-x-hidden p-3 sm:p-5 lg:p-8">
          <div className="content-stage">
            <div className="min-w-0 max-w-full">{children}</div>
          </div>
          <SiteFooter />
        </main>
      </div>
    </div>
  );
}
