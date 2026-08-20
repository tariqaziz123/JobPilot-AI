import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const getAnalytics = async (
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

    const applications = await prisma.application.findMany({
      where: {
        userId,
      },
      select: {
        status: true,
        appliedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalApplications = applications.length;

    const saved = applications.filter(
      (application) => application.status === "SAVED"
    ).length;

    const applied = applications.filter(
      (application) => application.status === "APPLIED"
    ).length;

    const interviews = applications.filter(
      (application) => application.status === "INTERVIEW"
    ).length;

    const offers = applications.filter(
      (application) => application.status === "OFFER"
    ).length;

    const rejected = applications.filter(
      (application) => application.status === "REJECTED"
    ).length;

    const assessments = applications.filter(
      (application) => application.status === "ASSESSMENT"
    ).length;

    const interviewRate =
      totalApplications > 0
        ? Math.round((interviews / totalApplications) * 100)
        : 0;

    const offerRate =
      totalApplications > 0
        ? Math.round((offers / totalApplications) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalApplications,
        saved,
        applied,
        interviews,
        offers,
        rejected,
        assessments,
        interviewRate,
        offerRate,
        recentApplications: applications.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};