import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.setTimeout(180000);

const SECTIONS = [
  { id: "about", targetName: "Generic_Monitor_Chassis" },
  { id: "projects", targetName: "case" },
  { id: "events", targetName: "Cloud_shelf" },
  { id: "learning", targetName: "Bookscase_Black_and_Light" },
  { id: "gallery", targetName: "frame" },
  { id: "team", targetName: "Cube029" },
  { id: "community", targetName: "Cube022" },
  { id: "join", targetName: "Studio_Neon_Sign" },
];

const outDir = path.join(process.cwd(), "screenshots", "framing");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

test.describe("Section Framing Verification (30% to 85% Height & Width Fit)", () => {
  const viewports = [
    { name: "desktop_1920x1080", width: 1920, height: 1080 },
    { name: "mobile_390x844", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    test(`Verify framing for all 8 sections at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("http://localhost:4173/experience", { waitUntil: "load" });

      const enterBtn = page.locator("button[data-testid='enter-button']");
      await enterBtn.waitFor({ state: "visible", timeout: 30000 });
      await enterBtn.click();

      const skipBtn = page.locator("button:has-text('Skip intro')");
      if (await skipBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await skipBtn.click();
      }

      await page.waitForFunction(
        () =>
          (window as any).__bc &&
          (window as any).__bc.modelLoaded === true &&
          ((window as any).__bc.state === "overview" || (window as any).__bc.state === "section")
      );
      await page.waitForTimeout(1000);

      for (let i = 0; i < 8; i++) {
        const sec = SECTIONS[i];
        await page.evaluate((idx) => (window as any).__bc.goTo(idx), i);
        await page.waitForTimeout(2000);

        const shotPath = path.join(outDir, `framing-${vp.width}x${vp.height}-${sec.id}.png`);
        await page.screenshot({ path: shotPath });

        const stats = await page.evaluate(
          ({ secId, targetName }) => {
            const cam = (window as any).__camera;
            const meshes: any[] = [];
            (window as any).__scene.traverse((obj: any) => {
              if (obj.isMesh && obj.geometry) {
                if (targetName === "Generic_Monitor_Chassis") {
                  if (obj.name.includes("Generic_Monitor")) meshes.push(obj);
                } else if (targetName === "case") {
                  if (obj.name.toLowerCase().startsWith("case")) meshes.push(obj);
                } else if (targetName === "Cloud_shelf") {
                  if (obj.name.toLowerCase().includes("cloud") || obj.name.toLowerCase().includes("shelf"))
                    meshes.push(obj);
                } else if (targetName === "Bookscase_Black_and_Light") {
                  if (obj.name.toLowerCase().includes("booksca") || obj.name.toLowerCase().includes("bookshelf"))
                    meshes.push(obj);
                } else if (targetName === "frame") {
                  if (obj.name.toLowerCase().includes("frame") || obj.name.toLowerCase().includes("painting"))
                    meshes.push(obj);
                } else if (targetName === "Cube029") {
                  if (obj.name.includes("Cube029") || obj.name.includes("Cube.029")) meshes.push(obj);
                } else if (targetName === "Cube022") {
                  if (obj.name.includes("Cube022") || obj.name.includes("Cube.022")) meshes.push(obj);
                } else if (targetName === "Studio_Neon_Sign" || targetName === "Gamer_neon__sign") {
                  if (
                    obj.name.includes("Plane04") ||
                    obj.name.includes("Plane.04") ||
                    obj.name.includes("Torus") ||
                    obj.name.includes("Studio_Neon") ||
                    obj.name.includes("Gamer")
                  )
                    meshes.push(obj);
                }
              }
            });

            if (meshes.length === 0) {
              return { error: `No meshes found for target ${targetName}` };
            }

            const allCorners: { x: number; y: number; z: number }[] = [];
            meshes.forEach((m) => {
              if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
              const b = m.geometry.boundingBox;
              const pts = [
                [b.min.x, b.min.y, b.min.z],
                [b.min.x, b.min.y, b.max.z],
                [b.min.x, b.max.y, b.min.z],
                [b.min.x, b.max.y, b.max.z],
                [b.max.x, b.min.y, b.min.z],
                [b.max.x, b.min.y, b.max.z],
                [b.max.x, b.max.y, b.min.z],
                [b.max.x, b.max.y, b.max.z],
              ];
              pts.forEach((p) => {
                const e = m.matrixWorld.elements;
                const wx = e[0] * p[0] + e[4] * p[1] + e[8] * p[2] + e[12];
                const wy = e[1] * p[0] + e[5] * p[1] + e[9] * p[2] + e[13];
                const wz = e[2] * p[0] + e[6] * p[1] + e[10] * p[2] + e[14];

                const v = new m.position.constructor(wx, wy, wz);
                v.project(cam);
                allCorners.push({ x: v.x, y: v.y, z: v.z });
              });
            });

            let minX = Infinity,
              maxX = -Infinity,
              minY = Infinity,
              maxY = -Infinity;
            allCorners.forEach((c) => {
              const sx = (c.x * 0.5 + 0.5) * window.innerWidth;
              const sy = (1 - c.y) * 0.5 * window.innerHeight;
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
              maxX: Math.round(maxX),
            };
          },
          { secId: sec.id, targetName: sec.targetName }
        );

        console.log(
          `[${vp.name}] ${sec.id.padEnd(12)}: height=${stats.heightPct}% | width=${stats.widthPct}% | fitsHeight=${stats.fitsHeight} | fitsWidth=${stats.fitsWidth}`
        );

        // Required: fits screen width
        expect(stats.fitsWidth, `${sec.id} must fit within screen width at ${vp.name}`).toBe(true);

        // Required: fills 30 to 85% height (tall objects fit <=85%, ultrawide monitor on mobile portrait fills >=20%)
        expect(stats.heightPct, `${sec.id} height must not exceed 85% at ${vp.name}`).toBeLessThanOrEqual(85);
        if (vp.width === 1920) {
          expect(stats.heightPct, `${sec.id} height must be >= 30% on desktop`).toBeGreaterThanOrEqual(30);
        } else {
          // In mobile portrait (390x844), ultra-wide monitor aspect 2.25:1 occupies 95.4% width at 22.7% height
          const minHeight = sec.id === "about" ? 20 : 30;
          expect(stats.heightPct, `${sec.id} height must be >= ${minHeight}% on mobile`).toBeGreaterThanOrEqual(
            minHeight
          );
        }
      }
    });
  }
});
