// Build-time Open Graph image generation.
//
// Renders one 1200x630 PNG per blog post into docs/public/og/<slug>.png, plus a
// card for each main site page (home, install, FAQ, guides, topic hubs, legal).
// Each card depicts its subject, not just the title:
//   - "Nav0 vs X" posts get a versus composition (Nav0 logo + the competitor's
//     colored badge and name).
//   - Essays and pages get a topic icon (Lucide) chosen per entry — an eye for
//     "watching you", a mask for incognito, a download glyph for the installer.
//   - Performance posts add their headline stat.
// Fonts are bundled (scripts/fonts) and rendering is deterministic, so output is
// identical on every machine and in CI. Run via the predocs:build npm hook.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import {
  Eye,
  Cookie,
  Lock,
  Puzzle,
  Building2,
  TrendingDown,
  AppWindow,
  LogIn,
  ShieldOff,
  Sparkles,
  VenetianMask,
  Sprout,
  Gauge,
  Globe,
  Download,
  Info,
  Newspaper,
  Tag,
  Shield,
  ShieldCheck,
  Scale,
  FileText,
  CircleHelp,
  Keyboard,
  Ban,
  Compass,
  Feather,
  Layers,
  Users,
  Rocket,
  Fingerprint,
} from 'lucide';

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

// Competitor badge styling for "Nav0 vs X" posts.
const VS = {
  Arc: { c1: '#ff5e7a', c2: '#b347d9', g: 'A', name: 'Arc' },
  Brave: { c1: '#ff5e3a', c2: '#b347d9', g: 'B', name: 'Brave' },
  Comet: { c1: '#3a3a5c', c2: '#8e8ec0', g: 'C', name: 'Comet' },
  DuckDuckGo: { c1: '#de5833', c2: '#ffb340', g: 'D', name: 'DuckDuckGo' },
  Edge: { c1: '#0071e3', c2: '#00b4c8', g: 'E', name: 'Edge' },
  Firefox: { c1: '#ff7b20', c2: '#c43c3c', g: 'F', name: 'Firefox' },
  Opera: { c1: '#e8344e', c2: '#ff5e7a', g: 'O', name: 'Opera' },
  Safari: { c1: '#00b4c8', c2: '#4ea7ff', g: 'S', name: 'Safari' },
  Tor: { c1: '#b347d9', c2: '#5a4b8a', g: 'T', name: 'Tor' },
  Vivaldi: { c1: '#ef4444', c2: '#9b1c1c', g: 'V', name: 'Vivaldi' },
  Chrome: { c1: '#5a6270', c2: '#aab0bd', g: 'C', name: 'Chrome' },
};

// Per-post visual: either a competitor (vs) or a topic icon, optionally a stat.
const POSTS = {
  'nav0-vs-arc': { vs: 'Arc' },
  'nav0-vs-brave': { vs: 'Brave' },
  'nav0-vs-comet': { vs: 'Comet' },
  'nav0-vs-duckduckgo': { vs: 'DuckDuckGo' },
  'nav0-vs-edge': { vs: 'Edge' },
  'nav0-vs-firefox': { vs: 'Firefox' },
  'nav0-vs-opera': { vs: 'Opera' },
  'nav0-vs-safari': { vs: 'Safari' },
  'nav0-vs-tor-browser': { vs: 'Tor' },
  'nav0-vs-vivaldi': { vs: 'Vivaldi' },
  'nav0-vs-chrome-performance-benchmark': { vs: 'Chrome', stat: '−48% RAM · −86% CPU' },
  'nav0-vs-chrome-data-consumption': { vs: 'Chrome', stat: '−18% data · −29% requests' },
  'nav0-v012-performance-update': { icon: Gauge, stat: '−45% RAM · −77% CPU vs Chrome' },
  'big-tech-owns-your-browser': { icon: Building2 },
  'browser-extensions-wont-save-your-privacy': { icon: Puzzle },
  'cookie-banners-are-privacy-theater': { icon: Cookie },
  'every-browser-permission-explained': { icon: Lock },
  'incognito-mode-is-not-private': { icon: VenetianMask },
  'stop-forcing-ai-into-browsers': { icon: Sparkles },
  'the-enshittification-of-chrome': { icon: TrendingDown },
  'the-indie-browser-renaissance': { icon: Sprout },
  'who-invented-tabbed-browsing': { icon: AppWindow },
  'why-your-browser-wants-you-to-sign-in': { icon: LogIn },
  'your-browser-doesnt-need-a-vpn': { icon: ShieldOff },
  'your-browser-is-watching-you': { icon: Eye },
  'honest-ua-vs-spoofed-ua-field-report': { icon: Fingerprint },
};

