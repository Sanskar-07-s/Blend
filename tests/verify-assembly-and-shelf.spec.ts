import { test, expect } from "@playwright/test";

test.setTimeout(180000);

test("capture intro sequence at 0s, 2s, 3.5s, 5s, 7.5s, and shelf after screenshots", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("favicon")) {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  await page.goto("http://localhost:4173/");

  // Verify WebGL renderer
  const rendererInfo = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return { renderer: "NO_WEBGL" };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    };
  });
  console.log("Renderer:", rendererInfo.renderer);

  // Wait for Enter button to be ready
  const enterBtn = page.locator("button[aria-label='Enter Studio']");
  await enterBtn.waitFor({ state: "visible", timeout: 60000 });
  await page.waitForTimeout(500);

  // Click Enter Studio -> starts intro
  await enterBtn.click();

  // 0 s screenshot
  await page.screenshot({ path: "intro-0s.png" });
  console.log("Captured intro-0s.png");

  // 2.0 s screenshot (Fly in phase)
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "intro-2s.png" });
  console.log("Captured intro-2s.png");

  // 3.5 s screenshot (Pulse phase)
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "intro-3.5s.png" });
  console.log("Captured intro-3.5s.png");

  // 5.0 s screenshot (Unfold phase)
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "intro-5s.png" });
  console.log("Captured intro-5s.png");

  // 7.5 s screenshot (Lights on / overview transition)
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "intro-7.5s.png" });
  console.log("Captured intro-7.5s.png");

  // Verify transition to overview completed
  await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 10000 });
  await page.waitForTimeout(1000);

  // Capture shelf in overview after fix
  await page.screenshot({ path: "shelf-overview-after.png" });
  console.log("Captured shelf-overview-after.png");

  // Navigate to Learning section (Geometric Shelf)
  const nextBtn = page.locator("button[aria-label='Next Section']");
  await nextBtn.waitFor({ state: "visible", timeout: 5000 });

  // Navigate forward to learning section (about -> projects -> events -> learning)
  for (let i = 0; i < 4; i++) {
    await nextBtn.click();
    await page.waitForTimeout(2200);
  }

  // Confirm in learning section
  await page.locator("body[data-section='learning']").waitFor({ state: "attached", timeout: 5000 });
  await page.waitForTimeout(1000);

  // Capture shelf in Learning section after fix
  await page.screenshot({ path: "shelf-learning-after.png" });
  console.log("Captured shelf-learning-after.png");

  expect(consoleErrors).toEqual([]);
});

test("measure intro frame times (no frame > 50ms) and test SKIP at any moment", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("favicon")) {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  await page.goto("http://localhost:4173/");

  const enterBtn = page.locator("button[aria-label='Enter Studio']");
  await enterBtn.waitFor({ state: "visible", timeout: 60000 });
  await page.waitForTimeout(500);

  await enterBtn.click();
  await page.waitForTimeout(300);

  // Track frame times during uninterrupted intro run
  await page.evaluate(() => {
    (window as any).__longFrames = [];
    (window as any).__trackingFrames = true;
    let lastTime = performance.now();

    function track() {
      if (!(window as any).__trackingFrames) return;
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      if (delta > 50) {
        (window as any).__longFrames.push({
          delta: Math.round(delta),
          time: Math.round(now),
        });
      }
      requestAnimationFrame(track);
    }
    requestAnimationFrame(track);
  });

  // Wait through the full intro without taking screenshots
  await page.waitForTimeout(7200);

  const longFrames = await page.evaluate(() => {
    (window as any).__trackingFrames = false;
    return (window as any).__longFrames;
  });
  console.log("Long frames (>50ms) during clean intro:", JSON.stringify(longFrames));

  // Verify settled to overview
  await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 5000 });

  // TEST SKIP FUNCTIONALITY: Reload and skip intro at 1.5s
  await page.goto("http://localhost:4173/");
  const enterBtn2 = page.locator("button[aria-label='Enter Studio']");
  await enterBtn2.waitFor({ state: "visible", timeout: 60000 });
  await enterBtn2.click();

  // Intro started, SKIP button immediately available
  const skipBtn = page.locator("button[aria-label='Skip Studio Introduction']");
  await skipBtn.waitFor({ state: "visible", timeout: 2000 });
  await page.waitForTimeout(1500); // 1.5s into fly-in
  await skipBtn.click();

  // Must immediately jump to overview state
  await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 3000 });
  console.log("SKIP successfully jumped to overview!");

  // Verify Next/Back buttons work after SKIP
  const nextBtn = page.locator("button[aria-label='Next Section']");
  await nextBtn.waitFor({ state: "visible", timeout: 5000 });
  await nextBtn.click();
  await page.locator("body[data-nav-state='section']").waitFor({ state: "attached", timeout: 5000 });
  console.log("Navigation verified working after SKIP!");

  expect(longFrames.filter((f: any) => f.delta > 50)).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
