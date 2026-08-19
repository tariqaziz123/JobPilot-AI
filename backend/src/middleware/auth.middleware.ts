import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

interface AuthPayload {
  userId: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const decoded = jwt.verify(
      token,
      env.jwtSecret
    ) as AuthPayload;

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    console.error("Authentication failed:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};