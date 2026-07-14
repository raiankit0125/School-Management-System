import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import SiteFooter from "../components/SiteFooter";
import { isEmail } from "../utils/formValidation";
import { API_ORIGIN, HAS_PLACEHOLDER_API_URL } from "../config/apiConfig";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        if (HAS_PLACEHOLDER_API_URL) {
            const message = "Mobile API URL is still a placeholder. Set frontend/.env.mobile to your real Render backend URL, then rebuild and reinstall the APK.";
            setError(message);
            alert(message);
            return;
        }
        if (!isEmail(email)) {
            alert("Enter a valid email address");
            return;
        }
        if (!password.trim()) {
            alert("Password is required");
            return;
        }
        try {
            setLoading(true);
            const res = await axiosInstance.post("/auth/login", { email, password });
            const mustChangePassword = res.data.data.user.mustChangePassword;
    if (mustChangePassword) {
      // token bhi store karna zaroori hai
      login({
        token: res.data.data.token,
        role: res.data.data.user.role,
        name: res.data.data.user.name,
      });

      navigate("/change-password");
      return;
    }

            login({
                token: res.data.data.token,
                role: res.data.data.user.role,
                name: res.data.data.user.name,
            });

            const role = res.data.data.user.role;
            if (role === "ADMIN") navigate("/admin");
            if (role === "TEACHER") navigate("/teacher");
            if (role === "STUDENT") navigate("/student");
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                (err?.request
                    ? `Cannot reach backend at ${API_ORIGIN}. Check .env.mobile, Render service, and CORS.`
                    : "Login failed");
            setError(message);
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell login-shell flex min-h-screen flex-col px-4 py-8">
          <main className="flex flex-1 items-center justify-center">
            <div className="login-card grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.6)] lg:grid-cols-[1.05fr_0.95fr]">
                <div className="login-brand-panel hidden flex-col justify-between p-10 text-white lg:flex">
                    <div>
                        <div className="brand-logo" aria-hidden="true">
                            <span className="brand-logo-mark">SMS</span>
                            <span className="brand-logo-ring" />
                        </div>
                        <p className="mt-7 text-xs uppercase tracking-[0.3em] text-white/65">Welcome</p>
                        <h1 className="mt-4 max-w-md text-5xl font-semibold leading-[1.04]">Smart Management System</h1>
                        <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
                            A cleaner command center for attendance, classes, fees, messages, and student progress.
                        </p>
                    </div>

                    <div className="smart-image-stage" aria-hidden="true">
                        <div className="smart-image-track">
                            <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=760&q=80" alt="" />
                            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=760&q=80" alt="" />
                            <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=760&q=80" alt="" />
                            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=760&q=80" alt="" />
                        </div>
                        <div className="smart-stat-card smart-stat-card-one">
                            <span>Live</span>
                            <strong>Role based access</strong>
                        </div>
                        <div className="smart-stat-card smart-stat-card-two">
                            <span>Unified</span>
                            <strong>Fees & academics</strong>
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
                            <p className="label text-teal-600/80">Portal</p>
                            <h1 className="text-xl font-semibold text-slate-900">Smart Management System</h1>
                        </div>
                    </div>
                    <div>
                        <p className="label text-teal-600/80">Sign in</p>
                        <h2 className="mt-2 text-4xl font-semibold leading-tight text-slate-900">
                            Welcome back
                        </h2>
                        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                            Continue to your workspace with a secure admin, faculty, or student account.
                        </p>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                        {error ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                                {error}
                            </div>
                        ) : null}
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
                            autoComplete="current-password"
                            required
                        />

                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </form>

                    <p className="mt-5 text-sm text-slate-500">
                        New admin?{" "}
                        <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
          </main>
          <div className="mx-auto w-full max-w-6xl">
            <SiteFooter compact />
          </div>
        </div>
    );
}

