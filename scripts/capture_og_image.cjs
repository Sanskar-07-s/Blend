const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto("http://localhost:4173/?quality=medium");
  const enterBtn = page.locator("button:has-text('ENTER')");
  await enterBtn.waitFor({ state: "visible", timeout: 20000 });
  await enterBtn.click();
  const skipBtn = page.locator("button:has-text('SKIP')");
  await skipBtn.waitFor({ state: "visible", timeout: 10000 });
  await skipBtn.click();
  await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 15000 });
  await page.waitForTimeout(1200);

  await page.screenshot({ path: "public/og-image.png" });
  await page.screenshot({ path: "public/apple-touch-icon.png", clip: { x: 500, y: 200, width: 192, height: 192 } });
  await page.screenshot({ path: "public/favicon.png", clip: { x: 500, y: 200, width: 64, height: 64 } });
  console.log("Successfully generated public/og-image.png, apple-touch-icon.png, favicon.png");
  await browser.close();
})();
