import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, KeyRound, Lock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import AuthLayout from "./AuthLayout";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [passwords, setPasswords] = useState({ newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const requestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, idx) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Enter the full 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email, otp: code });
      toast.success("OTP verified");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp: otp.join(""),
        newPassword: passwords.newPassword,
      });
      toast.success("Password reset! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? "Forgot password?" : step === 2 ? "Verify OTP" : "Set new password"}
      subtitle={
        step === 1
          ? "Enter your email and we'll send you a reset code"
          : step === 2
          ? `We sent a 6-digit code to ${email}`
          : "Choose a strong new password"
      }
    >
      {step === 1 && (
        <form onSubmit={requestOtp} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                placeholder="you@company.com"
                className="input !pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyOtp} className="space-y-5">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, idx)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !digit && idx > 0) inputsRef.current[idx - 1]?.focus();
                }}
                maxLength={1}
                className="input text-center text-lg font-semibold w-full h-12"
              />
            ))}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <KeyRound size={16} /> {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <button
            type="button"
            onClick={requestOtp}
            className="text-xs text-primary font-medium hover:underline block text-center w-full"
          >
            Resend OTP
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={resetPassword} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="input !pl-10"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
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
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-primary mt-6">
        <ArrowLeft size={14} /> Back to login
      </Link>
    </AuthLayout>
  );
};

export default ForgotPassword;
