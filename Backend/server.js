import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.Routes.js";

const PORT = 5000;
const app = express();

//db
connectDB();

//middleware
app.use(express.json());
app.use(cors());

//routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("API working");
});

app.listen(PORT, () => {
  console.log(`Server Started on http://localhost:${PORT}`);
});
