import { test, expect, Page } from "@playwright/test";

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
  // Wait for state to change to transitioning
  await page.locator("body[data-nav-state='transitioning']").waitFor({ state: "attached", timeout: 3000 }).catch(() => {});
  // Wait for transition to settle
  await waitForSettled(page);
}

async function clickPrev(page: Page) {
  await waitForSettled(page);
  const prevBtn = page.locator("button[aria-label='Previous Section']");
  await prevBtn.waitFor({ state: "visible", timeout: 10000 });
  await prevBtn.click();
  // Wait for state to change to transitioning
  await page.locator("body[data-nav-state='transitioning']").waitFor({ state: "attached", timeout: 3000 }).catch(() => {});
  // Wait for transition to settle
  await waitForSettled(page);
}

test("complete navigation flow: intro -> skip -> overview -> NEXT x9 -> BACK x8 -> menu jump -> home", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      if (!msg.text().includes("favicon")) {
        consoleErrors.push(msg.text());
      }
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  await page.goto("http://localhost:5173/");

  // 1. CHECK RENDERER
  const rendererInfo = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return { renderer: "NO_WEBGL", vendor: "UNKNOWN" };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
    };
  });
  console.log("PLAYWRIGHT_FLOW_RENDERER:", JSON.stringify(rendererInfo, null, 2));
  expect(rendererInfo.renderer).not.toMatch(/swiftshader|llvmpipe|software/i);

  // 2. Loading screen: Wait for body[data-nav-state='loading'] with ENTER button
  const enterButton = page.locator("button:has-text('ENTER')");
  await enterButton.waitFor({ state: "visible", timeout: 20000 });
  await enterButton.click();

  // 3. Intro sequence: wait for body[data-nav-state='intro'], then click SKIP
  await page.locator("body[data-nav-state='intro']").waitFor({ state: "attached", timeout: 10000 });
  const skipButton = page.locator("button:has-text('SKIP')");
  await skipButton.waitFor({ state: "visible", timeout: 6000 });
  await skipButton.click();

  // 4. Verify in Studio Overview
  await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 10000 });
  await expect(page.locator("text=STUDIO OVERVIEW")).toBeVisible({ timeout: 5000 });

  // 5. Navigate from Overview into Section 1..8, then 9th NEXT returns to Overview
  // Click 1: Overview -> Sec 1 (about)
  // Click 2: Sec 1 -> Sec 2 (projects)
  // ...
  // Click 8: Sec 7 -> Sec 8 (join)
  // Click 9: Sec 8 -> Overview
  for (let i = 0; i < 9; i++) {
    await clickNext(page);
  }

  // After 9 NEXT clicks, we are back in overview
  await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 10000 });
  await expect(page.locator("text=STUDIO OVERVIEW")).toBeVisible({ timeout: 5000 });

  // 6. Jump into section 8 to test BACK sequence
  const menuBtn = page.locator("button[aria-label='Open navigation drawer']");
  await menuBtn.click();
  await page.locator("text=JOIN THE MATRIX").click();
  await waitForSettled(page);
  await expect(page.locator("body[data-section='join']")).toBeAttached({ timeout: 5000 });

  // 7. BACK x8: Sec 8 -> Sec 7 -> ... -> Sec 1 -> Overview
  for (let i = 0; i < 8; i++) {
    await clickPrev(page);
  }

  // After BACK at first section, arrives at overview
  await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 10000 });
  await expect(page.locator("text=STUDIO OVERVIEW")).toBeVisible({ timeout: 5000 });

  // 8. Menu Jump: Jump to SHOWCASE RIGS
  await menuBtn.click();
  await page.locator("text=SHOWCASE RIGS").click();
  await waitForSettled(page);
  await expect(page.getByRole("heading", { name: "SHOWCASE RIGS" })).toBeVisible({ timeout: 5000 });

  // 9. Home button test
  const homeBtn = page.locator("button[aria-label='Return to Studio Overview']");
  await homeBtn.click();
  await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 10000 });
  await expect(page.locator("text=STUDIO OVERVIEW")).toBeVisible({ timeout: 5000 });

  // Fail test if any console error appeared
  expect(consoleErrors).toHaveLength(0);
});
