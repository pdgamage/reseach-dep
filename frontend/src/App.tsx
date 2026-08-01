import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
// Components
import { Sidebar } from "./components/Sidebar";
import { TopNavbar } from "./components/TopNavbar";
// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import { HRDashboard } from "./pages/HRDashboard";
import { CreateJob } from "./pages/CreateJob";
import { ClosedJobs } from "./pages/ClosedJobs";
import { JobDetails } from "./pages/JobDetails";
import { ApplicantJobList } from "./pages/ApplicantJobList";
import { ApplyJob } from "./pages/ApplyJob";
import { ShortlistResults } from "./pages/ShortlistResults";
import Landing from "./pages/Landing";
import { InterviewSchedule } from "./pages/InterviewSchedule";
import { CVSearch } from "./pages/CVSearch";
// Layouts
const HRLayout = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "hr") return <Navigate to="/jobs" replace />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300 overflow-hidden`}>
        <TopNavbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
const ApplicantLayout = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "applicant") return <Navigate to="/dashboard" replace />;
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden flex-col">
      <TopNavbar isApplicantView={true} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
const AuthLayout = () => {
  const { user } = useAuth();
  if (user) {
    return (
      <Navigate to={user.role === "hr" ? "/dashboard" : "/jobs"} replace />
    );
  }
  return <Outlet />;
};
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "978800458477-nvou1vdnql9fcar6eaikr88ali9b5djd.apps.googleusercontent.com";

export function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* HR Routes */}
          <Route element={<HRLayout />}>
            <Route path="/dashboard" element={<HRDashboard />} />
            <Route path="/search-cvs" element={<CVSearch />} />
            <Route path="/jobs/closed" element={<ClosedJobs />} />
            <Route path="/jobs/create" element={<CreateJob />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/results/:jobId" element={<ShortlistResults />} />
            <Route path="/schedule-interview" element={<InterviewSchedule />} />
          </Route>

          {/* Applicant Routes */}
          <Route element={<ApplicantLayout />}>
            <Route path="/jobs" element={<ApplicantJobList />} />
            <Route path="/jobs/:id/apply" element={<ApplyJob />} />
          </Route>

          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}
