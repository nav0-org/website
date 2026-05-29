import { defineConfig } from 'vitepress';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import packageJson from '../../package.json';

function getReleaseSidebar() {
  const releasesDir = resolve(dirname(fileURLToPath(import.meta.url)), '../releases');
  const files = readdirSync(releasesDir).filter((f) => f.endsWith('.md') && f !== 'index.md');

  const releases = files
    .map((file) => {
      const content = readFileSync(resolve(releasesDir, file), 'utf-8');
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (!match) return null;

      const frontmatter = match[1];
      const titleMatch = frontmatter.match(/title:\s*(["'])(.+?)\1/);
      const dateMatch = frontmatter.match(/^date:\s*(\S+)/m);

      return {
        text: titleMatch?.[2] || file.replace('.md', ''),
        date: dateMatch?.[1] || '',
        link: `/releases/${file.replace('.md', '')}`,
      };
    })
    .filter((r): r is { text: string; date: string; link: string } => r !== null);

  releases.sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return [
    {
      text: 'Release Notes',
      items: [
        { text: 'All Releases', link: '/releases/' },
        ...releases.map(({ text, link }) => ({ text, link })),
      ],
    },
  ];
}

function getBlogSidebar() {
  const blogDir = resolve(dirname(fileURLToPath(import.meta.url)), '../blog');
  const files = readdirSync(blogDir).filter((f) => f.endsWith('.md') && f !== 'index.md');

  const posts = files
    .map((file) => {
      const content = readFileSync(resolve(blogDir, file), 'utf-8');
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (!match) return null;

      const frontmatter = match[1];
      const titleMatch = frontmatter.match(/title:\s*(["'])(.+?)\1/);
      const dateMatch = frontmatter.match(/^date:\s*(\S+)/m);

      return {
        text: titleMatch?.[2] || file.replace('.md', ''),
        date: dateMatch?.[1] || '',
        link: `/blog/${file.replace('.md', '')}`,
      };
    })
    .filter((p): p is { text: string; date: string; link: string } => p !== null);

  posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return [
    {
      text: 'Blog',
      items: [
        { text: 'All Posts', link: '/blog/' },
        ...posts.map(({ text, link }) => ({ text, link })),
      ],
    },
    {
      text: 'Browse by topic',
      items: [
        { text: 'Privacy', link: '/blog/topic/privacy' },
        { text: 'Comparisons', link: '/blog/topic/comparisons' },
        { text: 'Performance', link: '/blog/topic/performance' },
        { text: 'The Open Web', link: '/blog/topic/open-web' },
        { text: 'Security', link: '/blog/topic/security' },
      ],
    },
  ];
}

const siteUrl = 'https://nav0.org';
const siteName = 'Nav0';
const siteDescription =
  'A minimal, privacy-focused web browser. No data collection. No bloat. No AI gimmicks. Just clean, safe browsing.';
const ogImage = `${siteUrl}/og-image.png`;

// Per-page Open Graph cards. scripts/generate-og.mjs renders one PNG per route
// into docs/public/og/<name>.png; this maps a route to its card so
// transformPageData can override the default og:image. Blog posts are handled
// separately (they key off the post slug). Returns null for routes with no
// dedicated card, which then fall back to the site default.
function pageOgName(relativePath: string): string | null {
  const direct: Record<string, string> = {
    'index.md': 'home',
    'install.md': 'install',
    'faq.md': 'faq',
    'about.md': 'about',
    'blog/index.md': 'blog',
    'releases/index.md': 'releases',
    'privacy-policy.md': 'legal-privacy-policy',
    'terms-of-use.md': 'legal-terms-of-use',
    'disclaimer.md': 'legal-disclaimer',
  };
  if (direct[relativePath]) return direct[relativePath];
  if (relativePath.startsWith('guide/'))
    return `guide-${relativePath.slice('guide/'.length).replace(/\.md$/, '')}`;
  if (relativePath.startsWith('blog/topic/'))
    return `topic-${relativePath.slice('blog/topic/'.length).replace(/\.md$/, '')}`;
  // All release detail pages share the releases card.
  if (relativePath.startsWith('releases/')) return 'releases';
  return null;
}

// Author identity. Nav0 is built and maintained by Ketan; blog bylines, the
// /about page, and all author/Person JSON-LD point here.
const authorName = 'Ketan Patil';
const authorUrl = `${siteUrl}/about`;
const authorSameAs = [
  'https://github.com/ketansp',
  'https://x.com/ketansp',
  'https://linkedin.com/in/ketansp',
  'https://github.com/nav0-org',
];
const personNode = {
  '@type': 'Person',
  name: authorName,
  url: authorUrl,
  sameAs: authorSameAs,
};

// Maps each "Nav0 vs X" post slug to the proper name of the browser it is
// compared against, so we can emit Comparison about/mentions JSON-LD that
// names both entities (see transformPageData).
const comparisonBrowsers: Record<string, string> = {
  'nav0-vs-arc': 'Arc',
  'nav0-vs-brave': 'Brave',
  'nav0-vs-chrome-data-consumption': 'Google Chrome',
  'nav0-vs-chrome-performance-benchmark': 'Google Chrome',
  'nav0-vs-comet': 'Comet',
  'nav0-vs-duckduckgo': 'DuckDuckGo',
  'nav0-vs-edge': 'Microsoft Edge',
  'nav0-vs-firefox': 'Mozilla Firefox',
  'nav0-vs-opera': 'Opera',
  'nav0-vs-safari': 'Safari',
  'nav0-vs-tor-browser': 'Tor Browser',
  'nav0-vs-vivaldi': 'Vivaldi',
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Reads blog post frontmatter (title/date/description) for the RSS feed.
// readdirSync only returns direct children, so /blog/topic/* hubs are excluded.
function getBlogPostsForFeed() {
  const blogDir = resolve(dirname(fileURLToPath(import.meta.url)), '../blog');
  const files = readdirSync(blogDir).filter((f) => f.endsWith('.md') && f !== 'index.md');
  const posts = files
    .map((file) => {
      const content = readFileSync(resolve(blogDir, file), 'utf-8');
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (!match) return null;
      const fm = match[1];
      return {
        title: fm.match(/title:\s*(["'])([\s\S]*?)\1/)?.[2] || file.replace('.md', ''),
        date: fm.match(/^date:\s*(\S+)/m)?.[1] || '',
        description: fm.match(/^description:\s*(["'])([\s\S]*?)\1/m)?.[2] || '',
        slug: file.replace('.md', ''),
      };
    })
    .filter((p): p is { title: string; date: string; description: string; slug: string } => !!p);
  posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return posts;
}

function writeRssFeed(outDir: string) {
  const posts = getBlogPostsForFeed();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${siteUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(authorName)}</dc:creator>
      <description>${escapeXml(p.description)}</description>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(siteName)} Blog</title>
    <link>${siteUrl}/blog/</link>
    <atom:link href="${siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(siteDescription)}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  mkdirSync(join(outDir, 'blog'), { recursive: true });
  writeFileSync(join(outDir, 'blog', 'feed.xml'), xml, 'utf-8');
}

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Nav0 Browser',
  description:
    'A minimal, privacy-focused web browser built on Electron. No data collection. No bloat. No AI gimmicks.',
  url: siteUrl,
  applicationCategory: 'WebBrowser',
  operatingSystem: 'Windows, macOS, Linux',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  license: 'https://opensource.org/licenses/MIT',
  isAccessibleForFree: true,
  downloadUrl: 'https://nav0.org/install',
  softwareVersion: packageJson.version,
  author: personNode,
  featureList: [
    'Zero telemetry',
    'No data collection',
    'Built-in ad blocker',
    'Tracker blocking',
    'Third-party cookie blocking',
    'HTTPS auto-upgrade',
    'Fingerprint protection',
    'User agent spoofing',
    'Private browsing mode',
    'Tab hibernation',
    'Tab pinning',
    'Customizable keyboard shortcuts',
    'Data retention and auto-delete',
    'Proxy configuration',
    'Process sandboxing',
    'Tab management',
    'Local bookmarks',
    'Download manager',
    'Reader mode',
    'PDF viewer',
    'Find in page with regex',
    'Browser notifications',
    'Open source',
    'Chromium engine',
    'Chrome DevTools',
  ],
};

const sectionNames: Record<string, { name: string; link: string }> = {
  blog: { name: 'Blog', link: '/blog/' },
  guide: { name: 'Guide', link: '/guide/getting-started' },
  releases: { name: 'Release Notes', link: '/releases/' },
};

export default defineConfig({
  title: siteName,
  description: siteDescription,
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  sitemap: {
    hostname: siteUrl,
  },

  head: [
    // Favicon
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],

    // RSS feed autodiscovery
    [
      'link',
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'Nav0 Blog',
        href: `${siteUrl}/blog/feed.xml`,
      },
    ],

    // Theme
    ['meta', { name: 'theme-color', content: '#1a1a1a' }],

    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: siteName }],
    ['meta', { property: 'og:title', content: 'Nav0 — Minimal Privacy Browser' }],
    ['meta', { property: 'og:description', content: siteDescription }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:locale', content: 'en_US' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Nav0 — Minimal Privacy Browser' }],
    ['meta', { name: 'twitter:description', content: siteDescription }],
    ['meta', { name: 'twitter:image', content: ogImage }],

    // Google Search Console
    [
      'meta',
      { name: 'google-site-verification', content: '9xATJZCv2SiLHb9BMJXHLSOqzbddjf7m2CQWwIqI1I0' },
    ],

    // Additional SEO
    ['meta', { name: 'author', content: 'Ketan Patil' }],
    ['meta', { name: 'robots', content: 'index, follow' }],

    // JSON-LD: Organization
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Nav0',
        url: siteUrl,
        logo: `${siteUrl}/logo.webp`,
        description: 'An open-source, privacy-focused web browser project.',
        sameAs: ['https://github.com/nav0-org/nav0-browser'],
      }),
    ],

    // JSON-LD: WebSite
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        publisher: {
          '@type': 'Organization',
          name: 'Nav0',
          url: siteUrl,
        },
      }),
    ],
  ],

  themeConfig: {
    logo: '/logo.webp',
    siteTitle: 'Nav0',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Install', link: '/install' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Release Notes', link: '/releases/' },
      { text: 'About', link: '/about' },
      {
        text: 'Links',
        items: [
          { text: 'FAQ', link: '/faq' },
          { text: 'Privacy Policy', link: '/privacy-policy' },
          { text: 'Terms of Use', link: '/terms-of-use' },
          { text: 'Disclaimer', link: '/disclaimer' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Features', link: '/guide/features' },
          ],
        },
        {
          text: 'Feature Guides',
          items: [
            { text: 'Ad Blocker', link: '/guide/ad-blocker' },
            { text: 'Privacy & Tracking Protection', link: '/guide/privacy-protection' },
            { text: 'Private Browsing', link: '/guide/private-browsing' },
            { text: 'Tab Management', link: '/guide/tab-management' },
            { text: 'Keyboard Shortcuts', link: '/guide/keyboard-shortcuts' },
          ],
        },
        {
          text: 'Un-features',
          items: [{ text: "What Nav0 Doesn't Do", link: '/guide/un-features' }],
        },
        {
          text: 'Core Principles',
          items: [
            { text: 'Privacy', link: '/guide/privacy' },
            { text: 'Philosophy', link: '/guide/philosophy' },
          ],
        },
        {
          text: 'Community',
          items: [{ text: 'Contributing', link: '/guide/contributing' }],
        },
      ],
      '/blog/': getBlogSidebar(),
      '/releases/': getReleaseSidebar(),
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/nav0-org/nav0-browser' }],

    footer: {
      message: 'Released under the MIT License.',
    },

    search: {
      provider: 'local',
    },
  },

  async buildEnd(siteConfig) {
    writeRssFeed(siteConfig.outDir);
  },

  transformPageData(pageData) {
    const canonicalUrl = `${siteUrl}/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '');

    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['meta', { property: 'og:url', content: canonicalUrl }],
      // The site is English-only; declare an explicit self-referencing
      // hreflang + x-default so crawlers don't have to guess.
      ['link', { rel: 'alternate', hreflang: 'en', href: canonicalUrl }],
      ['link', { rel: 'alternate', hreflang: 'x-default', href: canonicalUrl }]
    );

    // Per-page og:/twitter: title + description from frontmatter, so non-blog
    // pages stop inheriting the generic site title/description. Blog posts get
    // theirs in the blog/ branch below. We skip any tag the page already sets by
    // hand (e.g. index.md / about.md curate their own), and VitePress dedupes
    // og:/twitter: meta by property/name so these override the site defaults.
    if (!pageData.relativePath.startsWith('blog/')) {
      const head = pageData.frontmatter.head as Array<
        [string, Record<string, string>, string?]
      >;
      const hasMeta = (key: 'property' | 'name', val: string) =>
        head.some((e) => Array.isArray(e) && e[0] === 'meta' && e[1]?.[key] === val);
      const fmTitle = pageData.frontmatter.title as string | undefined;
      const fmDesc = pageData.frontmatter.description as string | undefined;
      if (fmTitle) {
        if (!hasMeta('property', 'og:title'))
          head.push(['meta', { property: 'og:title', content: fmTitle }]);
        if (!hasMeta('name', 'twitter:title'))
          head.push(['meta', { name: 'twitter:title', content: fmTitle }]);
      }
      if (fmDesc) {
        if (!hasMeta('property', 'og:description'))
          head.push(['meta', { property: 'og:description', content: fmDesc }]);
        if (!hasMeta('name', 'twitter:description'))
          head.push(['meta', { name: 'twitter:description', content: fmDesc }]);
      }
    }

    // Point non-blog routes at their dedicated OG card (blog posts get theirs
    // in the blog/ branch below). VitePress dedupes og:/twitter: meta by
    // property/name, so these override the site defaults.
    const ogName = pageOgName(pageData.relativePath);
    if (ogName) {
      const pageImage = `${siteUrl}/og/${ogName}.png`;
      pageData.frontmatter.head.push(
        ['meta', { property: 'og:image', content: pageImage }],
        ['meta', { name: 'twitter:image', content: pageImage }]
      );
    }

    if (pageData.relativePath === 'blog/index.md') {
      pageData.frontmatter.pageClass = 'blog-list-page';
    } else if (pageData.relativePath.startsWith('blog/topic/')) {
      // Topic hub pages (e.g. /blog/topic/privacy) render <TopicHub /> on a
      // plain page layout — they are not posts, so skip the post metadata.
      pageData.frontmatter.pageClass = 'blog-topic-page';
      pageData.frontmatter.layout = 'page';
    } else if (pageData.relativePath.startsWith('blog/')) {
      pageData.frontmatter.pageClass = 'blog-post-page';
      // Drop the all-posts left sidebar (the design uses the meta rail instead)
      // but keep the aside on so VitePress renders the right TOC + scrollspy.
      pageData.frontmatter.sidebar = false;

      // Per-post social metadata. Without this, every post inherits the
      // generic site title/description and the default OG image. VitePress
      // dedupes og:/twitter: tags by property, so these override the globals.
      const slug = pageData.relativePath.replace(/^blog\//, '').replace(/\.md$/, '');
      const postTitle = pageData.frontmatter.title;
      const postDesc = pageData.frontmatter.description;
      const postOgImage = `${siteUrl}/og/${slug}.png`;
      if (postTitle) {
        pageData.frontmatter.head.push(
          ['meta', { property: 'og:title', content: postTitle }],
          ['meta', { name: 'twitter:title', content: postTitle }]
        );
      }
      if (postDesc) {
        pageData.frontmatter.head.push(
          ['meta', { property: 'og:description', content: postDesc }],
          ['meta', { name: 'twitter:description', content: postDesc }]
        );
      }
      pageData.frontmatter.head.push(
        ['meta', { property: 'og:image', content: postOgImage }],
        ['meta', { name: 'twitter:image', content: postOgImage }],
        // Per-post author Person JSON-LD (referenced as author in the
        // Article schema below). url points at the /about page.
        [
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({ '@context': 'https://schema.org', ...personNode }),
        ]
      );
    } else if (pageData.relativePath === 'releases/index.md') {
      pageData.frontmatter.pageClass = 'releases-index-page';
      pageData.frontmatter.layout = 'page';
    } else if (pageData.relativePath.startsWith('releases/')) {
      pageData.frontmatter.pageClass = 'release-detail-page';
      pageData.frontmatter.layout = 'page';
    } else if (
      pageData.relativePath === 'disclaimer.md' ||
      pageData.relativePath === 'terms-of-use.md' ||
      pageData.relativePath === 'privacy-policy.md'
    ) {
      pageData.frontmatter.pageClass = 'legal-page';
      // We render our own left numbered TOC; tell VitePress not to
      // render its right-side aside so .content takes full width.
      pageData.frontmatter.aside = false;
      pageData.frontmatter.outline = false;
    } else if (pageData.relativePath.startsWith('guide/')) {
      pageData.frontmatter.pageClass = 'guide-page';
      // The Apple-style hero+left-TOC layout fills the column itself;
      // disable VitePress's right-side aside so the content isn't squeezed.
      pageData.frontmatter.aside = false;
      pageData.frontmatter.outline = false;
    } else if (pageData.relativePath === 'faq.md') {
      pageData.frontmatter.pageClass = 'faq-page-v2';
      pageData.frontmatter.layout = 'page';
    }

    // Inject SoftwareApplication schema only on relevant pages
    const softwareAppPages = ['index.md', 'install.md', 'guide/features.md'];
    if (softwareAppPages.includes(pageData.relativePath)) {
      pageData.frontmatter.head.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify(softwareAppSchema),
      ]);
    }

    // Inject BreadcrumbList JSON-LD for all content pages
    const segments = pageData.relativePath.replace(/\.md$/, '').split('/');
    const isIndex = segments[segments.length - 1] === 'index';
    const section = segments.length > 1 ? segments[0] : null;
    const pageTitle = pageData.frontmatter.title || pageData.title || segments[segments.length - 1];

    const breadcrumbItems: Array<{
      '@type': string;
      position: number;
      name: string;
      item?: string;
    }> = [{ '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl }];

    if (section && sectionNames[section]) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: sectionNames[section].name,
        item: `${siteUrl}${sectionNames[section].link}`,
      });

      if (!isIndex) {
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: 3,
          name: pageTitle,
        });
      }
    } else if (pageData.relativePath !== 'index.md') {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: pageTitle,
      });
    }

    if (breadcrumbItems.length > 1) {
      pageData.frontmatter.head.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbItems,
        }),
      ]);
    }

    // Patch the per-post Article JSON-LD: fill in dateModified, and for
    // "Nav0 vs X" comparison posts add about/mentions naming both browsers as
    // distinct entities so crawlers know which two things are being compared.
    if (pageData.relativePath.startsWith('blog/') && pageData.frontmatter.date) {
      const dateStr =
        typeof pageData.frontmatter.date === 'string'
          ? pageData.frontmatter.date
          : new Date(pageData.frontmatter.date).toISOString().split('T')[0];

      const reviewedRaw = pageData.frontmatter.lastReviewed;
      const reviewedStr =
        (typeof reviewedRaw === 'string'
          ? reviewedRaw
          : reviewedRaw
            ? new Date(reviewedRaw).toISOString().split('T')[0]
            : '') || dateStr;

      const slug = pageData.relativePath.replace(/^blog\//, '').replace(/\.md$/, '');
      const comparedBrowser = comparisonBrowsers[slug];
      const comparisonEntities = comparedBrowser
        ? [
            {
              '@type': 'SoftwareApplication',
              name: 'Nav0',
              applicationCategory: 'WebBrowser',
              url: siteUrl,
            },
            {
              '@type': 'SoftwareApplication',
              name: comparedBrowser,
              applicationCategory: 'WebBrowser',
            },
          ]
        : null;

      for (const entry of pageData.frontmatter.head) {
        if (
          Array.isArray(entry) &&
          entry[0] === 'script' &&
          entry[1]?.type === 'application/ld+json' &&
          typeof entry[2] === 'string'
        ) {
          try {
            const jsonLd = JSON.parse(entry[2]);
            if (jsonLd['@type'] === 'Article') {
              if (!jsonLd.dateModified) {
                jsonLd.dateModified = reviewedStr;
              }
              if (comparisonEntities) {
                jsonLd.about = comparisonEntities;
                jsonLd.mentions = comparisonEntities;
              }
              entry[2] = JSON.stringify(jsonLd);
            }
          } catch {
            // Skip malformed JSON-LD entries
          }
        }
      }
    }
  },
});
