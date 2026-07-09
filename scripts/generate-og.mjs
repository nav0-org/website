// Build-time Open Graph image generation.
//
// Renders one 1200x630 PNG per blog post into docs/public/og/<slug>.png, plus a
// card for each main site page (home, install, FAQ, guides, topic hubs, legal).
//
// Every card uses the shared "split lockup" template (see OG Images.dc.html in
// the Claude Design project): a dark charcoal panel with a subtle diagonal
// hairline texture and a blue corner glow, split down the middle. The left half
// is the Nav0 brand lockup (logo + wordmark + URL); the right half carries the
// message:
//   - Site pages get an eyebrow, a headline, and a one-line subtitle (4a).
//   - Blog posts get a category pill, the post title (its last line brushed with
//     the blue→violet→coral accent gradient), and a byline row (4b).
// Fonts are bundled (scripts/fonts) and rendering is deterministic, so output is
// identical on every machine and in CI. Run via the predocs:build npm hook.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BLOG_DIR = join(ROOT, 'docs/blog');
const OUT_DIR = join(ROOT, 'docs/public/og');
const LOGO_PATH = join(ROOT, 'docs/public/logo.svg');

// The template's typeface is Inter throughout. Each weight is registered under
// its own family name so canvas never has to synthesize a weight or italic.
const FONTS = [
  ['Inter-Regular.woff2', 'InterRegular'],
  ['Inter-Medium.woff2', 'InterMedium'],
  ['Inter-SemiBold.woff2', 'InterSemiBold'],
  ['Inter-Bold.woff2', 'InterBold'],
  ['Inter-SemiBoldItalic.woff2', 'InterSemiBoldItalic'],
];
for (const [file, family] of FONTS) {
  GlobalFonts.registerFromPath(join(__dirname, 'fonts', file), family);
}

const WIDTH = 1200;
const HEIGHT = 630;
const HALF = WIDTH / 2; // vertical split line
const PAD_X = 78; // horizontal padding inside the message (right) half
const SUBTITLE_SIZE = 40; // right-half subtitle; the lockup URL matches it

