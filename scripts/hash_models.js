import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const modelsDir = path.join(rootDir, 'public', 'models');
const configDir = path.join(rootDir, 'src', 'config');

function getHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 8);
}

export function generateModelHashes() {
  const targets = [
    { key: 'room', file: 'room.glb', pattern: /^room\.[a-f0-9]{8}\.glb$/ },
    { key: 'roomMobile', file: 'room.mobile.glb', pattern: /^room\.mobile\.[a-f0-9]{8}\.glb$/ },
    { key: 'anchors', file: 'anchors.json', pattern: /^anchors\.[a-f0-9]{8}\.json$/ }
  ];

  // 1. Remove old hashed copies in public/models
  if (fs.existsSync(modelsDir)) {
    const existing = fs.readdirSync(modelsDir);
    for (const f of existing) {
      for (const t of targets) {
        if (t.pattern.test(f)) {
          try {
            fs.unlinkSync(path.join(modelsDir, f));
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }

  const manifest = {};

  // 2. Generate new hashed files
  for (const t of targets) {
    const srcPath = path.join(modelsDir, t.file);
    if (!fs.existsSync(srcPath)) {
      console.warn(`[hash_models] Warning: source file not found: ${srcPath}`);
      manifest[t.key] = `/models/${t.file}`;
      continue;
    }

    const hash = getHash(srcPath);
    let hashedFilename = '';
    if (t.file === 'room.glb') {
      hashedFilename = `room.${hash}.glb`;
    } else if (t.file === 'room.mobile.glb') {
      hashedFilename = `room.mobile.${hash}.glb`;
    } else if (t.file === 'anchors.json') {
      hashedFilename = `anchors.${hash}.json`;
    }

    const destPath = path.join(modelsDir, hashedFilename);
    fs.copyFileSync(srcPath, destPath);

    manifest[t.key] = `/models/${hashedFilename}`;
    console.log(`[hash_models] ${t.file} -> ${hashedFilename}`);
  }

  // 3. Write src/config/modelsManifest.json
  const manifestPath = path.join(configDir, 'modelsManifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

  console.log(`[hash_models] Manifest generated at ${manifestPath}`);
  return manifest;
}

// Run directly if invoked as CLI script
if (process.argv[1] === __filename) {
  generateModelHashes();
}
