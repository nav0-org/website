<script setup lang="ts">
import { computed } from 'vue';
import { data as posts } from '../posts.data';

const props = defineProps<{ topic: string }>();

const TOPICS: Record<string, { label: string; intro: string }> = {
  privacy: {
    label: 'Privacy',
    intro:
      'How modern browsers track, profile, and monetize you — and what a browser that collects zero data does instead.',
  },
  comparisons: {
    label: 'Comparisons',
    intro:
      'Head-to-head looks at how Nav0 stacks up against Chrome, Firefox, Brave, Safari, Edge, and the rest.',
  },
  performance: {
    label: 'Performance',
    intro:
      'Benchmark-driven posts measuring memory, CPU, process count, and data transfer against mainstream browsers.',
  },
  'open-web': {
    label: 'The Open Web',
    intro:
      'On indie browsers, big-tech control of the web, and the history worth remembering as the browser landscape consolidates.',
  },
  security: {
    label: 'Security',
    intro:
      'Permissions, extensions, VPNs, and the security tradeoffs most browsers would rather you did not think about.',
  },
};

const meta = computed(() => TOPICS[props.topic] || { label: props.topic, intro: '' });
const list = computed(() => posts.filter((p) => p.topic === props.topic));
</script>

<template>
  <div class="topic-hub">
    <header class="th-head">
      <div class="th-eyebrow">Blog &middot; Topic</div>
      <h1 class="th-title">{{ meta.label }}</h1>
      <p class="th-intro">{{ meta.intro }}</p>
    </header>

    <ul class="th-list">
      <li v-for="p in list" :key="p.slug">
        <a class="th-card" :href="p.url">
          <span class="th-card-tag">{{ p.category }} &middot; {{ p.date }} &middot; {{ p.readTime }}</span>
          <span class="th-card-title">{{ p.title }}</span>
          <span class="th-card-desc">{{ p.excerpt }}</span>
        </a>
      </li>
    </ul>

    <p class="th-back"><a href="/blog/">&larr; All posts</a></p>
  </div>
</template>

<style scoped>
.topic-hub {
  max-width: 760px;
  margin: 0 auto;
  padding: 56px 24px 96px;
  font-family: var(--ds-font-sans, var(--vp-font-family-base));
  color: var(--ds-ink, var(--vp-c-text-1));
}

.th-eyebrow {
  font-size: 13px;
  font-weight: 600;
  color: var(--ds-accent, var(--vp-c-brand-1));
  letter-spacing: 0.02em;
  margin-bottom: 10px;
}

.th-title {
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 14px;
  border: 0;
  padding: 0;
}

.th-intro {
  font-size: 19px;
  line-height: 1.5;
  color: var(--ds-ink-3, var(--vp-c-text-2));
  margin: 0 0 40px;
  letter-spacing: -0.01em;
}

.th-list {
  list-style: none;
  margin: 0 0 40px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.th-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 22px 24px;
  border: 1px solid var(--ds-rule-soft, var(--vp-c-divider));
  border-radius: 16px;
  background: var(--ds-bg-card, var(--vp-c-bg-soft));
  text-decoration: none;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.th-card:hover {
  transform: translateY(-2px);
  border-color: var(--ds-rule, var(--vp-c-divider));
  box-shadow: var(--ds-shadow-md, 0 8px 24px rgba(0, 0, 0, 0.08));
}

.th-card-tag {
  font-size: 12px;
  font-weight: 600;
  color: var(--ds-accent, var(--vp-c-brand-1));
  letter-spacing: -0.005em;
}

.th-card-title {
  font-size: 21px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--ds-ink, var(--vp-c-text-1));
}

.th-card-desc {
  font-size: 15px;
  line-height: 1.55;
  color: var(--ds-ink-2, var(--vp-c-text-2));
}

.th-back a {
  color: var(--ds-accent, var(--vp-c-brand-1));
  text-decoration: none;
  font-size: 15px;
}

.th-back a:hover {
  text-decoration: underline;
}
</style>
