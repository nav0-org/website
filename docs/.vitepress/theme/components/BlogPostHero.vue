<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import { data as posts } from '../posts.data';

const { page, frontmatter } = useData();

const post = computed(() => {
  const slug = page.value.relativePath.replace(/^blog\//, '').replace(/\.md$/, '');
  return posts.find((p) => p.slug === slug);
});

const title = computed(() => frontmatter.value.title || post.value?.title || '');
const category = computed(() => post.value?.category || '');
const longDate = computed(() => post.value?.longDate || '');
const readTime = computed(() => post.value?.readTime || '');
const author = computed(() => post.value?.author || 'Ketan');
const dateISO = computed(() => post.value?.dateISO || '');
const reviewedISO = computed(() => post.value?.lastReviewedISO || '');
const canonicalUrl = computed(() => (post.value ? `https://nav0.org${post.value.url}` : ''));

// Short crumb — drop the colon-suffix subtitle that many posts use
const breadcrumbTitle = computed(() => title.value.split(':')[0].trim());
</script>

<template>
  <article v-if="post" class="bp-hero" itemscope itemtype="https://schema.org/BlogPosting">
    <div class="bp-hero-inner">
      <div class="bp-breadcrumb">
        <a href="/">Nav0</a>
        <span class="bp-sep">›</span>
        <a href="/blog/">Blog</a>
        <span class="bp-sep">›</span>
        <span>{{ breadcrumbTitle }}</span>
      </div>
      <div class="bp-eyebrow">
        <span class="bp-tag">{{ category }}</span>
      </div>
      <h1 class="bp-headline" itemprop="headline">{{ title }}</h1>
      <div class="bp-byline">
        <a
          class="bp-author"
          href="/about"
          itemprop="author"
          itemscope
          itemtype="https://schema.org/Person"
        >
          <img class="bp-avatar" src="/author.jpg" :alt="author" width="28" height="28" />
          <span itemprop="name">{{ author }}</span>
          <link itemprop="url" href="https://nav0.org/about" />
        </a>
        <span class="bp-dot"></span>
        <time :datetime="dateISO" itemprop="datePublished">{{ longDate }}</time>
        <span class="bp-dot"></span>
        <span>{{ readTime }}</span>
      </div>
    </div>
    <meta itemprop="dateModified" :content="reviewedISO || dateISO" />
    <link itemprop="mainEntityOfPage" :href="canonicalUrl" />
    <span itemprop="publisher" itemscope itemtype="https://schema.org/Organization">
      <meta itemprop="name" content="Nav0" />
      <link itemprop="url" href="https://nav0.org" />
    </span>
  </article>
</template>
