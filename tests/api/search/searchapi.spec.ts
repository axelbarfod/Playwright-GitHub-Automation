import { expect, test } from "@playwright/test";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import { StringUtils } from "../../utils/stringUtils";
import logger from "../../utils/logger";
import { GitHubSearchRepositoriesResponse } from "../../../model/search/Search";
import { GithubSearchService } from "../../../service/search/GithubSearchService";

test.describe("Search API Tests", () => {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);

  let githubSearchService: GithubSearchService;
  test.beforeEach(async ({ request }) => {
    githubSearchService = new GithubSearchService(request);
  });

  test("Test Search", async () => {
    const schema = StringUtils.readSchemaFile("searchRepositoriesSchema.json");
    const validate = ajv.compile(schema);
    const searchQuery = "playwright";
    // const apiResponse: APIResponse = await request.get("search/repositories", {
    //   params: { q: searchQuery },
    // });

    const apiResponse: GitHubSearchRepositoriesResponse =
      await githubSearchService.searchRepositories(searchQuery);

    const isValid = validate(apiResponse);

    if (!isValid) {
      logger.error(
        "Validation errors in:",
        StringUtils.prettyPrintJson(validate.errors),
      );
    }
    expect(isValid).toBe(true);
  });
});
