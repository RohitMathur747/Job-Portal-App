import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.Routes.js";
import userRouter from "./routes/user.Routes.js";
import companyRouter from "./routes/company.routes.js";
import jobRouter from "./routes/job.Routes.js";
import applicationRouter from "./routes/application.Routes.js";
import interviewRouter from "./routes/interview.Routes.js";
import savedRouter from "./routes/saved.Routes.js";
import inquiryRouter from "./routes/inquiry.Routes.js";

const PORT = 5000;
const app = express();

//db
connectDB();

//middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

app.use("/uploads", express.static("uploads"));

//routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/job", jobRouter);
app.use("/api/application", applicationRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/saved", savedRouter);
app.use("/api/inquiry", inquiryRouter);

app.get("/", (req, res) => {
  res.send("API working");
});

app.listen(PORT, () => {
  console.log(`Server Started on http://localhost:${PORT}`);
});
