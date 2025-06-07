import logger from "./logger";

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryCondition?: (error: any) => boolean;
}

export class RetryUtils {
  /**
   * Retries an async operation with exponential backoff
   * @param operation - The async operation to retry
   * @param options - Retry configuration options
   * @returns Promise resolving to the operation result
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<T> {
    const {
      maxRetries = 5,
      baseDelay = 1000,
      maxDelay = 10000,
      retryCondition = (error) => true, // Retry on any error by default
    } = options;

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 0) {
          logger.info(`Operation succeeded on attempt ${attempt + 1}`);
        }
        return result;
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !retryCondition(error)) {
          break;
        }

        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        logger.warn(
          `Operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms... Error: ${lastError.message}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Specific retry logic for GitHub API 404 errors
   */
  static async retryGitHubOperation<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    return this.withRetry(operation, {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 8000,
      retryCondition: (error) => {
        // Retry on 404 errors (repository not yet available) or network errors
        return (
          error.message?.includes("404") || error.message?.includes("Not Found")
        );
      },
    });
  }
}
