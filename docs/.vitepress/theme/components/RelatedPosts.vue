<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import { data as posts, type BlogPost } from '../posts.data';

const { page } = useData();

const current = computed(() => {
  const slug = page.value.relativePath.replace(/^blog\//, '').replace(/\.md$/, '');
  return posts.find((p) => p.slug === slug);
});

const related = computed<BlogPost[]>(() => {
  const cur = current.value;
  if (!cur) return [];

  const others = posts.filter((p) => p.slug !== cur.slug);
  const sameTopic = others.filter((p) => p.topic && p.topic === cur.topic);

  // Start with same-topic posts (already sorted newest-first). For comparison
  // posts this guarantees we link several other "Nav0 vs X" comparisons.
  const picks: BlogPost[] = [...sameTopic];

  // Backfill with the most recent remaining posts until we have at least 3.
  for (const p of others) {
    if (picks.length >= 3) break;
    if (!picks.includes(p)) picks.push(p);
  }

  return picks.slice(0, 5);
});
</script>

<template>
  <nav v-if="related.length" class="bp-related" aria-label="Related posts">
    <h2 class="bp-related-title">Related posts</h2>
    <ul class="bp-related-list">
      <li v-for="p in related" :key="p.slug">
        <a :href="p.url" class="bp-related-card">
          <span class="bp-related-tag">{{ p.category }}</span>
          <span class="bp-related-name">{{ p.title }}</span>
          <span class="bp-related-desc">{{ p.excerpt }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.bp-related {
  margin: 56px 0 8px;
  padding-top: 32px;
  border-top: 1px solid var(--blog-rule-soft, var(--vp-c-divider));
}

.bp-related-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--blog-ink-3, var(--vp-c-text-2));
  margin: 0 0 18px;
  border: 0;
  padding: 0;
}

.bp-related-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.bp-related-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  padding: 18px;
  border: 1px solid var(--blog-rule-soft, var(--vp-c-divider));
  border-radius: 14px;
  background: var(--blog-bg-card, var(--vp-c-bg-soft));
  text-decoration: none;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.bp-related-card:hover {
  transform: translateY(-2px);
  border-color: var(--blog-rule, var(--vp-c-divider));
  box-shadow: var(--blog-shadow-md, 0 8px 24px rgba(0, 0, 0, 0.08));
}

.bp-related-tag {
  align-self: flex-start;
  font-size: 11px;
  font-weight: 600;
  color: var(--blog-accent, var(--vp-c-brand-1, #0071e3));
  letter-spacing: -0.005em;
}

.bp-related-name {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.015em;
  color: var(--blog-ink, var(--vp-c-text-1));
}

.bp-related-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--blog-ink-3, var(--vp-c-text-2));
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
