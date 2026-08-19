import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

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
