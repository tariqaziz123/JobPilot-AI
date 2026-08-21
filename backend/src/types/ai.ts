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