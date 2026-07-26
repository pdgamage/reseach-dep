import { useState, useEffect } from 'react';
import {
  Calendar,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Job {
  _id: string;
  id?: string;
  title: string;
  description: string;
  skills: string[];
  minEducation: string;
  minExperience: number;
  closingDate: string;
  status: string;
  cvCount: number;
}

interface Schedule {
  _id?: string;
  jobId: string;
  jobTitle: string;
  date: string;
  time: string;
  location: string;
  notes: string;
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .isch-root { font-family: 'Poppins', sans-serif; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .isch-fade { animation: fadeIn 0.3s ease forwards; }

  .isch-shimmer {
    background: linear-gradient(90deg, #f0f2f5 25%, #fafafa 50%, #f0f2f5 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s ease infinite;
  }

  .isch-card {
    background: #fff;
    border: 1px solid #e8eaed;
    border-radius: 16px;
    padding: 24px;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    cursor: pointer;
  }
  .isch-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(79, 70, 229, 0.08);
    border-color: #4f46e5;
  }

  .isch-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-size: 13px;
    color: #0f172a;
    background: #fff;
    font-family: inherit;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .isch-input:focus {
    outline: none;
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
  }

  .isch-spin {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
`;

export function InterviewSchedule() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('Zoom / Online');
  const [scheduleNotes, setScheduleNotes] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('smarthire_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [jobsRes, schedulesRes] = await Promise.all([
        fetch('/api/jobs', { headers }),
        fetch('/api/interview-schedules', { headers }),
      ]);

      if (!jobsRes.ok || !schedulesRes.ok) {
        throw new Error('Failed to load scheduling data');
      }

      const jobsData = await jobsRes.json();
      const schedulesData = await schedulesRes.json();

      setJobs(jobsData);
      setSchedules(schedulesData);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading scheduling data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closedJobs = jobs.filter((job) => {
    if (job.status === 'Closed' || job.status === 'Completed') return true;
    const closing = new Date(job.closingDate);
    return closing < new Date();
  });

  const getJobSchedule = (jobId: string) => {
    return schedules.find((s) => s.jobId === jobId);
  };

  const handleOpenScheduleModal = (job: Job) => {
    const existing = getJobSchedule(job._id || job.id || '');
    setSelectedJob(job);
    if (existing) {
      setScheduleDate(existing.date);
      setScheduleTime(existing.time);
      setScheduleLocation(existing.location);
      setScheduleNotes(existing.notes);
    } else {
      setScheduleDate('');
      setScheduleTime('');
      setScheduleLocation('Zoom / Online');
      setScheduleNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!scheduleDate || !scheduleTime) {
      toast.error('Please select a date and time');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('smarthire_token');
      const res = await fetch('/api/interview-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: selectedJob._id || selectedJob.id,
          jobTitle: selectedJob.title,
          date: scheduleDate,
          time: scheduleTime,
          location: scheduleLocation,
          notes: scheduleNotes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save schedule');
      }

      toast.success(`Schedule saved successfully for ${selectedJob.title}!`);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error saving schedule');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="isch-root" style={{ background: '#f9fbfb', minHeight: '100vh', padding: '36px 24px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div className="isch-fade" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#eef2ff', color: '#4f46e5', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
              <Sparkles style={{ width: '13px', height: '13px' }} />
              Interview Logistics
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Interview Scheduling
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', margin: 0 }}>
              Set, update, and manage interview dates and times for candidate evaluation on closed jobs.
            </p>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="isch-shimmer" style={{ height: '220px', borderRadius: '16px' }} />
              ))}
            </div>
          ) : closedJobs.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
              <div style={{ width: '56px', height: '56px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#4f46e5' }}>
                <Calendar style={{ width: '26px', height: '26px' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>No Closed Jobs Found</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                Interview scheduling is available for closed or completed positions. Currently all job posts are active.
              </p>
            </div>
          ) : (
            <div className="isch-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {closedJobs.map((job) => {
                const schedule = getJobSchedule(job._id || job.id || '');
                return (
                  <div
                    key={job._id || job.id}
                    onClick={() => handleOpenScheduleModal(job)}
                    className="isch-card"
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>
                        {job.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                        <Users style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                        <span>{job.cvCount || 0} candidates shortlisted</span>
                      </div>

                      {schedule ? (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#14532d' }}>Scheduled Interview</div>
                            <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                              {new Date(schedule.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {schedule.time}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <AlertCircle style={{ width: '16px', height: '16px', color: '#94a3b8', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Not Scheduled</div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>No interview date/time set yet.</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#4f46e5' }}>
                      <span>{schedule ? 'Modify Schedule' : 'Schedule Now'} →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal */}
          {isModalOpen && selectedJob && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
              <div className="isch-fade" style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e8eaed', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
                
                {/* Modal Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Interview Logistics</span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, marginTop: '2px' }}>{selectedJob.title}</h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#94a3b8' }}
                  >
                    <X style={{ width: '18px', height: '18px' }} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveSchedule}>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                          Interview Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="isch-input"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                          Interview Time *
                        </label>
                        <input
                          type="time"
                          required
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="isch-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                        Location / Meeting Link *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Zoom Link, MS Teams, Conference Room 2"
                        value={scheduleLocation}
                        onChange={(e) => setScheduleLocation(e.target.value)}
                        className="isch-input"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                        Notes / Instructions
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Instructions for candidates (panel names, dress code, etc)..."
                        value={scheduleNotes}
                        onChange={(e) => setScheduleNotes(e.target.value)}
                        className="isch-input"
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                  </div>

                  {/* Modal Footer */}
                  <div style={{ padding: '16px 24px', background: '#fafafa', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      style={{ padding: '8px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      style={{ padding: '8px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
                    >
                      {isSaving ? <><span className="isch-spin" /> Saving…</> : 'Save Schedule'}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
