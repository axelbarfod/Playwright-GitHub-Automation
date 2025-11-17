import logger from "../../utils/logger";
import { StringUtils } from "../../utils/stringUtils";
import { PullRequest } from "../../../model/pullrequest/PullRequest";
import { GitHubRepository } from "../../../model/repository/Repository";
import { RetryUtils } from "../../utils/retryUtils";
import { expect, test } from "../../../fixture/GithubFixture";
import { ValidateFunction } from "ajv";

test.describe("Github Pull Requests API tests", () => {
  const publicOwner = "torvalds";
  const publicRepo = "linux";

  test("List pull requests for a public repository", async ({
    ajv,
    githubPullRequestService,
    metricsCollector,
  }) => {
    logger.info(
      `Listing pull requests for ${publicOwner}/${publicRepo} with state=closed`,
    );
    const schema = StringUtils.readSchemaFile(
      "/pullrequests/pull-requests-list-schema.json",
    );
    const validate: ValidateFunction = ajv.compile(schema);

    const pullRequests: PullRequest[] =
      await githubPullRequestService.listPullRequests(publicOwner, publicRepo, {
        state: "closed",
        per_page: 5,
      });

    expect(pullRequests).toBeDefined();
    expect(Array.isArray(pullRequests)).toBe(true);

    if (pullRequests.length > 0) {
      const validationStart = performance.now();
      const isValid = validate(pullRequests);
      const validationTime = performance.now() - validationStart;

      metricsCollector.recordSchemaValidation(
        "pull-requests-list-schema.json",
        isValid,
        validationTime,
      );

      if (!isValid) {
        logger.log(
          "Validation errors:",
          StringUtils.prettyPrintJson(validate.errors),
        );
      }
      expect(isValid).toBe(true);

      logger.info(`Found ${pullRequests.length} pull requests`);
      expect(pullRequests[0].state).toBe("closed");
    }
  });

  test("Get a specific pull request from a public repository", async ({
    ajv,
    githubPullRequestService,
    metricsCollector,
  }) => {
    logger.info(
      `Getting a specific pull request from ${publicOwner}/${publicRepo}`,
    );

    const schema = StringUtils.readSchemaFile(
      "/pullrequests/pull-request-schema.json",
    );
    const validate: ValidateFunction = ajv.compile(schema);

    const pullRequests: PullRequest[] =
      await githubPullRequestService.listPullRequests(publicOwner, publicRepo, {
        state: "closed",
        per_page: 1,
      });

    if (pullRequests.length > 0) {
      const prNumber = pullRequests[0].number;
      logger.info(`Fetching PR #${prNumber}`);

      const pullRequest: PullRequest =
        await githubPullRequestService.getPullRequest(
          publicOwner,
          publicRepo,
          prNumber,
        );

      expect(pullRequest).toBeDefined();
      expect(pullRequest.number).toBe(prNumber);

      const validationStart = performance.now();
      const isValid = validate(pullRequest);
      const validationTime = performance.now() - validationStart;

      metricsCollector.recordSchemaValidation(
        "pull-request-schema.json",
        isValid,
        validationTime,
      );

      if (!isValid) {
        logger.log(
          "Validation errors:",
          StringUtils.prettyPrintJson(validate.errors),
        );
      }
      expect(isValid).toBe(true);
    }
  });

  test("Create, update, and merge a pull request", async ({
    ajv,
    githubPullRequestService,
    githubRepoService,
    request,
    metricsCollector,
  }) => {
    const repoName = `test-pr-repo-${Date.now()}`;
    const owner = process.env.GH_USER!;

    logger.info(`Creating test repository: ${repoName}`);

    const prSchema = StringUtils.readSchemaFile(
      "/pullrequests/pull-request-schema.json",
    );
    const validatePR: ValidateFunction = ajv.compile(prSchema);

    const mergeSchema = StringUtils.readSchemaFile(
      "/pullrequests/merge-response-schema.json",
    );
    const validateMerge: ValidateFunction = ajv.compile(mergeSchema);

    const repo: GitHubRepository = await githubRepoService.createRepository({
      org: owner,
      name: repoName,
      description: "Test repository for PR operations",
      private: false,
      auto_init: true,
    });

    expect(repo.name).toBe(repoName);
    logger.info(`Repository created: ${repo.full_name}`);

    await RetryUtils.retryGitHubOperation(() =>
      githubRepoService.getRepository(owner, repoName),
    );

    logger.info("Getting main branch reference to create a new branch");
    const branchName = "test-feature-branch";

    const mainRefResponse = await request.get(
      `repos/${owner}/${repoName}/git/refs/heads/main`,
    );
    expect(mainRefResponse.ok()).toBe(true);
    const mainRefData = await mainRefResponse.json();
    const mainSha = mainRefData.object.sha;

    logger.info(`Main branch SHA: ${mainSha}`);
    logger.info("Creating new branch");

    const createBranchResponse = await request.post(
      `repos/${owner}/${repoName}/git/refs`,
      {
        data: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: mainSha,
        }),
      },
    );

    expect(createBranchResponse.ok()).toBe(true);
    logger.info(`Branch ${branchName} created`);

    logger.info("Creating a file on the new branch");
    const fileName = "test-file.txt";
    const fileContent = "This is a test file for PR testing";

    const createFileResponse = await request.put(
      `repos/${owner}/${repoName}/contents/${fileName}`,
      {
        data: JSON.stringify({
          message: "Add test file",
          content: Buffer.from(fileContent).toString("base64"),
          branch: branchName,
        }),
      },
    );

    expect(createFileResponse.ok()).toBe(true);
    logger.info(`File created on branch ${branchName}`);

    logger.info("Creating pull request");
    const createPRData = {
      title: "Test Pull Request",
      head: branchName,
      base: "main",
      body: "This is a test PR created by automated tests",
    };

    const createdPR: PullRequest =
      await githubPullRequestService.createPullRequest(
        owner,
        repoName,
        createPRData,
      );

    expect(createdPR).toBeDefined();
    expect(createdPR.title).toBe(createPRData.title);
    expect(createdPR.state).toBe("open");
    expect(createdPR.head.ref).toBe(branchName);
    expect(createdPR.base.ref).toBe("main");

    const prValidationStart = performance.now();
    const isPRValid = validatePR(createdPR);
    const prValidationTime = performance.now() - prValidationStart;

    metricsCollector.recordSchemaValidation(
      "pull-request-schema.json",
      isPRValid,
      prValidationTime,
    );

    if (!isPRValid) {
      logger.log(
        "PR Validation errors:",
        StringUtils.prettyPrintJson(validatePR.errors),
      );
    }
    expect(isPRValid).toBe(true);

    logger.info(`Pull request #${createdPR.number} created successfully`);

    logger.info("Updating pull request");
    const updatedPR: PullRequest =
      await githubPullRequestService.updatePullRequest(
        owner,
        repoName,
        createdPR.number,
        {
          title: "Updated Test Pull Request",
          body: "Updated description for the test PR",
        },
      );

    expect(updatedPR.title).toBe("Updated Test Pull Request");
    expect(updatedPR.body).toBe("Updated description for the test PR");
    logger.info("Pull request updated successfully");

    logger.info("Merging pull request");
    const mergeResponse = await githubPullRequestService.mergePullRequest(
      owner,
      repoName,
      createdPR.number,
      {
        commit_title: "Merge test PR",
        commit_message: "Merging test PR via automated tests",
        merge_method: "merge",
      },
    );

    expect(mergeResponse.merged).toBe(true);
    expect(mergeResponse.sha).toBeDefined();

    const mergeValidationStart = performance.now();
    const isMergeValid = validateMerge(mergeResponse);
    const mergeValidationTime = performance.now() - mergeValidationStart;

    metricsCollector.recordSchemaValidation(
      "merge-response-schema.json",
      isMergeValid,
      mergeValidationTime,
    );

    if (!isMergeValid) {
      logger.log(
        "Merge Validation errors:",
        StringUtils.prettyPrintJson(validateMerge.errors),
      );
    }
    expect(isMergeValid).toBe(true);

    logger.info("Pull request merged successfully");

    const isMerged = await githubPullRequestService.isPullRequestMerged(
      owner,
      repoName,
      createdPR.number,
    );
    expect(isMerged).toBe(true);
    logger.info("Verified that pull request is merged");

    logger.info(`Cleaning up: deleting repository ${repoName}`);
    await RetryUtils.retryGitHubOperation(() =>
      githubRepoService.deleteRepository(repoName, {
        owner,
        name: repoName,
      }),
    );
    logger.info("Repository deleted successfully");
  });

  test("Create pull request and close it without merging", async ({
    ajv,
    githubPullRequestService,
    githubRepoService,
    request,
    metricsCollector,
  }) => {
    const repoName = `test-pr-close-${Date.now()}`;
    const owner = process.env.GH_USER!;

    logger.info(`Creating test repository: ${repoName}`);

    const prSchema = StringUtils.readSchemaFile(
      "/pullrequests/pull-request-schema.json",
    );
    const validatePR: ValidateFunction = ajv.compile(prSchema);

    const repo: GitHubRepository = await githubRepoService.createRepository({
      org: owner,
      name: repoName,
      description: "Test repository for PR close operation",
      private: false,
      auto_init: true,
    });

    expect(repo.name).toBe(repoName);

    await RetryUtils.retryGitHubOperation(() =>
      githubRepoService.getRepository(owner, repoName),
    );

    logger.info("Getting main branch reference");
    const branchName = "test-close-branch";

    const mainRefResponse = await request.get(
      `repos/${owner}/${repoName}/git/refs/heads/main`,
    );
    expect(mainRefResponse.ok()).toBe(true);
    const mainRefData = await mainRefResponse.json();
    const mainSha = mainRefData.object.sha;

    logger.info("Creating new branch for close test");
    const createBranchResponse = await request.post(
      `repos/${owner}/${repoName}/git/refs`,
      {
        data: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: mainSha,
        }),
      },
    );

    expect(createBranchResponse.ok()).toBe(true);

    logger.info("Creating file on branch");
    const fileName = "close-test.txt";
    const fileContent = "Test file for close operation";

    const createFileResponse = await request.put(
      `repos/${owner}/${repoName}/contents/${fileName}`,
      {
        data: JSON.stringify({
          message: "Add test file for close",
          content: Buffer.from(fileContent).toString("base64"),
          branch: branchName,
        }),
      },
    );

    expect(createFileResponse.ok()).toBe(true);

    const createdPR: PullRequest =
      await githubPullRequestService.createPullRequest(owner, repoName, {
        title: "Test PR to Close",
        head: branchName,
        base: "main",
        body: "This PR will be closed without merging",
      });

    expect(createdPR.state).toBe("open");
    logger.info(`Pull request #${createdPR.number} created`);

    logger.info("Closing pull request without merging");
    const closedPR: PullRequest =
      await githubPullRequestService.updatePullRequest(
        owner,
        repoName,
        createdPR.number,
        {
          state: "closed",
        },
      );

    expect(closedPR.state).toBe("closed");
    expect(closedPR.merged).toBe(false);

    const validationStart = performance.now();
    const isPRValid = validatePR(closedPR);
    const validationTime = performance.now() - validationStart;

    metricsCollector.recordSchemaValidation(
      "pull-request-schema.json",
      isPRValid,
      validationTime,
    );

    expect(isPRValid).toBe(true);

    logger.info("Pull request closed successfully without merging");

    const isMerged = await githubPullRequestService.isPullRequestMerged(
      owner,
      repoName,
      createdPR.number,
    );
    expect(isMerged).toBe(false);

    logger.info(`Cleaning up: deleting repository ${repoName}`);
    await RetryUtils.retryGitHubOperation(() =>
      githubRepoService.deleteRepository(repoName, {
        owner,
        name: repoName,
      }),
    );
  });
});