// Non-blog site pages. `out` is the og/<out>.png filename, matched by route in
// config.ts (transformPageData). Titles are short display strings, not the long
// SEO <title>. Release detail pages share the 'releases' card.
const PAGES = [
  { out: 'home', label: 'Privacy Browser', title: 'Browse. Nothing more.', icon: Compass },
  { out: 'install', label: 'Download', title: 'Get Nav0 for Mac, Windows & Linux', icon: Download },
  { out: 'faq', label: 'Help', title: 'Frequently Asked Questions', icon: CircleHelp },
  { out: 'about', label: 'About', title: 'The Person Behind Nav0', icon: Info },
  { out: 'blog', label: 'Blog', title: 'Privacy, Browsers & the Open Web', icon: Newspaper },
  { out: 'releases', label: 'Release Notes', title: "What's New in Nav0", icon: Tag },

  // Blog topic hubs (/blog/topic/*)
  { out: 'topic-privacy', label: 'Privacy', title: 'Privacy & Tracking', icon: Shield },
  { out: 'topic-comparisons', label: 'Comparisons', title: 'Nav0 vs the Competition', icon: Scale },
  { out: 'topic-performance', label: 'Performance', title: 'Performance & Efficiency', icon: Gauge },
  { out: 'topic-open-web', label: 'The Open Web', title: 'The Open Web', icon: Globe },
  { out: 'topic-security', label: 'Security', title: 'Browser Security', icon: Lock },

  // Guide pages (/guide/*)
  { out: 'guide-features', label: 'Introduction', title: 'Nav0 Features', icon: Sparkles },
  { out: 'guide-getting-started', label: 'Introduction', title: 'Getting Started', icon: Rocket },
  { out: 'guide-ad-blocker', label: 'Feature Guide', title: 'Ad & Tracker Blocking', icon: Ban },
  { out: 'guide-privacy-protection', label: 'Feature Guide', title: 'Privacy & Tracking Protection', icon: ShieldCheck },
  { out: 'guide-private-browsing', label: 'Feature Guide', title: 'Private Browsing', icon: VenetianMask },
  { out: 'guide-tab-management', label: 'Feature Guide', title: 'Tab Management', icon: Layers },
  { out: 'guide-keyboard-shortcuts', label: 'Feature Guide', title: 'Keyboard Shortcuts', icon: Keyboard },
  { out: 'guide-un-features', label: 'Un-features', title: "What Nav0 Doesn't Do", icon: Ban },
  { out: 'guide-privacy', label: 'Core Principles', title: 'Zero Data Collection', icon: Shield },
  { out: 'guide-philosophy', label: 'Core Principles', title: 'Why We Built a Minimal Browser', icon: Feather },
  { out: 'guide-contributing', label: 'Community', title: 'Contributing to Nav0', icon: Users },

  // Legal
  { out: 'legal-privacy-policy', label: 'Legal', title: 'Privacy Policy', icon: Shield },
  { out: 'legal-terms-of-use', label: 'Legal', title: 'Terms of Use', icon: Scale },
  { out: 'legal-disclaimer', label: 'Legal', title: 'Disclaimer', icon: FileText },
];

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

