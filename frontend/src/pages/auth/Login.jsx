import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your inventory dashboard">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              placeholder="you@company.com"
              className="input !pl-10"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPass ? "text" : "password"}
              required
              placeholder="••••••••"
              className="input !pl-10 !pr-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          <LogIn size={16} /> {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="text-xs text-center text-gray-400 bg-canvas rounded-lg p-2.5 border border-border">
          Demo: <span className="font-medium text-gray-600">admin@stocksense.app</span> / admin123
        </div>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
