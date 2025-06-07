import { expect, test } from "@playwright/test";
import logger from "../../utils/logger";
import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { StringUtils } from "../../utils/stringUtils";
import { GithubRepoService } from "../../../service/repo/GithubRepoService";
import { GitHubRepository } from "../../../model/repository/Repository";
import { RetryUtils } from "../../utils/retryUtils";

test.describe(" Github Search API tests", () => {
  const ghUser = "torvalds";
  const project = "linux";
  const ajv = new Ajv({ allErrors: true });

  addFormats(ajv);
  let githubService: GithubRepoService;
  test.beforeEach(async ({ request }) => {
    githubService = new GithubRepoService(request);
  });

  test("Get a repository from a specific user", async () => {
    logger.info(`Searching for user ${ghUser} and repo ${project}`);
    const schema = StringUtils.readSchemaFile("/repositories/repo-schema.json");
    const validate: ValidateFunction = ajv.compile(schema);
    const apiResponse: GitHubRepository = await githubService.getRepository(
      ghUser,
      project,
    );
    const fullName = `${ghUser}/${project}`;
    expect(apiResponse).toHaveProperty("name", `${project}`);
    expect(apiResponse.owner.login).toBe(`${ghUser}`);
    expect(apiResponse.full_name).toBe(fullName);

    const isValid = validate(apiResponse);

    if (!isValid) {
      logger.log(
        "Validation errors in:",
        StringUtils.prettyPrintJson(validate.errors),
      );
    }
    expect(isValid).toBe(true);
  });

  test("List repositories for the authenticated user.", async () => {
    const schema = StringUtils.readSchemaFile("/repositories/user-repos.json");
    const validate = ajv.compile(schema);
    const repos: GitHubRepository[] = await githubService.getRepositories();

    if (repos.length > 0) {
      const isValid = validate(repos);
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

  test("Create a new repository and then delete it.", async () => {
    const repoName = `test-repo-${Date.now()}`;
    logger.info(`Creating repository ${repoName}`);
    const schema = StringUtils.readSchemaFile("/repositories/repo-schema.json");
    const validate: ValidateFunction = ajv.compile(schema);
    const data: GitHubRepository = await githubService.createRepository({
      org: process.env.GH_USER!,
      name: repoName,
      description: "A test repository",
      private: false,
      auto_init: true,
      gitignore_template: "Node",
      license_template: "MIT",
    });
    const isValid = validate(data);

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
        githubService.getRepository(process.env.GH_USER!, repoName),
      );
    expect(gitHubRepository.name).toBe(repoName);

    logger.info(
      `Deleting repo for user: [ ${process.env.GH_USER} - ${data.name} ] for cleanup purposes`,
    );
    //Delete the repo once it's created
    await RetryUtils.retryGitHubOperation(() =>
      githubService.deleteRepository(repoName, {
        owner: process.env.GH_USER!,
        name: data.name,
      }),
    );
  });
});
