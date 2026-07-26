import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface FormState {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    if (!form.email.trim()) {
      toast.error("Email address is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!form.password) {
      toast.error("Password is required.");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success("Login successful! Redirecting...");
        // Save auth data in context
        login(data.user, data.token);
        
        // Wait a brief moment to show success message before navigating
        setTimeout(() => {
          if (data.user.role === "hr") {
            navigate("/dashboard");
          } else {
            navigate("/jobs");
          }
        }, 1000);
      } else {
        toast.error(data.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login request error:", error);
      toast.error("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Mobile top bar */}
      <div className="flex lg:hidden items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <a className="flex items-center gap-2 no-underline" href="/">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">S</span>
          </div>
          <span className="font-bold text-base text-slate-900">
            Smart<em className="text-indigo-600 not-italic">Hire</em>
          </span>
        </a>
        <a
          href="/register"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Sign Up →
        </a>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT PANEL */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute rounded-full w-[500px] h-[500px] -top-[150px] -right-[150px] bg-white/[0.04]" />
            <div className="absolute rounded-full w-[350px] h-[350px] -bottom-[100px] -left-[100px] bg-white/[0.03]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>
          <div className="relative z-10">
            <a className="flex items-center gap-2.5 no-underline mb-16" href="/">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-white">SmartHire</span>
            </a>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
              Welcome back to <br />
              <span className="text-indigo-300">your career journey</span>
            </h2>
            <p className="text-base text-white/60 leading-relaxed mb-10">
              Sign in to access thousands of curated job opportunities matched
              perfectly to your profile.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: "🎯", text: "Smart job matching" },
                { icon: "⚡", text: "One-click apply" },
                { icon: "🏢", text: "Remote & Hybrid Opportunities" },
              ].map((f) => (
                <div className="flex items-center gap-3" key={f.text}>
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-base shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-sm text-white/80 font-medium">
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-[440px]">
            <div className="mb-9">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2">
                Sign in to SmartHire
              </h1>
              <p className="text-sm lg:text-base text-slate-500 leading-relaxed">
                Enter your credentials to access your account and continue your
                job search.
              </p>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none transition-all placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none transition-all placeholder-slate-400 pr-12 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-0.5"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Options row */}
            <div className="flex items-center justify-between mb-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => update("remember", e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <span className="text-xs text-slate-600">Remember me for 30 days</span>
              </label>
              <button
                type="button"
                className="bg-transparent border-none text-indigo-600 text-xs font-semibold cursor-pointer hover:text-indigo-800 hover:underline transition-colors"
                onClick={() => alert("Password reset flow would go here.")}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/35 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center"
              onClick={handleSubmit}
              disabled={loading || success}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing you in…
                </span>
              ) : success ? (
                "Redirecting…"
              ) : (
                "Sign In to SmartHire"
              )}
            </button>

            {/* Switch to register */}
            <div className="text-center mt-6 text-sm text-slate-500">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
                onClick={() => {
                  window.location.href = "/register";
                }}
              >
                Create one free →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
