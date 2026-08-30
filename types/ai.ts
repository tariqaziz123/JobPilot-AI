export type JobAnalysisResult = {
  matchScore: number;
  atsScore: number;
  skillsMatched: string[];
  missingSkills: string[];
  recommendation: string;
};

export type ResumeAnalysisResult = {
  resumeScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvements: string[];
  recommendedSkills: string[];
};

export type JobRecommendation = {
  jobId: string;
  matchScore: number;
  reason: string;
  strengths: string[];
  missingSkills: string[];
};

export type CoverLetterResult = {
  content: string;
};

type InterviewQuestion = {
  question: string;
  category: "TECHNICAL" | "BEHAVIORAL" | "JOB_SPECIFIC";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  suggestedAnswer: string;
};

export type InterviewPreparation = {
  id: string;
  jobId: string;
  questions: InterviewQuestion[];
  preparationTips: string[];
  createdAt: string;
};