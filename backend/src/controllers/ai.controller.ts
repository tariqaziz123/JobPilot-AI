import { Response } from "express";

import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { analyzeJobMatch } from "../services/ai.service.js";

export const analyzeJob = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "jobId is required",
      });
    }

    const [user, job] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          skills: true,
          resumeText: true,
        },
      }),

      prisma.job.findFirst({
        where: {
          id: jobId,
          userId,
        },
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!job.description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job description is required for AI analysis",
      });
    }

    if (
      user.skills.length === 0 &&
      !user.resumeText?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please add your skills or resume before analyzing a job",
      });
    }

    const candidateProfile = `
Candidate Skills:
${user.skills.join(", ")}

Candidate Resume:
${user.resumeText ?? "Not provided"}
`;

    const analysis = await analyzeJobMatch(
      candidateProfile,
      job.description
    );

    const savedAnalysis = await prisma.aIAnalysis.create({
      data: {
        userId,
        jobId: job.id,
        matchScore: analysis.matchScore,
        atsScore: analysis.atsScore,
        skillsMatched: analysis.skillsMatched,
        missingSkills: analysis.missingSkills,
        recommendation: analysis.recommendation,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...analysis,
        analysisId: savedAnalysis.id,
        jobId: job.id,
      },
    });
  } catch (error) {
    console.error("AI job analysis failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze job",
    });
  }
};