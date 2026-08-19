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