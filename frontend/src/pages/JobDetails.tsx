import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Job, mockResults } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';
import { SkillTag } from '../components/SkillTag';
import { CountdownBadge } from '../components/CountdownBadge';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  FileTextIcon,
  DownloadIcon,
  SparklesIcon,
  CalendarIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  AwardIcon } from
'lucide-react';
export function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobCVs, setJobCVs] = useState<any[]>([]);


  useEffect(() => {
    const fetchJobAndApplications = async () => {
      try {
        const token = localStorage.getItem("smarthire_token");
        const res = await fetch(`/api/jobs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error("Job not found");
        }
        const data = await res.json();
        setJob(data);

        // Fetch applications from the database
        const appsRes = await fetch(`/api/jobs/${id}/applications`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setJobCVs(appsData);
        }
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load job details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchJobAndApplications();
  }, [id, navigate]);

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <span className="text-sm font-medium text-slate-500">Loading Job Details...</span>
      </div>
    );
  }

  const jobResults = mockResults.
  filter((r) => r.jobId === job.id).
  sort((a, b) => a.rank - b.rank);
  
  // Merge database applications with mock results that are not already present in the database applications list
  const mergedCVs = [...jobCVs];
  jobResults.forEach(mr => {
    const alreadyExists = mergedCVs.some(cv => cv.applicantId === mr.applicantId || cv.id === mr.applicantId || cv._id === mr.applicantId);
    if (!alreadyExists) {
      mergedCVs.push({
        id: mr.id,
        _id: mr.id,
        jobId: mr.jobId,
        applicantId: mr.applicantId,
        applicantName: mr.applicantName,
        fileName: `${mr.applicantName.replace(/\s+/g, '_')}_CV.pdf`,
        cvUrl: "#", // mock URL
        createdAt: job.closingDate,
        status: mr.isRecommended ? 'Shortlisted' : 'Not Shortlisted',
        matchScore: mr.matchScore,
        skillsMatched: mr.skillsMatched,
        educationMatch: mr.educationMatch,
        experienceMatch: mr.experienceMatch,
        explanation: mr.explanation,
        isRecommended: mr.isRecommended
      });
    }
  });

  // Sort jobCVs by score and map rank dynamically
  const jobApplications = mergedCVs
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .map((cv, index) => {
      // If matches exist from DB/pre-mapped, use them
      if (cv.matchScore !== undefined && cv.matchScore > 0) {
        return {
          ...cv,
          rank: index + 1,
          isRecommended: cv.status === "Shortlisted" ? true : (cv.status === "Rejected" ? false : (cv.isRecommended ?? (cv.matchScore >= 70)))
        };
      }
      
      // Otherwise fallback to mock data
      const mockResult = jobResults.find((r) => r.applicantId === cv.applicantId || r.applicantId === cv.id || r.applicantId === cv._id);
      return {
        ...cv,
        matchScore: mockResult ? mockResult.matchScore : 0,
        skillsMatched: mockResult ? mockResult.skillsMatched : [],
        educationMatch: mockResult ? mockResult.educationMatch : "-",
        experienceMatch: mockResult ? mockResult.experienceMatch : "-",
        explanation: mockResult ? mockResult.explanation : "",
        isRecommended: mockResult ? mockResult.isRecommended : false,
        rank: mockResult ? mockResult.rank : index + 1,
        status: mockResult ? (mockResult.isRecommended ? 'Shortlisted' : 'Not Shortlisted') : cv.status
      };
    });

  const isClosed = job.status === 'Closed' || new Date(job.closingDate) < new Date();
  const hasResults = isClosed && jobApplications.length > 0;
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50';
    if (score >= 70) return 'text-indigo-700 bg-indigo-50';
    if (score >= 50) return 'text-amber-700 bg-amber-50';
    return 'text-rose-700 bg-rose-50';
  };
  const getProgressBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-indigo-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={job.status} />
                <CountdownBadge closingDate={job.closingDate} />
              </div>
            </div>

            {hasResults &&
            <Link
              to={`/results/${job.id}`}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap">
              
                <SparklesIcon className="w-4 h-4" />
                View Full Results
                <ExternalLinkIcon className="w-3.5 h-3.5" />
              </Link>
            }
          </div>

          <div className="prose prose-sm max-w-none text-slate-600 mb-8">
            <p>{job.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4 text-slate-400" />
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) =>
                <SkillTag key={skill} skill={skill} />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <GraduationCapIcon className="w-4 h-4 text-slate-400" />
                Qualifications
              </h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-700">Education:</span>{' '}
                  {job.minEducation}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    Experience:
                  </span>{' '}
                  {job.minExperience} Years
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                Timeline
              </h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-700">
                    Closing Date:
                  </span>{' '}
                  {new Date(job.closingDate).toLocaleDateString()}
                </p>
                {isClosed &&
                <p className="text-rose-600 font-medium">
                    CV submissions are closed
                  </p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Shortlisting Banner */}
      {hasResults && jobResults.length > 0 &&
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-indigo-900">
                AI Shortlisting Completed
              </h3>
              <p className="text-sm text-indigo-700 mt-0.5">
                Deadline has passed. CVs were automatically analysed and scored
                by AI.
              </p>
            </div>
          </div>
          <Link
          to={`/results/${job.id}`}
          className="text-sm font-medium text-indigo-700 hover:text-indigo-900 flex items-center gap-1 whitespace-nowrap">
          
            View detailed results
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      }

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {hasResults ? 'CVs & Shortlisting Scores' : 'Uploaded CVs'}
          </h2>
          <span className="bg-slate-100 text-slate-700 py-1 px-3 rounded-full text-sm font-medium">
            {jobCVs.length} Total
          </span>
        </div>

        {jobCVs.length > 0 ?
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  {hasResults && <th className="p-4">Rank</th>}
                  <th className="p-4">Applicant Name</th>
                  <th className="p-4">CV File</th>
                  <th className="p-4">Uploaded Date</th>
                  {hasResults ?
                <>
                      <th className="p-4">Match Score</th>
                      <th className="p-4">Status</th>
                    </> :

                <th className="p-4">Status</th>
                }
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {jobApplications.map((cv) => {
                  const cvId = cv.id || cv._id;
                  return (
                    <React.Fragment key={cvId}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        {hasResults && (
                          <td className="p-4">
                            {cv.matchScore !== undefined ? (
                              <div className="flex items-center gap-1.5">
                                <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 border border-slate-200">
                                  {cv.rank}
                                </span>
                                {cv.isRecommended && (
                                  <AwardIcon className="w-4 h-4 text-indigo-500" />
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </td>
                        )}
                        <td className="p-4 text-sm font-medium text-slate-900">
                          {cv.applicantName}
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <FileTextIcon className="w-4 h-4 text-slate-400" />
                            {cv.fileName}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {new Date(cv.createdAt || cv.uploadDate).toLocaleDateString()}
                        </td>
                        {hasResults && cv.matchScore !== undefined ? (
                          <>
                            <td className="p-4">
                              <div className="flex items-center gap-2.5 min-w-[140px]">
                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${getProgressBarColor(cv.matchScore)}`}
                                    style={{
                                      width: `${cv.matchScore}%`
                                    }}>
                                  </div>
                                </div>
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreColor(cv.matchScore)}`}>
                                  {cv.matchScore}%
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cv.isRecommended ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                                {cv.isRecommended && (
                                  <CheckCircleIcon className="w-3 h-3" />
                                )}
                                {cv.isRecommended ? 'Shortlisted' : 'Not Shortlisted'}
                              </span>
                            </td>
                          </>
                        ) : hasResults ? (
                          <>
                            <td className="p-4 text-sm text-slate-400">-</td>
                            <td className="p-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                Pending
                              </span>
                            </td>
                          </>
                        ) : (
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              {cv.status}
                            </span>
                          </td>
                        )}
                        <td className="p-4 text-right flex items-center justify-end gap-3">
                          <a
                            href={cv.cvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center gap-1 cursor-pointer no-underline"
                          >
                            <DownloadIcon className="w-4 h-4" />
                            Download
                          </a>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div> :

        <div className="text-center py-12">
            <FileTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">
              No CVs received yet
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Applicants haven't submitted any CVs for this job post.
            </p>
          </div>
        }
      </div>
    </div>);

}