// Palette lifted straight from the design.
const C = {
  bg0: '#060607',
  bg1: '#1a1a1f',
  ink: '#f5f5f7',
  dim: '#a1a1a6',
  faint: '#86868b',
  mono: '#6e6e73',
  italic: '#8e8e93',
  accent: '#4ea7ff',
  hairline: 'rgba(255,255,255,0.1)',
  badgeBg: 'rgba(41,151,255,0.14)',
  gradient: ['#4ea7ff', '#c56cff', '#ff7a94'],
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Blog `category` slug -> the label shown in the pill.
const CATEGORY_LABELS = {
  privacy: 'Privacy',
  comparisons: 'Comparisons',
  performance: 'Performance',
  'open-web': 'The Open Web',
  security: 'Security',
};

// Non-blog site pages. `out` is the og/<out>.png filename, matched by route in
// config.ts (pageOgName). `label` is the eyebrow, `title` the headline, `sub`
// the one-line supporting text. `accent` (home only) renders as a second,
// italicised headline line. Release detail pages share the 'releases' card.
const PAGES = [
  { out: 'home', label: 'Privacy-first browser', title: 'Browse.', accent: 'Nothing more.', sub: 'Zero telemetry. No bloat. No AI gimmicks.', url: 'nav0.org' },
  { out: 'install', label: 'Download', title: 'Get Nav0 for Mac, Windows & Linux', sub: 'Free, open source, and ready in seconds.' },
  { out: 'faq', label: 'Help', title: 'Frequently Asked Questions', sub: 'Straight answers about privacy, features, and how Nav0 works.' },
  { out: 'about', label: 'About', title: 'The Person Behind Nav0', sub: 'Why one developer built a browser that does less.' },
  { out: 'blog', label: 'Blog', title: 'Privacy, Browsers & the Open Web', sub: 'Essays on tracking, performance, and the case for a minimal browser.' },
  { out: 'releases', label: 'Release Notes', title: "What's New in Nav0", sub: 'Every change, in plain language. No hidden AI features.' },

  // Blog topic hubs (/blog/topic/*)
  { out: 'topic-privacy', label: 'Privacy', title: 'Privacy & Tracking', sub: "How the modern browser watches you — and how Nav0 doesn't." },
  { out: 'topic-comparisons', label: 'Comparisons', title: 'Nav0 vs the Competition', sub: 'Head-to-head with the browsers you already know.' },
  { out: 'topic-performance', label: 'Performance', title: 'Performance & Efficiency', sub: 'Less memory, less CPU, less battery. Measured, not marketed.' },
  { out: 'topic-open-web', label: 'The Open Web', title: 'The Open Web', sub: 'On the indie browsers keeping the web free and plural.' },
  { out: 'topic-security', label: 'Security', title: 'Browser Security', sub: 'The permissions and protections that keep you safe.' },

  // Guide pages (/guide/*)
  { out: 'guide-features', label: 'Introduction', title: 'Nav0 Features', sub: 'Everything Nav0 does — and the bloat it deliberately leaves out.' },
  { out: 'guide-getting-started', label: 'Introduction', title: 'Getting Started', sub: 'Install Nav0 and make it your default in under a minute.' },
  { out: 'guide-ad-blocker', label: 'Feature Guide', title: 'Ad & Tracker Blocking', sub: 'Built-in blocking that needs no extensions.' },
  { out: 'guide-privacy-protection', label: 'Feature Guide', title: 'Privacy & Tracking Protection', sub: 'Fingerprint resistance and tracker blocking, on by default.' },
  { out: 'guide-private-browsing', label: 'Feature Guide', title: 'Private Browsing', sub: 'A truly clean session that leaves nothing behind.' },
  { out: 'guide-tab-management', label: 'Feature Guide', title: 'Tab Management', sub: 'Fast, quiet tabs that stay out of your way.' },
  { out: 'guide-keyboard-shortcuts', label: 'Feature Guide', title: 'Keyboard Shortcuts', sub: 'Drive the whole browser without touching the mouse.' },
  { out: 'guide-un-features', label: 'Un-features', title: "What Nav0 Doesn't Do", sub: 'No accounts, no sync servers, no AI. On purpose.' },
  { out: 'guide-privacy', label: 'Core Principles', title: 'Zero Data Collection', sub: 'Nav0 collects nothing. Not telemetry, not analytics, not you.' },
  { out: 'guide-philosophy', label: 'Core Principles', title: 'Why We Built a Minimal Browser', sub: 'The case for a browser that does one thing well.' },
  { out: 'guide-contributing', label: 'Community', title: 'Contributing to Nav0', sub: 'Help build the browser that respects its users.' },

  // Legal
  { out: 'legal-privacy-policy', label: 'Legal', title: 'Privacy Policy', sub: 'What we collect: nothing. Here it is in writing.' },
  { out: 'legal-terms-of-use', label: 'Legal', title: 'Terms of Use', sub: 'The plain-language terms for using Nav0.' },
  { out: 'legal-disclaimer', label: 'Legal', title: 'Disclaimer', sub: 'The legal fine print, kept short.' },
];

function readFrontmatter(file) {
  const content = readFileSync(file, 'utf-8');
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = m[1];
  const title = fm.match(/title:\s*(["'])([\s\S]*?)\1/)?.[2];
  if (!title) return null;
  const category = fm.match(/^category:\s*(\S+)/m)?.[1] || '';
  const date = fm.match(/^date:\s*(\S+)/m)?.[1] || '';
  const author = fm.match(/^author:\s*(.+?)\s*$/m)?.[1]?.replace(/^["']|["']$/g, '') || 'Ketan Patil';
  return { title, category, date, author, slug: file.split('/').pop().replace('.md', '') };
}

function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return '';
  return `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}`;
}

// letterSpacing is optional in @napi-rs/canvas; guard so we degrade gracefully.
function setTracking(ctx, px) {
  try {
    ctx.letterSpacing = `${px}px`;
  } catch {
    /* unsupported: fall back to default tracking */
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
}

// Endpoints of a CSS-style linear gradient at `angleDeg` across a w×h box.
function cssGradient(ctx, angleDeg, w, h) {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  const cx = w / 2;
  const cy = h / 2;
  return ctx.createLinearGradient(cx - (dx * len) / 2, cy - (dy * len) / 2, cx + (dx * len) / 2, cy + (dy * len) / 2);
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

// Charcoal panel + diagonal hairline texture + blue corner glow.
function drawBackground(ctx) {
  const base = cssGradient(ctx, 160, WIDTH, HEIGHT);
  base.addColorStop(0, C.bg0);
  base.addColorStop(1, C.bg1);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // repeating-linear-gradient(112deg, transparent 23px, rgba(255,255,255,.05) 1px)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, WIDTH, HEIGHT);
  ctx.clip();
  ctx.translate(WIDTH / 2, HEIGHT / 2);
  ctx.rotate(((112 - 90) * Math.PI) / 180);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  const diag = Math.hypot(WIDTH, HEIGHT);
  for (let x = -diag; x <= diag; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, -diag);
    ctx.lineTo(x + 0.5, diag);
    ctx.stroke();
  }
  ctx.restore();

  // radial glow behind the logo, from left:120 top:145 (420px, closest-side)
  const glow = ctx.createRadialGradient(330, 355, 0, 330, 355, 210);
  glow.addColorStop(0, 'rgba(41,151,255,0.18)');
  glow.addColorStop(0.7, 'rgba(41,151,255,0)');
  glow.addColorStop(1, 'rgba(41,151,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// Left half: logo, "Nav0" wordmark, URL, and the center divider.
function drawLockup(ctx, logo, url) {
  const cx = HALF / 2;
  const logoSize = 360;
  const wordSize = 112;
  const urlSize = SUBTITLE_SIZE;
  const gap = 26;
  const wordBox = wordSize * 0.8;
  const urlBox = urlSize;
  const totalH = logoSize + gap + wordBox + gap + urlBox;
  let y = (HEIGHT - totalH) / 2;

  if (logo) ctx.drawImage(logo, cx - logoSize / 2, y, logoSize, logoSize);
  y += logoSize + gap;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.ink;
  ctx.font = `${wordSize}px InterBold`;
  setTracking(ctx, wordSize * -0.04);
  ctx.fillText('Nav0', cx, y + wordBox / 2);
  setTracking(ctx, 0);
  y += wordBox + gap;

  ctx.fillStyle = C.mono;
  ctx.font = `${urlSize}px InterRegular`;
  ctx.fillText(url, cx, y + urlBox / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.strokeStyle = C.hairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(HALF + 0.5, 0);
  ctx.lineTo(HALF + 0.5, HEIGHT);
  ctx.stroke();
}

// Right half for a site page: eyebrow / headline (+ optional italic accent
// line) / subtitle, as one vertically-centered stack.
function drawPageContent(ctx, entry) {
  const x = HALF + PAD_X;
  const maxW = HALF - PAD_X * 2;
  const gap = 24;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const eyebrow = (entry.label || '').toUpperCase();
  const eyeSize = 26;
  const eyeLH = 36;

  let tSize = 56;
  let titleLines;
  let accentLines = [];
  for (const fs of [56, 48, 42]) {
    tSize = fs;
    setTracking(ctx, fs * -0.04);
    ctx.font = `${fs}px InterBold`;
    titleLines = wrapLines(ctx, entry.title, maxW, 3);
    if (entry.accent) {
      ctx.font = `${fs}px InterSemiBoldItalic`;
      accentLines = wrapLines(ctx, entry.accent, maxW, 2);
    }
    setTracking(ctx, 0);
    if (titleLines.length + accentLines.length <= (entry.accent ? 3 : 2)) break;
  }
  const tLH = Math.round(tSize * 1.06);
  const nTitle = titleLines.length + accentLines.length;

  const subSize = SUBTITLE_SIZE;
  ctx.font = `${subSize}px InterRegular`;
  const subLines = entry.sub ? wrapLines(ctx, entry.sub, maxW, 3) : [];
  const sLH = 56;

  const total = eyeLH + gap + nTitle * tLH + (subLines.length ? gap + subLines.length * sLH : 0);
  let top = (HEIGHT - total) / 2;

  ctx.font = `${eyeSize}px InterMedium`;
  setTracking(ctx, eyeSize * 0.08);
  ctx.fillStyle = C.faint;
  ctx.fillText(eyebrow, x, top + eyeLH / 2);
  setTracking(ctx, 0);
  top += eyeLH + gap;

  let cy = top + tLH / 2;
  ctx.fillStyle = C.ink;
  ctx.font = `${tSize}px InterBold`;
  setTracking(ctx, tSize * -0.04);
  for (const line of titleLines) {
    ctx.fillText(line, x, cy);
    cy += tLH;
  }
  if (accentLines.length) {
    ctx.fillStyle = C.italic;
    ctx.font = `${tSize}px InterSemiBoldItalic`;
    for (const line of accentLines) {
      ctx.fillText(line, x, cy);
      cy += tLH;
    }
  }
  setTracking(ctx, 0);
  top += nTitle * tLH;

  if (subLines.length) {
    top += gap;
    let sy = top + sLH / 2;
    ctx.fillStyle = C.dim;
    ctx.font = `${subSize}px InterRegular`;
    for (const line of subLines) {
      ctx.fillText(line, x, sy);
      sy += sLH;
    }
  }
}

// Right half for a blog post: category pill / title (accent gradient on the
// last line) / date. The pill and date — the text above and below the title —
// are set at 2x to match the enlarged site-page cards.
function drawBlogContent(ctx, entry) {
  const x = HALF + PAD_X;
  const maxW = HALF - PAD_X * 2;
  const gap = 24;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const badgeText = entry.badge || 'Blog';
  const badgeSize = 28;
  const badgeH = 60;
  const badgePadX = 28;
  ctx.font = `${badgeSize}px InterSemiBold`;
  const badgeW = ctx.measureText(badgeText).width + badgePadX * 2;

  let tSize = 44;
  let titleLines;
  for (const fs of [44, 38, 32]) {
    tSize = fs;
    setTracking(ctx, fs * -0.035);
    ctx.font = `${fs}px InterBold`;
    titleLines = wrapLines(ctx, entry.title, maxW, 4);
    setTracking(ctx, 0);
    if (titleLines.length <= 3) break;
  }
  const tLH = Math.round(tSize * 1.12);

  const dateSize = 36;
  const bylineH = entry.date ? 44 : 0;

  const total = badgeH + gap + titleLines.length * tLH + (entry.date ? gap + bylineH : 0);
  let top = (HEIGHT - total) / 2;

  // pill
  roundRect(ctx, x, top, badgeW, badgeH, badgeH / 2);
  ctx.fillStyle = C.badgeBg;
  ctx.fill();
  ctx.fillStyle = C.accent;
  ctx.font = `${badgeSize}px InterSemiBold`;
  ctx.fillText(badgeText, x + badgePadX, top + badgeH / 2 + 0.5);
  top += badgeH + gap;

  // title
  let cy = top + tLH / 2;
  ctx.font = `${tSize}px InterBold`;
  setTracking(ctx, tSize * -0.035);
  titleLines.forEach((line, i) => {
    if (i === titleLines.length - 1) {
      const lw = Math.min(ctx.measureText(line).width, maxW);
      const g = ctx.createLinearGradient(x, 0, x + lw, 0);
      g.addColorStop(0, C.gradient[0]);
      g.addColorStop(0.5, C.gradient[1]);
      g.addColorStop(1, C.gradient[2]);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = C.ink;
    }
    ctx.fillText(line, x, cy);
    cy += tLH;
  });
  setTracking(ctx, 0);
  top += titleLines.length * tLH;

  // byline (date only)
  if (entry.date) {
    top += gap;
    ctx.font = `${dateSize}px InterRegular`;
    ctx.fillStyle = C.dim;
    ctx.fillText(entry.date, x, top + bylineH / 2);
  }
}

// Rasterize the brand logo into a notched bitmap. @napi-rs/canvas's SVG
// backend mis-renders the source logo's luminance <mask> (it leaves a ghosted
// second ring), so we reproduce the mask ourselves: draw the ring, punch the
// two wedge notches with destination-out, then lay the needles on top — the
// same paint order as the source, minus the buggy mask.
async function buildLogo(path) {
  const raw = readFileSync(path, 'utf-8');
  const ringSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">' +
    '<ellipse cx="256" cy="256" rx="138" ry="208" stroke="#94a3b8" stroke-width="56" fill="none"/></svg>';
  const needleSvg = raw.replace(/<ellipse\b[^>]*\/>/, ''); // ring drawn separately below
  const [ringImg, needleImg] = await Promise.all([
    loadImage(Buffer.from(ringSvg)),
    loadImage(Buffer.from(needleSvg)),
  ]);
  // The notch wedges live inside the source <mask>, rotated -22° about center.
  const wedges = [...raw.matchAll(/<polygon points="([^"]+)"/g)].map((m) =>
    m[1].trim().split(/\s+/).map((p) => p.split(',').map(Number)),
  );
  const S = 512;
  const off = createCanvas(S, S);
  const o = off.getContext('2d');
  o.drawImage(ringImg, 0, 0, S, S);
  o.save();
  o.globalCompositeOperation = 'destination-out';
  o.translate(256, 256);
  o.rotate((-22 * Math.PI) / 180);
  o.translate(-256, -256);
  o.fillStyle = '#000';
  for (const poly of wedges) {
    o.beginPath();
    poly.forEach(([x, y], i) => (i ? o.lineTo(x, y) : o.moveTo(x, y)));
    o.closePath();
    o.fill();
  }
  o.restore();
  o.globalCompositeOperation = 'source-over';
  o.drawImage(needleImg, 0, 0, S, S);
  return off;
}

async function render(entry, logo) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  drawBackground(ctx);
  drawLockup(ctx, logo, entry.url || 'nav0.org');
  if (entry.kind === 'blog') drawBlogContent(ctx, entry);
  else drawPageContent(ctx, entry);
  return canvas.encode('png');
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const logo = existsSync(LOGO_PATH) ? await buildLogo(LOGO_PATH).catch(() => null) : null;

  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') && f !== 'index.md');
  let count = 0;
  for (const file of files) {
    const post = readFrontmatter(join(BLOG_DIR, file));
    if (!post) continue;
    const entry = {
      kind: 'blog',
      title: post.title,
      badge: CATEGORY_LABELS[post.category] || 'Blog',
      author: post.author,
      date: formatDate(post.date),
      url: 'nav0.org/blog',
    };
    writeFileSync(join(OUT_DIR, `${post.slug}.png`), await render(entry, logo));
    count++;
  }

  for (const page of PAGES) {
    const entry = { kind: 'page', ...page };
    writeFileSync(join(OUT_DIR, `${page.out}.png`), await render(entry, logo));
    count++;
  }

  // Sitewide default/fallback card (docs/public/og-image.png), used for any
  // route without a dedicated card. Mirrors the home lockup.
  const home = PAGES.find((p) => p.out === 'home');
  writeFileSync(join(ROOT, 'docs/public/og-image.png'), await render({ kind: 'page', ...home }, logo));
  count++;

  console.log(`Generated ${count} OG images (incl. og-image.png fallback).`);
}

main();
