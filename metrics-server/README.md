# Test Metrics Server

A TypeScript-based Express.js API server for collecting and storing test metrics from Playwright tests in MySQL database.

## Features

- ✅ Receives API and E2E test metrics via REST endpoints
- ✅ Bearer token authentication
- ✅ **MySQL database storage** with TypeORM
- ✅ **Automatic database migrations**
- ✅ Retrieve stored metrics with pagination
- ✅ Summary statistics endpoint
- ✅ CORS enabled for browser access
- ✅ Health check endpoint
- ✅ Written in TypeScript for type safety
- ✅ Hot reload in development mode
- ✅ Indexed queries for fast performance

## Quick Start

### 1. Install Dependencies

```bash
cd metrics-server
npm install
```

### 2. Set Up MySQL Database

Create a MySQL database for storing metrics:

```sql
mysql -u root -p
CREATE DATABASE automation_metrics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON automation_metrics.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Server Configuration
PORT=3000
METRICS_API_KEY=my-secret-key-12345

# Database Configuration
DB_NAME=automation_metrics
DB_USER=root
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=3306
```

**Important:**
- Use the same `METRICS_API_KEY` in your main project's `.env` file!
- Update database credentials to match your MySQL setup

### 4. Run Database Migrations

Migrations run **automatically** on server start, but you can also run them manually:

```bash
# Run pending migrations
npm run migration:run

# Revert last migration (if needed)
npm run migration:revert
```

### 5. Start the Server

**Development mode (with hot reload using tsx):**
```bash
npm run dev
```

**Production mode (builds TypeScript first):**
```bash
npm start
```

**Or build and run separately:**
```bash
npm run build      # Compiles TypeScript to dist/
node dist/index.js # Run the compiled JavaScript
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```bash
GET /health
```
No authentication required. Returns server status.

**Example:**
```bash
curl http://localhost:3000/health
```

### Receive API Test Metrics
```bash
POST /api/metrics/api-tests
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/metrics/api-tests \
  -H "Authorization: Bearer my-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "testId": "test-123",
    "testName": "Get Issues Test",
    "timestamp": "2025-01-14T10:30:00Z",
    "status": "passed",
    "duration": 1250
  }'
```

### Retrieve API Test Metrics
```bash
GET /api/metrics/api-tests?limit=50&offset=0
Authorization: Bearer YOUR_API_KEY
```

**Example:**
```bash
curl http://localhost:3000/api/metrics/api-tests \
  -H "Authorization: Bearer my-secret-key-12345"
```

### Receive E2E Test Metrics
```bash
POST /api/metrics/e2e-tests
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/metrics/e2e-tests \
  -H "Authorization: Bearer my-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "testId": "test-456",
    "testName": "Login Flow Test",
    "timestamp": "2025-01-14T10:35:00Z",
    "status": "passed",
    "browser": "chromium",
    "duration": 3500
  }'
```

### Retrieve E2E Test Metrics
```bash
GET /api/metrics/e2e-tests?limit=50&offset=0
Authorization: Bearer YOUR_API_KEY
```

### Get Metrics Summary
```bash
GET /api/metrics/summary
Authorization: Bearer YOUR_API_KEY
```

Returns overall statistics including total metrics count and pass rates.

**Example:**
```bash
curl http://localhost:3000/api/metrics/summary \
  -H "Authorization: Bearer my-secret-key-12345"
