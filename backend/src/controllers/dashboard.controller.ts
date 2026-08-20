import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const getDashboardStats = async (
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

    const [
      totalApplications,
      interviews,
      offers,
      assessments,
    ] = await Promise.all([
      prisma.application.count({
        where: {
          userId,
        },
      }),

      prisma.application.count({
        where: {
          userId,
          status: "INTERVIEW",
        },
      }),

      prisma.application.count({
        where: {
          userId,
          status: "OFFER",
        },
      }),

      prisma.application.count({
        where: {
          userId,
          status: "ASSESSMENT",
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalApplications,
        interviews,
        assessments,
        offers,
      },
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};