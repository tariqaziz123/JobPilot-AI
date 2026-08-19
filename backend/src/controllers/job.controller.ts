import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const createJob = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      userId,
      company,
      title,
      location,
      jobUrl,
      description,
      salary,
      source,
    } = req.body;

    if (!userId || !company || !title) {
      return res.status(400).json({
        success: false,
        message: "userId, company, and title are required",
      });
    }

    const job = await prisma.job.create({
      data: {
        userId,
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
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        success: false,
        message: "userId query parameter is required",
      });
    }

    const jobs = await prisma.job.findMany({
      where: {
        userId,
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