// Browser checks that axe cannot do: keyboard operation, focus, moving content, reflow and form behaviour.
const { test, expect } = require('@playwright/test');
const pages = require('./pages');
const { settle, stubMailto } = require('./helpers');

test.beforeEach(async ({ page }) => {
    await stubMailto(page);
});

// Describes the focused element and whether a visible focus indicator is drawn.
// Waits for Bootstrap's smooth scrolling to bring the element into view before measuring.
function focusInfo(page) {
    return page.evaluate(async () => {
        const el = document.activeElement;
        let last = null;
        for (let i = 0; i < 40; i++) {
            const top = el.getBoundingClientRect().top;
            if (top === last) break;
            last = top;
            await new Promise(r => setTimeout(r, 50));
        }
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const hasOutline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
        return {
            tag: el.tagName,
            id: el.id,
            text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
            visibleIndicator: hasOutline,
            onScreen: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
            // Not hidden behind the fixed navbar or the floating accessibility button (WCAG 2.2 2.4.11)
            obscured: (() => {
                const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
                return !hit || !(el.contains(hit) || hit.contains(el) || el.labels?.[0]?.contains(hit));
            })(),
            inToolbar: !!el.closest('.accessibility-toolbar'),
        };
    });
}

for (const { path, name } of pages) {
    test.describe(`${name} (${path})`, () => {
        test('skip link is first, visible on focus and moves focus to main', async ({ page }) => {
            await page.goto(path);
            await page.keyboard.press('Tab');
            const skip = page.getByRole('link', { name: 'דלג לתוכן הראשי' });
            await expect(skip).toBeFocused();
            await expect(skip).toBeInViewport();
            // Not hidden under the fixed navbar
            const onTop = await skip.evaluate(el => {
                const r = el.getBoundingClientRect();
                return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === el;
            });
            expect(onTop).toBe(true);
            await page.keyboard.press('Enter');
            await expect(page.locator('#main-content')).toBeFocused();
        });

        test('every tab stop is on screen with a visible focus indicator, and the closed toolbar is skipped', async ({ page }, testInfo) => {
            await page.goto(path);
            await settle(page);
            const seen = [];
            for (let i = 0; i < 60; i++) {
                await page.keyboard.press('Tab');
                const info = await focusInfo(page);
                if (info.tag === 'BODY') break;
                seen.push(info);
                if (info.text === 'כלי נגישות' && info.tag === 'BUTTON') break;
            }
            expect(seen.length).toBeGreaterThan(3);
            const problems = seen.filter(s => !s.visibleIndicator || !s.onScreen || s.obscured || s.inToolbar);
            expect(problems, `focus problems in ${testInfo.project.name}`).toEqual([]);
        });

        test('accessibility toolbar opens, traps focus, closes with Escape and returns focus', async ({ page }) => {
            await page.goto(path);
            const toggle = page.getByRole('button', { name: 'כלי נגישות', exact: true });
            await expect(toggle).toHaveAttribute('aria-expanded', 'false');
            await toggle.focus();
            await page.keyboard.press('Enter');
            await expect(toggle).toHaveAttribute('aria-expanded', 'true');
            const dialog = page.getByRole('dialog', { name: 'כלי נגישות' });
            await expect(dialog).toBeVisible();
            await expect(dialog).toBeInViewport({ ratio: 1 });
            for (let i = 0; i < 20; i++) {
                await page.keyboard.press('Tab');
                expect(await page.evaluate(() => !!document.activeElement.closest('.accessibility-toolbar'))).toBe(true);
            }
            await page.keyboard.press('Escape');
            await expect(dialog).toBeHidden();
            await expect(toggle).toBeFocused();
            await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        });

        test('toolbar toggles expose their state', async ({ page }) => {
            await page.goto(path);
            await page.getByRole('button', { name: 'כלי נגישות', exact: true }).click();
            const contrast = page.getByRole('button', { name: 'ניגודיות גבוהה' });
            await expect(contrast).toHaveAttribute('aria-pressed', 'false');
            await contrast.click();
            await expect(contrast).toHaveAttribute('aria-pressed', 'true');
            await expect(page.locator('body')).toHaveClass(/high-contrast/);
            await page.getByRole('button', { name: 'איפוס הגדרות' }).click();
            await expect(contrast).toHaveAttribute('aria-pressed', 'false');
        });

        test('text size control enlarges page text', async ({ page }) => {
            await page.goto(path);
            const lead = page.locator('main p').first();
            const before = await lead.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
            await page.getByRole('button', { name: 'כלי נגישות', exact: true }).click();
            await page.getByRole('button', { name: 'ענק' }).click();
            const after = await lead.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
            expect(after).toBeGreaterThan(before * 1.3);
        });

        test('keyboard shortcuts dialog traps focus and Escape returns to the toolbar', async ({ page }) => {
            await page.goto(path);
            await page.getByRole('button', { name: 'כלי נגישות', exact: true }).click();
            const opener = page.getByRole('button', { name: 'קיצורי מקלדת' });
            await opener.click();
            const close = page.getByRole('button', { name: 'סגור קיצורי מקלדת' });
            await expect(close).toBeFocused();
            await page.keyboard.press('Tab');
            await expect(close).toBeFocused();
            await page.keyboard.press('Escape');
            await expect(page.getByRole('dialog', { name: 'קיצורי מקלדת' })).toBeHidden();
            await expect(opener).toBeFocused();
        });

        test('statement link is in the footer', async ({ page }) => {
            await page.goto(path);
            const link = page.getByRole('contentinfo').getByRole('link', { name: 'הצהרת נגישות' });
            await expect(link).toHaveAttribute('href', 'accessibility.html');
        });

        test('contact form: errors are announced, linked to fields and focus moves to the first error', async ({ page }) => {
            await page.goto(path);
            await page.getByLabel('שם מלא', { exact: true }).fill('ישראל ישראלי');
            await page.getByLabel('דוא״ל', { exact: true }).fill('not-an-email');
            await page.getByRole('button', { name: 'שלח הודעה' }).click();
            const status = page.locator('#contactFormStatus');
            await expect(status).toHaveAttribute('role', 'status');
            await expect(status).toContainText('3 שדות');
            const email = page.getByLabel('דוא״ל', { exact: true });
            await expect(email).toBeFocused();
            await expect(email).toHaveAttribute('aria-invalid', 'true');
            await expect(email).toHaveAccessibleDescription(/כתובת דוא"ל תקינה/);
            await expect(page.getByLabel('שם מלא', { exact: true })).toHaveAttribute('aria-invalid', 'false');
            await expect(page.locator('#email-error')).toBeVisible();
            expect(await page.evaluate(() => window.__sentMail.length)).toBe(0);
        });

        test('contact form: valid submission shows a success message without sending', async ({ page }) => {
            await page.goto(path);
            await page.getByLabel('שם מלא', { exact: true }).fill('ישראל ישראלי');
            await page.getByLabel('דוא״ל', { exact: true }).fill('test@example.com');
            await page.getByLabel('טלפון', { exact: true }).fill('050-0000000');
            await page.getByLabel('הודעה', { exact: true }).fill('בדיקה');
            await page.getByRole('button', { name: 'שלח הודעה' }).click();
            await expect(page.locator('#contactFormStatus')).toContainText('תוכנת הדואר');
            const sent = await page.evaluate(() => window.__sentMail);
            expect(sent).toHaveLength(1);
            expect(sent[0]).toMatch(/^mailto:barcom15@smile\.net\.il\?/);
        });

        test('content reflows at 320 CSS px without horizontal scrolling', async ({ page }) => {
            await page.setViewportSize({ width: 320, height: 640 });
            await page.goto(path);
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            expect(overflow).toBeLessThanOrEqual(0);
        });

        test('text spacing overrides do not clip content', async ({ page }) => {
            await page.goto(path);
            await page.addStyleTag({ content: '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}' });
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            expect(overflow).toBeLessThanOrEqual(0);
        });
    });
}

test.describe('mobile navigation', () => {
    test.beforeEach(({}, testInfo) => {
        test.skip(testInfo.project.name !== 'mobile', 'collapsed menu exists only at mobile widths');
    });

    test('menu toggle is keyboard operable and every link is reachable on a short screen', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 256 });
        await page.goto('/index.html');
        const toggle = page.getByRole('button', { name: 'תפריט' });
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await toggle.focus();
        await page.keyboard.press('Enter');
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        // Wait for Bootstrap's open animation to finish before measuring positions
        await expect(page.locator('#navbarCollapse')).toHaveClass(/\bshow\b/);
        await expect(page.locator('#navbarCollapse')).not.toHaveClass(/collapsing/);
        const links = page.locator('#navbarCollapse .nav-link');
        const count = await links.count();
        for (let i = 0; i < count; i++) {
            await page.keyboard.press('Tab');
            await expect(links.nth(i)).toBeFocused();
            await expect(links.nth(i)).toBeInViewport();
            // Not covered by the floating accessibility button
            const covered = await links.nth(i).evaluate(el => {
                const r = el.getBoundingClientRect();
                const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
                return !!hit && !el.contains(hit);
            });
            expect(covered).toBe(false);
        }
    });
});

