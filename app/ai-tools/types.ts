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

export type Job = {
    id: string;
    company: string;
    title: string;
    description: string | null;
    status: string;
};

export type Analysis = {
    matchScore: number;
    atsScore: number;
    skillsMatched: string[];
    missingSkills: string[];
    recommendation: string;
    analysisId: string;
    jobId: string;
};

export type AnalysisHistory = {
    id: string;
    matchScore: number | null;
    atsScore: number | null;
    skillsMatched: string[];
    missingSkills: string[];
    recommendation: string | null;
    createdAt: string;
    job: {
        id: string;
        company: string;
        title: string;
        location: string | null;
        status: string;
    };
};

export type ResumeAnalysis = {
    analysisId: string;
    resumeScore: number;
    atsScore: number;
    strengths: string[];
    weaknesses: string[];
    missingKeywords: string[];
    improvements: string[];
    recommendedSkills: string[];
    createdAt: string;
};

export type JobRecommendation = {
    jobId: string;
    matchScore: number;
    reason: string;
    strengths: string[];
    missingSkills: string[];
    job: {
        id: string;
        title: string;
        company: string;
        description: string | null;
    };
    priority: "HIGH" | "MEDIUM" | "LOW";
};

export type CoverLetter = {
    id: string;
    jobId: string;
    content: string;
    createdAt: string;
    job: {
        id: string;
        title: string;
        company: string;
    };
};

export type InterviewPreparationHistoryItem = InterviewPreparation & {
    id: string;
    jobId: string;
    job: {
        id: string;
        title: string;
        company: string;
    };
};

export type MockInterviewQuestion =
    | string
    | {
        question?: string;
        answer?: string;
        type?: string;
        difficulty?: string;
        category?: string;
    };

export type MockInterviewEvaluation = {
    score: number;
    strengths: string[];
    weaknesses: string[];
    feedback: string;
    improvedAnswer: string;
};

export type MockInterviewSession = {
    sessionId: string;
    job: {
        id: string;
        title: string;
        company: string;
    };
    questionIndex: number;
    totalQuestions: number;
    question: MockInterviewQuestion;
};

export type MockInterviewHistoryItem = {
    id: string;
    jobId: string;
    status: string;
    currentQuestion: number;
    totalQuestions: number;
    finalScore: number | null;
    startedAt: string;
    completedAt: string | null;
    job: {
        id: string;
        title: string;
        company: string;
    };
    answers: {
        id: string;
        questionIndex: number;
        question: string;
        candidateAnswer: string;
        score: number | null;
        strengths: string[] | null;
        weaknesses: string[] | null;
        feedback: string | null;
        improvedAnswer: string | null;
    }[];
};
