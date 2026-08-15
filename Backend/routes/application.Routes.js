import express from "express";

import { authMiddleware, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  applyJob,
  getApplicants,
  getUserApplication,
} from "../controllers/application.controller.js";

const applicationRouter = express.Router();

applicationRouter.post("/apply/:id", authMiddleware, applyJob);
applicationRouter.get("/user", authMiddleware, getUserApplication);
applicationRouter.get(
  "/:id/applicants",
  authMiddleware,
  authorize("admin"),
  getApplicants,
);

export default applicationRouter;