test.describe('400% zoom equivalent (320x256)', () => {
    test('accessibility toolbar is fully reachable and not covered by its toggle', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 256 });
        await page.goto('/index.html');
        await page.getByRole('button', { name: 'כלי נגישות', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'כלי נגישות' });
        await expect(dialog).toBeInViewport({ ratio: 1 });
        const buttons = dialog.locator('button, a');
        for (let i = 0; i < await buttons.count(); i++) {
            const b = buttons.nth(i);
            await b.focus();
            const covered = await b.evaluate(el => {
                const r = el.getBoundingClientRect();
                const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
                return !hit || !el.contains(hit);
            });
            expect(covered, await b.textContent()).toBe(false);
        }
    });

    test('hero heading is not hidden under the fixed navbar', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 256 });
        await page.goto('/index.html');
        await page.addStyleTag({ content: '*{animation:none!important}' });
        const navBottom = await page.locator('nav.navbar').evaluate(el => el.getBoundingClientRect().bottom);
        const headingTop = await page.locator('.carousel-item.active h2').evaluate(el => el.getBoundingClientRect().top);
        expect(headingTop).toBeGreaterThanOrEqual(navBottom);
    });
});

test.describe('home page carousel', () => {
    test('pause button stops rotation and hover does not restart it', async ({ page }) => {
        await page.clock.install();
        await page.goto('/index.html');
        const pause = page.getByRole('button', { name: 'עצור מצגת' });
        await expect(pause).toBeVisible();
        // Clickable, not covered by the previous/next controls
        await pause.click({ trial: true });
        await pause.click();
        await expect(page.getByRole('button', { name: 'הפעל מצגת' })).toBeVisible();
        const carousel = page.locator('#banner-carousel');
        await carousel.hover();
        await page.mouse.move(0, 0);
        await page.clock.runFor(16000);
        await expect(page.locator('.carousel-item').first()).toHaveClass(/active/);
        await page.getByRole('button', { name: 'הפעל מצגת' }).click();
        await page.clock.runFor(6000);
        await expect(page.locator('.carousel-item').nth(1)).toHaveClass(/active/);
    });

    test('rotation stops while focus is inside so focused content does not disappear', async ({ page }) => {
        await page.clock.install();
        await page.goto('/index.html');
        const cta = page.getByRole('link', { name: 'קבלו הצעת מחיר' });
        await cta.focus();
        await page.clock.runFor(16000);
        await expect(cta).toBeFocused();
        await expect(cta).toBeVisible();
    });

    test('does not auto-rotate when reduced motion is requested', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.clock.install();
        await page.goto('/index.html');
        await expect(page.getByRole('button', { name: 'הפעל מצגת' })).toBeVisible();
        await page.clock.runFor(16000);
        await expect(page.locator('.carousel-item').first()).toHaveClass(/active/);
    });

    test('slides are exposed as grouped slides with position', async ({ page }) => {
        await page.goto('/index.html');
        const slides = page.locator('.carousel-item');
        await expect(slides).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            await expect(slides.nth(i)).toHaveAttribute('role', 'group');
            await expect(slides.nth(i)).toHaveAttribute('aria-label', `${i + 1} מתוך 3`);
        }
    });
});

test.describe('page structure', () => {
    for (const { path, name } of pages) {
        test(`${name}: one h1, Hebrew RTL, unique title and landmarks`, async ({ page }) => {
            await page.goto(path);
            await expect(page.locator('h1')).toHaveCount(1);
            await expect(page.locator('html')).toHaveAttribute('lang', 'he');
            await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
            expect((await page.title()).length).toBeGreaterThan(5);
            await expect(page.getByRole('banner')).toHaveCount(1);
            await expect(page.getByRole('main')).toHaveCount(1);
            await expect(page.getByRole('contentinfo')).toHaveCount(1);
            await expect(page.locator('nav .nav-link[aria-current="page"]')).toHaveCount(path === '/accessibility.html' ? 0 : 1);
        });
    }

    test('page titles are unique', async ({ page }) => {
        const titles = [];
        for (const { path } of pages) {
            await page.goto(path);
            titles.push(await page.title());
        }
        expect(new Set(titles).size).toBe(titles.length);
    });
});
