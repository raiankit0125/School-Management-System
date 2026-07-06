import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import ChangePassword from "./pages/ChangePassword";
import PublicInfoPage from "./pages/public/PublicInfoPage";
import BulkUpload from "./pages/admin/BulkUpload";
import BulkMarksUpload from "./pages/teacher/BulkMarksUpload";
import BulkAttendanceUpload from "./pages/teacher/BulkAttendanceUpload";
import ChatCenter from "./pages/shared/ChatCenter";
import CalendarPage from "./pages/shared/CalendarPage";



// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import Teachers from "./pages/admin/Teachers";
import Students from "./pages/admin/Students";
import Classes from "./pages/admin/Classes";
import AdminNotifications from "./pages/admin/AdminNotifications";
import FeeManagement from "./pages/admin/FeeManagement";

// Teacher
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import Attendance from "./pages/teacher/Attendance";
import Marks from "./pages/teacher/Marks";
import TeacherNotices from "./pages/teacher/Notices";
import TeacherNotifications from "./pages/teacher/TeacherNotifications";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import MyAttendance from "./pages/student/MyAttendance";
import MyMarks from "./pages/student/MyMarks";
import StudentNotices from "./pages/student/Notices";
import MyFees from "./pages/student/MyFees";

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
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<PublicInfoPage type="about" />} />
        <Route path="/contact" element={<PublicInfoPage type="contact" />} />
        <Route path="/privacy" element={<PublicInfoPage type="privacy" />} />
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
        <Route path="/admin/fees" element={<ProtectedRoute role="ADMIN"><FeeManagement /></ProtectedRoute>} />
        <Route path="/admin/classes" element={<ProtectedRoute role="ADMIN"><Classes /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute role="ADMIN"><AdminNotifications /></ProtectedRoute>} />
        <Route path="/admin/calendar" element={<ProtectedRoute role="ADMIN"><CalendarPage /></ProtectedRoute>} />
        <Route path="/admin/chat" element={<ProtectedRoute role="ADMIN"><ChatCenter /></ProtectedRoute>} />

        {/* Teacher */}
        <Route path="/teacher" element={<ProtectedRoute role="TEACHER"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/classes" element={<ProtectedRoute role="TEACHER"><TeacherClasses /></ProtectedRoute>} />
        <Route path="/teacher/attendance" element={<ProtectedRoute role="TEACHER"><Attendance /></ProtectedRoute>} />
        <Route path="/teacher/marks" element={<ProtectedRoute role="TEACHER"><Marks /></ProtectedRoute>} />
        <Route path="/teacher/notices" element={<ProtectedRoute role="TEACHER"><TeacherNotices /></ProtectedRoute>} />
        <Route path="/teacher/notifications" element={<ProtectedRoute role="TEACHER"><TeacherNotifications /></ProtectedRoute>} />
        <Route path="/teacher/calendar" element={<ProtectedRoute role="TEACHER"><CalendarPage /></ProtectedRoute>} />
        <Route path="/teacher/chat" element={<ProtectedRoute role="TEACHER"><ChatCenter /></ProtectedRoute>} />

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute role="STUDENT"><MyAttendance /></ProtectedRoute>} />
        <Route path="/student/marks" element={<ProtectedRoute role="STUDENT"><MyMarks /></ProtectedRoute>} />
        <Route path="/student/fees" element={<ProtectedRoute role="STUDENT"><MyFees /></ProtectedRoute>} />
        <Route path="/student/notices" element={<ProtectedRoute role="STUDENT"><StudentNotices /></ProtectedRoute>} />
        <Route path="/student/calendar" element={<ProtectedRoute role="STUDENT"><CalendarPage /></ProtectedRoute>} />
        <Route path="/student/chat" element={<ProtectedRoute role="STUDENT"><ChatCenter /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}
