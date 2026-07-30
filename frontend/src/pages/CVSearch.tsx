import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Award,
  Briefcase,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Eye,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StatusHistoryItem {
  status: string;
  updatedBy: string;
  updatedAt: string;
  comment: string;
}

interface Application {
  id: string;
  _id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  fileName: string;
  cvUrl: string;
  status: 'Pending' | 'Shortlisted' | 'Rejected';
  matchScore?: number;
  skills?: string[];
  skillsMatched?: string[];
  roles?: string[];
  education?: string[];
  rawText?: string;
  statusHistory?: StatusHistoryItem[];
  createdAt: string;
}

interface Job {
  id: string;
  _id: string;
  title: string;
  description?: string;
  skills?: string[];
  minEducation?: string;
  minExperience?: number;
  location?: string;
  type?: string;
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .cvs-root { font-family: 'Poppins', sans-serif; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }

  .cvs-fade { animation: fadeIn 0.3s ease forwards; }

  .cvs-shimmer {
    background: linear-gradient(90deg, #f0f2f5 25%, #fafafa 50%, #f0f2f5 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s ease infinite;
  }

  .cvs-input {
    width: 100%;
    padding: 9px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 13px;
    color: #0f172a;
    background: #fff;
    font-family: inherit;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .cvs-input:focus {
    outline: none;
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
  }
`;

export function CVSearch() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  // Search filter states
  const [query, setQuery] = useState('');
  const [skills, setSkills] = useState('');
  const [roles, setRoles] = useState('');
  const [minScore, setMinScore] = useState<number>(0);
  const [status, setStatus] = useState<string>('All');

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const getJobTitle = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId || j._id === jobId);
    return job ? job.title : `Job #${jobId}`;
  };

  const handleOpenJobModal = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const job = jobs.find((j) => j.id === jobId || j._id === jobId);
    if (job) {
      setSelectedJob(job);
    } else {
      toast.error('Job details not found');
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('smarthire_token');
      const res = await fetch('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const executeSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('smarthire_token');
      const params = new URLSearchParams();
      if (query.trim()) params.append('query', query.trim());
      if (skills.trim()) params.append('skills', skills.trim());
      if (roles.trim()) params.append('roles', roles.trim());
      if (minScore > 0) params.append('minScore', minScore.toString());
      if (status !== 'All') params.append('status', status);

      const res = await fetch(`/api/applications/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Search request failed');
      const data: Application[] = await res.json();
      
      // Sort candidates by matched skills count & match score descending
      const sorted = [...data].sort((a, b) => {
        const matchedA = (a.skillsMatched || []).length;
        const matchedB = (b.skillsMatched || []).length;
        if (matchedB !== matchedA) return matchedB - matchedA;
        return (b.matchScore || 0) - (a.matchScore || 0);
      });

      setApplications(sorted);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to fetch applications matching search criteria');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setSkills('');
    setRoles('');
    setMinScore(0);
    setStatus('All');
    setApplications([]);
    setTimeout(() => executeSearch(), 50);
  };

  useEffect(() => {
    fetchJobs();
    executeSearch();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
    if (score >= 70) return 'text-indigo-700 bg-indigo-50 border border-indigo-200';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border border-amber-200';
    return 'text-rose-700 bg-rose-50 border border-rose-200';
  };

  const getStatusIcon = (statusName: string) => {
    switch (statusName) {
      case 'Shortlisted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const formatSkillsList = (list?: string[]): string[] => {
    if (!list || !Array.isArray(list)) return [];
    const res: string[] = [];
    const junkPatterns = [
      'non-related referees',
      'team player',
      'communication management',
      'problem solving creativity',
      'referees',
      'soft skills',
    ];

    list.forEach((item) => {
      if (typeof item === 'string') {
        const parts = item.split(/[,;\n]/).map((p) => p.trim()).filter(Boolean);
        parts.forEach((p) => {
          const lower = p.toLowerCase();
          if (p.length <= 35 && !junkPatterns.some((junk) => lower.includes(junk))) {
            res.push(p);
          }
        });
      }
    });

    const seen = new Set<string>();
    return res.filter((s) => {
      const lower = s.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  };

  const formatRolesList = (roles?: string[]): string[] => {
    if (!roles || !Array.isArray(roles)) return [];
    const cleanRoles = roles
      .filter((r) => typeof r === 'string' && r.trim().length > 0)
      .map((r) => r.trim());

    const seen = new Set<string>();
    return cleanRoles.filter((r) => {
      const lower = r.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleUpdateStatus = async (appId: string, newStatus: 'Shortlisted' | 'Rejected' | 'Pending') => {
    try {
      const token = localStorage.getItem('smarthire_token');
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          comment: `Status manually updated by HR from CV Search.`,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      const updated = await res.json();
      toast.success(`Application updated to ${newStatus}`);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId || app._id === appId ? updated : app))
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="cvs-root" style={{ background: '#f9fbfb', minHeight: '100vh', padding: '36px 24px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div className="cvs-fade" style={{ marginBottom: '28px' }}>
            
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              CV Search Engine
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', margin: 0 }}>
              Perform multi-criterion semantic searches across candidate resume profiles.
            </p>
          </div>

          {/* Filter Card */}
          <div
            className="cvs-fade"
            style={{
              background: '#fff',
              border: '1px solid #e8eaed',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '28px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              animationDelay: '40ms',
            }}
          >
            <form onSubmit={executeSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
              
              {/* Keyword search */}
              <div className="lg:col-span-4">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Keyword Search
                </label>
                <div style={{ position: 'relative' }}>
                  <Search style={{ width: '16px', height: '16px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Candidate name or text..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="cvs-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              {/* Skills filter */}
              <div className="lg:col-span-3">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Required Skills
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, React, SQL"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="cvs-input"
                />
              </div>

              {/* Roles filter */}
              <div className="lg:col-span-3">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Extracted Roles
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineer, Analyst"
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  className="cvs-input"
                />
              </div>

              {/* Status filter */}
              <div className="lg:col-span-2">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="cvs-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Min score slider */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Min. Match Score
                  </label>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: '10px' }}>
                    {minScore}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  style={{ accentColor: '#4f46e5', width: '100%', cursor: 'pointer' }}
                />
              </div>

              {/* Action buttons */}
              <div className="lg:col-span-6 flex items-end justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'inherit',
                  }}
                >
                  <RotateCcw style={{ width: '14px', height: '14px' }} />
                  Reset
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    background: '#4f46e5',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'inherit',
                    boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
                  }}
                >
                  <Filter style={{ width: '14px', height: '14px' }} />
                  Search
                </button>
              </div>

            </form>
          </div>

          {/* Results count header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Matched Candidates ({applications.length})
            </h2>
          </div>

          {/* Results Listing */}
          {loading ? (
            <div style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: '16px', padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e0e7ff', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Searching candidate resumes…</span>
            </div>
          ) : applications.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: '16px', padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#4f46e5' }}>
                <Briefcase style={{ width: '26px', height: '26px' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>No candidates matched</h3>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '360px', margin: '0 auto' }}>
                Try adjusting your search criteria or resetting filters.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {applications.map((app) => {
                const appId = app.id || app._id;
                const isExpanded = expandedId === appId;
                const targetJob = jobs.find((j) => j.id === app.jobId || j._id === app.jobId);
                const requiredJobSkills = formatSkillsList(targetJob?.skills || []);
                const parsedSkills = formatSkillsList(app.skills);
                const matchedSkills = formatSkillsList(app.skillsMatched);
                const extractedRoles = formatRolesList(app.roles);

                const candidateSkillSet = new Set(
                  [...matchedSkills, ...parsedSkills].map((s) => s.toLowerCase())
                );
                const missingSkills = requiredJobSkills.filter(
                  (reqSkill) => !candidateSkillSet.has(reqSkill.toLowerCase())
                );

                return (
                  <div
                    key={appId}
                    className="cvs-fade"
                    style={{
                      background: '#fff',
                      border: '1px solid #e8eaed',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                  >
                    {/* Row header */}
                    <div
                      onClick={() => toggleExpand(appId)}
                      style={{
                        padding: '18px 22px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                            {app.applicantName}
                          </h3>
                          {app.matchScore !== undefined && app.matchScore > 0 && (
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getScoreColor(app.matchScore)}`}>
                              {app.matchScore}% Match
                            </span>
                          )}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
                            {getStatusIcon(app.status)}
                            {app.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Briefcase style={{ width: '13px', height: '13px' }} />
                            Applied for:{' '}
                            <button
                              type="button"
                              onClick={(e) => handleOpenJobModal(app.jobId, e)}
                              style={{
                                background: '#eef2ff',
                                border: '1px solid #c7d2fe',
                                color: '#4338ca',
                                borderRadius: '6px',
                                padding: '2px 8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontFamily: 'inherit',
                              }}
                              title="Click to view full job post details"
                            >
                              {getJobTitle(app.jobId)}
                              <Eye style={{ width: '12px', height: '12px' }} />
                            </button>
                          </span>
                          <span>•</span>
                          <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {app.cvUrl && app.cvUrl !== '#' && (
                          <a
                            href={app.cvUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              color: '#475569',
                              textDecoration: 'none',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Download style={{ width: '14px', height: '14px' }} />
                            CV
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(appId);
                          }}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            color: '#4f46e5',
                            background: '#eef2ff',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontFamily: 'inherit',
                          }}
                        >
                          {isExpanded ? (
                            <>
                              Hide Details <ChevronUp style={{ width: '14px', height: '14px' }} />
                            </>
                          ) : (
                            <>
                              View Details <ChevronDown style={{ width: '14px', height: '14px' }} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div style={{ background: '#fafafa', borderTop: '1px solid #e8eaed', padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        
                        {/* Skills & Roles */}
                        <div>
                          {/* Matched Technical Skills */}
                          {matchedSkills.length > 0 && (
                            <div style={{ marginBottom: '14px' }}>
                              <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                
                                Technical Skills 
                              </h4>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {matchedSkills.map((s, i) => (
                                  <span key={i} style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 9px', borderRadius: '14px', fontWeight: 600 }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Missing Job Requirements (Red Color) */}
                          {missingSkills.length > 0 && (
                            <div style={{ marginBottom: '14px' }}>
                              
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {missingSkills.map((s, i) => (
                                  <span key={i} style={{ fontSize: '11px', background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', padding: '2px 9px', borderRadius: '14px', fontWeight: 600 }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}



                          {/* Extracted Roles */}
                          {extractedRoles.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                              <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                                Extracted Roles ({extractedRoles.length})
                              </h4>
                              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: '#334155' }}>
                                {extractedRoles.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* HR Status action buttons */}
                          <div style={{ paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                              Manual Status Action
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              <button
                                onClick={() => handleUpdateStatus(appId, 'Shortlisted')}
                                disabled={app.status === 'Shortlisted'}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  border: 'none',
                                  background: app.status === 'Shortlisted' ? '#f1f5f9' : '#16a34a',
                                  color: app.status === 'Shortlisted' ? '#94a3b8' : '#fff',
                                  cursor: app.status === 'Shortlisted' ? 'not-allowed' : 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appId, 'Rejected')}
                                disabled={app.status === 'Rejected'}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  border: 'none',
                                  background: app.status === 'Rejected' ? '#f1f5f9' : '#dc2626',
                                  color: app.status === 'Rejected' ? '#94a3b8' : '#fff',
                                  cursor: app.status === 'Rejected' ? 'not-allowed' : 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appId, 'Pending')}
                                disabled={app.status === 'Pending'}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  border: '1px solid #cbd5e1',
                                  background: '#fff',
                                  color: app.status === 'Pending' ? '#94a3b8' : '#334155',
                                  cursor: app.status === 'Pending' ? 'not-allowed' : 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Status history timeline */}
                        <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}>
                          <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Award style={{ width: '14px', height: '14px' }} />
                            Status History Log
                          </h4>

                          {app.statusHistory && app.statusHistory.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              {app.statusHistory.map((item, i) => (
                                <div key={i} style={{ fontSize: '12px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.status}</span>
                                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <Calendar style={{ width: '10px', height: '10px' }} />
                                      {new Date(item.updatedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>By: {item.updatedBy}</p>
                                  {item.comment && (
                                    <p style={{ fontSize: '11px', color: '#475569', background: '#fff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '4px', fontStyle: 'italic' }}>
                                      "{item.comment}"
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No timeline history recorded.</p>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Job Post Details Modal */}
      {selectedJob && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setSelectedJob(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '18px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedJob(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  background: '#eef2ff',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5',
                }}
              >
                <Briefcase style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedJob.title}
                </h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Applied Job Post Details
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              {selectedJob.minExperience !== undefined && (
                <span style={{ fontSize: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', color: '#475569', fontWeight: 600 }}>
                  Min. Experience: {selectedJob.minExperience} yrs
                </span>
              )}
              {selectedJob.minEducation && (
                <span style={{ fontSize: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', color: '#475569', fontWeight: 600 }}>
                  Education: {selectedJob.minEducation}
                </span>
              )}
              {selectedJob.location && (
                <span style={{ fontSize: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', color: '#475569', fontWeight: 600 }}>
                  Location: {selectedJob.location}
                </span>
              )}
            </div>

            {/* Required Skills */}
            {selectedJob.skills && selectedJob.skills.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Required Job Skills ({selectedJob.skills.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedJob.skills.map((sk, idx) => (
                    <span key={idx} style={{ fontSize: '12px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Job Description
              </h4>
              <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9', whiteSpace: 'pre-line', margin: 0 }}>
                {selectedJob.description || 'No detailed description provided for this job post.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setSelectedJob(null)}
                style={{
                  padding: '8px 20px',
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
