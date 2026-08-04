import { Link } from 'react-router-dom';
import { Job } from '../data/mockData';
import { StatusBadge } from './StatusBadge';
import { SkillTag } from './SkillTag';
import { CountdownBadge } from './CountdownBadge';
import { UsersIcon, ChevronRightIcon, Trash2 } from 'lucide-react';

interface JobCardProps {
  job: Job;
  isApplicantView?: boolean;
  hasApplied?: boolean;
  onDelete?: (job: Job) => void;
}

export function JobCard({ job, isApplicantView = false, hasApplied = false, onDelete }: JobCardProps) {
  const jobId = (job.id || (job as any)._id) as string;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(job);
    }
  };

  const isPastClosing = new Date(job.closingDate).getTime() <= Date.now();
  const effectiveStatus = (isPastClosing && job.status === 'Open')
    ? ((job.cvCount || 0) > 0 ? 'Processing' : 'Closed')
    : job.status;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{job.title}</h3>
          {!isApplicantView && (
            <div className="flex items-center text-sm text-slate-500 gap-2">
              <UsersIcon className="w-4 h-4" />
              <span>{job.cvCount} CVs Received</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isApplicantView && <StatusBadge status={effectiveStatus} />}
          {!isApplicantView && onDelete && (
            <button
              onClick={handleDelete}
              title="Delete job post"
              style={{
                background: 'none',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '5px 7px',
                cursor: 'pointer',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'none';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#fecaca';
              }}
            >
              <Trash2 style={{ width: '15px', height: '15px' }} />
            </button>
          )}
        </div>
      </div>

      {isApplicantView && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">
          {job.description}
        </p>
      )}

      <div className="mb-5 flex-grow">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Required Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 3).map((skill, index) => (
            <SkillTag key={index} skill={skill} />
          ))}
          {job.skills.length > 3 && (
            <span className="text-xs text-slate-500 flex items-center px-1">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        <CountdownBadge closingDate={job.closingDate} />

        {isApplicantView && hasApplied ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            Applied
          </span>
        ) : (
          <Link
            to={isApplicantView ? `/jobs/${jobId}/apply` : `/jobs/${jobId}`}
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {isApplicantView ? 'Apply Now' : 'View Details'}
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}