function lucideImage(node, size, color = '#ffffff', strokeWidth = 1.7) {
  const children = node
    .map(([tag, attrs]) => {
      const a = Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');
      return `<${tag} ${a}/>`;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
  return loadImage(Buffer.from(svg));
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

// Visual block in the upper-right: a versus composition or a single topic icon.
async function drawVisual(ctx, cfg, logo) {
  const cy = 188;
  if (cfg.vs && VS[cfg.vs]) {
    const s = VS[cfg.vs];
    const r = 62;
    const cxL = 852;
    const cxR = 1046;

    // "vs" between the two badges.
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '34px OGSansBold';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('vs', (cxL + cxR) / 2, cy);

    // Left: Nav0 (white badge + logo).
    circle(ctx, cxL, cy, r);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    if (logo) ctx.drawImage(logo, cxL - 40, cy - 40, 80, 80);

    // Right: competitor (gradient badge + initial).
    const g = ctx.createLinearGradient(cxR - r, cy - r, cxR + r, cy + r);
    g.addColorStop(0, s.c1);
    g.addColorStop(1, s.c2);
    circle(ctx, cxR, cy, r);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '58px OGSansBold';
    ctx.fillText(s.g, cxR, cy + 2);

    // Names under each badge.
    ctx.font = '22px OGSansBold';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('Nav0', cxL, cy + r + 26);
    ctx.fillText(s.name, cxR, cy + r + 26);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  } else {
    const cx = 980;
    const r = 116;
    circle(ctx, cx, cy, r);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.30)';
    circle(ctx, cx, cy, r);
    ctx.stroke();
    const node = cfg.icon || Globe;
    const size = 132;
    const img = await lucideImage(node, size);
    ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
  }

  // Optional headline stat, centered under the visual.
  if (cfg.stat) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '27px OGSansBold';
    ctx.textAlign = 'center';
    ctx.fillText(cfg.stat, 949, 312);
    ctx.textAlign = 'left';
  }
}

async function render(entry, logo) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const cfg = entry.cfg || {};

  // Apple-blue diagonal gradient background.
  const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  grad.addColorStop(0, '#0071e3');
  grad.addColorStop(1, '#001b44');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Logo badge + wordmark (top-left).
  const badge = 72;
  const bx = PAD;
  const by = PAD;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, bx, by, badge, badge, 18);
  ctx.fill();
  if (logo) ctx.drawImage(logo, bx + 12, by + 12, badge - 24, badge - 24);
  ctx.fillStyle = '#ffffff';
  ctx.font = '42px OGSansBold';
  ctx.textBaseline = 'middle';
  ctx.fillText('Nav0', bx + badge + 22, by + badge / 2);
  ctx.textBaseline = 'alphabetic';

  // Subject visual (upper-right).
  await drawVisual(ctx, cfg, logo);

  // Title, adaptive + bottom-anchored.
  const maxTextWidth = WIDTH - PAD * 2;
  let fontSize = 60;
  let lineHeight = 72;
  ctx.font = `${fontSize}px OGSansBold`;
  let lines = wrapLines(ctx, entry.title, maxTextWidth, 4);
  if (lines.length > 3) {
    fontSize = 50;
    lineHeight = 62;
    ctx.font = `${fontSize}px OGSansBold`;
    lines = wrapLines(ctx, entry.title, maxTextWidth, 4);
  }

  const titleBottom = 520;
  const firstBaseline = titleBottom - (lines.length - 1) * lineHeight;

  const label = (entry.label || 'Blog').toUpperCase();
  ctx.font = '24px OGSansBold';
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.fillText(label, PAD, firstBaseline - fontSize - 20);

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
    const entry = {
      title: post.title,
      label: CATEGORY_LABELS[post.category] || post.category || 'Blog',
      cfg: POSTS[post.slug] || {},
    };
    const png = await render(entry, logo);
    writeFileSync(join(OUT_DIR, `${post.slug}.png`), png);
    count++;
  }

  for (const page of PAGES) {
    const entry = {
      title: page.title,
      label: page.label,
      cfg: { icon: page.icon, stat: page.stat },
    };
    const png = await render(entry, logo);
    writeFileSync(join(OUT_DIR, `${page.out}.png`), png);
    count++;
  }
  console.log(`Generated ${count} OG images into docs/public/og/`);
}

main();
