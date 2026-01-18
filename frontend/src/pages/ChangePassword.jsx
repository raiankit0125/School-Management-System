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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white border rounded-2xl shadow p-8 w-full max-w-md">
        <h2 className="text-xl font-bold">Change Password</h2>
        <p className="text-gray-500 text-sm mt-1">
          This is required on first login.
        </p>

        <div className="mt-6 space-y-4">
          <Input label="Old Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

          <Button className="w-full" onClick={handleChange} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
