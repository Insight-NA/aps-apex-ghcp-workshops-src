#!/usr/bin/env node

// Simple CLI to scan current image assets and report dimensions/sizes.
// Intended to be used by the @image-manager Copilot agent.

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const REPO_ROOT = process.cwd();

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const AREAS = [
  {
    id: 'mobile-active',
    label: 'Mobile active assets',
    baseDir: 'mobile/assets',
    includeArchive: false,
  },
  {
    id: 'mobile-archive',
    label: 'Mobile archive assets',
    baseDir: 'mobile/assets/_archive',
    includeArchive: true,
  },
  {
    id: 'web-active',
    label: 'Web active assets',
    baseDir: 'frontend/public',
    includeArchive: false,
  },
  {
    id: 'web-archive',
    label: 'Web archive assets',
    baseDir: 'frontend/public/_archive',
    includeArchive: true,
  },
];

async function pathExists(p) {
  try {
    await fsp.access(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function collectImageFiles(baseDir) {
  const results = [];

  async function walk(currentDir) {
    let entries;
    try {
      entries = await fsp.readdir(currentDir, { withFileTypes: true });
    } catch (err) {
      if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
        return;
      }
      console.error(`Failed to read directory ${currentDir}:`, err.message || err);
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.has(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  await walk(baseDir);
  return results;
}

async function analyzeFile(filePath) {
  const relPath = path.relative(REPO_ROOT, filePath);

  let stat;
  try {
    stat = await fsp.stat(filePath);
  } catch (err) {
    return { path: relPath, error: `stat failed: ${err.message || String(err)}` };
  }

  try {
    const metadata = await sharp(filePath).metadata();
    return {
      path: relPath,
      format: metadata.format || 'unknown',
      width: metadata.width || null,
      height: metadata.height || null,
      sizeBytes: stat.size,
    };
  } catch (err) {
    return {
      path: relPath,
      error: `metadata failed: ${err.message || String(err)}`,
      sizeBytes: stat.size,
    };
  }
}

async function analyzeArea(area) {
  const basePath = path.join(REPO_ROOT, area.baseDir);
  const exists = await pathExists(basePath);
  if (!exists) {
    return { area, images: [], missing: true };
  }

  const files = await collectImageFiles(basePath);
  const images = [];

  for (const file of files) {
    const info = await analyzeFile(file);
    images.push(info);
  }

  return { area, images, missing: false };
}

async function main() {
  const jsonOutput = process.argv.includes('--json');

  const results = [];

  for (const area of AREAS) {
    const result = await analyzeArea(area);
    results.push(result);
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ root: REPO_ROOT, areas: results }, null, 2));
    return;
  }

  console.log('Image asset analysis');
  console.log('Repository root:', REPO_ROOT);
  console.log('');

  for (const { area, images, missing } of results) {
    console.log(`== ${area.label} (${area.baseDir}) ==`);
    if (missing) {
      console.log('  (directory not found)');
      console.log('');
      continue;
    }

    if (images.length === 0) {
      console.log('  (no images found)');
      console.log('');
      continue;
    }

    let totalBytes = 0;
    let errorCount = 0;

    for (const img of images) {
      totalBytes += img.sizeBytes || 0;
      if (img.error) errorCount += 1;
    }

    console.log(`  Files: ${images.length}`);
    console.log(`  Total size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    if (errorCount > 0) {
      console.log(`  Errors: ${errorCount}`);
    }

    const sample = images.slice(0, 10);
    for (const img of sample) {
      if (img.error) {
        console.log(`  - ${img.path} :: ERROR :: ${img.error}`);
      } else {
        console.log(
          `  - ${img.path} :: ${img.format} ${img.width}x${img.height} :: ${(img.sizeBytes / 1024).toFixed(1)} KB`
        );
      }
    }

    if (images.length > sample.length) {
      console.log(`  ...and ${images.length - sample.length} more files.`);
    }

    console.log('');
  }
}

main().catch((err) => {
  console.error('Image analysis failed:', err);
  process.exit(1);
});
