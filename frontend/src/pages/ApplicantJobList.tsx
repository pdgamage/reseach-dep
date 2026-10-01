import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../data/mockData';
import {
  Search,
  X,
  Briefcase,
  GraduationCap,
  SlidersHorizontal,
  RotateCcw,
  ArrowRight,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Inline CSS (Poppins font + rooster-style utilities) ──────────────── */
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .rj-root { font-family: 'Poppins', sans-serif; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }

  .rj-fade { animation: fadeIn 0.3s ease forwards; }

  .rj-shimmer {
    background: linear-gradient(90deg, #f0f2f5 25%, #fafafa 50%, #f0f2f5 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s ease infinite;
  }

  .rj-job-row {
    background: #fff;
    border: 1px solid #e8eaed;
    border-radius: 10px;
    padding: 22px 24px;
    display: flex;
    align-items: flex-start;
    gap: 20px;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    cursor: pointer;
  }
  .rj-job-row:hover {
    border-color: #4f46e5;
    box-shadow: 0 4px 20px rgba(79, 70, 229, 0.10);
  }

  .rj-skill-tag {
    display: inline-block;
    padding: 3px 10px;
    background: #eef2ff;
    color: #4338ca;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid #c7d2fe;
  }

  .rj-filter-chip {
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid #e5e7eb;
    background: #fff;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .rj-filter-chip:hover { border-color: #4f46e5; color: #4f46e5; }
  .rj-filter-chip.active {
    background: #4f46e5;
    border-color: #4f46e5;
    color: #fff;
  }

  .rj-apply-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 20px;
    background: #4f46e5;
    color: #fff;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s ease, transform 0.15s ease;
    white-space: nowrap;
  }
  .rj-apply-btn:hover {
    background: #4338ca;
    transform: translateY(-1px);
  }

  .rj-search-input:focus { outline: none; border-color: #4f46e5 !important; }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function closingLabel(closingDate: string) {
  const diff = new Date(closingDate).getTime() - Date.now();
  if (diff < 0) return { text: 'Closed', urgent: true };
  const d = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  if (d === 0) return { text: 'Closes today', urgent: true };
  if (d <= 3) return { text: `${d}d left`, urgent: true };
  return { text: `${d} days left`, urgent: false };
}

/* ─── Inline Job Row (Rooster-style horizontal card) ─────────────────── */
function JobRow({ job, index, hasApplied }: { job: Job; index: number; hasApplied?: boolean }) {
  const cl = closingLabel(job.closingDate);

  return (
    <div
      className="rj-job-row rj-fade"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Logo placeholder */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg border border-indigo-100"
        style={{ background: '#eef2ff', minWidth: '48px' }}
      >
        {job.title.charAt(0).toUpperCase()}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div>
            <h3
              className="font-semibold text-slate-900 text-base leading-snug hover:text-indigo-600 transition-colors"
              style={{ fontSize: '15px' }}
            >
              {job.title}
            </h3>
          </div>
          {/* Urgency badge */}
          <span
            className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: cl.urgent ? '#fef2f2' : '#f0fdf4',
              color: cl.urgent ? '#dc2626' : '#16a34a',
              border: `1px solid ${cl.urgent ? '#fecaca' : '#bbf7d0'}`,
            }}
          >
            <Calendar
              style={{ width: '11px', height: '11px', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}
            />
            {cl.text}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-slate-500 mb-3" style={{ fontSize: '12px' }}>
          <span className="flex items-center gap-1">
            <GraduationCap style={{ width: '13px', height: '13px' }} />
            {job.minEducation || 'Any Education'}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase style={{ width: '13px', height: '13px' }} />
            {job.minExperience === 0 ? 'No experience' : `${job.minExperience}+ yrs exp`}
          </span>
        </div>

        {/* Description */}
        {job.description && (
          <p
            className="text-slate-500 mb-3 line-clamp-1"
            style={{ fontSize: '13px', lineHeight: '1.5' }}
          >
            {job.description}
          </p>
        )}

        {/* Skills + Apply */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((skill, i) => (
              <span key={i} className="rj-skill-tag">{skill}</span>
            ))}
            {job.skills.length > 4 && (
              <span className="rj-skill-tag" style={{ background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }}>
                +{job.skills.length - 4}
              </span>
            )}
          </div>

          {hasApplied ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
              <CheckCircle style={{ width: '14px', height: '14px', color: '#059669' }} />
              Applied
            </span>
          ) : (
            <Link to={`/jobs/${job.id}/apply`} className="rj-apply-btn">
              Apply Now
              <ArrowRight style={{ width: '14px', height: '14px' }}
              strokeWidth={3.5}
   />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export function ApplicantJobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedEducation, setSelectedEducation] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('smarthire_token');
        const headers = { Authorization: `Bearer ${token}` };
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs', { headers }),
          fetch('/api/applications/my-applications', { headers })
        ]);
        if (!jobsRes.ok) throw new Error('Failed to fetch jobs');
        const data = await jobsRes.json();
        setJobs(data);

        if (appsRes.ok) {
          const apps = await appsRes.json();
          const ids = new Set<string>(apps.map((a: any) => String(a.jobId)));
          setAppliedJobIds(ids);
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openJobs = useMemo(() => jobs.filter((j) => j.status === 'Open'), [jobs]);

  const uniqueEducationLevels = useMemo(() => {
    const s = new Set<string>();
    openJobs.forEach((j) => j.minEducation && s.add(j.minEducation));
    return Array.from(s);
  }, [openJobs]);

  const popularSkills = useMemo(() => {
    const map: Record<string, number> = {};
    openJobs.forEach((j) =>
      j.skills?.forEach((s) => {
        const t = s.trim();
        if (t) map[t] = (map[t] || 0) + 1;
      })
    );
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([s]) => s);
  }, [openJobs]);

  const filteredJobs = useMemo(() => {
    return openJobs
      .filter((job) => {
        const term = searchTerm.toLowerCase().trim();
        const ok =
          !term ||
          job.title.toLowerCase().includes(term) ||
          job.description?.toLowerCase().includes(term) ||
          job.skills.some((s) => s.toLowerCase().includes(term)) ||
          job.minEducation?.toLowerCase().includes(term);
        if (!ok) return false;
        if (selectedExperience === 'entry' && job.minExperience > 2) return false;
        if (selectedExperience === 'mid' && (job.minExperience < 3 || job.minExperience > 5)) return false;
        if (selectedExperience === 'senior' && job.minExperience < 6) return false;
        if (selectedEducation !== 'all' && job.minEducation !== selectedEducation) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'exp-asc') return a.minExperience - b.minExperience;
        if (sortBy === 'closing-soon')
          return new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime();
        return 0;
      });
  }, [openJobs, searchTerm, selectedExperience, selectedEducation, sortBy]);

  const hasFilters = searchTerm || selectedExperience !== 'all' || selectedEducation !== 'all';
  const reset = () => { setSearchTerm(''); setSelectedExperience('all'); setSelectedEducation('all'); setSortBy('default'); };

  /* ── Loading skeleton ─── */
  if (loading) {
    return (
      <>
        <style>{pageStyles}</style>
        <div className="rj-root" style={{ background: '#f9fbfb', minHeight: '100vh' }}>
          {/* Hero skeleton */}
          <div style={{ background: '#fff', borderBottom: '1px solid #e8eaed', padding: '48px 0 40px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
              <div className="rj-shimmer" style={{ height: '48px', width: '60%', borderRadius: '8px', marginBottom: '24px' }} />
              <div className="rj-shimmer" style={{ height: '56px', borderRadius: '8px' }} />
            </div>
          </div>
          {/* Content skeleton */}
          <div style={{ maxWidth: '900px', margin: '32px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="rj-shimmer" style={{ height: '44px', borderRadius: '10px', marginBottom: '8px' }} />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rj-shimmer" style={{ height: '120px', borderRadius: '10px' }} />
            ))}
          </div>
        </div>
      </>
    );
  }

  /* ── Main render ─── */
  return (
    <>
      <style>{pageStyles}</style>
      <div className="rj-root" style={{ background: '#f9fbfb', minHeight: '100vh' }}>

        {/* ══════════ HERO SECTION ══════════ */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e8eaed', padding: '52px 0 44px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            {/* Eyebrow */}
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#4f46e5', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
              {openJobs.length} open positions · Updated today
            </p>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(28px, 5vw, 46px)',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.18,
                marginBottom: '32px',
                letterSpacing: '-0.02em',
              }}
            >
              Find your dream job or<br />
              <span style={{ color: '#4f46e5' }}>let companies find you</span>
            </h1>

            {/* Search bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                overflow: 'hidden',
                maxWidth: '700px',
                margin: '0 auto',
              }}
            >
              <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center' }}>
                <Search style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
              </div>
              <input
                type="text"
                className="rj-search-input"
                placeholder="Job title, keyword or skill…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: '16px 8px',
                  border: 'none',
                  fontSize: '15px',
                  color: '#0f172a',
                  background: 'transparent',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                >
                  <X style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                </button>
              )}
              <button
                style={{
                  padding: '14px 28px',
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#4338ca')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#4f46e5')}
              >
                Search Jobs
              </button>
            </div>

            {/* Popular skill quick-filters */}
            {popularSkills.length > 0 && (
              <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', alignSelf: 'center', marginRight: '4px' }}>
                  Popular:
                </span>
                {popularSkills.map((skill) => {
                  const active = searchTerm.toLowerCase() === skill.toLowerCase();
                  return (
                    <button
                      key={skill}
                      onClick={() => setSearchTerm(active ? '' : skill)}
                      className={`rj-filter-chip ${active ? 'active' : ''}`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══════════ MAIN CONTENT (full width) ══════════ */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 64px' }}>

          {/* ── INLINE FILTER BAR ABOVE JOB CARDS ── */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e8eaed',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {/* Filter icon + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px', flexShrink: 0 }}>
              <SlidersHorizontal style={{ width: '15px', height: '15px', color: '#4f46e5' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Filters:</span>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '20px', background: '#e5e7eb', flexShrink: 0 }} />

            {/* Experience chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '2px' }}>Exp:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'entry', label: '0–2 yrs' },
                { id: 'mid', label: '3–5 yrs' },
                { id: 'senior', label: '6+ yrs' },
              ].map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => setSelectedExperience(exp.id)}
                  className={`rj-filter-chip ${selectedExperience === exp.id ? 'active' : ''}`}
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                >
                  {exp.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            {uniqueEducationLevels.length > 0 && (
              <div style={{ width: '1px', height: '20px', background: '#e5e7eb', flexShrink: 0 }} />
            )}

            {/* Education dropdown */}
            {uniqueEducationLevels.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Edu:</span>
                <select
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  style={{
                    padding: '5px 10px',
                    border: `1px solid ${selectedEducation !== 'all' ? '#4f46e5' : '#e5e7eb'}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: selectedEducation !== 'all' ? '#4f46e5' : '#6b7280',
                    background: selectedEducation !== 'all' ? '#eef2ff' : '#fff',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all">Any Education</option>
                  {uniqueEducationLevels.map((edu) => (
                    <option key={edu} value={edu}>{edu}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Spacer + Sort + Reset */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '5px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#6b7280',
                  background: '#fff',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="default">Most Relevant</option>
                <option value="title-asc">Title (A → Z)</option>
                <option value="exp-asc">Experience: Low → High</option>
                <option value="closing-soon">Closing Soon</option>
              </select>

              {hasFilters && (
                <button
                  onClick={reset}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '12px', fontWeight: 600, color: '#4f46e5',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', padding: '4px 6px',
                    borderRadius: '6px',
                  }}
                >
                  <RotateCcw style={{ width: '12px', height: '12px' }} />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Results count bar */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
              {filteredJobs.length > 0 ? `${filteredJobs.length} Jobs Found` : 'No Results'}
            </span>
            {searchTerm && (
              <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '6px' }}>
                for "{searchTerm}"
              </span>
            )}
          </div>

          {/* Job rows */}
          {filteredJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredJobs.map((job, idx) => (
                <JobRow key={job.id} job={job} index={idx} hasApplied={appliedJobIds.has(String(job.id))} />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div
              className="rj-fade"
              style={{
                background: '#fff',
                border: '1px solid #e8eaed',
                borderRadius: '12px',
                padding: '60px 32px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: '#eef2ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Briefcase style={{ width: '28px', height: '28px', color: '#4f46e5' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                No jobs match your search
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
                Try adjusting your filters or searching with different keywords.
              </p>
              <button
                onClick={reset}
                style={{
                  padding: '10px 24px',
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw style={{ width: '14px', height: '14px' }} />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}