import { Router } from "express";

import { analyzeJob, getAIAnalyses } from "../controllers/ai.controller.js";
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

export default router;