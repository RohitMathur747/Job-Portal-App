import express from "express";
import { authMiddleware, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  getSavedItems,
  toggleSaveJob,
  toggleSaveQuestion,
} from "../controllers/saved.controller.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", getSavedItems);
router.post("/job/:jobId", toggleSaveJob);
router.post("/question/:questionId", toggleSaveQuestion);

export default router;
