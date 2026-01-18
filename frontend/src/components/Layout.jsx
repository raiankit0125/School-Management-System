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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 hidden md:block">
        <h2 className="text-xl font-bold text-indigo-600 mb-6">School System</h2>

        <nav className="flex flex-col gap-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl font-medium ${
                  isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {l.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Navbar */}
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">{user?.role} Panel</h1>
            <p className="text-sm text-gray-500">{user?.name}</p>
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

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
