import { defineConfig, devices } from '@playwright/test';

// Les 5 projets couvrent les moteurs réels des navigateurs ciblés :
// - Chrome / Edge / Samsung Internet  -> Chromium
// - Safari, et TOUS les navigateurs sur iPhone/iPad (y compris Chrome iOS) -> WebKit
// - Firefox -> Gecko
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:8000/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'desktop-safari', use: { ...devices['Desktop Safari'] } },
    { name: 'iphone', use: { ...devices['iPhone 15'] } },
    { name: 'android', use: { ...devices['Pixel 7'] } },
    { name: 'ipad', use: { ...devices['iPad (gen 7)'] } }
  ],
  webServer: {
    command: 'node tools/serve.mjs',
    url: 'http://localhost:8000/',
    reuseExistingServer: !process.env.CI
  }
});
