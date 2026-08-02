export type JobStatus = 'Open' | 'Closed';

export interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  minEducation: string;
  minExperience: number;
  closingDate: string;
  status: JobStatus;
  cvCount: number;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
}

export interface CVSubmission {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  fileName: string;
  uploadDate: string;
  status: 'Pending' | 'Shortlisted' | 'Rejected';
}

export interface ShortlistResult {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  rank: number;
  matchScore: number;
  skillsMatched: string[];
  educationMatch: string;
  experienceMatch: string;
  explanation: string;
  isRecommended: boolean;
  emailSent?: boolean;
  email?: string;
  phone?: string;
}

export const mockJobs: Job[] = [
{
  id: 'j1',
  title: 'Software Engineer',
  description:
  'We are looking for a skilled Software Engineer to join our core development team. You will be responsible for building scalable web applications and collaborating with cross-functional teams.',
  skills: ['React', 'Node.js', 'TypeScript', 'SQL'],
  minEducation: "Bachelor's Degree",
  minExperience: 2,
  closingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  status: 'Open',
  cvCount: 12
},
{
  id: 'j2',
  title: 'Marketing Executive',
  description:
  'Join our dynamic marketing team to drive brand awareness and execute digital campaigns across various platforms.',
  skills: ['Digital Marketing', 'SEO', 'Content Creation', 'Communication'],
  minEducation: 'Diploma',
  minExperience: 1,
  closingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  status: 'Open',
  cvCount: 8
},
{
  id: 'j3',
  title: 'Accounts Officer',
  description:
  'Seeking a detail-oriented Accounts Officer to manage daily financial transactions, payroll, and reporting.',
  skills: ['Excel', 'Accounting', 'QuickBooks', 'Attention to Detail'],
  minEducation: "Bachelor's Degree",
  minExperience: 3,
  closingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  status: 'Processing',
  cvCount: 24
},
{
  id: 'j4',
  title: 'Data Analyst',
  description:
  'Looking for a Data Analyst to interpret data and turn it into information which can offer ways to improve a business.',
  skills: ['Python', 'SQL', 'Tableau', 'Statistics'],
  minEducation: "Bachelor's Degree",
  minExperience: 2,
  closingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  status: 'Closed',
  cvCount: 45
},
{
  id: 'j5',
  title: 'HR Coordinator',
  description:
  'We need an HR Coordinator to facilitate daily HR functions like keeping track of employees records and supporting the interview process.',
  skills: ['Communication', 'Teamwork', 'MS Office', 'Organization'],
  minEducation: 'Diploma',
  minExperience: 1,
  closingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
  status: 'Open',
  cvCount: 3
}];


export const mockCVs: CVSubmission[] = [
{
  id: 'cv1',
  jobId: 'j3',
  applicantId: 'a1',
  applicantName: 'Kasun Perera',
  fileName: 'Kasun_Perera_CV.pdf',
  uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'Pending'
},
{
  id: 'cv2',
  jobId: 'j3',
  applicantId: 'a2',
  applicantName: 'Amandi Silva',
  fileName: 'Amandi_Resume_2023.pdf',
  uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'Pending'
},
{
  id: 'cv3',
  jobId: 'j3',
  applicantId: 'a3',
  applicantName: 'Nuwan Fernando',
  fileName: 'NuwanF_CV.pdf',
  uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'Pending'
}];


export const mockResults: ShortlistResult[] = [
{
  id: 'r4',
  jobId: 'j3',
  applicantId: 'a1',
  applicantName: 'Kasun Perera',
  rank: 1,
  matchScore: 88,
  skillsMatched: ['Excel', 'Accounting', 'Attention to Detail'],
  educationMatch: 'Matched (BSc Accounting)',
  experienceMatch: 'Matched (4 Years)',
  explanation:
  'Kasun is a strong match for this role. He has solid accounting experience with 4 years in a similar position. He matches 3 out of 4 required skills and exceeds the minimum experience requirement.',
  isRecommended: true
},
{
  id: 'r5',
  jobId: 'j3',
  applicantId: 'a2',
  applicantName: 'Amandi Silva',
  rank: 2,
  matchScore: 76,
  skillsMatched: ['Excel', 'QuickBooks'],
  educationMatch: 'Matched (BSc Business Administration)',
  experienceMatch: 'Matched (3 Years)',
  explanation:
  'Amandi meets the education and experience requirements. She has good proficiency in Excel and QuickBooks but lacks formal accounting qualifications which slightly lowered her score.',
  isRecommended: true
},
{
  id: 'r6',
  jobId: 'j3',
  applicantId: 'a3',
  applicantName: 'Nuwan Fernando',
  rank: 3,
  matchScore: 58,
  skillsMatched: ['Excel'],
  educationMatch: 'Partially Matched (Diploma)',
  experienceMatch: 'Below Minimum (1 Year)',
  explanation:
  "Nuwan has basic Excel skills but falls short on experience (1 year vs 3 required) and education (Diploma instead of Bachelor's). He would need additional training for this role.",
  isRecommended: false
},
{
  id: 'r1',
  jobId: 'j4',
  applicantId: 'a4',
  applicantName: 'Dinithi Jayasuriya',
  rank: 1,
  matchScore: 92,
  skillsMatched: ['Python', 'SQL', 'Statistics'],
  educationMatch: 'Matched (BSc Data Science)',
  experienceMatch: 'Matched (3 Years)',
  explanation:
  'Dinithi is a strong match. She meets the education and experience requirements fully. She has 3 out of 4 required skills, missing only Tableau, but has experience with PowerBI which is a similar tool.',
  isRecommended: true
},
{
  id: 'r2',
  jobId: 'j4',
  applicantId: 'a5',
  applicantName: 'Malith Rajapaksha',
  rank: 2,
  matchScore: 85,
  skillsMatched: ['SQL', 'Tableau'],
  educationMatch: 'Matched (BSc Computer Science)',
  experienceMatch: 'Matched (2 Years)',
  explanation:
  'Malith meets the minimum experience and education. He has strong visualization skills with Tableau and SQL, but lacks Python experience which lowered his overall score slightly.',
  isRecommended: true
},
{
  id: 'r3',
  jobId: 'j4',
  applicantId: 'a6',
  applicantName: 'Sanduni Weerasinghe',
  rank: 3,
  matchScore: 65,
  skillsMatched: ['Python'],
  educationMatch: 'Partially Matched (Diploma)',
  experienceMatch: 'Matched (2 Years)',
  explanation:
  "Sanduni has the required Python skills and experience, but falls short on the education requirement (Diploma instead of Bachelor's). She also lacks SQL and Tableau skills mentioned in the job post.",
  isRecommended: false
}];