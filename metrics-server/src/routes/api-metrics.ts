import express, { Request, Response, Router } from "express";
import { saveAPIMetrics, getAPIMetrics } from "../storage/metrics-storage.js";
import { authenticate } from "../middleware/auth.js";

const router: Router = express.Router();

/**
 * POST /api/metrics/api-tests
 * Receive and store API test metrics
 */
router.post(
  "/api-tests",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = req.body;

      // Basic validation
      if (!metrics.testId || !metrics.testName || !metrics.timestamp) {
        res.status(400).json({
          error: "Bad Request",
          message: "Missing required fields: testId, testName, or timestamp",
        });
        return;
      }

      // Save metrics to database
      const saved = await saveAPIMetrics(metrics);

      res.status(201).json({
        success: true,
        message: "API test metrics received",
        id: saved.id,
        testId: metrics.testId,
        testName: metrics.testName,
        status: metrics.status,
      });
    } catch (error) {
      console.error("Error saving API metrics:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to save metrics",
      });
    }
  },
);

/**
 * GET /api/metrics/api-tests
 * Retrieve stored API test metrics
 */
router.get(
  "/api-tests",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const metrics = await getAPIMetrics({ limit, offset });

      res.json({
        success: true,
        count: metrics.length,
        metrics,
      });
    } catch (error) {
      console.error("Error retrieving API metrics:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve metrics",
      });
    }
  },
);

export default router;
