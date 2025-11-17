# Playwright GitHub Automation

Is a TypeScript-based automation project using Playwright to interact with GitHub’s public pages. This project
demonstrates web automation by searching for repositories, navigating to results, and verifying content—all while
showcasing modern development practices like type safety, linting, and continuous integration.

## Features

A TypeScript-based automation project using Playwright to interact with GitHub’s public pages. This project demonstrates
web automation by searching for repositories, navigating to results, and verifying content—all while showcasing modern
development practices like type safety, linting, and continuous integration.

- **Repository** Search: Automates searching for GitHub repositories by keyword (e.g., "playwright").
- **Navigation**: Clicks through to the first repository result and verifies key details (e.g., name, description).
- **Type Safety**: Written in TypeScript with strict typing to ensure robust code.
- **Code Quality**: Enforced with ESLint and Prettier for consistent, error-free code.
- **CI/CD**: Integrated with GitHub Actions to lint and format code on every push.

## Prerequisites

Before running the project, ensure you have:

- [Node.js](https://nodejs.org/en) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A modern browser (Playwright installs its own, but ensure compatibility if using system browsers)

## Installation

1. Clone the Repository:

`git clone https://github.com/your-username/playwright-github-automation.git
cd playwright-github-automation`

2. Install Dependencies:

`npm install`

3. Install Playwright Browsers:

`npx playwright install`

## Usage

Run the automation script to see it in action:

`npm test`

Check in the [package.json](package.json) for the rest of the npm commands available.

## Scripts

### Run the Automation:

`npm run start`

### Lint the Code:

`npm run lint` # Checks for linting errors
`npm run lint:fix` # Fixes linting errors automatically

### Format the Code:

`npm run format` # Formats with Prettier
`npm run check:format ` # Checks formatting compliance

## Tools

- Playwright: Browser automation framework.
- TypeScript: Static typing for safer code.
- ESLint: Linting with flat config (v9.x) and TypeScript support.
- Prettier: Code formatting for consistency.
- GitHub Actions: CI pipeline for quality checks. (wip)

## API Testing

This project includes comprehensive API tests for GitHub's REST API with full JSON schema validation, metrics collection, and automated cleanup.

### Supported Endpoints

#### Repositories API

- `GET /repos/{owner}/{repo}` - Get a specific repository
- `GET /user/repos` - List repositories for authenticated user
- `POST /user/repos` - Create a new repository
- `DELETE /repos/{owner}/{repo}` - Delete a repository

#### Pull Requests API

- `GET /repos/{owner}/{repo}/pulls` - List pull requests (with filtering)
- `GET /repos/{owner}/{repo}/pulls/{number}` - Get a specific pull request
- `POST /repos/{owner}/{repo}/pulls` - Create a pull request
- `PATCH /repos/{owner}/{repo}/pulls/{number}` - Update a pull request
- `PUT /repos/{owner}/{repo}/pulls/{number}/merge` - Merge a pull request
- `GET /repos/{owner}/{repo}/pulls/{number}/merge` - Check if PR is merged

#### Issues API

- `GET /issues` - List issues assigned to authenticated user
- `GET /repos/{owner}/{repo}/issues/{number}` - Get a specific issue

#### Search API

- `GET /search/repositories` - Search for repositories by query

### Test Features

- **JSON Schema Validation**: All API responses are validated against JSON schemas
- **Metrics Collection**: Automatic tracking of API performance, rate limits, and response times
- **Retry Logic**: Handles GitHub API eventual consistency with exponential backoff
- **Automatic Cleanup**: Test repositories are automatically deleted after test completion
- **Type Safety**: Full TypeScript types for all API requests and responses

### Running API Tests

Run all API tests:

```bash
npm test -- --project=api
```

Run specific test suites:

```bash
# Pull Requests tests
npx playwright test tests/api/pullrequests --project=api

# Repositories tests
npx playwright test tests/api/repositories --project=api

# Issues tests
npx playwright test tests/api/issues --project=api

# Search tests
npx playwright test tests/api/search --project=api
```

### Environment Variables

Create a `.env` file with:

```
GH_TOKEN=your_github_personal_access_token
GH_USER=your_github_username
METRICS_ENDPOINT=http://localhost:3000
METRICS_API_KEY=your_metrics_api_key
```

### Test Reports

View test results with Allure reports:

```bash
npm run allure:generate
npm run allure:open
```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please ensure your code passes linting and formatting checks before submitting.

## License

This project is licensed under the MIT License (LICENSE). Feel free to use, modify, and distribute it as needed.

## Acknowledgments

- Built with Playwright by Microsoft.
- Inspired by the need to showcase automation skills for job applications.
