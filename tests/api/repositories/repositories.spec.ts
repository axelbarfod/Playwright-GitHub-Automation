import logger from "../../utils/logger";
import { StringUtils } from "../../utils/stringUtils";
import { GitHubRepository } from "../../../model/repository/Repository";
import { RetryUtils } from "../../utils/retryUtils";
import { expect, test } from "../../../fixture/GithubFixture";
import { ValidateFunction } from "ajv";

test.describe(" Github Search API tests", () => {
  const ghUser = "torvalds";
  const project = "linux";

  test("Get a repository from a specific user", async ({
    ajv,
    githubRepoService,
    metricsCollector,
  }) => {
    logger.info(`Searching for user ${ghUser} and repo ${project}`);
    const schema = StringUtils.readSchemaFile("/repositories/repo-schema.json");
    const validate: ValidateFunction = ajv.compile(schema);
    const apiResponse: GitHubRepository = await githubRepoService.getRepository(
      ghUser,
      project,
    );
    const fullName = `${ghUser}/${project}`;
    expect(apiResponse).toHaveProperty("name", `${project}`);
    expect(apiResponse.owner.login).toBe(`${ghUser}`);
    expect(apiResponse.full_name).toBe(fullName);

    const validationStart = performance.now();
    const isValid = validate(apiResponse);
    const validationTime = performance.now() - validationStart;

    metricsCollector.recordSchemaValidation(
      "repo-schema.json",
      isValid,
      validationTime,
    );

    if (!isValid) {
      logger.log(
        "Validation errors in:",
        StringUtils.prettyPrintJson(validate.errors),
      );
    }
    expect(isValid).toBe(true);
  });

  test("List repositories for the authenticated user.", async ({
    ajv,
    githubRepoService,
    metricsCollector,
  }) => {
    const schema = StringUtils.readSchemaFile("/repositories/user-repos.json");
    const validate = ajv.compile(schema);
    const repos: GitHubRepository[] = await githubRepoService.getRepositories();

    if (repos.length > 0) {
      const validationStart = performance.now();
      const isValid = validate(repos);
      const validationTime = performance.now() - validationStart;

      metricsCollector.recordSchemaValidation(
        "user-repos.json",
        isValid,
        validationTime,
      );

      if (!isValid) {
        logger.log(
          "Validation errors in:",
          StringUtils.prettyPrintJson(validate.errors),
        );
      }
      expect(isValid).toBe(true);
    }

    logger.info(`Found ${repos.length} repositories`);
  });

  test("Create a new repository and then delete it.", async ({
    ajv,
    githubRepoService,
    metricsCollector,
  }) => {
    const repoName = `test-repo-${Date.now()}`;
    logger.info(`Creating repository ${repoName}`);
    const schema = StringUtils.readSchemaFile("/repositories/repo-schema.json");
    const validate: ValidateFunction = ajv.compile(schema);
    const data: GitHubRepository = await githubRepoService.createRepository({
      org: process.env.GH_USER!,
      name: repoName,
      description: "A test repository",
      private: false,
      auto_init: true,
      gitignore_template: "Node",
      license_template: "MIT",
    });

    const validationStart = performance.now();
    const isValid = validate(data);
    const validationTime = performance.now() - validationStart;

    metricsCollector.recordSchemaValidation(
      "repo-schema.json",
      isValid,
      validationTime,
    );

    if (!isValid) {
      logger.log(
        "Validation errors in:",
        StringUtils.prettyPrintJson(validate.errors),
      );
      expect(
        isValid,
        `Schema validation failed: ${JSON.stringify(validate.errors, null, 2)}`,
      ).toBe(true);
    }

    expect(data.name).toBe(repoName);
    expect(data.private).toBe(false);
    expect(data.owner.login).toBeDefined();

    // let gitHubRepository:GitHubRepository = await githubService.getRepository(process.env.GH_USER!, repoName);
    // expect(gitHubRepository.name).toBe(repoName);
    const gitHubRepository: GitHubRepository =
      await RetryUtils.retryGitHubOperation(() =>
        githubRepoService.getRepository(process.env.GH_USER!, repoName),
      );
    expect(gitHubRepository.name).toBe(repoName);

    logger.info(
      `Deleting repo for user: [ ${process.env.GH_USER} - ${data.name} ] for cleanup purposes`,
    );
    //Delete the repo once it's created
    await RetryUtils.retryGitHubOperation(() =>
      githubRepoService.deleteRepository(repoName, {
        owner: process.env.GH_USER!,
        name: data.name,
      }),
    );
  });
});
