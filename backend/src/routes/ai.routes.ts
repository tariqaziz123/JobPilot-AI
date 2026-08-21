import { Router } from "express";
import { analyzeJob } from "../controllers/ai.controller.js";

const router = Router();

router.post("/analyze-job", analyzeJob);

export default router;