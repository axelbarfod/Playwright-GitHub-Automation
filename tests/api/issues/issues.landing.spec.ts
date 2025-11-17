import { StringUtils } from "../../utils/stringUtils";
import {
  GitHubIssue,
  GitHubIssuesResponse,
} from "../../../model/issues/IssuesModel";
import { expect, test } from "../../../fixture/GithubFixture";

test.describe("Issues Landing", () => {
  const schema = StringUtils.readSchemaFile("/issues/issues.json");

  test(`List Issues Assigned to ${process.env.GH_USER}`, async ({
    ajv,
    githubIssueService,
    metricsCollector,
  }) => {
    const apiResponse: GitHubIssuesResponse =
      await githubIssueService.getIssues();
    expect(apiResponse.length).toBeGreaterThan(0);
    const validate = ajv.compile(schema);

    const validationStart = performance.now();
    const isValid = validate(apiResponse);
    const validationTime = performance.now() - validationStart;

    metricsCollector.recordSchemaValidation(
      "issues.json",
      isValid,
      validationTime,
    );

    expect(
      isValid,
      `Schema validation failed: ${JSON.stringify(validate.errors, null, 2)}`,
    ).toBe(true);
  });

  test(`List repository issues assigned to ${process.env.GH_USER}`, async ({
    ajv,
    githubIssueService,
    metricsCollector,
  }) => {
    const apiResponse: GitHubIssuesResponse =
      await githubIssueService.getIssues();

    expect(apiResponse.length).toBeGreaterThan(0);
    expect(apiResponse[0].user.login).toBe(`${process.env.GH_USER}`);
    const validate = ajv.compile(schema);

    const validationStart = performance.now();
    const isValid = validate(apiResponse);
    const validationTime = performance.now() - validationStart;

    metricsCollector.recordSchemaValidation(
      "issues.json",
      isValid,
      validationTime,
    );

    expect(
      isValid,
      `Schema validation failed: ${JSON.stringify(validate.errors, null, 2)}`,
    ).toBe(true);
  });

  test("Get a specific issue", async ({ githubIssueService }) => {
    const apiResponse: GitHubIssuesResponse =
      await githubIssueService.getIssues();

    if (apiResponse.length === 0) {
      return;
    }

    const issue: GitHubIssue = await githubIssueService.getIssue(
      apiResponse[0].number,
    );
    expect(issue.number).toBe(apiResponse[0].number);
  });
});
