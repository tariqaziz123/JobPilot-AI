import { Router } from "express";
import {
  createJob,
  getJobs,
  updateJobStatus
} from "../controllers/job.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getJobs);
router.post("/", authMiddleware, createJob);
router.patch(
  "/:id/status",
  authMiddleware,
  updateJobStatus
);

export default router;