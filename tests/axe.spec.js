// Automated axe-core scans of every page and of the interactive states that change the DOM.
const { test, expect } = require('@playwright/test');
const pages = require('./pages');
const { scan, settle, stubMailto } = require('./helpers');

test.beforeEach(async ({ page }) => {
    await stubMailto(page);
});

for (const { path, name } of pages) {
    test.describe(`${name} (${path})`, () => {
        test('no axe violations on load', async ({ page }) => {
            await page.goto(path);
            await settle(page);
            expect(await scan(page)).toEqual([]);
        });

        test('no axe violations with the accessibility toolbar open', async ({ page }) => {
            await page.goto(path);
            await settle(page);
            await page.getByRole('button', { name: 'כלי נגישות', exact: true }).click();
            await expect(page.getByRole('dialog', { name: 'כלי נגישות' })).toBeVisible();
            expect(await scan(page)).toEqual([]);
        });

        test('no axe violations with the keyboard shortcuts dialog open', async ({ page }) => {
            await page.goto(path);
            await settle(page);
            await page.getByRole('button', { name: 'כלי נגישות', exact: true }).click();
            await page.getByRole('button', { name: 'קיצורי מקלדת' }).click();
            await expect(page.getByRole('dialog', { name: 'קיצורי מקלדת' })).toBeVisible();
            expect(await scan(page)).toEqual([]);
        });

        test('no axe violations with high contrast and large text enabled', async ({ page }) => {
            await page.goto(path);
            await settle(page);
            await page.getByRole('button', { name: 'כלי נגישות', exact: true }).click();
            await page.getByRole('button', { name: 'ניגודיות גבוהה' }).click();
            await page.getByRole('button', { name: 'ענק' }).click();
            expect(await scan(page)).toEqual([]);
        });

        test('no axe violations in the contact form error state', async ({ page }) => {
            await page.goto(path);
            await settle(page);
            await page.getByRole('button', { name: 'שלח הודעה' }).click();
            await expect(page.locator('#contactFormStatus')).toContainText('לא ניתן לשלוח');
            expect(await scan(page)).toEqual([]);
        });

        test('no axe violations in the contact form success state', async ({ page }) => {
            await page.goto(path);
            await settle(page);
            await page.getByLabel('שם מלא', { exact: true }).fill('בדיקה');
            await page.getByLabel('דוא״ל', { exact: true }).fill('test@example.com');
            await page.getByLabel('טלפון', { exact: true }).fill('050-0000000');
            await page.getByLabel('הודעה', { exact: true }).fill('הודעת בדיקה');
            await page.getByRole('button', { name: 'שלח הודעה' }).click();
            await expect(page.locator('#contactFormStatus')).toContainText('תוכנת הדואר');
            expect(await scan(page)).toEqual([]);
        });
    });
}

test.describe('home page carousel', () => {
    for (const slide of [0, 1, 2]) {
        test(`no axe violations with slide ${slide + 1} showing`, async ({ page }) => {
            await page.goto('/index.html');
            await settle(page);
            await page.getByRole('button', { name: 'עצור מצגת' }).click();
            await page.locator(`.carousel-indicators [data-bs-slide-to="${slide}"]`).click();
            await expect(page.locator('.carousel-item').nth(slide)).toHaveClass(/active/);
            expect(await scan(page)).toEqual([]);
        });
    }
});

test.describe('mobile navigation', () => {
    test.beforeEach(({}, testInfo) => {
        test.skip(testInfo.project.name !== 'mobile', 'collapsed menu exists only at mobile widths');
    });

    for (const { path, name } of pages) {
        test(`no axe violations with the menu open on ${name}`, async ({ page }) => {
            await page.goto(path);
            await settle(page);
            await page.getByRole('button', { name: 'תפריט' }).click();
            await expect(page.locator('#navbarCollapse')).toHaveClass(/show/);
            expect(await scan(page)).toEqual([]);
        });
    }
});
