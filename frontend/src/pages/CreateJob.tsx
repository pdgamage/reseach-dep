import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SkillTag } from '../components/SkillTag';
import {
  BriefcaseIcon,
  CalendarIcon,
  GraduationCapIcon,
  ArrowLeftIcon } from
'lucide-react';
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

      const token = localStorage.getItem("smarthire_token");
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        throw new Error(data.message || "Failed to create job post");
      }

      toast.success("Job post created successfully!");
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Create job error:", err);
      toast.error(err.message || "Failed to create job post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New Job</h1>
        <p className="text-sm text-slate-500 mt-1">
          Fill in the details to post a new job and start collecting CVs.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Basic Info Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-indigo-500" />
              Basic Information
            </h3>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-700 mb-1">
                  
                  Job Title
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Senior Software Engineer" />
                
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 mb-1">
                  
                  Job Description
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Describe the role, responsibilities, and what you are looking for..." />
                
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Requirements Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCapIcon className="w-5 h-5 text-indigo-500" />
              Requirements
            </h3>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-slate-700 mb-1">
                  
                  Required Skills
                </label>
                <div className="rounded-lg border border-slate-300 p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 bg-white">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map((skill) =>
                    <SkillTag
                      key={skill}
                      skill={skill}
                      onRemove={() => removeSkill(skill)} />

                    )}
                  </div>
                  <input
                    type="text"
                    id="skills"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="block w-full border-0 p-1 text-sm focus:ring-0"
                    placeholder={
                    skills.length === 0 ?
                    'Type a skill and press Enter...' :
                    'Add another skill...'
                    } />
                  
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Press Enter to add a skill. These will be used by AI for
                  matching.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="education"
                    className="block text-sm font-medium text-slate-700 mb-1">
                    
                    Minimum Education
                  </label>
                  <select
                    id="education"
                    required
                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white">
                    
                    <option value="">Select education level</option>
                    <option value="O/L">GCE O/L</option>
                    <option value="A/L">GCE A/L</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelors">Bachelor's Degree</option>
                    <option value="Masters">Master's Degree</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="experience"
                    className="block text-sm font-medium text-slate-700 mb-1">
                    
                    Experience Needed (Years)
                  </label>
                  <input
                    type="number"
                    id="experience"
                    min="0"
                    required
                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. 2" />
                  
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Timeline Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              Timeline
            </h3>
            <div className="max-w-md">
              <label
                htmlFor="closingDate"
                className="block text-sm font-medium text-slate-700 mb-1">
                
                Closing Date & Time
              </label>
              <input
                type="datetime-local"
                id="closingDate"
                required
                className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm">
              
              {isSubmitting ? 'Saving...' : 'Create Job Post'}
            </button>
          </div>
        </form>
      </div>
    </div>);

}