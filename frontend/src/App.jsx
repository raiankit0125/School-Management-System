import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import ChangePassword from "./pages/ChangePassword";
import BulkUpload from "./pages/admin/BulkUpload";
import BulkMarksUpload from "./pages/teacher/BulkMarksUpload";
import BulkAttendanceUpload from "./pages/teacher/BulkAttendanceUpload";



// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import Teachers from "./pages/admin/Teachers";
import Students from "./pages/admin/Students";
import Classes from "./pages/admin/Classes";

// Teacher
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import Attendance from "./pages/teacher/Attendance";
import Marks from "./pages/teacher/Marks";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import MyAttendance from "./pages/student/MyAttendance";
import MyMarks from "./pages/student/MyMarks";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === "ADMIN") return <Navigate to="/admin" />;
  if (user.role === "TEACHER") return <Navigate to="/teacher" />;
  if (user.role === "STUDENT") return <Navigate to="/student" />;
  return <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route
          path="/admin/bulk-upload"
          element={
            <ProtectedRoute role="ADMIN">
              <BulkUpload />
            </ProtectedRoute>
          }

        />

        <Route
          path="/teacher/bulk-marks"
          element={
            <ProtectedRoute role="TEACHER">
              <BulkMarksUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/bulk-attendance"
          element={
            <ProtectedRoute role="TEACHER">
              <BulkAttendanceUpload />
            </ProtectedRoute>
          }
        />





        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/teachers" element={<ProtectedRoute role="ADMIN"><Teachers /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute role="ADMIN"><Students /></ProtectedRoute>} />
        <Route path="/admin/classes" element={<ProtectedRoute role="ADMIN"><Classes /></ProtectedRoute>} />

        {/* Teacher */}
        <Route path="/teacher" element={<ProtectedRoute role="TEACHER"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/classes" element={<ProtectedRoute role="TEACHER"><TeacherClasses /></ProtectedRoute>} />
        <Route path="/teacher/attendance" element={<ProtectedRoute role="TEACHER"><Attendance /></ProtectedRoute>} />
        <Route path="/teacher/marks" element={<ProtectedRoute role="TEACHER"><Marks /></ProtectedRoute>} />

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute role="STUDENT"><MyAttendance /></ProtectedRoute>} />
        <Route path="/student/marks" element={<ProtectedRoute role="STUDENT"><MyMarks /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
