import { test, expect } from "@playwright/test";

test("complete navigation flow: intro -> skip -> overview -> NEXT x8 -> BACK x8 -> menu jump -> home", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto("http://localhost:5173/");

  // 1. Loading screen: Wait for ENTER button and click
  const enterButton = page.locator("button:has-text('ENTER')");
  await enterButton.waitFor({ state: "visible", timeout: 8000 });
  await enterButton.click();

  // 2. Intro sequence: Click SKIP button
  const skipButton = page.locator("button:has-text('SKIP')");
  await skipButton.waitFor({ state: "visible", timeout: 4000 });
  await skipButton.click();

  // 3. Verify in Studio Overview
  await expect(page.locator("text=STUDIO OVERVIEW")).toBeVisible();

  // 4. NEXT x8: Transition through all 8 sections
  for (let i = 0; i < 8; i++) {
    const nextBtn = page.locator("button[aria-label='Next Section']");
    await nextBtn.click();
    await page.waitForTimeout(2000); // 1.8s transition + settle
  }

  // After 8 NEXT clicks from section 1..8, last NEXT returns to overview
  await expect(page.locator("text=STUDIO OVERVIEW")).toBeVisible();

  // Jump into section 8 to test BACK sequence
  const menuBtn = page.locator("button[aria-label='Open navigation drawer']");
  await menuBtn.click();
  await page.locator("text=JOIN THE MATRIX").click();
  await page.waitForTimeout(2000);

  // 5. BACK x8
  for (let i = 0; i < 8; i++) {
    const prevBtn = page.locator("button[aria-label='Previous Section']");
    await prevBtn.click();
    await page.waitForTimeout(2000);
  }

  // After BACK at first section, arrives at overview
  await expect(page.locator("text=STUDIO OVERVIEW")).toBeVisible();

  // 6. Menu Jump: Jump to SHOWCASE RIGS
  await menuBtn.click();
  await page.locator("text=SHOWCASE RIGS").click();
  await page.waitForTimeout(2000);
  await expect(page.locator("text=SHOWCASE RIGS")).toBeVisible();

  // 7. Home button test
  const homeBtn = page.locator("button[aria-label='Return to Studio Overview']");
  await homeBtn.click();
  await page.waitForTimeout(2000);
  await expect(page.locator("text=STUDIO OVERVIEW")).toBeVisible();

  // Fail test if any console error appeared
  expect(consoleErrors).toHaveLength(0);
});
