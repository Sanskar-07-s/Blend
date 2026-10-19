import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 120000, // 120 seconds per test
  use: {
    channel: process.env.CI ? undefined : "chrome",
    headless: !!process.env.CI,
    viewport: { width: 1920, height: 1080 },
    launchOptions: {
      args: [
        "--enable-gpu-rasterization",
        "--ignore-gpu-blocklist",
        "--enable-zero-copy",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
    },
  },
  webServer: {
    command: "npx vite preview --port 5173",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
