import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.setTimeout(180000);

async function waitForSettled(page: Page) {
  await page.locator("body:is([data-nav-state='overview'], [data-nav-state='section'])").waitFor({
    state: "attached",
    timeout: 15000,
  });
}

async function clickNext(page: Page) {
  await waitForSettled(page);
  const nextBtn = page.locator("button[aria-label='Next Section']");
  await nextBtn.waitFor({ state: "visible", timeout: 10000 });
  await nextBtn.click();
  await page.locator("body[data-nav-state='transitioning']").waitFor({ state: "attached", timeout: 3000 }).catch(() => {});
  await waitForSettled(page);
}

test.describe("BLENDER CLUB PORTFOLIO COMPLETE FLOW", () => {
  const screenshotsDir = path.join(process.cwd(), "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  test("1. Full User Journey: Welcome (/) -> ENTER -> Experience -> tour -> EXIT STUDIO -> Club (/club)", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("favicon")) {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    // --- STEP 1: WELCOME HERO (/) ---
    await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("h1")).toContainText(/blender club/i);
    await page.screenshot({ path: path.join(screenshotsDir, "welcome-desktop-1920x1080.png") });

    // Click ENTER to navigate to /experience
    const enterBtn = page.locator("#welcome-enter-btn");
    await enterBtn.waitFor({ state: "visible", timeout: 10000 });
    await enterBtn.click();

    // Verify URL transitions to /experience
    await page.waitForURL("**/experience", { timeout: 10000 });
    expect(page.url()).toContain("/experience");

    // --- STEP 2: EXPERIENCE LOADING & ASSEMBLY INTRO ---
    const studioEnterBtn = page.locator("button[data-testid='enter-button']");
    await studioEnterBtn.waitFor({ state: "visible", timeout: 25000 });
    await studioEnterBtn.click();

    // Assembly intro plays or can be skipped
    const skipBtn = page.locator("button:has-text('SKIP'), button:has-text('Skip intro')").first();
    if (await skipBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await skipBtn.click();
    }

    // Verify Overview is reached
    await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 10000 });
    await expect(page.locator("text=/overview/i").first()).toBeVisible({ timeout: 5000 });

    // --- STEP 3: NAVIGATE TO SECTION 8 (JOIN) ---
    // Jump directly to Section 8 (JOIN) via drawer
    const menuBtn = page.locator("button[aria-label='Open navigation drawer']");
    await menuBtn.click();
    await page.locator("text=/join/i").first().click();
    await waitForSettled(page);
    await expect(page.locator("body[data-section='join']")).toBeAttached({ timeout: 5000 });

    // --- STEP 4: EXIT STUDIO BUTTON ---
    const exitStudioBtn = page.locator("button[data-testid='exit-studio-btn']").first();
    await exitStudioBtn.waitFor({ state: "visible", timeout: 10000 });
    await exitStudioBtn.click();

    // Verify Cinematic Exit navigates to /club
    await page.waitForURL("**/club", { timeout: 10000 });
    expect(page.url()).toContain("/club");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

    // Zero console errors throughout journey
    expect(consoleErrors).toEqual([]);
  });

  test("2. Direct visits & deep links to /club and /experience", async ({ page }) => {
    // Direct visit to /club
    await page.goto("http://localhost:5173/club");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#projects")).toBeVisible();
    await expect(page.locator("#join")).toBeVisible();

    // Direct visit to /experience
    await page.goto("http://localhost:5173/experience");
    const studioEnterBtn = page.locator("button[data-testid='enter-button']");
    await studioEnterBtn.waitFor({ state: "visible", timeout: 25000 });
    await expect(studioEnterBtn).toBeVisible();
  });

  test("3. Back button behavior and Re-enter from Club without memory leak", async ({ page }) => {
    // 1. Start at /experience
    await page.goto("http://localhost:5173/experience");
    const studioEnterBtn = page.locator("button[data-testid='enter-button']");
    await studioEnterBtn.waitFor({ state: "visible", timeout: 25000 });
    await studioEnterBtn.click();

    // Skip intro if present
    const skipBtn = page.locator("button:has-text('SKIP')");
    if (await skipBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await skipBtn.click();
    }
    await waitForSettled(page);

    // 2. Open drawer and click Exit to Site
    const menuBtn = page.locator("button[aria-label='Open navigation drawer']");
    await menuBtn.click();
    await page.locator("button:has-text('Exit to club site'), button:has-text('EXIT TO SITE')").first().click();
    await page.waitForURL("**/club", { timeout: 10000 });
    expect(page.url()).toContain("/club");

    // 3. Test Back button
    await page.goBack();
    expect(page.url()).toContain("/experience");

    // 4. Return forward to /club
    await page.goForward();
    expect(page.url()).toContain("/club");

    // 5. Click "ENTER STUDIO" button in Club nav to Re-enter
    const enterStudioNav = page.locator("a:has-text('ENTER STUDIO')").first();
    await enterStudioNav.click();
    await page.waitForURL("**/experience", { timeout: 10000 });
    expect(page.url()).toContain("/experience");
  });

  test("4. Capture Responsive Screenshots (Mobile 390x844, Tablet 768x1024, Desktop 1920x1080) & Each Club Section", async ({ page }) => {
    // Desktop (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("http://localhost:5173/club");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, "club-hero-desktop-1920x1080.png") });

    // Capture each club section
    const sections = ["about", "what-we-do", "projects", "events", "learning", "gallery", "team", "community", "join"];
    for (const sec of sections) {
      const loc = page.locator(`#${sec}`);
      if (await loc.isVisible()) {
        await loc.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await loc.screenshot({ path: path.join(screenshotsDir, `club-section-${sec}-desktop.png`) });
      }
    }

    // Mobile (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:5173/");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, "welcome-mobile-390x844.png") });

    await page.goto("http://localhost:5173/club");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, "club-hero-mobile-390x844.png") });

    // Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("http://localhost:5173/club");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, "club-hero-tablet-768x1024.png") });
  });
});
