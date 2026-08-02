import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
} from 'lucide-react';
import { Job, JobStatus } from '../data/mockData';
import { JobCard } from '../components/JobCard';
import toast from 'react-hot-toast';

/* ─── Styles matching Poppins & modern clean theme ──────────────────────── */
const dashboardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .hr-root { font-family: 'Poppins', sans-serif; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }

  .hr-fade { animation: fadeIn 0.3s ease forwards; }

  .hr-shimmer {
    background: linear-gradient(90deg, #f0f2f5 25%, #fafafa 50%, #f0f2f5 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s ease infinite;
  }

  .hr-stat-card {
    background: #fff;
    border: 1px solid #e8eaed;
    border-radius: 14px;
    padding: 20px 24px;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .hr-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(79, 70, 229, 0.08);
    border-color: #cbd5e1;
  }

  .hr-create-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #4f46e5;
    color: #fff;
    padding: 10px 22px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
    white-space: nowrap;
  }
  .hr-create-btn:hover {
    background: #4338ca;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
  }

  .hr-input:focus {
    outline: none;
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
  }
`;

export function HRDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ totalJobs: 0, openJobs: 0, totalCVs: 0, shortlisted: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'All'>('All');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('smarthire_token');
        const headers = { Authorization: `Bearer ${token}` };

        const [jobsRes, statsRes] = await Promise.all([
          fetch('/api/jobs', { headers }),
          fetch('/api/dashboard/stats', { headers }),
        ]);

        if (!jobsRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const jobsData = await jobsRes.json();
        const statsData = await statsRes.json();

        setJobs(jobsData);
        setStats(statsData);
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getEffectiveStatus = (job: Job): JobStatus => {
    const isPastClosing = new Date(job.closingDate).getTime() <= Date.now();
    if (isPastClosing && job.status === 'Open') {
      return (job.cvCount || 0) > 0 ? 'Processing' : 'Closed';
    }
    return job.status;
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const effectiveStatus = getEffectiveStatus(job);
    const matchesStatus = statusFilter === 'All' || effectiveStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('smarthire_token');
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete job');
      const data = await res.json();
      setJobs((prev) => prev.filter((j) => (j.id || (j as any)._id) !== jobId));
      toast.success(`Job deleted. ${data.deletedApplications} application(s) removed.`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete job');
    }
  };

  /* ── Loading Skeleton ── */
  if (loading) {
    return (
      <>
        <style>{dashboardStyles}</style>
        <div className="hr-root" style={{ background: '#f9fbfb', minHeight: '100vh', padding: '36px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="hr-shimmer" style={{ height: '40px', width: '220px', borderRadius: '8px', marginBottom: '32px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="hr-shimmer" style={{ height: '100px', borderRadius: '14px' }} />
              ))}
            </div>
            <div className="hr-shimmer" style={{ height: '300px', borderRadius: '14px' }} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{dashboardStyles}</style>
      <div className="hr-root" style={{ background: '#f9fbfb', minHeight: '100vh', padding: '36px 24px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* ══════════ PAGE HEADER ══════════ */}
          <div className="hr-fade" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '32px' }}>
            <div>
              
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                HR Dashboard
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', margin: 0 }}>
               
              </p>
            </div>

            <Link to="/jobs/create" className="hr-create-btn">
              <Plus style={{ width: '18px', height: '18px' }} />
               New Job
            </Link>
          </div>

          {/* ══════════ STAT CARDS ══════════ */}
          <div className="hr-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px', marginBottom: '32px', animationDelay: '40ms' }}>
            
            {/* Stat 1: Total Jobs */}
            <div className="hr-stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Total Jobs</p>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stats.totalJobs}</h3>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                <Briefcase style={{ width: '22px', height: '22px' }} />
              </div>
            </div>

            {/* Stat 2: Open Jobs */}
            <div className="hr-stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Open Jobs</p>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stats.openJobs}</h3>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <Clock style={{ width: '22px', height: '22px' }} />
              </div>
            </div>

            {/* Stat 3: CVs Received */}
            <div className="hr-stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>CVs Received</p>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    
                  </span>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stats.totalCVs}</h3>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Users style={{ width: '22px', height: '22px' }} />
              </div>
            </div>

            {/* Stat 4: Shortlisted */}
            <div className="hr-stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Shortlisted</p>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stats.shortlisted}</h3>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                <CheckCircle style={{ width: '22px', height: '22px' }} />
              </div>
            </div>

          </div>

          {/* ══════════ JOB POSTS SECTION ══════════ */}
          <div className="hr-fade" style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', animationDelay: '80ms' }}>
            
            {/* Header + Search/Filter Controls */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8eaed', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Job Posts</h2>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#4f46e5', background: '#eef2ff', padding: '2px 10px', borderRadius: '12px' }}>
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                </span>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
                
                {/* Search Input */}
                <div style={{ position: 'relative', width: '240px' }}>
                  <Search style={{ width: '16px', height: '16px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="hr-input"
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '13px',
                      color: '#0f172a',
                      fontFamily: 'inherit',
                      fontWeight: 500,
                      background: '#fff',
                    }}
                  />
                </div>

                {/* Status Select Filter */}
                <div style={{ position: 'relative' }}>
                  <Filter style={{ width: '15px', height: '15px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="hr-input"
                    style={{
                      padding: '8px 32px 8px 34px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#334155',
                      fontFamily: 'inherit',
                      background: '#fff',
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="Processing">Processing</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Content / Cards Grid */}
            <div style={{ padding: '24px', background: '#fafafa' }}>
              {filteredJobs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ width: '56px', height: '56px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#4f46e5' }}>
                    <Briefcase style={{ width: '26px', height: '26px' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>No jobs found</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Try adjusting your search query or status filter.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </>
  );
}