```

## Database Schema

Metrics are stored in MySQL database with two main tables managed by TypeORM:

### `api_test_metrics` Table

Stores API test execution metrics with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | UUID primary key |
| `testId` | VARCHAR(255) | Test identifier (indexed) |
| `testName` | VARCHAR(500) | Test name |
| `suiteName` | VARCHAR(500) | Test suite name |
| `timestamp` | DATETIME | Test execution timestamp (indexed) |
| `environment` | VARCHAR(10) | Test environment (dev/prod, indexed) |
| `status` | VARCHAR(20) | Test status (passed/failed/skipped, indexed) |
| `duration` | INT | Total test duration in ms |
| `retryCount` | INT | Number of retries |
| `apiCalls` | JSON | Array of API call details |
| `totalApiTime` | INT | Sum of all API call times |
| `averageResponseTime` | INT | Average API response time |
| `slowestCall` | JSON | Details of slowest API call |
| `schemaValidations` | JSON | Schema validation results (nullable) |
| `error` | JSON | Error details if test failed (nullable) |
| `metadata` | JSON | Additional metadata (nullable) |
| `createdAt` | DATETIME | Record creation timestamp |

**Indices:**
- `IDX_api_testId` on `testId`
- `IDX_api_testName_createdAt` on `testName, createdAt`
- `IDX_api_status_createdAt` on `status, createdAt`
- `IDX_api_environment` on `environment`
- `IDX_api_timestamp` on `timestamp`

### `e2e_test_metrics` Table

Stores E2E test execution metrics:

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | UUID primary key |
| `testId` | VARCHAR(255) | Test identifier (indexed) |
| `testName` | VARCHAR(500) | Test name |
| `suiteName` | VARCHAR(500) | Test suite name |
| `timestamp` | DATETIME | Test execution timestamp (indexed) |
| `environment` | VARCHAR(10) | Test environment (dev/prod, indexed) |
| `browser` | VARCHAR(20) | Browser used (chromium/firefox/webkit, indexed) |
| `status` | VARCHAR(20) | Test status (indexed) |
| `duration` | INT | Total test duration in ms |
| `retryCount` | INT | Number of retries |
| `pageMetrics` | JSON | Page performance metrics |
| `browserMetrics` | JSON | Browser-specific metrics |
| `actionMetrics` | JSON | User action timings |
| `networkMetrics` | JSON | Network performance data |
| `visualMetrics` | JSON | Visual regression data (nullable) |
| `error` | JSON | Error details if test failed (nullable) |
| `metadata` | JSON | Additional metadata (nullable) |
| `createdAt` | DATETIME | Record creation timestamp |

**Indices:**
- `IDX_e2e_testId` on `testId`
- `IDX_e2e_testName_createdAt` on `testName, createdAt`
- `IDX_e2e_status_createdAt` on `status, createdAt`
- `IDX_e2e_browser` on `browser`
- `IDX_e2e_environment` on `environment`
- `IDX_e2e_timestamp` on `timestamp`

### Database Benefits

- **Fast queries**: Optimized indices for common query patterns
- **Structured data**: Strongly typed columns with JSON for complex nested data
- **Easy backup**: Standard MySQL backup tools (mysqldump)
- **Scalable**: Can handle millions of metrics records
- **Version controlled schema**: Migrations tracked in source control

## Database Migrations

The server uses TypeORM migrations for version-controlled schema changes.

### Automatic Migrations

Migrations run **automatically** when the server starts. You'll see output like:

```
🔄 Running pending migrations...
✅ Migrations completed successfully
🚀 Metrics Server running on http://localhost:3000
```

### Manual Migration Commands

```bash
# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Generate a new migration (after changing entities)
npm run migration:generate -- src/migrations/YourMigrationName
```

### Creating New Migrations

When you modify entity files (`src/entities/*.ts`), generate a migration:

1. **Update the entity** (e.g., add a new column to `APITestMetric.ts`)
2. **Generate migration**:
   ```bash
   npm run migration:generate -- src/migrations/AddNewColumn
   ```
3. **Review the generated migration** in `src/migrations/`
4. **Run the migration**:
   ```bash
   npm run migration:run
   # Or just restart the server (auto-runs migrations)
   ```

### Migration Files Location

Migrations are stored in `src/migrations/` and tracked in git:

```
src/migrations/
└── 1700000000000-InitialSchema.ts  # Creates initial tables and indices
```

### Example: Querying Metrics

```sql
-- Get all failed API tests from last 24 hours
SELECT testName, status, duration, createdAt
FROM api_test_metrics
WHERE status = 'failed'
  AND createdAt > DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY createdAt DESC;

-- Get average test duration by browser
SELECT browser, AVG(duration) as avg_duration, COUNT(*) as test_count
FROM e2e_test_metrics
WHERE createdAt > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY browser;

-- Find slowest tests
SELECT testName, MAX(duration) as max_duration
FROM api_test_metrics
GROUP BY testName
ORDER BY max_duration DESC
LIMIT 10;
```

## Connecting Your Tests

Update your main project's `.env`:

```bash
METRICS_ENDPOINT=http://localhost:3000
METRICS_API_KEY=my-secret-key-12345
```

Now run your tests and metrics will be sent automatically!

```bash
npm run test:api
```

## Authentication

All endpoints except `/health` require Bearer token authentication.

Include the token in the `Authorization` header:
```
Authorization: Bearer YOUR_API_KEY
```

The token must match the `METRICS_API_KEY` environment variable.

## Deployment

### Local Development
```bash
npm run dev
```

### Production

**Option 1: Node.js directly**
```bash
npm start
```

**Option 2: PM2 (recommended for production)**
```bash
npm install -g pm2
pm2 start index.js --name metrics-server
pm2 save
```

**Option 3: Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloud Deployment

The server can be deployed to:
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **DigitalOcean App Platform**: Import from GitHub
- **AWS EC2/ECS**: Standard Node.js deployment
- **Vercel/Netlify**: May need serverless adaptation

## Project Structure

```
metrics-server/
├── src/                          # TypeScript source files
│   ├── index.ts                  # Main server application
│   ├── config/
│   │   └── database.ts          # TypeORM DataSource configuration
│   ├── entities/
│   │   ├── APITestMetric.ts     # API test metrics entity
│   │   └── E2ETestMetric.ts     # E2E test metrics entity
│   ├── migrations/
│   │   └── 1700000000000-InitialSchema.ts  # Database migrations
│   ├── middleware/
│   │   └── auth.ts              # Authentication middleware
│   ├── routes/
│   │   ├── api-metrics.ts       # API test metrics routes
│   │   └── e2e-metrics.ts       # E2E test metrics routes
│   └── storage/
│       └── metrics-storage.ts   # Database storage layer (TypeORM)
├── dist/                         # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json                 # TypeScript configuration
└── .env                          # Environment variables
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `METRICS_API_KEY` | Yes | - | Authentication token |
| `DB_NAME` | Yes | `automation_metrics` | MySQL database name |
| `DB_USER` | Yes | - | MySQL username |
| `DB_PASS` | Yes | - | MySQL password |
| `DB_HOST` | No | `localhost` | MySQL host |
| `DB_PORT` | No | `3306` | MySQL port |

## Troubleshooting

### "METRICS_API_KEY not configured"
- Make sure `.env` file exists in `metrics-server/`
- Verify `METRICS_API_KEY` is set in `.env`

### "Unauthorized" or "Forbidden"
- Check that `METRICS_API_KEY` matches between server and client
- Ensure you're sending `Authorization: Bearer TOKEN` header

### Database Connection Errors

**"Error initializing database" or "ECONNREFUSED"**
- Verify MySQL is running: `mysql -u root -p`
- Check database credentials in `.env` file match your MySQL setup
- Ensure the database exists: `CREATE DATABASE automation_metrics;`
- Check that MySQL is listening on the correct port (default: 3306)

**"Access denied for user"**
- Verify `DB_USER` and `DB_PASS` are correct in `.env`
- Grant privileges: `GRANT ALL PRIVILEGES ON automation_metrics.* TO 'user'@'localhost';`

**"Unknown database"**
- Create the database first: `CREATE DATABASE automation_metrics;`
- Verify `DB_NAME` matches the database you created

### Migration Errors

**"QueryFailedError" during migrations**
- Check if migrations were already applied: `npm run migration:run`
- Try reverting last migration: `npm run migration:revert`
- Verify database schema matches expected state

**"No pending migrations"**
- This is normal if all migrations are already applied
- Server will start normally

### Metrics not appearing

**In database:**
```sql
-- Check if data is being stored
SELECT COUNT(*) FROM api_test_metrics;
SELECT COUNT(*) FROM e2e_test_metrics;

-- Check latest records
SELECT * FROM api_test_metrics ORDER BY createdAt DESC LIMIT 5;
```

**If no data:**
- Check server logs for errors
- Verify endpoint URL is correct: `http://localhost:3000`
- Test with curl to isolate the issue
- Ensure authentication token is correct

## Roadmap

Future enhancements:
- [ ] Built-in dashboard UI for visualizing metrics
- [ ] PostgreSQL/MongoDB support (MySQL currently implemented)
- [ ] Metrics aggregation and trending charts
- [ ] Alerts and notifications for test failures
- [ ] Export to CSV/Excel reports
- [ ] Grafana/Prometheus integration
- [ ] Performance baseline comparison and regression detection
- [ ] Historical trend analysis and reporting
- [ ] Flaky test detection and tracking
- [ ] Test execution time forecasting

## License

MIT
