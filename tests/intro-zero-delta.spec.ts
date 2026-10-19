import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.setTimeout(180000);

test("Intro zero-delta assertion & screenshots: verify single intro animation", async ({ page }) => {
  const screenshotDir = path.resolve(process.cwd(), "test-results");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("favicon")) {
      consoleErrors.push(msg.text());
    }
  });

  // Navigate to dev server
  await page.goto("http://localhost:5173/");

  // 1. Wait for Loading Screen ENTER button (which only enables once quality tier and prewarm are ready)
  const enterBtn = page.locator("button:has-text('ENTER')");
  await enterBtn.waitFor({ state: "visible", timeout: 40000 });

  // Click ENTER to start the single assembly intro sequence
  await enterBtn.click();

  // 2. Poll every 0.5s from ENTER until 3 seconds after intro ends, capturing frame screenshots
  let frameIdx = 0;
  let introEnded = false;
  let snapshotAtIntroEnd: any = null;

  while (!introEnded) {
    await page.screenshot({ path: path.join(screenshotDir, `intro_frame_${String(frameIdx).padStart(2, "0")}.png`) });
    frameIdx++;

    const navState = await page.evaluate(() => (window as any).__bc?.state);
    if (navState === "overview") {
      introEnded = true;
      snapshotAtIntroEnd = await page.evaluate(() => (window as any).__bc?.getSceneSnapshot?.());
      break;
    }

    await page.waitForTimeout(500);
  }

  expect(snapshotAtIntroEnd).not.toBeNull();
  console.log("Intro ended cleanly. Captured snapshot at intro end:", JSON.stringify(snapshotAtIntroEnd.camera));

  // 3. Take screenshots every 0.5s for 3 full seconds after intro ends
  for (let s = 1; s <= 6; s++) {
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, `post_intro_settled_${s * 500}ms.png`) });
  }

  // 4. Capture snapshot 3 seconds after intro ends
  const snapshot3sLater = await page.evaluate(() => (window as any).__bc?.getSceneSnapshot?.());
  console.log("Captured snapshot 3s later:", JSON.stringify(snapshot3sLater.camera));

  // 5. ASSERTION: Camera pose difference between intro end and 3s later MUST BE ZERO (difference < 0.001)
  const camDeltaX = Math.abs(snapshot3sLater.camera.x - snapshotAtIntroEnd.camera.x);
  const camDeltaY = Math.abs(snapshot3sLater.camera.y - snapshotAtIntroEnd.camera.y);
  const camDeltaZ = Math.abs(snapshot3sLater.camera.z - snapshotAtIntroEnd.camera.z);

  console.log(`Camera Deltas: dx=${camDeltaX}, dy=${camDeltaY}, dz=${camDeltaZ}`);
  expect(camDeltaX).toBeLessThan(0.001);
  expect(camDeltaY).toBeLessThan(0.001);
  expect(camDeltaZ).toBeLessThan(0.001);

  // 6. ASSERTION: Group world poses difference between intro end and 3s later MUST BE ZERO
  expect(snapshot3sLater.groups.length).toBeGreaterThan(0);
  for (const group3s of snapshot3sLater.groups) {
    const groupEnd = snapshotAtIntroEnd.groups.find((g: any) => g.name === group3s.name);
    expect(groupEnd).toBeDefined();

    const gdx = Math.abs(group3s.x - groupEnd.x);
    const gdy = Math.abs(group3s.y - groupEnd.y);
    const gdz = Math.abs(group3s.z - groupEnd.z);

    expect(gdx).toBeLessThan(0.001);
    expect(gdy).toBeLessThan(0.001);
    expect(gdz).toBeLessThan(0.001);
  }

  // 7. Capture overview screenshot
  await page.screenshot({ path: path.join(screenshotDir, "overview_palette.png") });

  const waitForSettled = async () => {
    await page.locator("body:is([data-nav-state='overview'], [data-nav-state='section'])").waitFor({
      state: "attached",
      timeout: 15000,
    });
    await page.waitForTimeout(300);
  };

  const clickNext = async () => {
    await waitForSettled();
    const nextBtn = page.locator("button[aria-label='Next Section']");
    await nextBtn.waitFor({ state: "visible", timeout: 10000 });
    await nextBtn.click();
    await page.locator("body[data-nav-state='transitioning']").waitFor({ state: "attached", timeout: 3000 }).catch(() => {});
    await waitForSettled();
  };

  // 8. Capture About section screenshot (requirement: About section before and after)
  await clickNext();
  await page.locator("body[data-section='about']").waitFor({ state: "attached", timeout: 10000 });
  await page.screenshot({ path: path.join(screenshotDir, "about_after.png") });

  // 9. Capture all other 7 sections to verify color grading and no section washed out
  const remainingSections = ["projects", "events", "learning", "gallery", "team", "community", "join"];
  for (const sec of remainingSections) {
    await clickNext();
    await page.locator(`body[data-section='${sec}']`).waitFor({ state: "attached", timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, `section_${sec}_palette.png`) });
  }

  expect(consoleErrors).toHaveLength(0);
});
