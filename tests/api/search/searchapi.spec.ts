import { StringUtils } from "../../utils/stringUtils";
import logger from "../../utils/logger";
import { GitHubSearchRepositoriesResponse } from "../../../model/search/Search";
import { expect, test } from "../../../fixture/GithubFixture";

test.describe("Search API Tests", () => {
  test("Test Search", async ({ ajv, githubSearchService }) => {
    const schema = StringUtils.readSchemaFile("searchRepositoriesSchema.json");
    const validate = ajv.compile(schema);
    const searchQuery = "playwright";

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
