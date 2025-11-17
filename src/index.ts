import express, { type Request, type Response } from "express";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.controller.js";
import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware/middleware.js";

configDotenv();
const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  "http://192.168.29.223:3000",
  "http://82.112.237.169:3000",
  "http://192.168.29.134:3000",
  "http://72.61.172.184:3000",
];

// ✅ CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman, mobile apps

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
// ❌ WRONG → app.get("/api/auth", authRoutes)
// ✅ RIGHT:
app.use("/api/auth", authRoutes);
app.use("/api/task", authMiddleware, taskRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "NodeNext server running!" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
