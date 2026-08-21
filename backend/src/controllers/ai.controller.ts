import { Request, Response } from "express";
import { analyzeJobMatch } from "../services/ai.service.js";

export const analyzeJob = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      candidateProfile,
      jobDescription,
    } = req.body;

    if (!candidateProfile || !jobDescription) {
      return res.status(400).json({
        message:
          "candidateProfile and jobDescription are required",
      });
    }

    const result = await analyzeJobMatch(
      candidateProfile,
      jobDescription
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("AI job analysis failed:", error);

    return res.status(500).json({
      message: "Failed to analyze job",
    });
  }
};