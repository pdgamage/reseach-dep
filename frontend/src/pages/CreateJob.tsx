import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SkillTag } from '../components/SkillTag';
import {
  Briefcase,
  Calendar,
  GraduationCap,
  PlusCircle,
} from 'lucide-react';

/* ─── Inline CSS (Poppins font + modern form utilities) ─────────────────── */
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .cj-root { font-family: 'Poppins', sans-serif; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .cj-fade { animation: fadeIn 0.3s ease forwards; }

  .cj-back-btn {
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
  .cj-back-btn:hover {
    background: #eef2ff;
    color: #4f46e5;
    border-color: #c7d2fe;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.12);
    transform: translateX(-3px);
  }
  .cj-back-btn svg {
    transition: transform 0.2s ease;
  }
  .cj-back-btn:hover svg {
    transform: translateX(-2px);
  }

  .cj-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-size: 14px;
    color: #0f172a;
    background: #fff;
    font-family: inherit;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .cj-input:focus {
    outline: none;
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
  }

  .cj-btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 24px;
    background: #4f46e5;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
  }
  .cj-btn-primary:hover:not(:disabled) {
    background: #4338ca;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
  }
  .cj-btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  .cj-btn-secondary {
    padding: 10px 20px;
    background: #fff;
    color: #475569;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .cj-btn-secondary:hover {
    background: #f8fafc;
    color: #0f172a;
  }

  .cj-spin {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
`;

export function CreateJob() {
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.currentTarget as HTMLFormElement;
      const title = (form.querySelector('#title') as HTMLInputElement).value;
      const description = (form.querySelector('#description') as HTMLTextAreaElement).value;
      const minEducation = (form.querySelector('#education') as HTMLSelectElement).value;
      const minExperience = parseInt((form.querySelector('#experience') as HTMLInputElement).value, 10);
      const closingDate = (form.querySelector('#closingDate') as HTMLInputElement).value;

      const token = localStorage.getItem('smarthire_token');
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          skills,
          minEducation,
          minExperience,
          closingDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create job post');
      }

      toast.success('Job post created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Create job error:', err);
      toast.error(err.message || 'Failed to create job post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="cj-root" style={{ background: '#f9fbfb', minHeight: '100vh', padding: '36px 24px 64px' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          
          {/* Back button */}
          

          {/* Header title */}
          <div className="cj-fade" style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Create New Job Post
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', margin: 0 }}>
              Fill in the details to publish a new position and start accepting applications.
            </p>
          </div>

          {/* Form Card */}
          <div
            className="cj-fade"
            style={{
              background: '#fff',
              border: '1px solid #e8eaed',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              animationDelay: '40ms',
            }}
          >
            <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
              
              {/* ── Section 1: Basic Information ── */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                    <Briefcase style={{ width: '16px', height: '16px' }} />
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Basic Information
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label htmlFor="title" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Job Title <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      className="cj-input"
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Job Description <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={5}
                      className="cj-input"
                      style={{ resize: 'vertical' }}
                      placeholder="Describe the role, responsibilities, requirements, and qualifications..."
                    />
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '32px 0' }} />

              {/* ── Section 2: Requirements ── */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                    <GraduationCap style={{ width: '16px', height: '16px' }} />
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Role Requirements
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Skills input */}
                  <div>
                    <label htmlFor="skills" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Required Skills
                    </label>
                    <div
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        background: '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: skills.length > 0 ? '8px' : '0' }}>
                        {skills.map((skill) => (
                          <SkillTag key={skill} skill={skill} onRemove={() => removeSkill(skill)} />
                        ))}
                      </div>
                      <input
                        type="text"
                        id="skills"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        style={{
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                          fontSize: '13px',
                          color: '#0f172a',
                          fontFamily: 'inherit',
                          background: 'transparent',
                        }}
                        placeholder={skills.length === 0 ? 'Type a skill and press Enter…' : 'Add another skill…'}
                      />
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', margin: '6px 0 0 0' }}>
                      Press Enter to add skills. These will be used by SmartHire AI to rank candidates.
                    </p>
                  </div>

                  {/* Education + Experience side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                    <div>
                      <label htmlFor="education" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Minimum Education <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <select id="education" required className="cj-input">
                        <option value="">Select education level</option>
                        <option value="O/L">GCE O/L</option>
                        <option value="A/L">GCE A/L</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelors">Bachelor's Degree</option>
                        <option value="Masters">Master's Degree</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="experience" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Experience Needed (Years) <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="number"
                        id="experience"
                        min="0"
                        required
                        className="cj-input"
                        placeholder="e.g. 2"
                      />
                    </div>
                  </div>

                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '32px 0' }} />

              {/* ── Section 3: Timeline ── */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                    <Calendar style={{ width: '16px', height: '16px' }} />
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Timeline
                  </h2>
                </div>

                <div style={{ maxWidth: '360px' }}>
                  <label htmlFor="closingDate" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Closing Date & Time <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="closingDate"
                    required
                    className="cj-input"
                  />
                </div>
              </div>

              {/* ── Form Actions ── */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="cj-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cj-btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <span className="cj-spin" />
                      Publishing Job…
                    </>
                  ) : (
                    <>
                      <PlusCircle style={{ width: '16px', height: '16px' }} />
                      Publish Job Post
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </>
  );
}