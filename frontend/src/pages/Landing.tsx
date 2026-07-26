import { useState, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

// ─── Data ───────────────────────────────────────────────────────────────────
const FEATURES: FeatureItem[] = [
  {
    icon: "🎯",
    title: "Smart Job Matching",
    desc: "AI-powered algorithms match your skills and experience to the most relevant opportunities instantly.",
  },
  {
    icon: "⚡",
    title: "One-Click Apply",
    desc: "Apply to multiple positions with a single profile. No repetitive form-filling, ever again.",
  },
  {
    icon: "🌍",
    title: "Remote & Hybrid",
    desc: "Filter by remote-first, hybrid, or on-site — find roles that match your lifestyle, not just your CV.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-500 selection:text-white antialiased">
      {/* Dynamic inline styles for card float animation */}
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-1 {
          animation: floatCard 4s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: floatCard 4s ease-in-out infinite;
          animation-delay: -2s;
        }
      `}</style>

      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
          <a className="flex items-center gap-2.5 no-underline" href="/">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold text-base">S</span>
            </div>
            <span className="font-bold text-xl text-slate-900">
              Smart<span className="text-indigo-600">Hire</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-3">
            <button
              className="px-5 py-2 rounded-full text-sm font-semibold text-indigo-600 border border-indigo-300 bg-white hover:bg-indigo-50 hover:border-indigo-500 transition-colors"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
            <button
              className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/20 active:translate-y-[1px] transition-all"
              onClick={() => navigate("/register")}
            >
              Sign Up Free
            </button>
          </div>
          <button
            className="block md:hidden bg-transparent border-none cursor-pointer p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect y="4" width="22" height="2" rx="1" fill="#334155" />
              <rect y="10" width="22" height="2" rx="1" fill="#334155" />
              <rect y="16" width="22" height="2" rx="1" fill="#334155" />
            </svg>
          </button>
        </div>

        {/* Mobile Nav Menu */}
        {mobileOpen && (
          <div className="md:hidden fixed top-18 left-0 right-0 bg-white p-6 shadow-md z-40 border-b border-slate-200 flex flex-col gap-2">
            <button
              className="w-full py-2.5 rounded-full text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors text-center"
              onClick={() => {
                setMobileOpen(false);
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Features
            </button>
            <button
              className="w-full py-2.5 rounded-full text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors text-center"
              onClick={() => {
                setMobileOpen(false);
                window.location.href = "/login";
              }}
            >
              Browse Jobs
            </button>
            <button
              className="w-full py-2.5 rounded-full text-sm font-semibold text-indigo-600 border border-indigo-300 bg-white hover:bg-indigo-50 hover:border-indigo-500 transition-colors text-center"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
            <button
              className="w-full py-2.5 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all text-center"
              onClick={() => navigate("/register")}
            >
              Sign Up Free
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 relative overflow-hidden flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute rounded-full w-[600px] h-[600px] -top-[200px] -right-[150px] bg-white/[0.04]" />
          <div className="absolute rounded-full w-[400px] h-[400px] -bottom-[100px] -left-[100px] bg-white/[0.03]" />
          <div className="absolute rounded-full w-[200px] h-[200px] top-[30%] left-[20%] bg-white/[0.05]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full">
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-white/85">
                newest jobs posted today
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Find Your <span className="bg-gradient-to-r from-indigo-200 to-blue-200 bg-clip-text text-transparent">Dream Career</span> With Confidence
            </h1>
            <p className="text-base md:text-lg text-white/70 leading-relaxed mb-9 max-w-lg mx-auto lg:mx-0">
              SmartHire's smart
              matching technology finds roles that fit not just your skills, but
              your ambitions.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-8 text-sm text-white/60">
              <span className="mr-1 text-xs text-white/40">Popular:</span>
              {["React Developer", "Product Manager", "Data Scientist", "UX Designer"].map((t) => (
                <span
                  key={t}
                  className="text-xs text-white/70 hover:text-white cursor-pointer transition-colors px-2 py-0.5 rounded bg-white/5 hover:bg-white/10"
                >
                  #{t}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3.5 justify-center lg:justify-start">
              <a
                className="px-7 py-3.5 bg-white text-indigo-700 font-bold rounded-full text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center gap-2"
                href="/register"
              >
                Get Started Free
              </a>
              <a
                className="px-7 py-3.5 bg-white/12 text-white border border-white/30 font-semibold rounded-full text-sm hover:bg-white/20 hover:border-white/50 transition-all flex items-center gap-2"
                href="/login"
              >
                Sign In
              </a>
            </div>
          </div>

          {/* Floating job cards */}
          <div className="hidden lg:block relative max-w-md mx-auto w-full">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-5 shadow-2xl mb-4 animate-float-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-indigo-50 rounded-lg flex items-center justify-center text-xl shrink-0">
                  🏦
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Senior UI/UX Designer</div>
                  <div className="text-xs text-slate-400">
                    Colombo · Sri Lanka
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap mb-3">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">Figma</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Remote</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Full-time</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">LKR 140K – LKR 180K</span>
                <button
                  onClick={() => navigate("/register")}
                  className="text-xs font-semibold px-3.5 py-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-5 shadow-2xl ml-8 animate-float-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-amber-50 rounded-lg flex items-center justify-center text-xl shrink-0">
                  🛒
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Project Manager</div>
                  <div className="text-xs text-slate-400">Galle · Sri Lanka</div>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap mb-3">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">React</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Hybrid</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Leadership</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">LKR 160K – LKR 200K</span>
                <button
                  onClick={() => navigate("/register")}
                  className="text-xs font-semibold px-3.5 py-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-slate-50" id="features">
        <div className="max-w-7xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-wider uppercase text-indigo-600 mb-3">
            Why SmartHire
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            Built for the <span className="text-indigo-600">Modern Job Search</span>
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-lg leading-relaxed mb-12">
            Everything you need to land your next role — smarter, faster, and
            with less stress.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-indigo-100 transition-all"
                key={f.title}
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-5">
                  {f.icon}
                </div>
                <div className="font-bold text-lg text-slate-900 mb-2">{f.title}</div>
                <div className="text-sm text-slate-600 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-900 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute rounded-full w-[400px] h-[400px] -top-[100px] -right-[100px] bg-white/[0.05]" />
          <div className="absolute rounded-full w-[300px] h-[300px] -bottom-[80px] -left-[80px] bg-white/[0.04]" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Your Next Chapter Starts Here
          </h2>
          <p className="text-base md:text-lg text-indigo-100 mb-9 leading-relaxed">
            Join over 2.4 million professionals who've found their perfect role
            through SmartHire. It's free to get started.
          </p>
          <div className="flex gap-3.5 justify-center flex-wrap">
            <a
              href="/register"
              className="px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-full text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Create Free Account
            </a>
            <a
              href="/login"
              className="px-8 py-3.5 bg-transparent text-white border border-white/40 font-semibold rounded-full text-sm hover:bg-white/10 hover:border-white/70 transition-all"
            >
              Already have an account?
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-16 px-6 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">T</span>
                </div>
                <span className="font-bold text-lg text-white">
                  Talent<span className="text-indigo-500">Hub</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mt-3 max-w-[280px]">
                Connecting ambition with opportunity. The modern job platform
                built for the future of work.
              </p>
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-4">
                For Job Seekers
              </div>
              <div className="flex flex-col gap-2.5">
                {["Browse Jobs", "Resume Builder", "Career Advice", "Salary Tools"].map((l) => (
                  <span
                    className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                    key={l}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-4">
                For Employers
              </div>
              <div className="flex flex-col gap-2.5">
                {["Post a Job", "Search Talent", "Pricing", "Hire at Scale"].map((l) => (
                  <span
                    className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                    key={l}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-4">
                Company
              </div>
              <div className="flex flex-col gap-2.5">
                {["About Us", "Blog", "Careers", "Contact"].map((l) => (
                  <span
                    className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                    key={l}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-slate-500">
              © 2025 SmartHire Inc. All rights reserved.
            </span>
            <div className="flex gap-5">
              <a href="#" className="text-xs text-slate-500 hover:text-slate-300">
                Privacy
              </a>
              <a href="#" className="text-xs text-slate-500 hover:text-slate-300">
                Terms
              </a>
              <a href="#" className="text-xs text-slate-500 hover:text-slate-300">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
