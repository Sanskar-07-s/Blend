import { test, expect } from "@playwright/test";

test.setTimeout(240000);

test.describe("Two-Lap Tour Performance Regression Test", () => {
  test("runs the full tour twice and verifies no FPS drop >10% and heap growth <=20%", async ({ page }) => {
    await page.goto("http://localhost:4173/experience", { waitUntil: "load" });

    const enterBtn = page.locator("button[data-testid='enter-button']");
    await enterBtn.waitFor({ state: "visible", timeout: 35000 });
    await enterBtn.click();

    const skipBtn = page.locator("button:has-text('Skip intro')");
    if (await skipBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await skipBtn.click();
    }

    await page.waitForFunction(
      () =>
        (window as any).__bc &&
        (window as any).__bc.modelLoaded === true &&
        ((window as any).__bc.state === "overview" || (window as any).__bc.state === "section")
    );
    await page.waitForTimeout(1000);

    // --- LAP 1 ---
    console.log("=== STARTING LAP 1 ===");
    const lap1StartFrame = await page.evaluate(() => (window as any).__bc?.realFrames || 0);
    const lap1StartTime = performance.now();

    for (let i = 0; i < 8; i++) {
      await page.evaluate((idx) => (window as any).__bc.goTo(idx), i);
      await page.waitForTimeout(1200);
    }
    // Return to overview at end of lap 1
    await page.evaluate(() => (window as any).__bc.home());
    await page.waitForTimeout(1000);

    const lap1EndTime = performance.now();
    const lap1EndFrame = await page.evaluate(() => (window as any).__bc?.realFrames || 0);
    const lap1Frames = lap1EndFrame - lap1StartFrame;
    const lap1DurationSec = (lap1EndTime - lap1StartTime) / 1000;
    const lap1AvgFps = Math.round((lap1Frames / lap1DurationSec) * 10) / 10;

    const lap1Metrics = await page.evaluate(() => {
      const perf = (window.performance as any);
      return {
        heapBytes: perf?.memory?.usedJSHeapSize || 0,
        fps: (window as any).__bc?.fps,
        refreshRate: (window as any).__bc?.refreshRate,
        onePercentLow: (window as any).__bc?.onePercentLow,
      };
    });

    console.log(
      `Lap 1: avgFPS=${lap1AvgFps} (instant=${lap1Metrics.fps}, 1%low=${lap1Metrics.onePercentLow}, Hz=${lap1Metrics.refreshRate}) | Heap=${(
        lap1Metrics.heapBytes /
        (1024 * 1024)
      ).toFixed(2)} MB`
    );

    // --- LAP 2 ---
    console.log("=== STARTING LAP 2 ===");
    const lap2StartFrame = await page.evaluate(() => (window as any).__bc?.realFrames || 0);
    const lap2StartTime = performance.now();

    for (let i = 0; i < 8; i++) {
      await page.evaluate((idx) => (window as any).__bc.goTo(idx), i);
      await page.waitForTimeout(1200);
    }
    // Return to overview at end of lap 2
    await page.evaluate(() => (window as any).__bc.home());
    await page.waitForTimeout(1000);

    const lap2EndTime = performance.now();
    const lap2EndFrame = await page.evaluate(() => (window as any).__bc?.realFrames || 0);
    const lap2Frames = lap2EndFrame - lap2StartFrame;
    const lap2DurationSec = (lap2EndTime - lap2StartTime) / 1000;
    const lap2AvgFps = Math.round((lap2Frames / lap2DurationSec) * 10) / 10;

    const lap2Metrics = await page.evaluate(() => {
      const perf = (window.performance as any);
      return {
        heapBytes: perf?.memory?.usedJSHeapSize || 0,
        fps: (window as any).__bc?.fps,
        refreshRate: (window as any).__bc?.refreshRate,
        onePercentLow: (window as any).__bc?.onePercentLow,
      };
    });

    console.log(
      `Lap 2: avgFPS=${lap2AvgFps} (instant=${lap2Metrics.fps}, 1%low=${lap2Metrics.onePercentLow}, Hz=${lap2Metrics.refreshRate}) | Heap=${(
        lap2Metrics.heapBytes /
        (1024 * 1024)
      ).toFixed(2)} MB`
    );

    // Assertions required by Audit Item 4:
    // 1. Second lap average FPS must not be more than 10% below the first
    const minAllowedFps = lap1AvgFps * 0.9;
    console.log(`Lap 1 Avg FPS: ${lap1AvgFps} -> Minimum allowed Lap 2 FPS: ${minAllowedFps.toFixed(1)}`);
    expect(
      lap2AvgFps,
      `Lap 2 average FPS (${lap2AvgFps}) is more than 10% below Lap 1 (${lap1AvgFps})`
    ).toBeGreaterThanOrEqual(minAllowedFps);

    // 2. JS heap must not grow by more than 20%
    if (lap1Metrics.heapBytes > 0 && lap2Metrics.heapBytes > 0) {
      const maxAllowedHeap = lap1Metrics.heapBytes * 1.2;
      const heapGrowthPct =
        ((lap2Metrics.heapBytes - lap1Metrics.heapBytes) / lap1Metrics.heapBytes) * 100;
      console.log(`Heap Growth: ${heapGrowthPct.toFixed(1)}% (allowed <= 20%)`);
      expect(
        lap2Metrics.heapBytes,
        `JS heap grew by ${heapGrowthPct.toFixed(1)}% which exceeds the 20% threshold`
      ).toBeLessThanOrEqual(maxAllowedHeap);
    }
  });
});
