import { expect, test } from "@playwright/test";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { StringUtils } from "../../utils/stringUtils";
import { GithubIssueService } from "../../../service/issue/GithubIssueService";
import {
  GitHubIssue,
  GitHubIssuesResponse,
} from "../../../model/issues/IssuesModel";

test.describe("Issues Landing", () => {
  const schema = StringUtils.readSchemaFile("/issues/issues.json");
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  let githubService: GithubIssueService;
  test.beforeEach(async ({ request }) => {
    githubService = new GithubIssueService(request);
  });

  test(`List Issues Assigned to ${process.env.GH_USER}`, async () => {
    const apiResponse: GitHubIssuesResponse = await githubService.getIssues();
    expect(apiResponse.length).toBeGreaterThan(0);
    const validate = ajv.compile(schema);
    const isValid = validate(apiResponse);

    expect(
      isValid,
      `Schema validation failed: ${JSON.stringify(validate.errors, null, 2)}`,
    ).toBe(true);
  });

  test(`List repository issues assigned to ${process.env.GH_USER}`, async () => {
    const apiResponse: GitHubIssuesResponse = await githubService.getIssues();

    expect(apiResponse.length).toBeGreaterThan(0);
    expect(apiResponse[0].user.login).toBe(`${process.env.GH_USER}`);
    const validate = ajv.compile(schema);
    const isValid = validate(apiResponse);
    expect(
      isValid,
      `Schema validation failed: ${JSON.stringify(validate.errors, null, 2)}`,
    ).toBe(true);
  });

  test("Get a specific issue", async () => {
    const apiResponse: GitHubIssuesResponse = await githubService.getIssues();

    if (apiResponse.length === 0) {
      return;
    }

    const issue: GitHubIssue = await githubService.getIssue(
      apiResponse[0].number,
    );
    expect(issue.number).toBe(apiResponse[0].number);
  });
});
