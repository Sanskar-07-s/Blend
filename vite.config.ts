import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
