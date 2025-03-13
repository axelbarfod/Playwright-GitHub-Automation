# Playwright GitHub Automation

Is a TypeScript-based automation project using Playwright to interact with GitHub’s public pages. This project demonstrates web automation by searching for repositories, navigating to results, and verifying content—all while showcasing modern development practices like type safety, linting, and continuous integration.

## Features
A TypeScript-based automation project using Playwright to interact with GitHub’s public pages. This project demonstrates web automation by searching for repositories, navigating to results, and verifying content—all while showcasing modern development practices like type safety, linting, and continuous integration.

* **Repository** Search: Automates searching for GitHub repositories by keyword (e.g., "playwright").
* **Navigation**: Clicks through to the first repository result and verifies key details (e.g., name, description).
* **Type Safety**: Written in TypeScript with strict typing to ensure robust code.
* **Code Quality**: Enforced with ESLint and Prettier for consistent, error-free code.
* **CI/CD**: Integrated with GitHub Actions to lint and format code on every push.

## Prerequisites
Before running the project, ensure you have:
* [Node.js](https://nodejs.org/en) (v18 or later recommended)
* [npm](https://www.npmjs.com/) (comes with Node.js)
* A modern browser (Playwright installs its own, but ensure compatibility if using system browsers)

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

Run the Automation:
bash

npm run start  # Alias for `ts-node src/main.ts`

Lint the Code:
bash

npm run lint   # Checks for linting errors
npm run lint:fix  # Fixes linting errors automatically

Format the Code:

npm run format  # Formats with Prettier
npm run check:format  # Checks formatting compliance

## Tools
* Playwright: Browser automation framework.
* TypeScript: Static typing for safer code.
* ESLint: Linting with flat config (v9.x) and TypeScript support.
* Prettier: Code formatting for consistency.
* GitHub Actions: CI pipeline for quality checks. (wip)


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

* Built with Playwright by Microsoft.
* Inspired by the need to showcase automation skills for job applications.

