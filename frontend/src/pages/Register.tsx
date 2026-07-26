import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

function getPasswordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return { score, label: pw ? labels[score] || "Weak" : "" };
}

function getBarClass(barIndex: number, score: number): string {
  if (score === 0 || barIndex >= score) return "bg-slate-200";
  if (score === 1) return "bg-rose-500";
  if (score === 2) return "bg-amber-500";
  if (score === 3) return "bg-indigo-500";
  return "bg-emerald-500";
}

function getLabelColorClass(label: string): string {
  switch (label.toLowerCase()) {
    case "weak":
      return "text-rose-500";
    case "fair":
      return "text-amber-500";
    case "good":
      return "text-indigo-500";
    case "strong":
      return "text-emerald-500";
    default:
      return "text-slate-400";
  }
}

interface RegForm {
  role: "seeker" | "employer";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegForm>({
    role: "seeker",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = <K extends keyof RegForm>(field: K, value: RegForm[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    if (!form.firstName.trim()) {
      toast.error("First name is required.");
      return false;
    }
    if (!form.lastName.trim()) {
      toast.error("Last name is required.");
      return false;
    }
    if (!form.email.trim()) {
      toast.error("Email is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Enter a valid email.");
      return false;
    }
    if (!form.password) {
      toast.error("Password is required.");
      return false;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return false;
    }
    if (!form.confirmPassword) {
      toast.error("Please confirm your password.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match.");
      return false;
    }
    if (!form.terms) {
      toast.error("You must accept the terms to continue.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success("Account created successfully! Redirecting...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration request error:", error);
      toast.error("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Mobile nav */}
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
          href="/login"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Sign In →
        </a>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute rounded-full w-[520px] h-[520px] -top-[180px] -right-[180px] bg-white/[0.04]" />
            <div className="absolute rounded-full w-[380px] h-[380px] -bottom-[120px] -left-[100px] bg-white/[0.03]" />
            <div className="absolute rounded-full w-[180px] h-[180px] top-[40%] left-[25%] bg-white/[0.05]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:52px_52px]" />
          </div>
          <div className="relative z-10">
            <a className="flex items-center gap-2.5 no-underline mb-16" href="/">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-white">SmartHire</span>
            </a>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
              Start your journey <br />
              to <span className="text-indigo-300">the perfect role</span>
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mb-10">
              Creating your free account takes under 2 minutes. No credit card
              required.
            </p>
            <div className="flex flex-col gap-5">
              {[
                { n: "01", title: "Create your profile" },
                { n: "02", title: "Get matched instantly" },
                { n: "03", title: "Apply with one click" },
                { n: "04", title: "Land your dream job" },
              ].map((s) => (
                <div className="flex items-start gap-3.5" key={s.n}>
                  <div className="w-8 h-8 rounded-lg bg-white/12 border border-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {s.n}
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm font-semibold text-white">{s.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs text-white/40 font-light">
              Free forever. No credit card. Cancel anytime.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="overflow-y-auto flex items-start justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-[480px] pb-8">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2">
              Create your account
            </h1>
            <p className="text-sm text-slate-500 mb-7 leading-relaxed">
              Find your next career move and apply today.
            </p>

            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none transition-all placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Jane"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none transition-all placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Smith"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full px-3.5 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none transition-all placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full px-3.5 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none transition-all placeholder-slate-400 pr-12 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors p-0.5"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded transition-colors ${getBarClass(i, pwStrength.score)}`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${getLabelColorClass(pwStrength.label)}`}>
                    {pwStrength.label} password
                  </span>
                </div>
              )}
              {!form.password && (
                <div className="text-xs text-slate-400 mt-1">
                  At least 8 characters, mix of letters, numbers & symbols.
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  className="w-full px-3.5 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none transition-all placeholder-slate-400 pr-12 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors p-0.5"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                >
                  {showConfirmPw ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword === form.password && (
                <div className="text-xs text-emerald-600 mt-1">
                  ✓ Passwords match
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => update("terms", e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer mt-0.5 shrink-0"
              />
              <span className="text-xs text-slate-600 leading-normal">
                I agree to SmartHire's{" "}
                <a href="#" className="text-indigo-600 font-semibold hover:underline">Terms of Service</a> and{" "}
                <a href="#" className="text-indigo-600 font-semibold hover:underline">Privacy Policy</a>. I consent to receiving
                career-related emails.
              </span>
            </label>

            {/* Submit */}
            <button
              className="w-full py-3.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/35 transition-all disabled:opacity-65 disabled:cursor-not-allowed mt-2 flex items-center justify-center"
              onClick={handleSubmit}
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <span className="w-[17px] h-[17px] border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
                  Creating your account…
                </>
              ) : success ? (
                "Account Created! ✓"
              ) : (
                "Create Account →"
              )}
            </button>

            <div className="text-center mt-6 text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
                onClick={() => {
                  window.location.href = "/login";
                }}
              >
                Sign in here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
