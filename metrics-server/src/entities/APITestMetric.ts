import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("api_test_metrics")
@Index(["testName", "createdAt"])
@Index(["status", "createdAt"])
@Index(["environment"])
export class APITestMetric {
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
  status!: string; // 'passed' | 'failed' | 'skipped' | 'timedOut'

  @Column({ type: "int" })
  duration!: number; // milliseconds

  @Column({ type: "int", default: 0 })
  retryCount!: number;

  // API Call Metrics (stored as JSON)
  @Column({ type: "json" })
  apiCalls!: {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    requestSize: number;
    responseSize: number;
    headers: Record<string, string>;
    rateLimitRemaining?: number;
    rateLimitReset?: number;
  }[];

  // Performance Aggregates
  @Column({ type: "int" })
  totalApiTime!: number;

  @Column({ type: "int" })
  averageResponseTime!: number;

  @Column({ type: "json" })
  slowestCall!: {
    endpoint: string;
    duration: number;
  };

  // Schema Validations (stored as JSON)
  @Column({ type: "json", nullable: true })
  schemaValidations?: {
    schema: string;
    valid: boolean;
    validationTime: number;
  }[];

  // Error Details (stored as JSON, nullable)
  @Column({ type: "json", nullable: true })
  error?: {
    message: string;
    stack?: string;
    apiError?: {
      endpoint: string;
      statusCode: number;
      errorBody: string;
    };
  };

  // Additional Metadata (stored as JSON, nullable)
  @Column({ type: "json", nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}
