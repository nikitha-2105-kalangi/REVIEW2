const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Initialize database schema and admin seed
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite development (port 5173 and standard origins)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root & Health check routes
app.get("/", (req, res) => {
  res.send("JobTrack API Server Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "JobTrack Backend API",
    time: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "An unexpected error occurred on the server.",
  });
});

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` JobTrack Express Backend Server Started!      `);
  console.log(` Running on: http://localhost:${PORT}          `);
  console.log(` Database: SQLite (jobtrack.db)                `);
  console.log(` Initial Admin: admin@jobtrack.com             `);
  console.log(`===============================================`);
});

module.exports = { app, server };
