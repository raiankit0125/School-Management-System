import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links =
    user?.role === "ADMIN"
      ? [
          { name: "Dashboard", to: "/admin" },
          { name: "Teachers", to: "/admin/teachers" },
          { name: "Students", to: "/admin/students" },
          { name: "Bulk Upload", to: "/admin/bulk-upload" },
          { name: "Classes", to: "/admin/classes" },
        ]
      : user?.role === "TEACHER"
      ? [
          { name: "Dashboard", to: "/teacher" },
          { name: "My Classes", to: "/teacher/classes" },
          { name: "Attendance", to: "/teacher/attendance" },
          { name: "Bulk Marks Upload", to: "/teacher/bulk-marks" },
          { name: "Bulk Attendance Upload", to: "/teacher/bulk-attendance" },
          { name: "Marks", to: "/teacher/marks" },
        ]
      : [
          { name: "Dashboard", to: "/student" },
          { name: "My Attendance", to: "/student/attendance" },
          { name: "My Marks", to: "/student/marks" },
        ];

  return (
    <div className="app-shell flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white/90 border-r border-slate-200/60 p-5 hidden lg:flex flex-col gap-8 shadow-[6px_0_30px_-26px_rgba(15,23,42,0.6)]">
        <div className="rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-600 p-5 text-white shadow-lg">
          <p className="text-xs uppercase tracking-widest text-white/70">Portal</p>
          <h2 className="text-2xl font-semibold mt-2">School System</h2>
          <p className="text-sm text-white/80 mt-1">Manage with clarity</p>
        </div>

        <nav className="flex flex-col gap-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {l.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-200/70 bg-white/80 p-4">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.role}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Navbar */}
        <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200/70 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{user?.role} Panel</h1>
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

        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
