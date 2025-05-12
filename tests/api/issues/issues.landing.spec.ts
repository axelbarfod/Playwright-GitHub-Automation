import { APIResponse, expect, test } from "@playwright/test";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { StringUtils } from "../../utils/stringUtils";

test.describe("Issues Landing", () => {
  const schema = StringUtils.readSchemaFile("/issues/issues.json");
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  // const fixture = test.extend<{
  //   githubApi: {
  //     fetchAndValidate: <T>(
  //       endpoint: string,
  //       schema: object,
  //       expectedStatus?: number,
  //     ) => Promise<T>;
  //     ghUser: string;
  //   };
  // }>({
  //   githubApi: async ({ request }, use) => {
  //     const ajv = new Ajv({ allErrors: true });
  //     addFormats(ajv);
  //   },
  // });
  test(`List Issues Assigned to ${process.env.GH_USER}`, async ({
    request,
  }) => {
    const apiResponse: APIResponse = await request.get("issues", {
      headers: {
        Authorization: `token ${process.env.GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const body = await apiResponse.json();
    expect(apiResponse.status()).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    const validate = ajv.compile(schema);
    const isValid = validate(body);

    expect(
      isValid,
      `Schema validation failed: ${JSON.stringify(validate.errors, null, 2)}`,
    ).toBe(true);
  });

  test(`List repository issues assigned to ${process.env.GH_USER}`, async ({
    request,
  }) => {
    const apiResponse: APIResponse = await request.get(
      `repos/${process.env.GH_USER}/DemoRepo/issues`,
      {
        headers: {
          Authorization: `token ${process.env.GH_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    const body = await apiResponse.json();
    expect(apiResponse.status()).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].user.login).toBe(`${process.env.GH_USER}`);
    const validate = ajv.compile(schema);
    const isValid = validate(body);
    expect(
      isValid,
      `Schema validation failed: ${JSON.stringify(validate.errors, null, 2)}`,
    ).toBe(true);
  });
});
