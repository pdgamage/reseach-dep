import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Job, mockResults } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';
import { SkillTag } from '../components/SkillTag';
import { CountdownBadge } from '../components/CountdownBadge';
import toast from 'react-hot-toast';
import { ArrowLeft  } from 'lucide-react';
import {
  FileText,
  Download,
  Sparkles,
  Calendar,
  GraduationCap,
  Briefcase,
  ExternalLink,
  CheckCircle,
  Award,
} from 'lucide-react';

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .jd-root { font-family: 'Poppins', sans-serif; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .jd-fade { animation: fadeIn 0.3s ease forwards; }

  .jd-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 6px 0;
    margin-bottom: 20px;
    transition: color 0.15s;
  }
  .jd-back-btn:hover { color: #4f46e5; }
  .sr-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 8px 16px;
    margin-bottom: 24px;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .sr-back-btn:hover {
    background: #eef2ff;
    color: #4f46e5;
    border-color: #c7d2fe;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.12);
    transform: translateX(-3px);
  }
  .sr-back-btn svg {
    transition: transform 0.2s ease;
  }
  .sr-back-btn:hover svg {
    transform: translateX(-2px);
  }
`;

export function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobCVs, setJobCVs] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      try {
        const token = localStorage.getItem('smarthire_token');
        const res = await fetch(`/api/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJob(data);

        const appsRes = await fetch(`/api/jobs/${id}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setJobCVs(appsData);
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load job details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchJobAndApplications();
  }, [id, navigate]);

  if (loading || !job) {
    return (
      <>
        <style>{pageStyles}</style>
        <div className="jd-root" style={{ minHeight: '100vh', background: '#f9fbfb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', border: '3px solid #e0e7ff', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>Loading job details…</span>
        </div>
      </>
    );
  }

  const jobResults = mockResults
    .filter((r) => r.jobId === job.id)
    .sort((a, b) => a.rank - b.rank);

  const mergedCVs = [...jobCVs];
  jobResults.forEach((mr) => {
    const alreadyExists = mergedCVs.some(
      (cv) => cv.applicantId === mr.applicantId || cv.id === mr.applicantId || cv._id === mr.applicantId
    );
    if (!alreadyExists) {
      mergedCVs.push({
        id: mr.id,
        _id: mr.id,
        jobId: mr.jobId,
        applicantId: mr.applicantId,
        applicantName: mr.applicantName,
        fileName: `${mr.applicantName.replace(/\s+/g, '_')}_CV.pdf`,
        cvUrl: '#',
        createdAt: job.closingDate,
        status: mr.isRecommended ? 'Shortlisted' : 'Not Shortlisted',
        matchScore: mr.matchScore,
        skillsMatched: mr.skillsMatched,
        educationMatch: mr.educationMatch,
        experienceMatch: mr.experienceMatch,
        explanation: mr.explanation,
        isRecommended: mr.isRecommended,
      });
    }
  });

  const jobApplications = mergedCVs
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .map((cv, index) => {
      if (cv.matchScore !== undefined && cv.matchScore > 0) {
        return {
          ...cv,
          rank: index + 1,
          isRecommended:
            cv.status === 'Shortlisted'
              ? true
              : cv.status === 'Rejected'
                ? false
                : (cv.isRecommended ?? (cv.matchScore >= 70)),
        };
      }
      const mockResult = jobResults.find(
        (r) => r.applicantId === cv.applicantId || r.applicantId === cv.id || r.applicantId === cv._id
      );
      return {
        ...cv,
        matchScore: mockResult ? mockResult.matchScore : 0,
        skillsMatched: mockResult ? mockResult.skillsMatched : [],
        educationMatch: mockResult ? mockResult.educationMatch : '-',
        experienceMatch: mockResult ? mockResult.experienceMatch : '-',
        explanation: mockResult ? mockResult.explanation : '',
        isRecommended: mockResult ? mockResult.isRecommended : false,
        rank: mockResult ? mockResult.rank : index + 1,
        status: mockResult ? (mockResult.isRecommended ? 'Shortlisted' : 'Not Shortlisted') : cv.status,
      };
    });

  const isClosed = job.status === 'Closed' || new Date(job.closingDate) < new Date();
  const hasResults = isClosed && jobApplications.length > 0;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50';
    if (score >= 70) return 'text-indigo-700 bg-indigo-50';
    if (score >= 50) return 'text-amber-700 bg-amber-50';
    return 'text-rose-700 bg-rose-50';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-indigo-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="jd-root" style={{ background: '#f9fbfb', minHeight: '100vh', padding: '36px 24px 64px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <button className="sr-back-btn" onClick={() => navigate(`/dashboard`)}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back to Dashboard
          </button>

          

          {/* Main Job Details Card */}
          <div className="jd-fade" style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '28px' }}>
            <div style={{ padding: '32px' }}>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                    {job.title}
                  </h1>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                    <StatusBadge status={
                      (new Date(job.closingDate).getTime() <= Date.now() && job.status === 'Open')
                        ? ((jobApplications.some(a => a.status === 'Pending') || job.cvCount > 0) ? 'Processing' : 'Closed')
                        : job.status
                    } />
                    <CountdownBadge closingDate={job.closingDate} />
                  </div>
                </div>

                {hasResults && (
                  <Link
                    to={`/results/${job.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#4f46e5',
                      color: '#fff',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(79,70,229,0.25)',
                    }}
                  >

                    View Full  Results
                    <ExternalLink style={{ width: '13px', height: '13px' }} />
                  </Link>
                )}
              </div>

              {/* Description */}
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: '28px' }}>
                {job.description}
              </p>

              {/* Requirements 3-Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase style={{ width: '14px', height: '14px', color: '#4f46e5' }} />
                    Required Skills
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {job.skills.map((skill) => (
                      <SkillTag key={skill} skill={skill} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GraduationCap style={{ width: '14px', height: '14px', color: '#4f46e5' }} />
                    Qualifications
                  </h3>
                  <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>Education: <strong style={{ color: '#0f172a' }}>{job.minEducation}</strong></span>
                    <span>Experience: <strong style={{ color: '#0f172a' }}>{job.minExperience} Years</strong></span>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar style={{ width: '14px', height: '14px', color: '#4f46e5' }} />
                    Timeline
                  </h3>
                  <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>Closing: <strong style={{ color: '#0f172a' }}>{new Date(job.closingDate).toLocaleDateString()}</strong></span>
                    {isClosed && <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>Submissions closed</span>}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* AI Banner */}
          {hasResults && jobResults.length > 0 && (
            <div className="jd-fade" style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '14px', padding: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#4f46e5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                  <Sparkles style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#312e81', margin: 0 }}>AI Shortlisting Completed</h3>
                  <p style={{ fontSize: '12px', color: '#4338ca', marginTop: '2px', margin: 0 }}>CVs analyzed & ranked automatically by SmartHire AI.</p>
                </div>
              </div>
              <Link to={`/results/${job.id}`} style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View detailed rankings <ExternalLink style={{ width: '13px', height: '13px' }} />
              </Link>
            </div>
          )}

          {/* Uploaded CVs Table Container */}
          <div className="jd-fade" style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', animationDelay: '80ms' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {hasResults ? 'CVs & Shortlisting Scores' : 'Uploaded Applications'}
              </h2>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '2px 10px', borderRadius: '12px' }}>
                {jobCVs.length} Total
              </span>
            </div>

            {jobCVs.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {hasResults && <th style={{ padding: '14px 20px' }}>Rank</th>}
                      <th style={{ padding: '14px 20px' }}>Applicant Name</th>
                      <th style={{ padding: '14px 20px' }}>CV File</th>
                      <th style={{ padding: '14px 20px' }}>Applied Date</th>
                      {hasResults ? (
                        <>
                          <th style={{ padding: '14px 20px' }}>Match Score</th>
                          <th style={{ padding: '14px 20px' }}>Status</th>
                        </>
                      ) : (
                        <th style={{ padding: '14px 20px' }}>Status</th>
                      )}
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: '#334155' }}>
                    {jobApplications.map((cv) => {
                      const cvId = cv.id || cv._id;
                      return (
                        <tr key={cvId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          {hasResults && (
                            <td style={{ padding: '14px 20px' }}>
                              {cv.matchScore !== undefined ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                                    {cv.rank}
                                  </span>
                                  {cv.isRecommended && <Award style={{ width: '16px', height: '16px', color: '#4f46e5' }} />}
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>-</span>
                              )}
                            </td>
                          )}
                          <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a' }}>
                            {cv.applicantName}
                          </td>
                          <td style={{ padding: '14px 20px', color: '#64748b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FileText style={{ width: '15px', height: '15px', color: '#94a3b8' }} />
                              {cv.fileName}
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px', color: '#64748b' }}>
                            {new Date(cv.createdAt || cv.uploadDate).toLocaleDateString()}
                          </td>
                          {hasResults && cv.matchScore !== undefined ? (
                            <>
                              <td style={{ padding: '14px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '140px' }}>
                                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
                                    <div
                                      className={getProgressBarColor(cv.matchScore)}
                                      style={{ height: '100%', borderRadius: '10px', width: `${cv.matchScore}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreColor(cv.matchScore)}`}>
                                    {cv.matchScore}%
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '14px 20px' }}>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cv.isRecommended ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                                  {cv.isRecommended && <CheckCircle style={{ width: '12px', height: '12px' }} />}
                                  {cv.isRecommended ? 'Shortlisted' : 'Not Shortlisted'}
                                </span>
                              </td>
                            </>
                          ) : (
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569' }}>
                                {cv.status}
                              </span>
                            </td>
                          )}
                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <a
                              href={cv.cvUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Download style={{ width: '14px', height: '14px' }} /> Download
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <FileText style={{ width: '36px', height: '36px', color: '#94a3b8', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>No applications yet</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Applicants haven't submitted any CVs for this post.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}