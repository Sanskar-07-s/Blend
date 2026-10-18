import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.setTimeout(180000);

function computeStats(deltas: number[]) {
  if (deltas.length === 0) return { avgFps: 0, p1LowFps: 0, worstFrameMs: 0 };
  const sorted = [...deltas].sort((a, b) => b - a); // descending by frame ms
  const worstFrameMs = sorted[0];
  const count1Percent = Math.max(1, Math.round(deltas.length * 0.01));
  const worst1Percent = sorted.slice(0, count1Percent);
  const avgWorst1PercentMs = worst1Percent.reduce((a, b) => a + b, 0) / count1Percent;
  const p1LowFps = 1000 / avgWorst1PercentMs;
  const avgMs = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const avgFps = 1000 / avgMs;
  return {
    avgFps: Math.round(avgFps * 10) / 10,
    p1LowFps: Math.round(p1LowFps * 10) / 10,
    worstFrameMs: Math.round(worstFrameMs * 10) / 10,
  };
}

test("measure production profile", async ({ page }) => {
  await page.goto("http://localhost:4173/");

  // 1. CHECK THE RENDERER
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
  console.log("PLAYWRIGHT_RENDERER:", JSON.stringify(rendererInfo, null, 2));
  const isSoftware = /swiftshader|llvmpipe|software/i.test(rendererInfo.renderer);
  if (isSoftware) {
    console.warn("WARNING: Machine has NO real GPU! Renderer:", rendererInfo.renderer);
  } else {
    console.log("REAL GPU CONFIRMED:", rendererInfo.renderer);
  }

  // Inject stage recorder
  await page.evaluate(() => {
    (window as any).__stageFrames = [];
    (window as any).__recordingStage = false;
    let last = performance.now();
    function loop(now: number) {
      const dt = now - last;
      last = now;
      if ((window as any).__recordingStage && dt > 0 && dt < 1000) {
        (window as any).__stageFrames.push(dt);
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  });

  const stagesReport: Array<{
    stage: string;
    avgFps: number;
    p1LowFps: number;
    worstFrameMs: number;
    drawCalls: number;
    triangles: number;
    textures: number;
  }> = [];

  // STAGE 1: First 10 seconds after load
  console.log("--- Starting Stage 1: First 10s after load ---");
  await page.evaluate(() => {
    (window as any).__stageFrames = [];
    (window as any).__recordingStage = true;
  });
  await page.waitForTimeout(10000);
  const stage1Data = await page.evaluate(() => {
    (window as any).__recordingStage = false;
    return {
      frames: (window as any).__stageFrames as number[],
      renderInfo: (window as any).__bc?.renderInfo || { calls: 0, triangles: 0, textures: 0 },
    };
  });
  const s1Stats = computeStats(stage1Data.frames);
  stagesReport.push({
    stage: "First 10s after load",
    avgFps: s1Stats.avgFps,
    p1LowFps: s1Stats.p1LowFps,
    worstFrameMs: s1Stats.worstFrameMs,
    drawCalls: stage1Data.renderInfo.calls || 0,
    triangles: stage1Data.renderInfo.triangles || 0,
    textures: stage1Data.renderInfo.textures || 0,
  });

  // Wait for Enter button and click
  const enterBtn = page.locator("button:has-text('ENTER')");
  await enterBtn.waitFor({ state: "visible", timeout: 20000 });
  await enterBtn.click();

  // STAGE 2: Intro
  console.log("--- Starting Stage 2: Intro ---");
  await page.locator("body[data-nav-state='intro']").waitFor({ state: "attached", timeout: 10000 });
  await page.evaluate(() => {
    (window as any).__stageFrames = [];
    (window as any).__recordingStage = true;
  });
  await page.waitForTimeout(4000); // 4 seconds of intro
  const stage2Data = await page.evaluate(() => {
    (window as any).__recordingStage = false;
    return {
      frames: (window as any).__stageFrames as number[],
      renderInfo: (window as any).__bc?.renderInfo || { calls: 0, triangles: 0, textures: 0 },
    };
  });
  const s2Stats = computeStats(stage2Data.frames);
  stagesReport.push({
    stage: "Intro playback",
    avgFps: s2Stats.avgFps,
    p1LowFps: s2Stats.p1LowFps,
    worstFrameMs: s2Stats.worstFrameMs,
    drawCalls: stage2Data.renderInfo.calls || 0,
    triangles: stage2Data.renderInfo.triangles || 0,
    textures: stage2Data.renderInfo.textures || 0,
  });

  // Skip intro
  const skipBtn = page.locator("button:has-text('SKIP')");
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
  }
  await page.locator("body[data-nav-state='overview']").waitFor({ state: "attached", timeout: 10000 });

  // STAGE 3: Each transition
  console.log("--- Starting Stage 3: Transitions ---");
  const sectionTransitions = [
    "Overview -> Sec 1 (About)",
    "Sec 1 -> Sec 2 (Projects)",
    "Sec 2 -> Sec 3 (Events)",
    "Sec 3 -> Sec 4 (Learning)",
  ];

  for (const transName of sectionTransitions) {
    // Wait for settled
    await page.locator("body:is([data-nav-state='overview'], [data-nav-state='section'])").waitFor({ state: "attached", timeout: 10000 });
    const nextBtn = page.locator("button[aria-label='Next Section']");
    await nextBtn.waitFor({ state: "visible", timeout: 10000 });

    // Start recording
    await page.evaluate(() => {
      (window as any).__stageFrames = [];
      (window as any).__recordingStage = true;
    });

    await nextBtn.click();

    // Wait for transition start & settle
    await page.locator("body[data-nav-state='transitioning']").waitFor({ state: "attached", timeout: 3000 }).catch(() => {});
    await page.locator("body:is([data-nav-state='overview'], [data-nav-state='section'])").waitFor({ state: "attached", timeout: 15000 });

    const transData = await page.evaluate(() => {
      (window as any).__recordingStage = false;
      return {
        frames: (window as any).__stageFrames as number[],
        renderInfo: (window as any).__bc?.renderInfo || { calls: 0, triangles: 0, textures: 0 },
      };
    });
    const tStats = computeStats(transData.frames);
    stagesReport.push({
      stage: transName,
      avgFps: tStats.avgFps,
      p1LowFps: tStats.p1LowFps,
      worstFrameMs: tStats.worstFrameMs,
      drawCalls: transData.renderInfo.calls || 0,
      triangles: transData.renderInfo.triangles || 0,
      textures: transData.renderInfo.textures || 0,
    });
  }

  const finalOutput = {
    renderer: rendererInfo.renderer,
    vendor: rendererInfo.vendor,
    isSoftware,
    timestamp: new Date().toISOString(),
    stages: stagesReport,
  };

  const resultsPath = path.resolve(process.cwd(), "perf-results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(finalOutput, null, 2));

  console.log("\n================ PERFORMANCE MEASUREMENT RESULTS ================");
  console.log(`Renderer: ${rendererInfo.renderer} (${rendererInfo.vendor})`);
  console.table(stagesReport);
  console.log("=================================================================\n");

  expect(stagesReport.length).toBeGreaterThan(0);
});
