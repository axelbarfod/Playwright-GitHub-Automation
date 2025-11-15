import "reflect-metadata";
import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiMetricsRouter from "./routes/api-metrics.js";
import e2eMetricsRouter from "./routes/e2e-metrics.js";
import { getMetricsSummary } from "./storage/metrics-storage.js";
import { authenticate } from "./middleware/auth.js";
import { initializeDatabase } from "./config/database.js";

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Support large payloads (screenshots, traces)
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (no auth required)
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "test-metrics-server",
    timestamp: new Date().toISOString(),
  });
});

// Summary endpoint (requires auth)
app.get(
  "/api/metrics/summary",
  authenticate,
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const summary = await getMetricsSummary();
      res.json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error("Error getting summary:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to get metrics summary",
      });
    }
  },
);

// Metrics routes
app.use("/api/metrics", apiMetricsRouter);
app.use("/api/metrics", e2eMetricsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// Start server with database initialization
async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log("=".repeat(60));
      console.log("📊 Test Metrics Server");
      console.log("=".repeat(60));
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Health check:     http://localhost:${PORT}/health`);
      console.log("");
      console.log("Endpoints:");
      console.log(
        `  POST   /api/metrics/api-tests  - Receive API test metrics`,
      );
      console.log(
        `  GET    /api/metrics/api-tests  - Retrieve API test metrics`,
      );
      console.log(
        `  POST   /api/metrics/e2e-tests  - Receive E2E test metrics`,
      );
      console.log(
        `  GET    /api/metrics/e2e-tests  - Retrieve E2E test metrics`,
      );
      console.log(`  GET    /api/metrics/summary    - Get metrics summary`);
      console.log("");
      console.log(
        "Authentication: Bearer token required (set METRICS_API_KEY)",
      );
      console.log("Database: MySQL connected");
      console.log("=".repeat(60));
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
