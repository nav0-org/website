<script setup lang="ts">
import { ref, onMounted } from 'vue';

// The GitHub repository the star + download counts are read from. Kept in sync
// with the socialLinks entry in config.ts.
const REPO = 'nav0-org/nav0-browser';

// Client-side counts are cached in localStorage so a returning visitor doesn't
// re-hit the GitHub API on every navigation. Unauthenticated GitHub API calls
// are limited to 60/hour per IP, so a 1-hour TTL keeps us well clear of it.
const CACHE_KEY = 'nav0:gh-stats:v1';
const TTL_MS = 60 * 60 * 1000;

const stars = ref<number | null>(null);
const downloads = ref<number | null>(null);

// 1234 -> "1.2k", 1_500_000 -> "1.5M". Trailing ".0" is stripped.
function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

// Sum download_count across every asset of every release.
function sumDownloads(releases: unknown): number {
  if (!Array.isArray(releases)) return 0;
  return releases.reduce((total, release) => {
    const assets = release?.assets;
    if (!Array.isArray(assets)) return total;
    return total + assets.reduce((sub, a) => sub + (Number(a?.download_count) || 0), 0);
  }, 0);
}

async function fetchStats(): Promise<{ stars: number | null; downloads: number | null }> {
  const [repoRes, releasesRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${REPO}`),
    fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`),
  ]);

  let s: number | null = null;
  let d: number | null = null;

  if (repoRes.ok) {
    const repo = await repoRes.json();
    if (typeof repo?.stargazers_count === 'number') s = repo.stargazers_count;
  }
  if (releasesRes.ok) {
    d = sumDownloads(await releasesRes.json());
  }

  return { stars: s, downloads: d };
}

onMounted(async () => {
  // Serve from cache when it's fresh.
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached && typeof cached.ts === 'number' && Date.now() - cached.ts < TTL_MS) {
        stars.value = cached.stars ?? null;
        downloads.value = cached.downloads ?? null;
        return;
      }
    }
  } catch {
    // Ignore unreadable/blocked storage and fall through to a live fetch.
  }

  try {
    const result = await fetchStats();
    stars.value = result.stars;
    downloads.value = result.downloads;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...result, ts: Date.now() }));
    } catch {
      // Storage may be full or blocked; the counts still render this session.
    }
  } catch {
    // Network/API failure: leave the counts hidden rather than showing zeros.
  }
});
</script>

<template>
  <div class="nav-gh-stats">
    <a
      v-if="stars !== null"
      class="nav-gh-stat"
      :href="`https://github.com/${REPO}/stargazers`"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`${stars} stars on GitHub`"
      title="Stars on GitHub"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2.5l2.9 6.06 6.6.79-4.87 4.53 1.28 6.52L12 17.9l-5.91 3l1.28-6.52L2.5 9.35l6.6-.79L12 2.5z"
          fill="currentColor"
        />
      </svg>
      <span>{{ formatCount(stars) }}</span>
    </a>
    <a
      v-if="downloads !== null"
      class="nav-gh-stat"
      :href="`https://github.com/${REPO}/releases`"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`${downloads} total downloads`"
      title="Total downloads"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3v10m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>{{ formatCount(downloads) }}</span>
    </a>
  </div>
</template>

<style scoped>
.nav-gh-stats {
  display: none;
  align-items: center;
  gap: 8px;
  margin-right: 4px;
}

/* Match VitePress: social links (and thus these counts) only show >= 768px. */
@media (min-width: 768px) {
  .nav-gh-stats {
    display: flex;
  }
}

.nav-gh-stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transition:
    color 0.25s,
    border-color 0.25s,
    background-color 0.25s;
}

.nav-gh-stat:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.nav-gh-stat svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
</style>
