import React, { useState, useEffect } from 'react';
import {
  BriefcaseIcon,
  UsersIcon,
  CheckCircleIcon,
  SearchIcon,
  ArchiveIcon
} from 'lucide-react';
import { Job } from '../data/mockData';
import { JobCard } from '../components/JobCard';
import { SummaryStatCard } from '../components/SummaryStatCard';
import toast from 'react-hot-toast';

export function ClosedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("smarthire_token");
        const res = await fetch("/api/jobs", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await res.json();
        setJobs(data);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load jobs from database");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Filter jobs to show only those that are currently closed
  // (Either status is 'Closed' or the closing date has passed)
  const closedJobs = jobs.filter((job) => {
    const isClosed = job.status === 'Closed' || new Date(job.closingDate) < new Date();
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    return isClosed && matchesSearch;
  });

  const totalClosedJobs = closedJobs.length;
  const totalCVsInClosed = closedJobs.reduce((acc, job) => acc + (job.cvCount || 0), 0);
  const completedJobsCount = closedJobs.filter((job) => job.status === 'Closed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <span className="text-sm font-medium text-slate-500">Loading Closed Jobs...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Closed Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review applicant profiles and view AI shortlisting scores for completed and closed vacancies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryStatCard
          title="Total Closed Jobs"
          value={totalClosedJobs}
          icon={ArchiveIcon}
        />
        <SummaryStatCard
          title="Total CVs Received"
          value={totalCVsInClosed}
          icon={UsersIcon}
        />
        <SummaryStatCard
          title="Evaluation Completed"
          value={completedJobsCount}
          icon={CheckCircleIcon}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Closed Job Listings</h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search closed jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50">
          {closedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedJobs.map((job) => (
                <JobCard key={job.id || job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BriefcaseIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">
                No closed jobs found
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                There are no jobs that meet the closed status or deadline criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
