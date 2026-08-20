import { Router } from "express";
import { getUsers, createUser, getMe, updateMe } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.get(
  "/me",
  authMiddleware,
  getMe
);

router.put(
  "/me",
  authMiddleware,
  updateMe
);

export default router;
