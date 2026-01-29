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

  const handleRegister = async (e) => {
    e.preventDefault();
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
    <div className="app-shell flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.6)] lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-600 p-10 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Admin setup</p>
            <h1 className="mt-4 text-3xl font-semibold">Create the first admin</h1>
            <p className="mt-3 text-sm text-white/80">
              This account unlocks dashboards, uploads, and staff management.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white/90">
            Tip: Use a secure password and keep it safe.
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div>
            <p className="label text-teal-600/80">Register</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create admin account</h2>
            <p className="mt-2 text-sm text-slate-500">Only the first admin can be created here.</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleRegister}>
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <Input
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Register Admin"}
            </Button>

            <p className="text-sm text-slate-500">
              Already have admin?{" "}
              <Link className="font-semibold text-teal-600 hover:text-teal-700" to="/login">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
