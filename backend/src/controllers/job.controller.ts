import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const createJob = async (
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

    const {
      company,
      title,
      location,
      jobUrl,
      description,
      salary,
      source,
    } = req.body;

    if (!company || !title) {
      return res.status(400).json({
        success: false,
        message: "Company and title are required",
      });
    }

    const job = await prisma.job.create({
      data: {
        userId: req.user.userId,
        company,
        title,
        location,
        jobUrl,
        description,
        salary,
        source,
      },
    });

    return res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Failed to create job:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create job",
    });
  }
};

export const getJobs = async (
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

    const jobs = await prisma.job.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Failed to fetch jobs:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};

export const updateJobStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }
    const { status } = req.body;

    const allowedStatuses = [
      "SAVED",
      "APPLIED",
      "INTERVIEW",
      "OFFER",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job status",
      });
    }

    const job = await prisma.job.findUnique({
      where: {
        id,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const updatedJob = await prisma.job.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    console.error("Failed to update job status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update job status",
    });
  }
};