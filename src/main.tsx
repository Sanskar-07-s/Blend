import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/bricolage-grotesque/600.css'
import '@fontsource/instrument-sans/400.css'
import '@fontsource/instrument-sans/500.css'
import '@fontsource/jetbrains-mono/400.css'
import './index.css'
import App from './App.tsx'
import { applyPaletteToCss } from './config/palette.ts'

if (typeof window !== 'undefined') {
  applyPaletteToCss();
}

if (typeof window !== 'undefined') {
  const frameTimes: number[] = [];
  const rollingDeltas: number[] = [];
  let lastTime = performance.now();

  (window as any).__bc = {
    state: 'loading',
    section: '',
    fps: 60,
    frameTimes,
    renderInfo: {
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0,
      textures: 0,
      geometries: 0,
    },
  };

  const measureLoop = (now: number) => {
    const dt = now - lastTime;
    lastTime = now;
    if (dt > 0 && dt < 1000) {
      frameTimes.push(dt);
      rollingDeltas.push(dt);
      if (rollingDeltas.length > 60) rollingDeltas.shift();
      const avgDt = rollingDeltas.reduce((a, b) => a + b, 0) / rollingDeltas.length;
      if ((window as any).__bc) {
        (window as any).__bc.fps = Math.round((1000 / avgDt) * 10) / 10;
      }
    }
    requestAnimationFrame(measureLoop);
  };
  requestAnimationFrame(measureLoop);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

