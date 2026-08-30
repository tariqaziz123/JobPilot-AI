import { Response } from "express";

import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { analyzeJobMatch, analyzeResume, recommendJobs, generateCoverLetter, generateInterviewPreparation } from "../services/ai.service.js";

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

export const getAIAnalyses = async (
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

    const analyses = await prisma.aIAnalysis.findMany({
      where: {
        userId,
      },
      include: {
        job: {
          select: {
            id: true,
            company: true,
            title: true,
            location: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    console.error(
      "Failed to fetch AI analyses:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch AI analyses",
    });
  }
};

export const analyzeResumeController = async (
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

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        resumeText: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.resumeText?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Please add your resume before analyzing it",
      });
    }

    const analysis = await analyzeResume(
      user.resumeText
    );

    const savedAnalysis =
      await prisma.resumeAnalysis.create({
        data: {
          userId,

          resumeScore: analysis.resumeScore,
          atsScore: analysis.atsScore,

          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          missingKeywords: analysis.missingKeywords,
          improvements: analysis.improvements,
          recommendedSkills:
            analysis.recommendedSkills,
        },
      });

    return res.status(200).json({
      success: true,
      data: {
        ...analysis,
        analysisId: savedAnalysis.id,
      },
    });
  } catch (error) {
    console.error(
      "Resume analysis failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to analyze resume",
    });
  }
};

export const getResumeAnalyses = async (
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

    const analyses = await prisma.resumeAnalysis.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    console.error(
      "Failed to fetch resume analyses:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume analyses",
    });
  }
};

export const getJobRecommendations = async (
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

    const [user, jobs] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          skills: true,
          resumeText: true,
        },
      }),

      prisma.job.findMany({
        where: {
          userId,
          status: "SAVED",
        },
        select: {
          id: true,
          title: true,
          company: true,
          description: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 15,
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.skills.length === 0 &&
      !user.resumeText?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please add your skills or resume before getting recommendations",
      });
    }

    if (jobs.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const candidateProfile = `
Candidate Skills:
${user.skills.join(", ")}

Candidate Resume:
${user.resumeText ?? "Not provided"}
`;

    const recommendations = await recommendJobs(
      candidateProfile,
      jobs
    );

    const jobMap = new Map(
      jobs.map((job) => [job.id, job])
    );

    const result = recommendations
      .filter((recommendation) =>
        jobMap.has(recommendation.jobId)
      )
      .sort(
        (a, b) =>
          b.matchScore - a.matchScore
      )
      .map((recommendation) => ({
        ...recommendation,
        job: jobMap.get(
          recommendation.jobId
        ),
      }));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Job recommendations failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate job recommendations",
    });
  }
};


export const generateCoverLetterController = async (
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
          name: true,
          skills: true,
          resumeText: true,
        },
      }),

      prisma.job.findFirst({
        where: {
          id: jobId,
          userId,
        },
        select: {
          id: true,
          title: true,
          company: true,
          description: true,
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
        message:
          "Job description is required to generate a cover letter",
      });
    }

    if (
      user.skills.length === 0 &&
      !user.resumeText?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please add your skills or resume before generating a cover letter",
      });
    }

    const candidateProfile = `
Candidate Name:
${user.name ?? "Candidate"}

Candidate Skills:
${user.skills.join(", ")}

Candidate Resume:
${user.resumeText ?? "Not provided"}
`;

    const coverLetter = await generateCoverLetter(
      candidateProfile,
      job
    );

    const savedCoverLetter =
      await prisma.coverLetter.create({
        data: {
          userId,
          jobId: job.id,
          content: coverLetter.content,
        },
      });

    return res.status(200).json({
      success: true,
      data: {
        id: savedCoverLetter.id,
        jobId: job.id,
        content: savedCoverLetter.content,
        createdAt: savedCoverLetter.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Cover letter generation failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate cover letter",
    });
  }
};

export const getCoverLetters = async (
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

    const coverLetters = await prisma.coverLetter.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: coverLetters,
    });
  } catch (error) {
    console.error(
      "Failed to fetch cover letters:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cover letters",
    });
  }
};

export const generateInterviewPreparationController = async (
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
          name: true,
          skills: true,
          resumeText: true,
        },
      }),

      prisma.job.findFirst({
        where: {
          id: jobId,
          userId,
        },
        select: {
          id: true,
          title: true,
          company: true,
          description: true,
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
        message:
          "Job description is required for interview preparation",
      });
    }

    if (
      user.skills.length === 0 &&
      !user.resumeText?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please add your skills or resume before generating interview preparation",
      });
    }

    const candidateProfile = `
Candidate Name:
${user.name ?? "Candidate"}

Candidate Skills:
${user.skills.join(", ")}

Candidate Resume:
${user.resumeText ?? "Not provided"}
`;

    const preparation =
      await generateInterviewPreparation(
        candidateProfile,
        job
      );

    const savedPreparation =
      await prisma.interviewPreparation.create({
        data: {
          userId,
          jobId: job.id,
          questions: preparation.questions,
          preparationTips:
            preparation.preparationTips,
        },
      });

    return res.status(200).json({
      success: true,
      data: {
        id: savedPreparation.id,
        jobId: job.id,
        questions: preparation.questions,
        preparationTips:
          preparation.preparationTips,
        createdAt:
          savedPreparation.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Interview preparation generation failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate interview preparation",
    });
  }
};
