import { Router } from "express";

import { analyzeJob, getAIAnalyses, analyzeResumeController, getResumeAnalyses, getJobRecommendations, generateCoverLetterController, getCoverLetters, generateInterviewPreparationController, getInterviewPreparations, startMockInterviewController, answerMockInterviewController } from "../controllers/ai.controller.js";
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

router.get(
  "/cover-letters",
  authMiddleware,
  getCoverLetters
);

router.post(
  "/interview-preparation",
  authMiddleware,
  generateInterviewPreparationController
);

router.get(
  "/interview-preparation",
  authMiddleware,
  getInterviewPreparations
);

router.post(
  "/mock-interview/start",
  authMiddleware,
  startMockInterviewController
);

router.post(
  "/mock-interview/answer",
  authMiddleware,
  answerMockInterviewController
);

export default router;