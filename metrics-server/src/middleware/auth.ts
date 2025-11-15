import { Request, Response, NextFunction } from "express";

/**
 * Authentication middleware for metrics API
 * Uses Bearer token authentication
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Missing Authorization header",
    });
    return;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer") {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authentication scheme. Expected: Bearer",
    });
    return;
  }

  if (!token) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Missing authentication token",
    });
    return;
  }

  // Verify token against environment variable
  const expectedToken = process.env.METRICS_API_KEY;

  if (!expectedToken) {
    console.error("METRICS_API_KEY not configured in environment");
    res.status(500).json({
      error: "Server Configuration Error",
      message: "Server authentication not configured",
    });
    return;
  }

  if (token !== expectedToken) {
    res.status(403).json({
      error: "Forbidden",
      message: "Invalid authentication token",
    });
    return;
  }

  // Token is valid, proceed
  next();
}
