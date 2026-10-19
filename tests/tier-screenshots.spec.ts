import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.setTimeout(180000);

const TIERS = ["high", "medium", "low"] as const;
const SECTIONS = [
  "about",
  "projects",
  "events",
  "learning",
  "gallery",
  "team",
  "community",
  "join",
];

const outDir = path.resolve(process.cwd(), "test-results", "tier_screenshots");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

test("capture all 8 sections across high, medium, and low tiers", async ({ page }) => {
  for (const tier of TIERS) {
    console.log(`--- Capturing tier: ${tier} ---`);
    await page.goto(`http://localhost:4173/?quality=${tier}`);

    // Enter studio
    const enterBtn = page.locator("button:has-text('ENTER')");
    await enterBtn.waitFor({ state: "visible", timeout: 20000 });
    await enterBtn.click();

    // Skip intro
    await page.locator("body[data-nav-state='intro']").waitFor({ state: "attached", timeout: 10000 });
    const skipBtn = page.locator("button:has-text('SKIP')");
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }
    await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 15000 });
    await page.waitForTimeout(600);

    for (let i = 0; i < SECTIONS.length; i++) {
      const secName = SECTIONS[i];
      await page.locator("body:is([data-nav-state='overview'], [data-nav-state='section'])").waitFor({
        state: "attached",
        timeout: 15000,
      });
      await page.waitForTimeout(400);

      const nextBtn = page.locator("button[aria-label='Next Section']");
      await nextBtn.waitFor({ state: "visible", timeout: 8000 });
      await nextBtn.click();

      await page.locator(`body[data-section='${secName}']`).waitFor({ state: "attached", timeout: 15000 });
      await page.locator("body[data-nav-state='section']").waitFor({ state: "attached", timeout: 15000 });
      await page.waitForTimeout(500); // Wait for camera to settle

      const ssPath = path.join(outDir, `${tier}_sec${i + 1}_${secName}.png`);
      await page.screenshot({ path: ssPath });
      console.log(`Saved screenshot: ${tier}_sec${i + 1}_${secName}.png`);
    }
  }
});
