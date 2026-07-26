import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Job, mockResults } from '../data/mockData';
import { FairnessPanel } from '../components/FairnessPanel';
import { CandidateResultCard } from '../components/CandidateResultCard';
import { ArrowLeft, Download, Users, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .sr-root { font-family: 'Poppins', sans-serif; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .sr-fade { animation: fadeIn 0.3s ease forwards; }

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

export function ShortlistResults() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobCVs, setJobCVs] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      try {
        const token = localStorage.getItem('smarthire_token');
        const res = await fetch(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJob(data);

        const appsRes = await fetch(`/api/jobs/${jobId}/applications`, {
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
  }, [jobId, navigate]);

  if (loading || !job) {
    return (
      <>
        <style>{pageStyles}</style>
        <div className="sr-root" style={{ minHeight: '100vh', background: '#f9fbfb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', border: '3px solid #e0e7ff', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>Loading AI Results…</span>
        </div>
      </>
    );
  }

  const handleEmailSent = (candidateId: string, updatedCandidate: any) => {
    setJobCVs((prevCVs) => {
      const exists = prevCVs.some((cv) => cv.id === candidateId || cv._id === candidateId);
      if (exists) {
        return prevCVs.map((cv) =>
          cv.id === candidateId || cv._id === candidateId ? { ...cv, emailSent: true } : cv
        );
      } else {
        return [...prevCVs, updatedCandidate];
      }
    });
  };

  const results = [...jobCVs]
    .map((cv) => {
      if (cv.matchScore !== undefined) {
        return {
          id: cv._id || cv.id,
          jobId: cv.jobId,
          applicantId: cv.applicantId,
          applicantName: cv.applicantName,
          matchScore: cv.matchScore,
          skillsMatched: cv.skillsMatched || [],
          educationMatch: cv.educationMatch || '-',
          experienceMatch: cv.experienceMatch || '-',
          explanation: cv.explanation || '',
          isRecommended:
            cv.status === 'Shortlisted'
              ? true
              : cv.status === 'Rejected'
              ? false
              : (cv.isRecommended ?? (cv.matchScore >= 70)),
          emailSent: cv.emailSent || false,
        };
      }
      return null;
    })
    .filter((r) => r !== null)
    .concat(
      (mockResults as any[]).filter(
        (r) => r.jobId === job.id && !jobCVs.some((cv) => cv.applicantId === r.applicantId)
      )
    )
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((r, index) => ({
      ...r,
      rank: index + 1,
    }));

  return (
    <>
      <style>{pageStyles}</style>
      <div className="sr-root" style={{ background: '#f9fbfb', minHeight: '100vh', padding: '36px 24px 64px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <button className="sr-back-btn" onClick={() => navigate(`/jobs/${job.id}`)}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back to Job Details
          </button>

          {/* Header */}
          <div className="sr-fade" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#eef2ff', color: '#4f46e5', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                <Sparkles style={{ width: '13px', height: '13px' }} />
                SmartHire AI Engine
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Shortlisting Results
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', margin: 0 }}>
                AI candidate evaluation & ranking for <strong style={{ color: '#0f172a' }}>{job.title}</strong>
              </p>
            </div>

            <button
              onClick={() => toast.success('Export report feature ready')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Download style={{ width: '15px', height: '15px' }} />
              Export Report
            </button>
          </div>

          {/* Fairness Panel Component */}
          <div className="sr-fade" style={{ marginBottom: '24px' }}>
            <FairnessPanel />
          </div>

          {/* Candidate Result Cards List Container */}
          <div className="sr-fade" style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', animationDelay: '80ms' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users style={{ width: '18px', height: '18px', color: '#4f46e5' }} />
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Ranked Candidates</h2>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                Showing {results.length} results
              </span>
            </div>

            <div style={{ padding: '24px', background: '#fafafa' }}>
              {results.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {results.map((result) => (
                    <CandidateResultCard
                      key={result.id}
                      result={result}
                      onEmailSent={(updated) => handleEmailSent(result.id, updated)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <Users style={{ width: '36px', height: '36px', color: '#94a3b8', margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>No results found</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>There are no shortlisted candidates for this job position yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '32px', lineHeight: 1.6 }}>
            <p style={{ margin: 0 }}>Ranking is based strictly on job-relevant skills, qualifications, and experience.</p>
            <p style={{ margin: 0 }}>Sensitive personal details are not used for scoring. Provided to assist HR decision-making.</p>
          </div>

        </div>
      </div>
    </>
  );
}