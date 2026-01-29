import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Login() {
    const [email, setEmail] = useState("admin@gmail.com");
    const [password, setPassword] = useState("admin123");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
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
            alert(err?.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell flex items-center justify-center px-4 py-10">
            <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.6)] lg:grid-cols-2">
                <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-10 text-white">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Welcome</p>
                        <h1 className="mt-4 text-3xl font-semibold">Smart School Suite</h1>
                        <p className="mt-3 text-sm text-white/70">
                            Track attendance, manage classes, and keep everything in one place.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                        Demo credentials: <span className="font-semibold">admin@gmail.com / admin123</span>
                    </div>
                </div>

                <div className="p-8 sm:p-10">
                    <div>
                        <p className="label text-teal-600/80">Sign in</p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Use your admin, teacher, or student credentials to continue.
                        </p>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleLogin}>
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
                            autoComplete="current-password"
                        />

                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </form>

                    <div className="mt-4 text-xs text-slate-500 lg:hidden">
                        Demo: <span className="font-semibold">admin@gmail.com / admin123</span>
                    </div>

                    <p className="text-sm text-slate-500 mt-5">
                        New admin?{" "}
                        <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

