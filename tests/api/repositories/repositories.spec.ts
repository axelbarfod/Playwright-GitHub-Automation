import { APIResponse, expect, test } from "@playwright/test";
import logger from "../../utils/logger";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { StringUtils } from "../../utils/stringUtils";

test.describe(" Github Search API tests", () => {
  const ghUser = "torvalds";
  const project = "linux";
  const ajv = new Ajv({ allErrors: true });

  addFormats(ajv);

  test("Get a repository from a specific user", async ({ request }) => {
    logger.info(`Searching for user ${ghUser} and repo ${project}`);
    const schema = StringUtils.readSchemaFile("/repositories/repo-schema.json");
    const validate = ajv.compile(schema);
    const apiResponse: APIResponse = await request.get(
      `repos/${ghUser}/${project}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `token ${process.env.GH_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    const fullName = `${ghUser}/${project}`;
    logger.info(fullName);
    expect(apiResponse.status()).toBe(200);
    const data = await apiResponse.json();
    const headers: { [p: string]: string } = apiResponse.headers();
    expect(data).toHaveProperty("name", `${project}`);
    expect(data.owner.login).toBe(`${ghUser}`);
    expect(data.full_name).toBe(fullName);
    expect(headers["x-ratelimit-limit"]).toBe("5000");

    const isValid = validate(data);

    if (!isValid) {
      logger.log(
        "Validation errors in:",
        StringUtils.prettyPrintJson(validate.errors),
      );
    }
    expect(isValid).toBe(true);
  });

  test("List repositories for the authenticated user.", async ({ request }) => {
    const schema = StringUtils.readSchemaFile("/repositories/user-repos.json");
    const validate = ajv.compile(schema);
    const apiResponse: APIResponse = await request.get("user/repos", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `token ${process.env.GH_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const data = await apiResponse.json();
    expect(apiResponse.ok()).toBeTruthy();
    expect(apiResponse.status()).toBe(200);
    const repos = await apiResponse.json();
    expect(Array.isArray(repos)).toBe(true);

    if (repos.length > 0) {
      const isValid = validate(data);
      if (!isValid) {
        logger.log(
          "Validation errors in:",
          StringUtils.prettyPrintJson(validate.errors),
        );
      }
      expect(isValid).toBe(true);
      expect(repos[0]).toHaveProperty("id");
      expect(repos[0]).toHaveProperty("name");
      expect(repos[0]).toHaveProperty("owner");
    }

    logger.info(`Found ${repos.length} repositories`);
  });

  test("Create a new repository and then delete it.", async ({ request }) => {
    const repoName = `test-repo-${Date.now()}`;
    logger.info(`Creating repository ${repoName}`);
    const schema = StringUtils.readSchemaFile("/repositories/repo-schema.json");
    const validate = ajv.compile(schema);
    ///user/repos
    //`/orgs/${process.env.GH_USER}/repos`,
    const response: APIResponse = await request.post(`user/repos`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `token ${process.env.GH_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      data: {
        org: process.env.GH_USER,
        name: repoName,
        description: "A test repository",
        private: false,
        auto_init: true,
        gitignore_template: "Node",
        license_template: "MIT",
      },
    });
    expect(response.status()).toBe(201);
    const data = await response.json();
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
    logger.info(
      `Deleting repo for user: ${process.env.GH_USER} - ${data.name} for cleanup purposes`,
    );
    //Delete the repo once it's created
    const deleteResponse = await request.delete(
      `repos/${process.env.GH_USER}/${repoName}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `token ${process.env.GH_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        data: {
          owner: process.env.GH_USER,
          name: data.name,
        },
      },
    );
    //logging
    expect(deleteResponse.status()).toBe(204);

    if (deleteResponse.status() !== 204) {
      const deleteData = await deleteResponse.json();
      logger.info(`Delete response: ${JSON.stringify(deleteData)}`);
    }
  });
});
