import express, { Request, Response, Router } from "express";
import { saveE2EMetrics, getE2EMetrics } from "../storage/metrics-storage.js";
import { authenticate } from "../middleware/auth.js";

const router: Router = express.Router();

/**
 * POST /api/metrics/e2e-tests
 * Receive and store E2E test metrics
 */
router.post(
  "/e2e-tests",
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
      const saved = await saveE2EMetrics(metrics);

      res.status(201).json({
        success: true,
        message: "E2E test metrics received",
        id: saved.id,
        testId: metrics.testId,
        testName: metrics.testName,
        status: metrics.status,
        browser: metrics.browser,
      });
    } catch (error) {
      console.error("Error saving E2E metrics:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to save metrics",
      });
    }
  },
);

/**
 * GET /api/metrics/e2e-tests
 * Retrieve stored E2E test metrics
 */
router.get(
  "/e2e-tests",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const metrics = await getE2EMetrics({ limit, offset });

      res.json({
        success: true,
        count: metrics.length,
        metrics,
      });
    } catch (error) {
      console.error("Error retrieving E2E metrics:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve metrics",
      });
    }
  },
);

export default router;
