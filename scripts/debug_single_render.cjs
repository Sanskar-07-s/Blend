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
  await page.goto("http://localhost:4173/");

  const enterBtn = page.locator("button:has-text('ENTER')");
  await enterBtn.waitFor({ state: "visible", timeout: 20000 });
  await enterBtn.click();

  await page.waitForTimeout(4500); // 4.5s into intro

  const res = await page.evaluate(() => {
    const gl = (window).__gl;
    const scene = (window).__scene;
    const camera = (window).__camera;

    const draws = [];
    const origRenderBufferDirect = gl.renderBufferDirect.bind(gl);
    gl.renderBufferDirect = function(camera, scene, geometry, material, object, group) {
      if (object.name === "roof") {
        draws.push({
          name: object.name,
          material: material.name,
          group: group,
          stack: new Error().stack,
        });
      }
      return origRenderBufferDirect(camera, scene, geometry, material, object, group);
    };

    gl.info.reset();
    gl.render(scene, camera);

    return {
      roofDrawCount: draws.length,
      draw1: draws[0],
      draw2: draws[1],
    };
  });

  console.log("EXACT RENDER STATS:", JSON.stringify(res, null, 2));

  await browser.close();
})();
