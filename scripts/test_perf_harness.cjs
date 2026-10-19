const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--use-angle=d3d11', '--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--enable-zero-copy']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:4173/');

  // Wait for ENTER
  const enterBtn = page.locator('button:has-text("ENTER")');
  await enterBtn.waitFor({ state: 'visible', timeout: 20000 });

  // Measure intro
  await enterBtn.click();
  await page.locator('body[data-nav-state="intro"]').waitFor({ state: 'attached' });

  const introFrames = await page.evaluate(() => {
    return new Promise(resolve => {
      const frames = [];
      let last = performance.now();
      function loop(now) {
        const dt = now - last;
        last = now;
        if (dt > 0) frames.push(dt);
        if (frames.length < 180 && document.body.getAttribute('data-nav-state') === 'intro') {
          requestAnimationFrame(loop);
        } else {
          resolve(frames);
        }
      }
      requestAnimationFrame(loop);
    });
  });

  const sorted = [...introFrames].sort((a,b) => b-a);
  const avg = introFrames.reduce((a,b) => a+b, 0) / introFrames.length;
  console.log('INTRO FRAMES COUNT:', introFrames.length);
  console.log('INTRO AVG FPS:', (1000 / avg).toFixed(1));
  console.log('INTRO WORST FRAME:', sorted[0].toFixed(1), 'ms');
  console.log('TOP 5 WORST FRAMES:', sorted.slice(0, 5).map(x => x.toFixed(1) + 'ms'));

  // Skip intro if not completed
  const skipBtn = page.locator('button:has-text("SKIP")');
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
  }
  await page.locator('body[data-nav-state="overview"]').waitFor({ state: 'attached', timeout: 10000 });

  // Measure transitions
  for (let s = 1; s <= 4; s++) {
    const nextBtn = page.locator("button[aria-label='Next Section']");
    await nextBtn.waitFor({ state: 'visible', timeout: 10000 });

    const transFrames = await page.evaluate(() => {
      return new Promise(resolve => {
        const frames = [];
        let recording = false;
        let last = performance.now();

        const observer = new MutationObserver(() => {
          const state = document.body.getAttribute('data-nav-state');
          if (state === 'transitioning') {
            recording = true;
            last = performance.now();
          } else if (recording && (state === 'section' || state === 'overview')) {
            observer.disconnect();
            resolve(frames);
          }
        });

        observer.observe(document.body, { attributes: true, attributeFilter: ['data-nav-state'] });

        function loop(now) {
          if (recording) {
            const dt = now - last;
            last = now;
            if (dt > 0 && dt < 500) frames.push(dt);
          } else {
            last = now;
          }
          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);

        // Click next
        document.querySelector("button[aria-label='Next Section']").click();
      });
    });

    const tSorted = [...transFrames].sort((a,b) => b-a);
    const tAvg = transFrames.reduce((a,b) => a+b, 0) / transFrames.length;
    console.log(`\nTRANSITION ${s} FRAMES:`, transFrames.length);
    console.log(`TRANSITION ${s} AVG FPS:`, (1000 / tAvg).toFixed(1));
    console.log(`TRANSITION ${s} WORST FRAME:`, tSorted[0] ? tSorted[0].toFixed(1) + 'ms' : 'N/A');
    console.log(`TRANSITION ${s} TOP 3 WORST:`, tSorted.slice(0, 3).map(x => x.toFixed(1) + 'ms'));
  }

  await browser.close();
})();
