// Builds the Google Ads landing pages.
// Usage: node scripts/ads-landing/build.mjs
// Writes each page to the repo root (local preview) and to the WordPress theme's static-pages folder.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES } from './pages.mjs';
import { render } from './template.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const sprite = readFileSync(join(here, 'sprite.svg.html'), 'utf8');

for (const page of PAGES) {
  const html = render(page, sprite);
  for (const dir of [root, join(root, 'purplebox-static-theme', 'static-pages')]) {
    writeFileSync(join(dir, page.file), html);
  }
  console.log(`built ${page.file} (${(html.length / 1024).toFixed(1)} KB)`);
}
