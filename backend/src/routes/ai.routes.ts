import { Router } from "express";

import { analyzeJob, getAIAnalyses, analyzeResumeController, getResumeAnalyses, getJobRecommendations, generateCoverLetterController } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/analyze-job",
  authMiddleware,
  analyzeJob
);

router.get(
  "/analyses",
  authMiddleware,
  getAIAnalyses
);

router.post(
  "/analyze-resume",
  authMiddleware,
  analyzeResumeController
);

router.get(
  "/resume-analyses",
  authMiddleware,
  getResumeAnalyses
);

router.get(
  "/job-recommendations",
  authMiddleware,
  getJobRecommendations
);

router.post( "/cover-letter", authMiddleware, generateCoverLetterController );

export default router;