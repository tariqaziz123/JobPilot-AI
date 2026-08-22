import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env.js";

import {JobAnalysisResult, ResumeAnalysisResult, JobRecommendation} from "../types/ai.js"

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});

const MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
];

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => typeof item === "string"
    )
  );
}

function isScore(value: unknown): value is number {
  return (
    typeof value === "number" &&
    value >= 0 &&
    value <= 100
  );
}

function validateJobAnalysis(
  analysis: JobAnalysisResult
): JobAnalysisResult {
  if (
    !isScore(analysis.matchScore) ||
    !isScore(analysis.atsScore) ||
    !isStringArray(analysis.skillsMatched) ||
    !isStringArray(analysis.missingSkills) ||
    typeof analysis.recommendation !== "string"
  ) {
    throw new Error(
      "Invalid job analysis structure"
    );
  }

  return analysis;
}

function validateResumeAnalysis(
  analysis: ResumeAnalysisResult
): ResumeAnalysisResult {
  if (
    !isScore(analysis.resumeScore) ||
    !isScore(analysis.atsScore) ||
    !isStringArray(analysis.strengths) ||
    !isStringArray(analysis.weaknesses) ||
    !isStringArray(analysis.missingKeywords) ||
    !isStringArray(analysis.improvements) ||
    !isStringArray(analysis.recommendedSkills)
  ) {
    throw new Error(
      "Invalid resume analysis structure"
    );
  }

  return analysis;
}

function parseAIJson<T>(response: string): T {
  try {
    return JSON.parse(response) as T;
  } catch {
    const cleaned = response
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      return JSON.parse(cleaned) as T;
    } catch (error) {
      console.error("Invalid AI JSON response:", response);

      throw new Error(
        "AI returned an invalid JSON response"
      );
    }
  }
}

export async function generateAIResponse(
  prompt: string
) {
  let lastError: unknown;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text ?? "";
    } catch (error) {
      lastError = error;

      console.warn(
        `Gemini model ${model} failed. Trying fallback...`
      );
    }
  }

  throw lastError;
}

export interface JobAnalysis {
  matchScore: number;
  atsScore: number;
  skillsMatched: string[];
  missingSkills: string[];
  recommendation: string;
}

export async function analyzeJobMatch(
  candidateProfile: string,
  jobDescription: string
): Promise<JobAnalysis> {
  const prompt = `
You are an AI job matching assistant.

Analyze the candidate profile against the job description.

CANDIDATE PROFILE:
${candidateProfile}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not include any explanation outside the JSON.

The JSON must contain exactly these fields:

{
  "matchScore": number,
  "atsScore": number,
  "skillsMatched": string[],
  "missingSkills": string[],
  "recommendation": string
}

Rules:
- matchScore: number from 0 to 100 representing how well the candidate matches the job.
- atsScore: number from 0 to 100 representing keyword and skill alignment with the job description.
- skillsMatched: important skills from the job description that the candidate possesses.
- missingSkills: important skills from the job description that the candidate does not possess.
- recommendation: concise actionable recommendation for the candidate.
`;

  const response = await generateAIResponse(prompt);

  try {
    const parsed = validateJobAnalysis(
  parseAIJson<JobAnalysisResult>(response)
);

    if (
      typeof parsed.matchScore !== "number" ||
      typeof parsed.atsScore !== "number" ||
      !Array.isArray(parsed.skillsMatched) ||
      !Array.isArray(parsed.missingSkills) ||
      typeof parsed.recommendation !== "string"
    ) {
      throw new Error("Invalid JobAnalysis structure returned by Gemini");
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse Gemini job analysis:", response);

    throw new Error(
      `Gemini returned invalid structured JSON: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function analyzeResume(
  resumeText: string
) {
  const prompt = `
You are an expert ATS resume reviewer and technical recruiter.

Analyze the following candidate resume.

Return ONLY valid JSON.
Do not include markdown.
Do not include code fences.

The JSON must have exactly these fields:

{
  "resumeScore": number,
  "atsScore": number,
  "strengths": string[],
  "weaknesses": string[],
  "missingKeywords": string[],
  "improvements": string[],
  "recommendedSkills": string[]
}

Rules:

- resumeScore must be between 0 and 100.
- atsScore must be between 0 and 100.
- strengths should contain specific strengths found in the resume.
- weaknesses should contain specific issues that could reduce hiring chances.
- missingKeywords should contain relevant technical/job-market keywords that appear to be missing.
- improvements should contain practical changes the candidate should make.
- recommendedSkills should contain skills that would improve the candidate's marketability.
- Do not invent experience that is not present in the resume.
- Keep the recommendations relevant to the candidate's existing technical background.

Candidate Resume:

${resumeText}
`;

  const response = await generateAIResponse(prompt);

  try {
    return validateResumeAnalysis(
  parseAIJson<ResumeAnalysisResult>(response)
);
  } catch (error) {
    console.error(
      "Failed to parse resume AI response:",
      response
    );

    throw new Error(
      "AI returned an invalid resume analysis"
    );
  }
}

export async function recommendJobs(
  candidateProfile: string,
  jobs: {
    id: string;
    title: string;
    company: string;
    description: string | null;
  }[]
): Promise<JobRecommendation[]> {
  const jobsText = jobs
    .map(
      (job) => `
Job ID: ${job.id}
Company: ${job.company}
Title: ${job.title}
Description:
${job.description ?? "No description provided"}
`
    )
    .join("\n---\n");

  const prompt = `
You are an expert technical recruiter.

Evaluate how well the candidate matches each job.

Candidate Profile:
${candidateProfile}

Jobs:
${jobsText}

Return ONLY valid JSON.

Return exactly this structure:

[
  {
    "jobId": "string",
    "matchScore": number,
    "reason": "string",
    "strengths": ["string"],
    "missingSkills": ["string"]
  }
]

Rules:
- matchScore must be between 0 and 100.
- Include every job.
- Use the exact Job ID provided.
- Do not invent candidate experience.
- Base the recommendation only on the candidate profile and job description.
- Keep reason concise and useful.
`;

  const response = await generateAIResponse(prompt);

  const recommendations =
    parseAIJson<JobRecommendation[]>(response);

  if (!Array.isArray(recommendations)) {
    throw new Error(
      "Invalid job recommendation structure"
    );
  }

  return recommendations;
}