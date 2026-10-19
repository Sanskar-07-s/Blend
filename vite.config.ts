import react from '@vitejs/plugin-react'
import { defineConfig, Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { generateModelHashes } from './scripts/hash_models.js'

function modelHashingPlugin(): Plugin {
  return {
    name: 'vite-plugin-model-hashing',
    buildStart() {
      generateModelHashes()
    },
    closeBundle() {
      // Also write models.manifest.json into dist for external inspection if needed
      const srcManifest = path.resolve(__dirname, 'src/config/modelsManifest.json')
      const distDir = path.resolve(__dirname, 'dist')
      if (fs.existsSync(srcManifest) && fs.existsSync(distDir)) {
        fs.copyFileSync(srcManifest, path.join(distDir, 'models.manifest.json'))
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [modelHashingPlugin(), react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          'react-three-fiber': ['@react-three/fiber'],
          'react-three-drei': ['@react-three/drei'],
          'react-three-postprocessing': ['@react-three/postprocessing'],
          gsap: ['gsap'],
          lucide: ['lucide-react'],
        },
      },
    },
  },
})
