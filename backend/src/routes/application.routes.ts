import { Router } from "express";

import {
  createApplication,
  getApplications,
} from "../controllers/application.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getApplications);
router.post("/", authMiddleware, createApplication);

export default router;