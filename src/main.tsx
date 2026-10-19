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
  (window as any).__bc = {
    state: 'loading',
    section: '',
    fps: 60,
    frameTimes: [],
    renderInfo: {
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0,
      textures: 0,
      geometries: 0,
    },
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

