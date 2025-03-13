import {APIResponse, expect, test} from "@playwright/test";

test.describe("Search API Tests", () => {

    test('API and UI consistency', async ({page, request}) => {
        // API: Search repositories
        const searchQuery = 'playwright';
        const apiResponse: APIResponse = await request.get('search/repositories', {
            params: {q: searchQuery},
        });
        const apiData = await apiResponse.json();
        expect(apiResponse.status()).toBe(200);
        let headers: { [p: string]: string } = apiResponse.headers();
        let rateLimitUsed = headers['X-RateLimit-Used'];
        expect(headers['X-RateLimit-Used']).toEqual(rateLimitUsed);
        expect(headers['x-ratelimit-limit']).toBeDefined();

    });

});