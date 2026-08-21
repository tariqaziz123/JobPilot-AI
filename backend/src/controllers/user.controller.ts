import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const getUsers = async (
  _req: Request,
  res: Response
) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const createUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    return res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Failed to create user:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

export const getMe = async (
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
      id: true,
      name: true,
      email: true,
      skills: true,
      resumeText: true,
      createdAt: true,
    },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

export const updateMe = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    const {
      name,
      skills,
      resumeText,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (skills !== undefined && !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "skills must be an array",
      });
    }

    if (
      resumeText !== undefined &&
      typeof resumeText !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "resumeText must be a string",
      });
    }

    const cleanedSkills =
      skills
        ?.filter(
          (skill: unknown): skill is string =>
            typeof skill === "string"
        )
        .map((skill: string) => skill.trim())
        .filter(Boolean);

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(skills !== undefined && {
          skills: cleanedSkills,
        }),
        ...(resumeText !== undefined && {
          resumeText: resumeText.trim() || null,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true,
        resumeText: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(
      "Failed to update profile:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};


