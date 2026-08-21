import { Router } from "express";

import { analyzeJob } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/analyze-job",
  authMiddleware,
  analyzeJob
);

export default router;