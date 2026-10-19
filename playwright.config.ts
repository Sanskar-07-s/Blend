import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 120000, // 120 seconds per test
  use: {
    channel: "chrome",
    headless: false,
    viewport: { width: 1920, height: 1080 },
    launchOptions: {
      args: [
        "--use-angle=d3d11",
        "--enable-gpu-rasterization",
        "--ignore-gpu-blocklist",
        "--enable-zero-copy",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
    },
  },
});
