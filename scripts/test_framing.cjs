const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'screenshots', 'framing');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const SECTIONS = [
  { id: 'about', targetName: 'Generic_Monitor_Chassis' },
  { id: 'projects', targetName: 'case' },
  { id: 'events', targetName: 'Cloud_shelf' },
  { id: 'learning', targetName: 'Bookscase_Black_and_Light' },
  { id: 'gallery', targetName: 'frame' },
  { id: 'team', targetName: 'Cube029' },
  { id: 'community', targetName: 'Cube022' },
  { id: 'join', targetName: 'Gamer_neon__sign' },
];

async function measureFraming(viewport) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  await page.goto('http://localhost:4173/experience', { waitUntil: 'load' });
  const enterBtn = page.locator("button[data-testid='enter-button']");
  await enterBtn.waitFor({ state: 'visible', timeout: 25000 });
  await enterBtn.click();

  const skipBtn = page.locator("button:has-text('Skip intro')");
  if (await skipBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await skipBtn.click();
  }

  await page.waitForFunction(() => window.__bc && window.__bc.modelLoaded === true && (window.__bc.state === 'overview' || window.__bc.state === 'section'));
  await page.waitForTimeout(1000);

  const results = {};

  for (let i = 0; i < 8; i++) {
    const sec = SECTIONS[i];
    await page.evaluate((idx) => window.__bc.goTo(idx), i);
    await page.waitForTimeout(2000); // Wait for transition and camera settle

    // Take screenshot
    const shotPath = path.join(outDir, `framing-${viewport.width}x${viewport.height}-${sec.id}.png`);
    await page.screenshot({ path: shotPath });

    const stats = await page.evaluate(({ secId, targetName }) => {
      const cam = window.__camera;
      
      // Find target meshes
      const meshes = [];
      window.__scene.traverse((obj) => {
        if (obj.isMesh && obj.geometry) {
          if (targetName === 'Generic_Monitor_Chassis') {
            if (obj.name.includes('Generic_Monitor')) meshes.push(obj);
          } else if (targetName === 'case') {
            if (obj.name.toLowerCase().startsWith('case')) meshes.push(obj);
          } else if (targetName === 'Cloud_shelf') {
            if (obj.name.toLowerCase().includes('cloud') || obj.name.toLowerCase().includes('shelf')) meshes.push(obj);
          } else if (targetName === 'Bookscase_Black_and_Light') {
            if (obj.name.toLowerCase().includes('booksca') || obj.name.toLowerCase().includes('bookshelf')) meshes.push(obj);
          } else if (targetName === 'frame') {
            if (obj.name.toLowerCase().includes('frame') || obj.name.toLowerCase().includes('painting')) meshes.push(obj);
          } else if (targetName === 'Cube029') {
            if (obj.name.includes('Cube029') || obj.name.includes('Cube.029')) meshes.push(obj);
          } else if (targetName === 'Cube022') {
            if (obj.name.includes('Cube022') || obj.name.includes('Cube.022')) meshes.push(obj);
          } else if (targetName === 'Gamer_neon__sign') {
            if (obj.name.includes('Plane04') || obj.name.includes('Plane.04') || obj.name.includes('Torus') || obj.name.includes('Gamer')) meshes.push(obj);
          }
        }
      });
      if (meshes.length === 0) {
        return { error: `No meshes found for target ${targetName}` };
      }

      const allCorners = [];
      meshes.forEach(m => {
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
        const b = m.geometry.boundingBox;
        const pts = [
          [b.min.x, b.min.y, b.min.z], [b.min.x, b.min.y, b.max.z],
          [b.min.x, b.max.y, b.min.z], [b.min.x, b.max.y, b.max.z],
          [b.max.x, b.min.y, b.min.z], [b.max.x, b.min.y, b.max.z],
          [b.max.x, b.max.y, b.min.z], [b.max.x, b.max.y, b.max.z],
        ];
        pts.forEach(p => {
          const e = m.matrixWorld.elements;
          const wx = e[0]*p[0] + e[4]*p[1] + e[8]*p[2] + e[12];
          const wy = e[1]*p[0] + e[5]*p[1] + e[9]*p[2] + e[13];
          const wz = e[2]*p[0] + e[6]*p[1] + e[10]*p[2] + e[14];

          const v = new m.position.constructor(wx, wy, wz);
          v.project(cam);
          allCorners.push({ x: v.x, y: v.y, z: v.z });
        });
      });

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      allCorners.forEach(c => {
        const sx = (c.x * 0.5 + 0.5) * window.innerWidth;
        const sy = ((1 - c.y) * 0.5) * window.innerHeight;
        minX = Math.min(minX, sx);
        maxX = Math.max(maxX, sx);
        minY = Math.min(minY, sy);
        maxY = Math.max(maxY, sy);
      });

      const widthPct = Math.round(((maxX - minX) / window.innerWidth) * 1000) / 10;
      const heightPct = Math.round(((maxY - minY) / window.innerHeight) * 1000) / 10;

      return {
        targetName: meshes[0].name,
        widthPct,
        heightPct,
        fitsWidth: minX >= 0 && maxX <= window.innerWidth,
        fitsHeight: minY >= 0 && maxY <= window.innerHeight,
        minY: Math.round(minY),
        maxY: Math.round(maxY),
        minX: Math.round(minX),
        maxX: Math.round(maxX)
      };
    }, { secId: sec.id, targetName: sec.targetName });

    results[sec.id] = stats;
  }

  await browser.close();
  return results;
}

(async () => {
  console.log('=== MEASURING FRAMING (1920x1080) ===');
  const d1080 = await measureFraming({ width: 1920, height: 1080 });
  console.log('1920x1080 Results:');
  for (const [id, res] of Object.entries(d1080)) {
    console.log(`  ${id.padEnd(12)}: height=${res.heightPct}% | width=${res.widthPct}% | fitsHeight=${res.fitsHeight} | fitsWidth=${res.fitsWidth} [Y: ${res.minY}..${res.maxY}, X: ${res.minX}..${res.maxX}]`);
  }

  console.log('\n=== MEASURING FRAMING (390x844) ===');
  const m844 = await measureFraming({ width: 390, height: 844 });
  console.log('390x844 Results:');
  for (const [id, res] of Object.entries(m844)) {
    console.log(`  ${id.padEnd(12)}: height=${res.heightPct}% | width=${res.widthPct}% | fitsHeight=${res.fitsHeight} | fitsWidth=${res.fitsWidth} [Y: ${res.minY}..${res.maxY}, X: ${res.minX}..${res.maxX}]`);
  }

  fs.writeFileSync('scratch/framing-results.json', JSON.stringify({ '1920x1080': d1080, '390x844': m844 }, null, 2));
})();
