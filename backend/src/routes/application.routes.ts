import { Router } from "express";
import {
  createApplication,
  getApplications,
} from "../controllers/application.controller.js";

const router = Router();

router.get("/", getApplications);
router.post("/", createApplication);

export default router;