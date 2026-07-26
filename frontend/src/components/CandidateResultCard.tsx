import React, { useState } from 'react';
import { ShortlistResult } from '../data/mockData';
import { SkillTag } from './SkillTag';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  AwardIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  MailIcon,
  PhoneIcon,
  CopyIcon,
  XIcon,
  UserIcon } from
'lucide-react';
import toast from 'react-hot-toast';

interface CandidateResultCardProps {
  result: ShortlistResult;
  onEmailSent?: (updatedCandidate: any) => void;
}
export function CandidateResultCard({ result, onEmailSent }: CandidateResultCardProps) {
  const [isSending, setIsSending] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFetchingContact, setIsFetchingContact] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ name: string; email: string; phone: string } | null>(
    result.email || result.phone ? { name: result.applicantName, email: result.email || "", phone: result.phone || "" } : null
  );

  const handleContactCandidate = async () => {
    setIsContactModalOpen(true);
    if (contactInfo) return; // already loaded or pre-populated

    setIsFetchingContact(true);
    try {
      const token = localStorage.getItem("smarthire_token");
      const res = await fetch(`/api/applications/${result.id}/contact-info`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to load candidate contact details");
      }
      const data = await res.json();
      setContactInfo(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not load contact details");
    } finally {
      setIsFetchingContact(false);
    }
  };

  const handleSendEmail = async () => {
    if (isSending || result.emailSent) return;
    setIsSending(true);
    try {
      const token = localStorage.getItem("smarthire_token");
      const res = await fetch(`/api/applications/${result.id}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: result.jobId,
          applicantId: result.applicantId,
          applicantName: result.applicantName,
          matchScore: result.matchScore,
          skillsMatched: result.skillsMatched,
          educationMatch: result.educationMatch,
          experienceMatch: result.experienceMatch,
          explanation: result.explanation,
          isRecommended: result.isRecommended
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send email");
      }

      const updated = await res.json();
      toast.success(`Email sent to ${result.applicantName} successfully!`);
      if (onEmailSent) {
        onEmailSent(updated);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to record sent email");
    } finally {
      setIsSending(false);
    }
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };
  const getProgressBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-indigo-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4 transition-all duration-200 hover:shadow-md">
      <div
        className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}>
        
        <div className="flex items-center gap-4 flex-grow">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0 border border-slate-200">
            #{result.rank}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {result.applicantName}
              {result.isRecommended &&
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  <AwardIcon className="w-3 h-3" />
                  Top Match
                </span>
              }
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <GraduationCapIcon className="w-3.5 h-3.5" />
                {result.educationMatch.split(' ')[0]}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1">
                <BriefcaseIcon className="w-3.5 h-3.5" />
                {result.experienceMatch.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:w-1/3 justify-between sm:justify-end">
          <div className="flex flex-col items-end gap-1 w-full max-w-[150px]">
            <div className="flex justify-between w-full text-sm font-medium">
              <span className="text-slate-600">Match Score</span>
              <span className={getScoreColor(result.matchScore).split(' ')[0]}>
                {result.matchScore}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressBarColor(result.matchScore)}`}
                style={{
                  width: `${result.matchScore}%`
                }}>
              </div>
            </div>
          </div>

          <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            {isExpanded ?
            <ChevronUpIcon className="w-5 h-5" /> :

            <ChevronDownIcon className="w-5 h-5" />
            }
          </button>
        </div>
      </div>

      {isExpanded &&
      <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                Matched Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.skillsMatched.map((skill) =>
              <SkillTag key={skill} skill={skill} />
              )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                <AlertTriangleIcon className="w-4 h-4 text-indigo-500" />
                AI Explanation
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {result.explanation}
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button 
              onClick={handleContactCandidate}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Contact Candidate
            </button>
            <button
              onClick={handleSendEmail}
              disabled={isSending || result.emailSent}
              className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors ${
                result.emailSent
                  ? "text-slate-500 bg-slate-100 border border-slate-200 cursor-not-allowed shadow-none"
                  : "text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              }`}
            >
              {isSending ? "Sending..." : result.emailSent ? "Email Sent" : "Send Email"}
            </button>
          </div>
        </div>
      }

      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all font-sans animate-in fade-in duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <h3 className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-indigo-600" />
                Candidate Contact Details
              </h3>
              <button 
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 min-h-[220px] flex flex-col justify-center">
              {isFetchingContact ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-slate-500">Scanning CV with Gemini AI...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 shrink-0 mt-0.5">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">{contactInfo?.name || result.applicantName}</p>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3 group">
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 shrink-0 mt-0.5">
                        <MailIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</span>
                        <p className="text-base font-medium text-slate-900 mt-0.5 break-all">
                          {contactInfo?.email || "No email found"}
                        </p>
                      </div>
                    </div>
                    {contactInfo?.email && (
                      <div className="flex items-center gap-2 self-center shrink-0">
                        <a 
                          href={`mailto:${contactInfo.email}`}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Send mail directly"
                        >
                          <MailIcon className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(contactInfo?.email || "");
                            toast.success("Email copied to clipboard!");
                          }}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Copy email"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3 group">
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 shrink-0 mt-0.5">
                        <PhoneIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</span>
                        <p className="text-base font-medium text-slate-900 mt-0.5">
                          {contactInfo?.phone || "No phone number found"}
                        </p>
                      </div>
                    </div>
                    {contactInfo?.phone && (
                      <div className="flex items-center gap-2 self-center shrink-0">
                        <a 
                          href={`tel:${contactInfo.phone}`}
                          className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Call candidate"
                        >
                          <PhoneIcon className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(contactInfo?.phone || "");
                            toast.success("Phone number copied to clipboard!");
                          }}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Copy phone number"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsContactModalOpen(false)}
                className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>);

}