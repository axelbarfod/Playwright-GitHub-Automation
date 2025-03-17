import {expect, test} from "@playwright/test";
import {GithubHomePage} from "../../pages/githubHomePage";

test.describe('Navigate to landing page', () => {
    let githubHomePage: GithubHomePage;
    test.beforeEach(async ({page}) => {
        githubHomePage = new GithubHomePage(page);
        await githubHomePage.goToHomePage();
    });


    test("navigates to landing page", {tag: '@debug'}, async ({page}) => {
        await githubHomePage.validatePageHasLoaded();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot("github-landing-page.png");
        await expect(page).toHaveTitle('GitHub · Build and ship software on a single, collaborative platform · GitHub');
    });
});