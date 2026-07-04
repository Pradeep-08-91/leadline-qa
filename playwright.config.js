// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const PORT = 8931;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [
    ['list'],                                   // live pass/fail in the terminal
    ['html', { open: 'never' }],                // rich report in ./playwright-report
  ],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Serve index.html for the tests. Reuses the server you already have running.
  webServer: {
    command: `python3 -m http.server ${PORT}`,
    url: `http://localhost:${PORT}/index.html`,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
