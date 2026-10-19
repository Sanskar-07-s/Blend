import { test, expect } from "@playwright/test";

test.setTimeout(120000);

test("Measure route transfer bytes and LCP on production preview", async ({ page }) => {
  // 1. Measure Welcome page (/)
  let welcomeBytes = 0;
  const welcomeRequests: { url: string; bytes: number }[] = [];
  page.on("response", async (res) => {
    try {
      const buffer = await res.body();
      welcomeBytes += buffer.length;
      welcomeRequests.push({ url: res.url(), bytes: buffer.length });
    } catch {}
  });

  await page.goto("http://localhost:4173/");
  await page.waitForTimeout(1500);

  const welcomeMetrics = await page.evaluate(() => {
    return new Promise<{ lcp: number; lcpElement: string }>((resolve) => {
      let lcp = 0;
      let lcpElement = "none";
      const po = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          lcp = lastEntry.startTime;
          lcpElement = lastEntry.element ? (lastEntry.element.tagName + (lastEntry.element.id ? "#" + lastEntry.element.id : "")) : "unknown";
        }
      });
      po.observe({ type: "largest-contentful-paint", buffered: true });
      setTimeout(() => {
        resolve({ lcp, lcpElement });
      }, 1000);
    });
  });

  console.log("METRICS_WELCOME:", JSON.stringify({
    totalBytes: welcomeBytes,
    totalKB: Math.round(welcomeBytes / 1024),
    lcp: Math.round(welcomeMetrics.lcp) + "ms",
    lcpElement: welcomeMetrics.lcpElement,
  }, null, 2));

  // 2. Measure Club page (/club)
  const clubPage = await page.context().newPage();
  let clubBytes = 0;
  clubPage.on("response", async (res) => {
    try {
      const buffer = await res.body();
      clubBytes += buffer.length;
    } catch {}
  });

  await clubPage.goto("http://localhost:4173/club");
  await clubPage.waitForTimeout(1500);

  const clubMetrics = await clubPage.evaluate(() => {
    return new Promise<{ lcp: number; lcpElement: string }>((resolve) => {
      let lcp = 0;
      let lcpElement = "none";
      const po = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          lcp = lastEntry.startTime;
          lcpElement = lastEntry.element ? (lastEntry.element.tagName + (lastEntry.element.id ? "#" + lastEntry.element.id : "")) : "unknown";
        }
      });
      po.observe({ type: "largest-contentful-paint", buffered: true });
      setTimeout(() => {
        resolve({ lcp, lcpElement });
      }, 1000);
    });
  });

  console.log("METRICS_CLUB:", JSON.stringify({
    totalBytes: clubBytes,
    totalKB: Math.round(clubBytes / 1024),
    lcp: Math.round(clubMetrics.lcp) + "ms",
    lcpElement: clubMetrics.lcpElement,
  }, null, 2));

  // 3. Measure Experience (/experience) after ENTER
  const expPage = await page.context().newPage();
  let expBytes = 0;
  expPage.on("response", async (res) => {
    try {
      const buffer = await res.body();
      expBytes += buffer.length;
    } catch {}
  });

  await expPage.goto("http://localhost:4173/experience");
  const enterBtn = expPage.locator("button[data-testid='enter-button']");
  await enterBtn.waitFor({ state: "visible", timeout: 25000 });
  await enterBtn.click();
  await expPage.waitForTimeout(2000);

  console.log("METRICS_EXPERIENCE:", JSON.stringify({
    totalBytes: expBytes,
    totalMB: (expBytes / (1024 * 1024)).toFixed(2) + " MB",
  }, null, 2));
});
