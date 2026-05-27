<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import { data as posts } from '../posts.data';

const { page } = useData();

const post = computed(() => {
  const slug = page.value.relativePath.replace(/^blog\//, '').replace(/\.md$/, '');
  return posts.find((p) => p.slug === slug);
});
</script>

<template>
  <aside v-if="post && post.tldr" class="bp-tldr" aria-label="TL;DR — quick summary">
    <span class="bp-tldr-label">TL;DR</span>
    <p class="bp-tldr-body">{{ post.tldr }}</p>
  </aside>
</template>

<style scoped>
.bp-tldr {
  margin: 0 0 36px;
  padding: 18px 22px;
  border: 1px solid var(--blog-rule-soft, var(--vp-c-divider));
  border-left: 3px solid var(--blog-accent, var(--vp-c-brand-1, #0071e3));
  border-radius: 14px;
  background: var(--blog-bg-card, var(--vp-c-bg-soft));
  box-shadow: var(--blog-shadow-sm, none);
}

.bp-tldr-label {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blog-accent, var(--vp-c-brand-1, #0071e3));
  margin-bottom: 8px;
}

.bp-tldr-body {
  margin: 0;
  font-size: 16px;
  line-height: 1.55;
  color: var(--blog-ink, var(--vp-c-text-1));
  letter-spacing: -0.003em;
}
</style>
