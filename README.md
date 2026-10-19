# Blender Club 3D Studio & Portfolio

A high-performance collegiate 3D club portfolio website featuring real-time 3D interactive graphics and a content-rich landing page.

Built with **React 18**, **Three.js / React Three Fiber**, **TypeScript**, and **Vite**, engineered for 60 FPS performance across desktop, laptop, tablet, and mobile devices, and ready for instant deployment to **Vercel**.

---

## 🌟 Architecture & Flow

The portfolio consists of three interconnected experiences:

```
[ Welcome Hero (/) ]
         │
    (ENTER button)
         ▼
[ 3D Room Experience (/experience) ] ── (EXIT STUDIO / Menu) ──► [ Club Landing Site (/club) ]
         ▲                                                                   │
         └─────────────────────── (ENTER STUDIO) ────────────────────────────┘
```

1. **Welcome Hero (`/`)**:
   - Ultra-fast initial page load with real HTML accessible typography.
   - Procedural floating club emblem in a single R3F canvas (zero external model downloads, < 150 draw calls, < 100k triangles).
   - Low tier device fallback with static/CSS visuals (zero canvas overhead).
   - Cancelable 2-second background prefetch of 3D room assets when idle (bypassed on Save-Data / 2G connections).
   - "ENTER THE STUDIO" with 0.8s flash animation to `/experience` and direct "Skip to site" link to `/club`.

2. **3D Experience Studio (`/experience`)**:
   - Realistic 3D studio room loaded from an ultra-lightweight Draco-compressed GLB (`room.glb`, ~1.04 MB; mobile `room.mobile.glb`, ~802 KB).
   - Real-time download progress indicator via `@react-three/drei`'s `useProgress`.
   - Assembly intro sequence stored in `sessionStorage` (`bc_intro_seen`) to prevent redundant replays on repeat visits.
   - Full 8-section spatial camera navigation with bounding box auto-framing.
   - Automatic tier scaling (`high`, `medium`, `low`) with dynamic FPS degradation watchdog.
   - "EXIT STUDIO" cinematic sequence on section 8 (JOIN) and drawer menu (2.5s camera zoom toward neon portal, lighting pulse, violet transition to `/club`; 0.5s plain crossfade for `prefers-reduced-motion`).
   - Clean unmount memory disposal: disposes Three.js scenes, geometries, materials, textures, renderer (`gl.dispose()`, `gl.forceContextLoss()`), and kills active GSAP timelines.

3. **Club Portfolio Site (`/club`)**:
   - Sticky slim top navigation bar with brand wordmark, section anchors, "ENTER STUDIO" button, and "JOIN" CTA.
   - 9 typed content sections in `src/content/site.ts`:
     - `#hero`: Headline, subline, CTAs, and a looping 3D tech core that only mounts when visible in the viewport (`IntersectionObserver`).
     - `#about`: Mission, vision, and 3 key metrics tiles.
     - `#what-we-do`: 6 core craft cards with custom 2D icons.
     - `#projects`: Interactive projects grid with lightbox modal.
     - `#events`: Upcoming and past club workshops, hackathons, and jams.
     - `#learning`: Curated learning tracks with level badges and resource links.
     - `#gallery`: Student showcase renders grid with lightbox preview.
     - `#team`: Leadership roles with placeholder member cards.
     - `#community`: Discussion channels, social links, and an interactive FAQ accordion.
     - `#join`: Application steps and dynamic Google Form / Tally button linked to `JOIN_URL`.
   - Violet entry crossfade matching the exit sequence from the 3D studio.

---

## 🛠️ Scripts & Commands

```bash
# Install dependencies
npm install

# Start local dev server (default port 5173)
npm run dev

# Run TypeScript typechecker
npm run typecheck

# Build optimized production bundle
npm run build

# Preview production build locally (port 4173)
npm run preview

# Run complete Playwright user journey test
npm run test:flow
```

---

## 📝 How to Edit Site Content

