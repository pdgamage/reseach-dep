import { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Trash2,
} from 'lucide-react';
import { Job } from '../data/mockData';
import { JobCard } from '../components/JobCard';
import toast from 'react-hot-toast';

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .cj-root { font-family: 'Poppins', sans-serif; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }

  .cj-fade { animation: fadeIn 0.3s ease forwards; }

  .cj-shimmer {
    background: linear-gradient(90deg, #f0f2f5 25%, #fafafa 50%, #f0f2f5 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s ease infinite;
  }

  .cj-stat-card {
    background: #fff;
    border: 1px solid #e8eaed;
    border-radius: 14px;
    padding: 20px 24px;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .cj-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(79, 70, 229, 0.08);
    border-color: #cbd5e1;
  }

  .cj-input:focus {
    outline: none;
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
  }
`;

export function ClosedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete popup state
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('smarthire_token');
        const res = await fetch('/api/jobs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data);
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load jobs from database');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    const targetId = (jobToDelete.id || (jobToDelete as any)._id) as string;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem('smarthire_token');
      const res = await fetch(`/api/jobs/${targetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete job');
      const data = await res.json();

      setJobs((prev) => prev.filter((j) => (j.id || (j as any)._id) !== targetId));
      toast.success(`Job deleted along with ${data.deletedApplications || 0} applicant record(s).`);
      setJobToDelete(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  const closedJobs = jobs.filter((job) => {
    const isClosed = job.status === 'Closed';
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    return isClosed && matchesSearch;
  });

  const totalClosedJobs = closedJobs.length;
  const totalCVsInClosed = closedJobs.reduce((acc, job) => acc + (job.cvCount || 0), 0);
  const completedJobsCount = closedJobs.filter((job) => job.status === 'Closed').length;

  if (loading) {
    return (
      <>
        <style>{pageStyles}</style>
        <div className="cj-root" style={{ background: '#f9fbfb', minHeight: '100vh', padding: '36px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="cj-shimmer" style={{ height: '40px', width: '220px', borderRadius: '8px', marginBottom: '32px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="cj-shimmer" style={{ height: '100px', borderRadius: '14px' }} />
              ))}
            </div>
            <div className="cj-shimmer" style={{ height: '300px', borderRadius: '14px' }} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{pageStyles}</style>
      <div className="cj-root" style={{ background: '#f9fbfb', minHeight: '100vh', padding: '36px 24px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div className="cj-fade" style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Closed Jobs
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', margin: 0 }}>
              Review applicant profiles and view AI shortlisting scores for completed and closed vacancies.
            </p>
          </div>

          

          {/* List Card Container */}
          <div className="cj-fade" style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', animationDelay: '80ms' }}>
            
            {/* Header + Search */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8eaed', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Closed Job Listings</h2>

              <div style={{ position: 'relative', width: '260px' }}>
                <Search style={{ width: '16px', height: '16px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search closed jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="cj-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            {/* Grid */}
            <div style={{ padding: '24px', background: '#fafafa' }}>
              {closedJobs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {closedJobs.map((job) => (
                    <JobCard
                      key={job.id || (job as any)._id}
                      job={job}
                      onDelete={(selectedJob) => setJobToDelete(selectedJob)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ width: '56px', height: '56px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#4f46e5' }}>
                    <Briefcase style={{ width: '26px', height: '26px' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>No closed jobs found</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    There are no jobs that match the closed status or deadline criteria.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Simple, Compact Warning Popup */}
      {jobToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => !isDeleting && setJobToDelete(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '380px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              textAlign: 'center',
              animation: 'popIn 0.18s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            

            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              Delete Job Post?
            </h3>

            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong style={{ color: '#0f172a' }}>"{jobToDelete.title}"</strong>? All associated applicant details and CVs will be permanently removed.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteJob}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  background: isDeleting ? '#94a3b8' : '#dc2626',
                  color: '#fff',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {isDeleting ? 'Deleting...' : (
                  <>
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
