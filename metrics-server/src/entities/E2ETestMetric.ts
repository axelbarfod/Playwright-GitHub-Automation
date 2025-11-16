import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("e2e_test_metrics")
@Index(["testName", "createdAt"])
@Index(["status", "createdAt"])
@Index(["browser"])
@Index(["environment"])
export class E2ETestMetric {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  @Index()
  testId!: string;

  @Column({ type: "varchar", length: 500 })
  testName!: string;

  @Column({ type: "varchar", length: 500 })
  suiteName!: string;

  @Column({ type: "datetime" })
  @Index()
  timestamp!: Date;

  @Column({ type: "varchar", length: 10 })
  environment!: string; // 'local' | 'ci'

  @Column({ type: "varchar", length: 20 })
  browser!: string; // 'chromium' | 'firefox' | 'webkit'

  @Column({ type: "varchar", length: 20 })
  status!: string; // 'passed' | 'failed' | 'flaky' | 'skipped' | 'timedOut'

  @Column({ type: "int" })
  duration!: number; // milliseconds

  @Column({ type: "int", default: 0 })
  retryCount!: number;

  // Page Performance Metrics (stored as JSON)
  @Column({ type: "json" })
  pageMetrics!: {
    url: string;
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    timeToInteractive: number;
    totalSize: number;
    requestCount: number;
  }[];

  // Browser Performance (stored as JSON)
  @Column({ type: "json" })
  browserMetrics!: {
    memoryUsage: number;
    cpuUsage?: number;
  };

  // User Action Metrics (stored as JSON)
  @Column({ type: "json" })
  actionMetrics!: {
    action: string;
    selector: string;
    duration: number;
    screenshot?: string;
  }[];

  // Network Metrics (stored as JSON)
  @Column({ type: "json" })
  networkMetrics!: {
    totalRequests: number;
    failedRequests: number;
    totalTransferred: number;
    resourceTypes: Record<string, number>;
  };

  // Visual Metrics (stored as JSON, nullable)
  @Column({ type: "json", nullable: true })
  visualMetrics?: {
    screenshotsTaken: number;
    visualDiff?: number;
    snapshotComparisons?: number;
  };

  // Error Details (stored as JSON, nullable)
  @Column({ type: "json", nullable: true })
  error?: {
    message: string;
    stack?: string;
    screenshot?: string;
    trace?: string;
    videoUrl?: string;
  };

  // Additional Metadata (stored as JSON, nullable)
  @Column({ type: "json", nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}
