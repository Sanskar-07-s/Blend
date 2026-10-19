import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, Plugin } from 'vite'
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

function seoPlugin(siteUrl: string): Plugin {
  const generateSeoFiles = (targetDir: string) => {
    if (!fs.existsSync(targetDir)) return
    const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/club</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/experience</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
`
    fs.writeFileSync(path.join(targetDir, 'robots.txt'), robotsContent, 'utf-8')
    fs.writeFileSync(path.join(targetDir, 'sitemap.xml'), sitemapContent, 'utf-8')
  }

  return {
    name: 'vite-plugin-seo',
    buildStart() {
      generateSeoFiles(path.resolve(__dirname, 'public'))
    },
    closeBundle() {
      generateSeoFiles(path.resolve(__dirname, 'dist'))
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        let transformed = html
          .replaceAll('https://blender-club.vercel.app', siteUrl)
          .replaceAll('https://blend-gamma-two.vercel.app', siteUrl)

        if (ctx?.bundle) {
          const fontAsset = Object.keys(ctx.bundle).find(
            name => name.includes('bricolage-grotesque-latin-600') && name.endsWith('.woff2')
          )
          if (fontAsset) {
            const preloadTag = `    <link rel="preload" href="/${fontAsset}" as="font" type="font/woff2" crossorigin />\n`
            transformed = transformed.replace('</head>', `${preloadTag}  </head>`)
          }
        }
        return transformed
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || process.env.VITE_SITE_URL || 'https://blend-gamma-two.vercel.app').replace(/\/+$/, '')

  return {
    plugins: [modelHashingPlugin(), seoPlugin(siteUrl), react()],
    build: {
      chunkSizeWarningLimit: 600,
      modulePreload: {
        resolveDependencies(_filename, deps, { hostType }) {
          if (hostType === 'html') {
            return deps.filter(
              dep => !dep.includes('three') &&
                     !dep.includes('react-three') &&
                     !dep.includes('gsap')
            )
          }
          return deps
        }
      },
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
  }
})

