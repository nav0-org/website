<script setup lang="ts">
import { computed } from 'vue';
import { data as posts } from '../posts.data';

const featured = computed(() => posts[0]);
const gridPosts = computed(() => posts.slice(1));

const featuredIsIndieRenaissance = computed(
  () => featured.value?.slug === 'the-indie-browser-renaissance'
);

const indieMarks = ['M', 'H', 'L', 'Z', 'O', 'Q', 'S', 'F', 'LF', 'B', 'N0', '+'];
</script>

<template>
  <div class="bl-page">
    <!-- PAGE HEAD -->
    <section class="bl-page-head">
      <h1 class="bl-page-title">Notes from a small <em>browser project.</em></h1>
      <p class="bl-page-sub">
        Thoughts on privacy, browsers, performance, and the open web. Published when there's
        something to say.
      </p>
    </section>

    <div class="bl-shell">
      <!-- FEATURED -->
      <a v-if="featured" :href="featured.url" class="bl-featured">
        <div
          class="bl-featured-art"
          :style="
            featuredIsIndieRenaissance
              ? 'background: linear-gradient(135deg, #0071e3 0%, #b347d9 50%, #ff5e7a 100%);'
              : `background: ${featured.artGradient};`
          "
        >
          <div v-if="featuredIsIndieRenaissance" class="bl-featured-marks" aria-hidden="true">
            <div
              v-for="(mark, i) in indieMarks"
              :key="i"
              class="bl-indie-mark"
              :class="{ 'is-us': mark === 'N0' }"
            >
              {{ mark }}
            </div>
          </div>
          <div v-else class="bl-featured-glyph" aria-hidden="true">
            {{ featured.artGlyph }}
          </div>
        </div>
        <div class="bl-featured-body">
          <div class="bl-featured-eyebrow">Featured</div>
          <h2>{{ featured.title }}</h2>
          <p>{{ featured.excerpt }}</p>
          <div class="bl-featured-meta">
            <span class="bl-tag">{{ featured.category }}</span>
            <span class="bl-dot"></span>
            <span>{{ featured.date }}</span>
            <span class="bl-dot"></span>
            <span>{{ featured.readTime }}</span>
            <span class="bl-dot"></span>
            <span>By {{ featured.author }}</span>
          </div>
        </div>
      </a>

      <!-- GRID -->
      <div v-if="gridPosts.length" class="bl-grid">
        <a v-for="post in gridPosts" :key="post.url" :href="post.url" class="bl-post-card">
          <div
            class="bl-post-art"
            :style="`background: ${post.artGradient}; color: ${post.artInk || '#fff'};`"
          >
            <span class="bl-post-glyph">{{ post.artGlyph }}</span>
          </div>
          <div class="bl-post-body">
            <span class="bl-post-tag">{{ post.tag }}</span>
            <h3>{{ post.title }}</h3>
            <p>{{ post.excerpt }}</p>
            <div class="bl-post-foot">
              <span>{{ post.date }}</span>
              <span>{{ post.shortReadTime }}</span>
            </div>
          </div>
        </a>
      </div>

    </div>
  </div>
</template>
