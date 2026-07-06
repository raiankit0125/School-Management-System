import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Input from "../components/Input";
import Button from "../components/Button";
import SiteFooter from "../components/SiteFooter";
import { isEmail } from "../utils/formValidation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    if (!isEmail(email)) {
      alert("Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
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
    <div className="app-shell login-shell flex min-h-screen flex-col px-4 py-8">
      <main className="flex flex-1 items-center justify-center">
        <div className="login-card grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.6)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="login-brand-panel register-brand-panel hidden flex-col justify-between p-10 text-white lg:flex">
            <div>
              <div className="brand-logo" aria-hidden="true">
                <span className="brand-logo-mark">SMS</span>
                <span className="brand-logo-ring" />
              </div>
              <p className="mt-7 text-xs uppercase tracking-[0.3em] text-white/70">Admin setup</p>
              <h1 className="mt-4 max-w-md text-5xl font-semibold leading-[1.04]">Launch your management portal</h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
                Create the primary admin account that controls students, faculty, fees, notifications, and daily operations.
              </p>
            </div>

            <div className="smart-image-stage" aria-hidden="true">
              <div className="smart-image-track smart-image-track-alt">
                <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=760&q=80" alt="" />
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=760&q=80" alt="" />
                <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=760&q=80" alt="" />
                <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=760&q=80" alt="" />
              </div>
              <div className="smart-stat-card smart-stat-card-one">
                <span>Admin</span>
                <strong>Complete control</strong>
              </div>
              <div className="smart-stat-card smart-stat-card-two">
                <span>Setup</span>
                <strong>Secure foundation</strong>
              </div>
            </div>
          </div>

          <div className="login-form-panel p-8 sm:p-10">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div className="brand-logo brand-logo-small" aria-hidden="true">
                <span className="brand-logo-mark">SMS</span>
                <span className="brand-logo-ring" />
              </div>
              <div>
                <p className="label text-teal-600/80">Setup</p>
                <h1 className="text-xl font-semibold text-slate-900">Smart Management System</h1>
              </div>
            </div>
            <div>
              <p className="label text-teal-600/80">Register</p>
              <h2 className="mt-2 text-4xl font-semibold leading-tight text-slate-900">Create admin account</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                Set up the owner account for your school management workspace.
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleRegister}>
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
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
      </main>
      <div className="mx-auto w-full max-w-6xl">
        <SiteFooter compact />
      </div>
    </div>
  );
}
