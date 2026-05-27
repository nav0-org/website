// Build-time Open Graph image generation.
//
// Renders one 1200x630 PNG per blog post into docs/public/og/<slug>.png, using
// the post title, the Nav0 logo, and the post's category tag on the Apple-blue
// accent. Fonts are bundled (scripts/fonts) so output is identical on every
// machine and in CI. Run via the predocs:build npm hook.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BLOG_DIR = join(ROOT, 'docs/blog');
const OUT_DIR = join(ROOT, 'docs/public/og');
const LOGO_PATH = join(ROOT, 'docs/public/logo.svg');

GlobalFonts.registerFromPath(join(__dirname, 'fonts/DejaVuSans-Bold.ttf'), 'OGSansBold');
GlobalFonts.registerFromPath(join(__dirname, 'fonts/DejaVuSans.ttf'), 'OGSans');

const WIDTH = 1200;
const HEIGHT = 630;
const PAD = 72;

const CATEGORY_LABELS = {
  privacy: 'Privacy',
  comparisons: 'Comparisons',
  performance: 'Performance',
  'open-web': 'The Open Web',
  security: 'Security',
};

function readFrontmatter(file) {
  const content = readFileSync(file, 'utf-8');
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = m[1];
  const title = fm.match(/title:\s*(["'])([\s\S]*?)\1/)?.[2];
  const category = fm.match(/^category:\s*(\S+)/m)?.[1] || '';
  if (!title) return null;
  return { title, category, slug: file.split('/').pop().replace('.md', '') };
}

function wrapLines(ctx, text, maxWidth, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
      last = last.slice(0, -1);
    }
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }
  return lines;
}

async function render(post, logo) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Apple-blue diagonal gradient background.
  const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  grad.addColorStop(0, '#0071e3');
  grad.addColorStop(1, '#001b44');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Logo in a white rounded badge (so it reads on any logo color).
  const badge = 76;
  const r = 18;
  const bx = PAD;
  const by = PAD;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.arcTo(bx + badge, by, bx + badge, by + badge, r);
  ctx.arcTo(bx + badge, by + badge, bx, by + badge, r);
  ctx.arcTo(bx, by + badge, bx, by, r);
  ctx.arcTo(bx, by, bx + badge, by, r);
  ctx.closePath();
  ctx.fill();
  if (logo) {
    const pad = 12;
    ctx.drawImage(logo, bx + pad, by + pad, badge - pad * 2, badge - pad * 2);
  }

  // Wordmark.
  ctx.fillStyle = '#ffffff';
  ctx.font = '44px OGSansBold';
  ctx.textBaseline = 'middle';
  ctx.fillText('Nav0', bx + badge + 22, by + badge / 2);

  // Title, wrapped with adaptive sizing (smaller when it runs long) and
  // bottom-anchored so the block always clears the footer.
  const maxTextWidth = WIDTH - PAD * 2;
  let fontSize = 60;
  let lineHeight = 72;
  ctx.font = `${fontSize}px OGSansBold`;
  let lines = wrapLines(ctx, post.title, maxTextWidth, 4);
  if (lines.length > 3) {
    fontSize = 50;
    lineHeight = 62;
    ctx.font = `${fontSize}px OGSansBold`;
    lines = wrapLines(ctx, post.title, maxTextWidth, 4);
  }

  const titleBottom = 520; // baseline of the last title line
  const firstBaseline = titleBottom - (lines.length - 1) * lineHeight;

  // Category tag, just above the title block.
  const label = (CATEGORY_LABELS[post.category] || post.category || 'Blog').toUpperCase();
  ctx.font = '24px OGSansBold';
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(label, PAD, firstBaseline - fontSize - 20);

  // Title.
  ctx.fillStyle = '#ffffff';
  ctx.font = `${fontSize}px OGSansBold`;
  let y = firstBaseline;
  for (const line of lines) {
    ctx.fillText(line, PAD, y);
    y += lineHeight;
  }

  // Footer URL.
  ctx.font = '26px OGSans';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('nav0.org', PAD, HEIGHT - 52);

  return canvas.encode('png');
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const logo = existsSync(LOGO_PATH) ? await loadImage(LOGO_PATH).catch(() => null) : null;

  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') && f !== 'index.md');
  let count = 0;
  for (const file of files) {
    const post = readFrontmatter(join(BLOG_DIR, file));
    if (!post) continue;
    const png = await render(post, logo);
    writeFileSync(join(OUT_DIR, `${post.slug}.png`), png);
    count++;
  }
  console.log(`Generated ${count} OG images into docs/public/og/`);
}

main();
