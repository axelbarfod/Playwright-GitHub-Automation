import Ajv from "ajv";
import addFormats from "ajv-formats";
import { APIResponse, expect, PlaywrightTestArgs } from "@playwright/test";
import logger from "../utils/logger";

export abstract class BaseGithubTest {
  protected ajv: Ajv;
  protected headers: Record<string, string>;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);

    this.headers = {
      Authorization: `token ${process.env.GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  protected async fetchAndValidate<T>(
    request: PlaywrightTestArgs["request"],
    endpoint: string,
    schema: object,
    expectedStatus: number = 200,
  ): Promise<T> {
    const apiResponse: APIResponse = await request.get(endpoint, {
      headers: this.headers,
      failOnStatusCode: false,
    });

    if (apiResponse.status() !== expectedStatus) {
      const errorData = await apiResponse.json();
      logger.error(
        `API Error (Status ${apiResponse.status()}): ${JSON.stringify(errorData, null, 2)}`,
      );
    }
    expect(
      apiResponse.status(),
      `Expected status ${expectedStatus}, got ${apiResponse.status()}`,
    ).toBe(expectedStatus);

    // Parse and validate body
    const body = await apiResponse.json();

    // Schema validation
    const validate = this.ajv.compile(schema);
    const isValid = validate(body);
    expect(
      isValid,
      `Schema validation failed: ${JSON.stringify(validate.errors, null, 2)}`,
    ).toBe(true);

    return body as T;
  }
}
