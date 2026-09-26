import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start managing your inventory in minutes">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              required
              placeholder="Sahil Panchal"
              className="input !pl-10"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>
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
          <label className="label">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="input !pl-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              required
              placeholder="Re-enter password"
              className="input !pl-10"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          <UserPlus size={16} /> {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;
