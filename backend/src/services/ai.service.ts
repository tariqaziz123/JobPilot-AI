import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env.js";

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});

const MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
];

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
    const parsed = JSON.parse(response) as JobAnalysis;

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
    return JSON.parse(response);
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