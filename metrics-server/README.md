# Test Metrics Server

A TypeScript-based Express.js API server for collecting and storing test metrics from Playwright tests.

## Features

- ✅ Receives API and E2E test metrics via REST endpoints
- ✅ Bearer token authentication
- ✅ File-based JSON storage (easy to query and backup)
- ✅ Retrieve stored metrics with pagination
- ✅ Summary statistics endpoint
- ✅ CORS enabled for browser access
- ✅ Health check endpoint
- ✅ Written in TypeScript for type safety
- ✅ Hot reload in development mode

## Quick Start

### 1. Install Dependencies

```bash
cd metrics-server
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
PORT=3000
METRICS_API_KEY=my-secret-key-12345
```

**Important:** Use the same `METRICS_API_KEY` in your main project's `.env` file!

### 3. Start the Server

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

## Data Storage

Metrics are stored as JSON files in the `data/` directory:

```
metrics-server/data/
├── api-metrics/
│   ├── 2025-01-14_test-123_2025-01-14T10-30-00-000Z.json
│   └── 2025-01-14_test-124_2025-01-14T10-31-00-000Z.json
└── e2e-metrics/
    ├── 2025-01-14_test-456_2025-01-14T10-35-00-000Z.json
    └── 2025-01-14_test-457_2025-01-14T10-36-00-000Z.json
```

### Benefits of File Storage

- **Easy to query**: Use standard filesystem tools
- **Easy to backup**: Just copy the `data/` folder
- **Human-readable**: JSON format, no database needed
- **Version control friendly**: Can commit summaries to git
- **Easy migration**: Import into any database later

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
│   ├── middleware/
│   │   └── auth.ts              # Authentication middleware
│   ├── routes/
│   │   ├── api-metrics.ts       # API test metrics routes
│   │   └── e2e-metrics.ts       # E2E test metrics routes
│   └── storage/
│       └── metrics-storage.ts   # File-based storage layer
├── dist/                         # Compiled JavaScript (generated)
├── data/                         # Metrics storage
│   ├── api-metrics/
│   └── e2e-metrics/
├── package.json
├── tsconfig.json                 # TypeScript configuration
└── .env                          # Environment variables
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `METRICS_API_KEY` | Yes | - | Authentication token |

## Troubleshooting

### "METRICS_API_KEY not configured"
- Make sure `.env` file exists in `metrics-server/`
- Verify `METRICS_API_KEY` is set in `.env`

### "Unauthorized" or "Forbidden"
- Check that `METRICS_API_KEY` matches between server and client
- Ensure you're sending `Authorization: Bearer TOKEN` header

### "ENOENT: no such file or directory"
- Server creates `data/` directory automatically on startup
- Check file system permissions

### Metrics not appearing
- Check server logs for errors
- Verify endpoint URL is correct: `http://localhost:3000`
- Test with curl to isolate the issue

## Roadmap

Future enhancements:
- [ ] PostgreSQL/MongoDB support
- [ ] Built-in dashboard UI
- [ ] Metrics aggregation and trending
- [ ] Alerts and notifications
- [ ] Export to CSV/Excel
- [ ] Grafana integration
- [ ] Performance baseline comparison

## License

MIT
