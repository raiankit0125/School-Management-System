import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Register() {
  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setLoading(true);

      await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
        role: "ADMIN",   // ✅ fixed admin role
      });

      alert("Admin Registered ✅ Now login");
      navigate("/login");
    } catch (err) {
      alert(err?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800">Create Admin 👑</h1>
        <p className="text-gray-500 mt-1">Register admin account</p>

        <div className="mt-6 space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button className="w-full" onClick={handleRegister} disabled={loading}>
            {loading ? "Creating..." : "Register Admin"}
          </Button>

          <p className="text-sm text-gray-500 text-center">
            Already have admin?{" "}
            <Link className="text-indigo-600 font-semibold" to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
