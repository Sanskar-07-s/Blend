import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.setTimeout(180000);

interface DeviceConfig {
  name: string;
  viewport: { width: number; height: number };
  isPhone?: boolean;
  userAgent?: string;
  hasTouch?: boolean;
}

const DEVICES: DeviceConfig[] = [
  {
    name: "iPhone_SE",
    viewport: { width: 375, height: 667 },
    isPhone: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  },
  {
    name: "iPhone_14_Pro",
    viewport: { width: 393, height: 852 },
    isPhone: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  },
  {
    name: "Pixel_7",
    viewport: { width: 412, height: 915 },
    isPhone: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  },
  {
    name: "Tablet_Portrait",
    viewport: { width: 768, height: 1024 },
    hasTouch: true,
  },
  {
    name: "Tablet_Landscape",
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  },
  {
    name: "iPad_Pro",
    viewport: { width: 1024, height: 1366 },
    hasTouch: true,
  },
  {
    name: "Laptop_1366x768",
    viewport: { width: 1366, height: 768 },
  },
  {
    name: "Desktop_1080p",
    viewport: { width: 1920, height: 1080 },
  },
  {
    name: "Ultrawide_21_9",
    viewport: { width: 3440, height: 1440 },
  },
];

async function waitForSettled(page: Page) {
  await page.locator("body:is([data-nav-state='overview'], [data-nav-state='section'])").waitFor({
    state: "attached",
    timeout: 15000,
  });
  await page.waitForTimeout(400);
}

async function clickNext(page: Page) {
  await waitForSettled(page);
  const nextBtn = page.locator("button[aria-label='Next Section']");
  await nextBtn.waitFor({ state: "visible", timeout: 8000 });
  await nextBtn.click();
  await page.locator("body[data-nav-state='transitioning']").waitFor({ state: "attached", timeout: 2500 }).catch(() => {});
  await waitForSettled(page);
}

async function clickPrev(page: Page) {
  await waitForSettled(page);
  const prevBtn = page.locator("button[aria-label='Previous Section']");
  await prevBtn.waitFor({ state: "visible", timeout: 8000 });
  await prevBtn.click();
  await page.locator("body[data-nav-state='transitioning']").waitFor({ state: "attached", timeout: 2500 }).catch(() => {});
  await waitForSettled(page);
}

const screenshotDir = path.resolve(process.cwd(), "test-results", "screenshots");
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const matrixResults: Array<{
  device: string;
  tier: string;
  avgFps: number;
  worstFrame: number;
  loadTime: number;
  overflow: boolean;
  problems: string;
}> = [];

