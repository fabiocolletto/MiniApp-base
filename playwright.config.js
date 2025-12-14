const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
  reporter: 'list',
  webServer: {
    command: 'python3 -m http.server 4173',
    url: 'http://localhost:4173/index.html',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    cwd: path.join(__dirname),
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],
});
