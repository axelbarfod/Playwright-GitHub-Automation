import { APIResponse, expect, test } from "@playwright/test";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import { StringUtils } from "../../utils/stringUtils";
import Logger from "../../utils/logger";

test.describe("Search API Tests", () => {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);

  test("Test Search", async ({ request }) => {
    const schema = StringUtils.readSchemaFile("searchRepositoriesSchema.json");
    const validate = ajv.compile(schema);
    const searchQuery = "playwright";
    const apiResponse: APIResponse = await request.get("search/repositories", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "token" + process.env.GH_TOKEN,
      },
      params: { q: searchQuery },
    });
    const responseBody = await apiResponse.json();
    expect(apiResponse.status()).toBe(200);
    let headers: { [p: string]: string } = apiResponse.headers();
    const rateLimitUsed =
      headers["x-ratelimit-used"] || headers["X-RateLimit-Used"];
    expect(Number(rateLimitUsed)).toBeGreaterThanOrEqual(1);
    expect(headers["x-ratelimit-limit"]).toBeDefined();

    const isValid = validate(responseBody);

    if (!isValid) {
      Logger.log(
        "Validation errors in:",
        StringUtils.prettyPrintJson(validate.errors),
      );
    }
    expect(isValid).toBe(true);
  });
});
