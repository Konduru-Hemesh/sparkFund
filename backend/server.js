import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import connectDB from "./config/database.js";
import "./config/firebase.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import ideaRoutes from "./routes/ideas.js";
import investorRoutes from "./routes/investors.js";
import chatRoutes from "./routes/chat.js";
import notificationRoutes from "./routes/notifications.js";
import aiRoutes from "./routes/ai.js";

import { authMiddleware } from "./middleware/auth.js";
import { setupSocketHandlers } from "./controllers/socketController.js";
import User from "./models/User.js";
import Idea from "./models/Idea.js";

dotenv.config();

const app = express();
const server = createServer(app);
// Safely resolve allowed origins from env; support comma-separated list, tolerate missing var
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : "*",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // if no explicit origins configured, allow all to prevent crashes in staging
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // allow Vercel preview domains by default if configured FRONTEND_URL includes a vercel app
      try {
        const hostname = new URL(origin).hostname;
        if (hostname.endsWith(".vercel.app")) {
          return callback(null, true);
        }
      } catch (_) {}
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/ideas", authMiddleware, ideaRoutes);
app.use("/api/investors", authMiddleware, investorRoutes);
app.use("/api/chat", authMiddleware, chatRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);
app.use("/api/ai", authMiddleware, aiRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Public stats endpoint for landing page
app.get("/api/stats", async (req, res) => {
  try {
    const totalIdeas = await Idea.countDocuments({ status: "published" });
    const totalUsers = await User.countDocuments();
    const totalFunding = await Idea.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: null, total: { $sum: "$currentFunding" } } }
    ]);
    
    // Calculate success rate (ideas that reached at least 80% of goal)
    const successfulIdeas = await Idea.countDocuments({
      status: { $in: ["published", "funded"] },
      $expr: { $gte: [{ $divide: ["$currentFunding", "$fundingGoal"] }, 0.8] }
    });
    
    const successRate = totalIdeas > 0 
      ? Math.round((successfulIdeas / totalIdeas) * 100) 
      : 0;

    res.json({
      totalIdeas: totalIdeas || 0,
      totalUsers: totalUsers || 0,
      totalFunding: totalFunding[0]?.total || 0,
      successRate: successRate || 0,
    });
  } catch (error) {
    console.error("Get public stats error:", error);
    // Return default values on error so landing page still works
    res.json({
      totalIdeas: 0,
      totalUsers: 0,
      totalFunding: 0,
      successRate: 0,
    });
  }
});

// Socket.IO setup
setupSocketHandlers(io);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? error.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
