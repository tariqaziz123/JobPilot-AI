import { Router } from "express";

import { analyzeJob, getAIAnalyses, analyzeResumeController, getResumeAnalyses } from "../controllers/ai.controller.js";
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

export default router;