const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    args: ['--use-angle=d3d11', '--enable-gpu-rasterization']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:4173/');

  // Wait for Enter button and click
  const enterBtn = page.locator("button:has-text('ENTER')");
  await enterBtn.waitFor({ state: "visible", timeout: 20000 });
  await enterBtn.click();

  await page.waitForTimeout(4000);

  const drawCallsBreakdown = await page.evaluate(() => {
    const list = [];
    const scene = (window).__scene;
    if (scene) {
      scene.traverse((obj) => {
        if (obj.isMesh && obj.visible) {
          list.push({
            name: obj.name,
            parent: obj.parent ? obj.parent.name : null,
            material: Array.isArray(obj.material) ? obj.material.map(m => m.name) : obj.material?.name,
            geometryTris: obj.geometry ? (obj.geometry.index ? obj.geometry.index.count / 3 : obj.geometry.attributes.position.count / 3) : 0
          });
        }
      });
    }
    return {
      totalMeshes: list.length,
      meshes: list
    };
  });

  console.log('Total visible meshes in Three.js:', drawCallsBreakdown.totalMeshes);
  console.log('Breakdown by parent/name:');
  const counts = {};
  for (const m of drawCallsBreakdown.meshes) {
    const key = m.parent || 'root';
    counts[key] = (counts[key] || 0) + 1;
  }
  console.table(counts);

  console.log('\nSample meshes:');
  console.table(drawCallsBreakdown.meshes.slice(0, 30));

  await browser.close();
})();
