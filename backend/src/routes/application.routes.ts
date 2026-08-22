import { Router } from "express";

import {
  createApplication,
  getApplications,
  updateApplicationStatus,
  getApplicationById
} from "../controllers/application.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getApplications);
router.post("/", authMiddleware, createApplication);
router.patch(
  "/:applicationId/status",
  authMiddleware,
  updateApplicationStatus
);
router.get(
  "/:applicationId",
  authMiddleware,
  getApplicationById
);

export default router;