All text, links, and structured sections are centrally managed in:
👉 [`src/content/site.ts`](file:///d:/Blender/blender-club-3d-studio/src/content/site.ts)

### Guidelines
- **Placeholders**: Keep placeholder markers where details are yet to be confirmed (e.g. `"Name placeholder"`, `"Tagline placeholder"`).
- **Join URL**: Set your application Google Form or Tally link in `VITE_JOIN_URL` inside your `.env` or in `src/content/site.ts`. If left empty, the button gracefully displays a disabled `"Join link coming soon"` badge.
- **Socials & Links**: Update the URLs in `SITE_CONTENT.community.socials`.

---

## 🧊 Exporting 3D Models from Blender

The 3D studio room was modeled in Blender and exported via automated Python scripts to retain collection hierarchies for animations.

1. **Source File**: `GamingRoom.blend`
2. **Export Script**: `scripts/export_models.py`
3. **Execution**:
   ```bash
   blender GamingRoom.blend --background --python scripts/export_models.py
   ```
4. **Optimization Pipeline**:
   The exported GLTF is transformed using `@gltf-transform/cli`:
   - Prunes unused materials and textures.
   - Resizes oversized textures (512–1024px maximum).
   - Applies Draco geometry compression.
   - Produces `public/models/room.glb` (< 1.1 MB) and `public/models/room.mobile.glb` (< 850 KB).

Because all `.glb` files are now well under 10 MB, they are tracked as standard Git files (untracked from Git LFS), allowing Vercel to serve them with 1-year immutable caching.

---

## 🚀 Vercel Deployment Instructions

### 1. Import Repository
1. Navigate to [vercel.com/new](https://vercel.com/new).
2. Select your GitHub repository (`blender-club-3d-studio`).

### 2. Configure Project Settings
- **Framework Preset**: `Vite`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: `20.x` (configured in `package.json` engines `>=20`)

### 3. Environment Variables
Add the following environment variables in the Vercel dashboard under **Project Settings ➔ Environment Variables**:

| Variable | Description | Example Value |
|---|---|---|
| `VITE_JOIN_URL` | Application Form Link (Tally, Google Forms) | `https://tally.so/r/your-form` |
| `VITE_SITE_URL` | Production canonical URL | `https://blenderclub.vercel.app` |
| `VITE_CONTACT_EMAIL` | Contact inquiries email | `contact@blenderclub.org` |
| `VITE_ANALYTICS` | Enable Vercel Web Analytics (optional) | `1` |

*(Refer to [`.env.example`](file:///d:/Blender/blender-club-3d-studio/.env.example) for reference)*

### 4. Deploy
Click **Deploy**. Vercel will compile the TypeScript application, optimize the bundle, and publish the site with global CDN caching.

### 5. Custom Domain Setup
1. In your Vercel project, go to **Settings ➔ Domains**.
2. Add your custom domain (e.g. `blenderclub.org` or `club.university.edu`).
3. Add the recommended `CNAME` or `A` records in your DNS registrar (e.g., Cloudflare, Namecheap, Google Domains).
4. SSL certificates are provisioned automatically by Vercel within minutes.

### 6. Rollback
If an issue occurs in production:
1. Navigate to **Deployments** in the Vercel project dashboard.
2. Locate any prior successful deployment.
3. Click the three dots `...` ➔ **Instant Rollback**.
4. Production traffic will revert immediately without rebuilding.

---

## 🛡️ Caching & Security Headers (`vercel.json`)

The configured `vercel.json` ensures optimal performance and security:
- **SPA Rewrites**: All routes (`/`, `/experience`, `/club`, etc.) rewrite to `/index.html`.
- **Immutable Model & Asset Caching**: `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`, `/models/*`, and `/draco/*`.
- **Index Header**: `Cache-Control: no-cache` for `/index.html` to guarantee instant version rollouts.
- **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 🧪 Testing & CI

Continuous Integration is set up via GitHub Actions in [`.github/workflows/ci.yml`](file:///d:/Blender/blender-club-3d-studio/.github/workflows/ci.yml).

Every Pull Request and push to `main` validates:
1. `npm run typecheck` — TypeScript strict type safety.
2. `npm run build` — Production bundle build.
3. `npm run test:flow` — Playwright headless end-to-end tests covering Welcome, Experience, navigation tour, Exit Studio, Club site, deep links, and back navigation.
