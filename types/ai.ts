export type ResumeAnalysis = {
  overallScore: number;
  experienceMatch: number;
  skillsMatch: number;
  missingKeywords: string[];
  matchedSkills: string[];
  skillGaps: string[];
  recommendations: string[];
};