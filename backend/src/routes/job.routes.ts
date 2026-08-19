import { Router } from "express";

import {
  createJob,
  getJobs,
} from "../controllers/job.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getJobs);
router.post("/", authMiddleware, createJob);

export default router;