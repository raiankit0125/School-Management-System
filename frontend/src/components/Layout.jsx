import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const links =
    user?.role === "ADMIN"
      ? [
          { name: "Dashboard", to: "/admin" },
          { name: "Faculty", to: "/admin/teachers" },
          { name: "Students", to: "/admin/students" },
          { name: "Bulk Upload", to: "/admin/bulk-upload" },
          { name: "Classes", to: "/admin/classes" },
          { name: "Chat", to: "/admin/chat" },
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
          { name: "Chat", to: "/teacher/chat" },
        ]
      : [
          { name: "Dashboard", to: "/student" },
          { name: "My Attendance", to: "/student/attendance" },
          { name: "My Marks", to: "/student/marks" },
          { name: "My Notices", to: "/student/notices" },
          { name: "Chat", to: "/student/chat" },
        ];

  return (
    <div className={`app-shell ${shellClass} flex`}>
      {/* Sidebar */}
      <aside className="hidden w-80 flex-col gap-8 border-r border-white/60 bg-white/55 p-5 shadow-[10px_0_45px_-34px_rgba(15,23,42,0.5)] backdrop-blur-xl lg:flex">
        <div className={`rounded-[28px] bg-gradient-to-br ${roleAccent} p-6 text-white shadow-xl`}>
          <p className="text-xs uppercase tracking-widest text-white/70">Portal</p>
          <h2 className="mt-2 text-3xl font-semibold">Academic Hub</h2>
          <p className="mt-2 text-sm text-white/80">Built for schools, colleges, and modern academic teams</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/90">
            <div className="rounded-2xl bg-white/12 px-3 py-3">
              <p className="uppercase tracking-[0.2em] text-white/60">Role</p>
              <p className="mt-2 text-sm font-semibold">{user?.role}</p>
            </div>
            <div className="rounded-2xl bg-white/12 px-3 py-3">
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

        <div className="mt-auto rounded-[26px] border border-white/70 bg-white/75 p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.36)]">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="mt-1 text-base font-semibold text-slate-800">{user?.name}</p>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{user?.role}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Navbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/60 bg-white/45 px-6 py-4 backdrop-blur-xl">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{user?.role} Workspace</h1>
            <p className="text-sm text-slate-500">{user?.name}</p>
          </div>

          <Button
            variant="danger"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </header>

        <main className="p-5 lg:p-8">
          {children}
          <footer className="mt-10 rounded-[30px] border border-white/70 bg-white/70 px-6 py-6 text-sm text-slate-600 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)] backdrop-blur">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p>Academic Hub supports faculty operations, student progress, attendance, notices, and communication.</p>
              <p>Designed for school and college workflows.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
