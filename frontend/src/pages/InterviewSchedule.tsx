import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  FileTextIcon,
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UsersIcon,
} from "lucide-react";
import toast from "react-hot-toast";

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

export function InterviewSchedule() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleLocation, setScheduleLocation] = useState("Zoom / Online");
  const [scheduleNotes, setScheduleNotes] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("smarthire_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch jobs
      const jobsRes = await fetch("/api/jobs", { headers });
      if (!jobsRes.ok) throw new Error("Failed to load jobs");
      const jobsData = await jobsRes.json();

      // Fetch schedules
      const schedulesRes = await fetch("/api/interview-schedules", { headers });
      if (!schedulesRes.ok) throw new Error("Failed to load schedules");
      const schedulesData = await schedulesRes.json();

      setJobs(jobsData);
      setSchedules(schedulesData);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error loading scheduling data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter for currently closed jobs (Closed/Completed or past closing date)
  const closedJobs = jobs.filter((job) => {
    if (job.status === "Closed" || job.status === "Completed") return true;
    const closing = new Date(job.closingDate);
    return closing < new Date();
  });

  const getJobSchedule = (jobId: string) => {
    return schedules.find((s) => s.jobId === jobId);
  };

  const handleOpenScheduleModal = (job: Job) => {
    const existing = getJobSchedule(job._id || job.id || "");
    setSelectedJob(job);
    if (existing) {
      setScheduleDate(existing.date);
      setScheduleTime(existing.time);
      setScheduleLocation(existing.location);
      setScheduleNotes(existing.notes);
    } else {
      setScheduleDate("");
      setScheduleTime("");
      setScheduleLocation("Zoom / Online");
      setScheduleNotes("");
    }
    setIsModalOpen(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!scheduleDate || !scheduleTime) {
      toast.error("Please select a date and time");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("smarthire_token");
      const res = await fetch("/api/interview-schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        throw new Error(errData.message || "Failed to save schedule");
      }

      toast.success(`Schedule saved successfully for ${selectedJob.title}!`);
      setIsModalOpen(false);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error saving schedule");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Interview Scheduling</h1>
          <p className="text-slate-500 mt-1">Manage, enter, and persist dates and times for candidate interviews on closed jobs.</p>
        </div>
      </div>

      {isLoading ? (
        // Loading skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 h-56 animate-pulse space-y-4">
              <div className="h-6 w-3/4 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-1/2 bg-slate-100 rounded-md"></div>
              <div className="h-10 bg-slate-100 rounded-xl mt-4"></div>
            </div>
          ))}
        </div>
      ) : closedJobs.length === 0 ? (
        // Empty State
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 max-w-2xl mx-auto p-8 shadow-sm">
          <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">No Closed Jobs Found</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Interview scheduling is only available for closed or completed job positions. Currently, all your job openings are active.
          </p>
        </div>
      ) : (
        // Jobs Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {closedJobs.map((job) => {
            const schedule = getJobSchedule(job._id || job.id || "");
            return (
              <div
                key={job._id || job.id}
                onClick={() => handleOpenScheduleModal(job)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-64 group relative overflow-hidden"
              >
                {/* Accent line on hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-250"></div>

                <div>
                  {/* Job Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h3>
                  </div>

                  {/* Applicants count */}
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                    <UsersIcon className="w-4 h-4 text-slate-400" />
                    <span>{job.cvCount || 0} candidates shortlisted</span>
                  </div>

                  {/* Status Badge */}
                  {schedule ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-start gap-2.5">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold">Scheduled Interview</p>
                        <p className="text-emerald-700 mt-0.5">
                          {new Date(schedule.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {schedule.time}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 text-slate-600 p-3 rounded-xl flex items-start gap-2.5">
                      <AlertCircleIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold">Not Scheduled</p>
                        <p className="text-slate-500 mt-0.5">No interview date/time set yet.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action footer */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                  <span>{schedule ? "Modify Schedule" : "Schedule Now"} &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal Popup */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 transition-all font-sans">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Job Vacancy Interview</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{selectedJob.title}</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveSchedule}>
              <div className="p-6 space-y-5">
                {/* Date & Time Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                      Interview Date
                    </label>
                    <input
                      type="date"
                      required
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 transition-shadow bg-slate-50/50 hover:bg-slate-50"
                    />
                  </div>

                  {/* Time Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
                      Interview Time
                    </label>
                    <input
                      type="time"
                      required
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 transition-shadow bg-slate-50/50 hover:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Location Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPinIcon className="w-3.5 h-3.5 text-indigo-500" />
                    Interview Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zoom Link, MS Teams, Head Office Conference Room"
                    value={scheduleLocation}
                    onChange={(e) => setScheduleLocation(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 transition-shadow bg-slate-50/50 hover:bg-slate-50"
                  />
                </div>

                {/* Notes Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <FileTextIcon className="w-3.5 h-3.5 text-indigo-500" />
                    Notes / Instructions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add guidelines for candidates, e.g. Dress code, panel names, preparation instructions..."
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 transition-shadow bg-slate-50/50 hover:bg-slate-50 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSaving ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
