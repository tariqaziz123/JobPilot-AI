import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const createApplication = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { jobId, status, notes } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "jobId is required",
      });
    }

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: req.user.userId,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const application = await prisma.application.create({
      data: {
        userId: req.user.userId,
        jobId,
        status,
        notes,
      },
    });

    return res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Failed to create application:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create application",
    });
  }
};

export const getApplications = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        job: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Failed to fetch applications:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};