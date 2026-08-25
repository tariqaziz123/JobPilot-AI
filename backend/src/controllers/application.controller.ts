import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

const APPLICATION_STATUSES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

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

    if (
      status !== undefined &&
      !APPLICATION_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

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

export const updateApplicationStatus = async (
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

    const applicationId = req.params.applicationId;

    if (typeof applicationId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid applicationId",
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    const normalizedStatus = status.toUpperCase();

    if (!APPLICATION_STATUSES.includes(normalizedStatus as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status: normalizedStatus as any,
      },
      include: {
        job: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Failed to update application status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update application status",
    });
  }
};

export const getApplicationById = async (
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

    const applicationId = req.params.applicationId;

    if (typeof applicationId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
      include: {
        job: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Failed to fetch application:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

export const updateApplication = async (
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

    const applicationId = req.params.id;

    if (typeof applicationId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const { status, notes } = req.body;

    if (
      status !== undefined &&
      !APPLICATION_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const updatedApplication =
      await prisma.application.update({
        where: {
          id: applicationId,
        },
        data: {
          ...(status !== undefined && { status }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          job: true,
        },
      });

    return res.status(200).json({
      success: true,
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Failed to update application:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update application",
    });
  }
};

export const deleteApplication = async (
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

    const applicationId = req.params.id;

    if (typeof applicationId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    await prisma.application.delete({
      where: {
        id: applicationId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete application:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete application",
    });
  }
};