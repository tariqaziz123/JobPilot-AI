import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const createApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      userId,
      jobId,
      status,
      notes,
    } = req.body;

    if (!userId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "userId and jobId are required",
      });
    }

    const application = await prisma.application.create({
      data: {
        userId,
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

    const applications = await prisma.application.findMany({
      where: {
        userId,
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