import React from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../data/mockData';
import { StatusBadge } from './StatusBadge';
import { SkillTag } from './SkillTag';
import { CountdownBadge } from './CountdownBadge';
import { UsersIcon, ChevronRightIcon } from 'lucide-react';
interface JobCardProps {
  job: Job;
  isApplicantView?: boolean;
}
export function JobCard({ job, isApplicantView = false }: JobCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{job.title}</h3>
          {!isApplicantView &&
          <div className="flex items-center text-sm text-slate-500 gap-2">
              <UsersIcon className="w-4 h-4" />
              <span>{job.cvCount} CVs Received</span>
            </div>
          }
        </div>
        {!isApplicantView && <StatusBadge status={job.status} />}
      </div>

      {isApplicantView &&
      <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">
          {job.description}
        </p>
      }

      <div className="mb-5 flex-grow">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Required Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 3).map((skill, index) =>
          <SkillTag key={index} skill={skill} />
          )}
          {job.skills.length > 3 &&
          <span className="text-xs text-slate-500 flex items-center px-1">
              +{job.skills.length - 3} more
            </span>
          }
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        <CountdownBadge closingDate={job.closingDate} />

        <Link
          to={isApplicantView ? `/jobs/${job.id}/apply` : `/jobs/${job.id}`}
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          
          {isApplicantView ? 'Apply Now' : 'View Details'}
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>);

}