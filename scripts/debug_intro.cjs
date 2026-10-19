const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: [
      "--use-angle=d3d11",
      "--enable-gpu-rasterization",
      "--ignore-gpu-blocklist",
    ],
  });
  const page = await browser.newPage();
  page.on("console", (msg) => console.log("PAGE CONSOLE:", msg.text()));
  await page.goto("http://localhost:4173/");

  const enterBtn = page.locator("button:has-text('ENTER')");
  await enterBtn.waitFor({ state: "visible", timeout: 20000 });
  await enterBtn.click();

  await page.waitForTimeout(4000); // 4s into intro

  const debug = await page.evaluate(() => {
    const gl = (window).__gl;
    const scene = (window).__scene;
    const bc = (window).__bc;

    let shadowCasters = 0;
    let totalMeshes = 0;
    if (scene) {
      scene.traverse((obj) => {
        if (obj.isMesh) {
          totalMeshes++;
          if (obj.castShadow) shadowCasters++;
        }
      });
    }

    return {
      tier: bc?.tier,
      renderInfo: bc?.renderInfo,
      glShadowMapEnabled: gl?.shadowMap?.enabled,
      glShadowMapAutoUpdate: gl?.shadowMap?.autoUpdate,
      glShadowMapNeedsUpdate: gl?.shadowMap?.needsUpdate,
      totalMeshesInScene: totalMeshes,
      shadowCastersCount: shadowCasters,
    };
  });

  console.log("INTRO RENDER DEBUG:", JSON.stringify(debug, null, 2));

  await browser.close();
})();
