import React, { useState, useEffect } from 'react';
import {
  SearchIcon,
  FilterIcon,
  AwardIcon,
  BriefcaseIcon,
  DownloadIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  RotateCcwIcon
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
  roles?: string[];
  education?: string[];
  statusHistory?: StatusHistoryItem[];
  createdAt: string;
}

interface Job {
  id: string;
  _id: string;
  title: string;
}

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

  // Map job ID to title
  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId || j._id === jobId);
    return job ? job.title : `Job #${jobId}`;
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("smarthire_token");
      const res = await fetch("/api/jobs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const executeSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("smarthire_token");
      const params = new URLSearchParams();
      if (query.trim()) params.append('query', query.trim());
      if (skills.trim()) params.append('skills', skills.trim());
      if (roles.trim()) params.append('roles', roles.trim());
      if (minScore > 0) params.append('minScore', minScore.toString());
      if (status !== 'All') params.append('status', status);

      const res = await fetch(`/api/applications/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Search request failed");
      const data = await res.json();
      setApplications(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch applications matching search criteria");
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
    // Run empty search to fetch all applications initially
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
        return <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />;
      case 'Rejected':
        return <XCircleIcon className="w-4 h-4 text-rose-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-amber-500" />;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleUpdateStatus = async (appId: string, newStatus: 'Shortlisted' | 'Rejected' | 'Pending') => {
    try {
      const token = localStorage.getItem("smarthire_token");
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          comment: `Status manually updated by HR from CV Search.`
        })
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      const updated = await res.json();
      toast.success(`Application updated to ${newStatus}`);
      
      // Update state
      setApplications(prev => prev.map(app => (app.id === appId || app._id === appId) ? updated : app));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">CV Search Engine</h1>
        <p className="text-sm text-slate-500 mt-1">
          Perform multi-criterion semantic searches across all processed candidate applications.
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <form onSubmit={executeSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Main Keyword Search */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Keyword Search (Name / Raw Text)
            </label>
            <div className="relative">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Skills Filter */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Python, SQL, React"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Roles Filter */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Extracted Roles (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Engineer, Analyst"
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Application Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Min Score Slider */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Minimum Match Score
              </label>
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {minScore}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-6 flex items-end justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium rounded-lg text-sm transition-colors flex items-center gap-1.5"
            >
              <RotateCcwIcon className="w-4 h-4" />
              Reset Filters
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm flex items-center gap-1.5"
            >
              <FilterIcon className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Matched Candidates ({applications.length})
        </h2>
      </div>

      {/* Results Listing */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <span className="text-sm text-slate-500">Searching matching resumes...</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <BriefcaseIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-slate-700">No applications matched</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your keyword query, clearing tags, or resetting the minimum match score threshold.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {applications.map((app) => {
            const appId = app.id || app._id;
            const isExpanded = expandedId === appId;
            return (
              <div
                key={appId}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm overflow-hidden"
              >
                {/* Main Row */}
                <div
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none"
                  onClick={() => toggleExpand(appId)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{app.applicantName}</h3>
                      {app.matchScore !== undefined && app.matchScore > 0 && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getScoreColor(app.matchScore)}`}>
                          {app.matchScore}% Match
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-600 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-full">
                        {getStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <BriefcaseIcon className="w-3.5 h-3.5 text-slate-400" />
                        Applied for: <span className="font-medium text-slate-700">{getJobTitle(app.jobId)}</span>
                      </span>
                      <span>•</span>
                      <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t border-slate-100 md:border-0 pt-3 md:pt-0">
                    {app.cvUrl && app.cvUrl !== '#' && (
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Download CV"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      className="p-2 border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5 text-xs font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(appId);
                      }}
                    >
                      {isExpanded ? (
                        <>
                          Hide Details
                          <ChevronUpIcon className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          View Details
                          <ChevronDownIcon className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="bg-slate-50/50 border-t border-slate-200 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Skills & Roles Column */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      {/* Skills */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Parsed Skills ({app.skills?.length || 0})
                        </h4>
                        {app.skills && app.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {app.skills.map((s, i) => (
                              <span
                                key={i}
                                className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No skills extracted.</span>
                        )}
                      </div>

                      {/* Roles & Education */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Extracted Roles
                          </h4>
                          {app.roles && app.roles.length > 0 ? (
                            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                              {app.roles.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No roles extracted.</span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Education details
                          </h4>
                          {app.education && app.education.length > 0 ? (
                            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                              {app.education.map((edu, i) => <li key={i}>{edu}</li>)}
                            </ul>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No education extracted.</span>
                          )}
                        </div>
                      </div>

                      {/* Manual Action Status */}
                      <div className="border-t border-slate-200 pt-4 mt-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                          Manual HR Review Status Action
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleUpdateStatus(appId, 'Shortlisted')}
                            disabled={app.status === 'Shortlisted'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
                              app.status === 'Shortlisted'
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            Mark Shortlisted
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appId, 'Rejected')}
                            disabled={app.status === 'Rejected'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
                              app.status === 'Rejected'
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : 'bg-rose-600 hover:bg-rose-700 text-white'
                            }`}
                          >
                            Mark Rejected
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appId, 'Pending')}
                            disabled={app.status === 'Pending'}
                            className={`px-3 py-1.5 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
                              app.status === 'Pending' ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            Reset to Pending
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Log Column */}
                    <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <AwardIcon className="w-4 h-4 text-slate-400" />
                        Application Status History Log
                      </h4>

                      {app.statusHistory && app.statusHistory.length > 0 ? (
                        <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-6">
                          {app.statusHistory.map((item, i) => (
                            <div key={i} className="relative">
                              {/* Dot Icon */}
                              <span className="absolute -left-[25px] top-0.5 bg-white border border-slate-300 rounded-full p-1 flex items-center justify-center">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === 'Shortlisted' ? 'bg-emerald-500' :
                                  item.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                                }`} />
                              </span>
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-slate-800">
                                    {item.status}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                    <CalendarIcon className="w-3 h-3" />
                                    {new Date(item.updatedAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  By: {item.updatedBy}
                                </p>
                                {item.comment && (
                                  <p className="text-xs text-slate-600 bg-slate-100/80 px-2 py-1.5 rounded mt-1 border border-slate-200/50 italic">
                                    "{item.comment}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
                          <ClockIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 italic">No timeline history recorded.</p>
                        </div>
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
  );
}
