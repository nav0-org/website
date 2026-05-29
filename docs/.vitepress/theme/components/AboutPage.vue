<script setup lang="ts">
const githubUrl = 'https://github.com/nav0-org';
const githubPersonal = 'https://github.com/ketansp';
const twitterUrl = 'https://x.com/ketnsp';
const linkedinUrl = 'https://linkedin.com/in/ketansp';
const emailUrl = 'mailto:ketan@nav0.org';
</script>

<template>
  <div class="about-page">
    <section class="ab-hero">
      <img class="ab-avatar" src="/ketan-patil.jpg" alt="Portrait of Ketan Patil, the creator of Nav0" width="120" height="120" />
      <h1 class="ab-name">Ketan Patil</h1>
      <p class="ab-role">Creator &amp; maintainer of Nav0</p>
      <p class="ab-location">Mumbai, India</p>
    </section>

    <section class="ab-body">
      <p class="ab-lede">
        I build Nav0 — a minimal, privacy-focused web browser that collects zero data.
        I also write most of what you'll find on this blog.
      </p>

      <h2>Why Nav0 exists</h2>
      <p>
        The browser is the most-used piece of software on most people's computers, and over
        the years it quietly turned into something else: a billboard for AI assistants nobody
        asked for, a funnel for accounts and sync, and a data pipeline pointed back at whoever
        shipped it. Almost every mainstream browser is made by a company that sells ads or runs
        a platform — and that shapes every decision it makes about your data.
      </p>
      <p>
        I wanted a browser that does exactly one thing: let me browse the web. No telemetry, no
        accounts, no AI features, no crypto, no built-in VPN upsell — nothing that phones home.
        When I couldn't find one that drew that line and held it, I started building Nav0.
      </p>
      <p>
        Nav0 is free and open source under the MIT License. Privacy isn't a setting you have to
        find and toggle; it's the architecture. There's nothing to opt out of because there's
        nothing being collected. If that sounds like the browser you've been wanting, the best
        place to start is the
        <a href="/guide/philosophy">philosophy page</a> or
        <a href="/guide/getting-started">the getting-started guide</a>.
      </p>

      <h2>Find me</h2>
      <p>
        Nav0's source code, issues, and discussions all live on
        <a :href="githubUrl" rel="me noopener">GitHub</a>. That's the best place to report a bug,
        request a feature, or read the code that backs up every privacy claim on this site.
      </p>
      <ul class="ab-find">
        <li><a :href="githubPersonal" rel="me noopener">GitHub</a> — <span>github.com/ketansp</span></li>
        <li><a :href="twitterUrl" rel="me noopener">X / Twitter</a> — <span>@ketnsp</span></li>
        <li><a :href="linkedinUrl" rel="me noopener">LinkedIn</a> — <span>in/ketansp</span></li>
        <li><a :href="emailUrl" rel="me">Email</a> — <span>ketan@nav0.org</span></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 56px 24px 96px;
  font-family: var(--ds-font-sans, var(--vp-font-family-base));
  color: var(--ds-ink, var(--vp-c-text-1));
}

.ab-hero {
  text-align: center;
  margin-bottom: 48px;
}

.ab-avatar {
  width: 120px;
  height: 120px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--ds-rule-soft, var(--vp-c-divider));
  box-shadow: var(--ds-shadow-md, 0 8px 24px rgba(0, 0, 0, 0.1));
}

.ab-name {
  font-size: clamp(36px, 6vw, 52px);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: 20px 0 6px;
  line-height: 1.05;
  border: 0;
  padding: 0;
}

.ab-role {
  font-size: 18px;
  color: var(--ds-ink-3, var(--vp-c-text-2));
  margin: 0 0 4px;
}

.ab-location {
  font-size: 15px;
  color: var(--ds-ink-3, var(--vp-c-text-2));
  margin: 0 0 24px;
}

.ab-links {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.ab-btn {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 22px;
  border-radius: 999px;
  background: var(--ds-accent, var(--vp-c-brand-1));
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: background 160ms ease;
}

.ab-btn:hover {
  background: var(--ds-accent-hover, var(--vp-c-brand-2));
}

.ab-body {
  font-size: 17px;
  line-height: 1.65;
  color: var(--ds-ink-2, var(--vp-c-text-1));
}

.ab-lede {
  font-size: 21px;
  line-height: 1.5;
  color: var(--ds-ink, var(--vp-c-text-1));
  letter-spacing: -0.01em;
  margin: 0 0 36px;
}

.ab-body h2 {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 40px 0 14px;
  border: 0;
  padding: 0;
}

.ab-body p {
  margin: 0 0 18px;
}

.ab-body a {
  color: var(--ds-accent, var(--vp-c-brand-1));
  text-decoration: none;
}

.ab-body a:hover {
  text-decoration: underline;
}

.ab-find {
  list-style: none;
  padding: 0;
  margin: 0 0 18px;
}

.ab-find li {
  margin: 0 0 8px;
}

.ab-find span {
  color: var(--ds-ink-3, var(--vp-c-text-2));
  font-size: 15px;
}
</style>
