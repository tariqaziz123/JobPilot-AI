import { Router } from "express";

import {
  createApplication,
  getApplications,
  updateApplicationStatus,
  getApplicationById,
  updateApplication,
  deleteApplication
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
router.patch("/:id", authMiddleware, updateApplication);

router.delete("/:id", authMiddleware, deleteApplication);

export default router;