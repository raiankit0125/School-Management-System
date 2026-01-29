import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Input from "../components/Input";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = async () => {
    try {
      setLoading(true);
      await axiosInstance.post("/user/change-password", { oldPassword, newPassword });

      alert("Password changed ✅ Now continue");
      // After change password -> redirect based on role
      if (user.role === "ADMIN") navigate("/admin");
      if (user.role === "TEACHER") navigate("/teacher");
      if (user.role === "STUDENT") navigate("/student");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-xl p-8 sm:p-10">
        <p className="label text-teal-600/80">Security check</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Change password</h2>
        <p className="text-slate-500 text-sm mt-2">
          For security, update your password before continuing.
        </p>

        <div className="mt-6 space-y-4">
          <Input
            label="Old Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />

          <Button className="w-full" onClick={handleChange} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
