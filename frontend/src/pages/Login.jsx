import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Login() {
    const [email, setEmail] = useState("admin@gmail.com");
    const [password, setPassword] = useState("admin12345");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-gray-800">Welcome Back 👋</h1>
                <p className="text-gray-500 mt-1">Login to continue</p>

                <div className="mt-6 space-y-4">
                    <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button className="w-full" onClick={handleLogin} disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                    Demo: <b>admin@gmail.com / admin123</b>
                </div>
            </div>
        </div>
    );
}
<p className="text-sm text-gray-500 text-center mt-3">
    New admin?{" "}
    <a href="/register" className="text-indigo-600 font-semibold">
        Register
    </a>
</p>

