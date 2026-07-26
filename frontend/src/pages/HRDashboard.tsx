import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  SearchIcon,
  PlusIcon,
  FilterIcon } from
'lucide-react';
import { Job, JobStatus } from '../data/mockData';
import { JobCard } from '../components/JobCard';
import { SummaryStatCard } from '../components/SummaryStatCard';
import toast from 'react-hot-toast';

export function HRDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ totalJobs: 0, openJobs: 0, totalCVs: 0, shortlisted: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'All'>('All');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("smarthire_token");
        const headers = { Authorization: `Bearer ${token}` };

        const [jobsRes, statsRes] = await Promise.all([
          fetch("/api/jobs", { headers }),
          fetch("/api/dashboard/stats", { headers })
        ]);

        if (!jobsRes.ok || !statsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const jobsData = await jobsRes.json();
        const statsData = await statsRes.json();

        setJobs(jobsData);
        setStats(statsData);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.
    toLowerCase().
    includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalJobs = stats.totalJobs;
  const openJobs = stats.openJobs;
  const totalCVs = stats.totalCVs;
  const shortlistedCount = stats.shortlisted;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <span className="text-sm font-medium text-slate-500">Loading Dashboard...</span>
      </div>
    );
  }
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your job posts and review applicants.
          </p>
        </div>
        <Link
          to="/jobs/create"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          
          <PlusIcon className="w-4 h-4" />
          Create New Job
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryStatCard
          title="Total Jobs"
          value={totalJobs}
          icon={BriefcaseIcon} />
        
        <SummaryStatCard title="Open Jobs" value={openJobs} icon={ClockIcon} />
        <SummaryStatCard
          title="CVs Received"
          value={totalCVs}
          icon={UsersIcon}
          trend="+12%"
          trendUp={true} />
        
        <SummaryStatCard
          title="Shortlisted"
          value={shortlistedCount}
          icon={CheckCircleIcon} />
        
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Job Posts</h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64" />
              
            </div>

            <div className="relative">
              <FilterIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white">
                
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="Processing">Processing</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50">
          {filteredJobs.length > 0 ?
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) =>
            <JobCard key={job.id} job={job} />
            )}
            </div> :

          <div className="text-center py-12">
              <BriefcaseIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">
                No jobs found
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Try adjusting your search or filters.
              </p>
            </div>
          }
        </div>
      </div>
    </div>);

}