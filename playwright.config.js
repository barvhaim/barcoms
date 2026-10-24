// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const PORT = 4173;

module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    reporter: [['list']],
    use: {
        baseURL: `http://localhost:${PORT}`,
        // Uses the locally installed Google Chrome; set PW_CHANNEL= (empty) to use Playwright's bundled Chromium
        channel: process.env.PW_CHANNEL ?? 'chrome',
        locale: 'he-IL',
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL ?? 'chrome' } },
        { name: 'mobile', use: { ...devices['Pixel 7'], channel: process.env.PW_CHANNEL ?? 'chrome' } },
    ],
    webServer: {
        command: `npx http-server . -p ${PORT} -c-1 --silent`,
        url: `http://localhost:${PORT}/index.html`,
        reuseExistingServer: !process.env.CI,
    },
});