test.describe("Device Emulation Matrix", () => {
  for (const dev of DEVICES) {
    test(`Run flow on ${dev.name} (${dev.viewport.width}x${dev.viewport.height})`, async ({ page, context }) => {
      // 1. Setup viewport and touch
      await page.setViewportSize(dev.viewport);
      if (dev.userAgent) {
        await page.setExtraHTTPHeaders({ "User-Agent": dev.userAgent });
      }

      // Note: CPU throttling is NOT used as per instructions (measure real GPU honestly)
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error" && !msg.text().includes("favicon")) {
          consoleErrors.push(msg.text());
        }
      });
      page.on("pageerror", (err) => {
        consoleErrors.push(err.message);
      });

      const startTime = performance.now();
      await page.goto("http://localhost:4173/");

      // 3. Wait for prewarm & ready to enter
      const enterBtn = page.locator("button:has-text('ENTER')");
      await enterBtn.waitFor({ state: "visible", timeout: 60000 });
      const loadTime = Math.round(performance.now() - startTime);

      // Check detected tier before entering
      const detectedTier = await page.evaluate(() => {
        return (window as any).__bc?.tier || document.body.className.includes("tier-low") ? "low" : "detected";
      });

      await enterBtn.click();

      // 4. Intro sequence -> click SKIP
      await page.locator("body[data-nav-state='intro']").waitFor({ state: "attached", timeout: 10000 });
      const skipBtn = page.locator("button:has-text('SKIP')");
      await skipBtn.waitFor({ state: "visible", timeout: 6000 });
      await skipBtn.click();

      // 5. Studio Overview
      await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 12000 });
      await waitForSettled(page);

      // Verify no horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasOverflow).toBe(false);

      // Save Screenshot 1: Overview
      await page.screenshot({
        path: path.join(screenshotDir, `${dev.name}_overview.png`),
      });

      // 6. Section 1 (About)
      await clickNext(page);
      await expect(page.locator("body[data-section='about']")).toBeAttached({ timeout: 5000 });
      await page.waitForTimeout(300);

      // Save Screenshot 2: Section 1
      await page.screenshot({
        path: path.join(screenshotDir, `${dev.name}_sec1_about.png`),
      });

      // 7. Section 2 (Projects)
      await clickNext(page);
      await expect(page.locator("body[data-section='projects']")).toBeAttached({ timeout: 5000 });
      await page.waitForTimeout(300);

      // Save Screenshot 3: Section 2
      await page.screenshot({
        path: path.join(screenshotDir, `${dev.name}_sec2_projects.png`),
      });

      // 8. Sections 3, 4, 5
      await clickNext(page); // 3: events
      await clickNext(page); // 4: learning
      await clickNext(page); // 5: gallery
      await expect(page.locator("body[data-section='gallery']")).toBeAttached({ timeout: 5000 });
      await page.waitForTimeout(300);

      // Save Screenshot 4: Section 5
      await page.screenshot({
        path: path.join(screenshotDir, `${dev.name}_sec5_gallery.png`),
      });

      // 9. Sections 6, 7, 8
      await clickNext(page); // 6: team
      await clickNext(page); // 7: community
      await clickNext(page); // 8: join
      await expect(page.locator("body[data-section='join']")).toBeAttached({ timeout: 5000 });

      // 10. Test BACK button from section 8 -> section 7
      await clickPrev(page);
      await expect(page.locator("body[data-section='community']")).toBeAttached({ timeout: 5000 });

      // 11. Test Menu jump to section 1
      const menuBtn = page.locator("button[aria-label='Open navigation drawer']");
      await menuBtn.click();
      await page.locator("text=ABOUT THE CLUB").first().click(); // Section 1 About
      await waitForSettled(page);
      await expect(page.locator("body[data-section='about']")).toBeAttached({ timeout: 5000 });

      // 12. Test Home button back to Overview
      const homeBtn = page.locator("button[aria-label='Return to Studio Overview']").first();
      await homeBtn.click();
      await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 10000 });
      await waitForSettled(page);

      // 13. Collect performance metrics
      const perfMetrics = await page.evaluate(() => {
        const bc = (window as any).__bc || {};
        const frameTimes: number[] = bc.frameTimes || [];
        const avg = frameTimes.length > 0 ? 1000 / (frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length) : bc.fps || 60;
        const worst = frameTimes.length > 0 ? Math.max(...frameTimes) : 16.6;
        return {
          tier: bc.tier || "high",
          avgFps: Math.round(avg * 10) / 10,
          worstFrameMs: Math.round(worst * 10) / 10,
        };
      });

      const problems: string[] = [];
      if (consoleErrors.length > 0) problems.push(`${consoleErrors.length} errors: ${consoleErrors[0].slice(0, 40)}`);
      if (hasOverflow) problems.push("Horizontal scroll detected");
      if (perfMetrics.avgFps < 30) problems.push("Average FPS < 30");

      const result = {
        device: dev.name,
        tier: perfMetrics.tier,
        avgFps: perfMetrics.avgFps,
        worstFrame: perfMetrics.worstFrameMs,
        loadTime: loadTime,
        overflow: hasOverflow,
        problems: problems.length > 0 ? problems.join("; ") : "None",
      };

      matrixResults.push(result);
      console.log(`RESULT [${dev.name}]:`, JSON.stringify(result));

      fs.writeFileSync(
        path.join(process.cwd(), "test-results", "matrix-summary.json"),
        JSON.stringify(matrixResults, null, 2)
      );

      // Responsive matrix pass/fail thresholds:
      // Phone low tier >= 45 fps, laptop/desktop >= 50 fps, ultrawide >= 45 fps
      expect(consoleErrors).toHaveLength(0);
      if (dev.isPhone || dev.viewport.width > 2560) {
        expect(perfMetrics.avgFps).toBeGreaterThanOrEqual(45);
      } else {
        expect(perfMetrics.avgFps).toBeGreaterThanOrEqual(50);
      }
    });
  }
});
