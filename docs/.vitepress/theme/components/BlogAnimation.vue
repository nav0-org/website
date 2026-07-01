<script setup>
import { computed } from 'vue';

/**
 * BlogAnimation — a small, on-brand animated figure embedded mid-article.
 *
 * Pure CSS animation (no runtime JS, SSR-safe). Colours come exclusively
 * from the design tokens in tokens.css so every scene tracks light/dark
 * mode. All motion is disabled under `prefers-reduced-motion: reduce`,
 * and each scene's resting state is a sensible static composition.
 *
 * One scene per blog topic — see DEFAULT_CAPTIONS for the catalogue.
 */
const props = defineProps({
  scene: { type: String, required: true },
  // Used by the `versus` scene to label the opposing browser window.
  opponent: { type: String, default: '' },
  // Optional caption override; otherwise a sensible default per scene.
  caption: { type: String, default: '' },
});

const range = (n) => Array.from({ length: n }, (_, i) => i);

const DEFAULT_CAPTIONS = {
  versus: (opp) =>
    `Two windows, side by side: Nav0 just browses, while ${opp || 'the other browser'} keeps a lot more running in the background.`,
  surveillance:
    'A mainstream browser leaks identifiers to third parties with every request. Nav0 stops them at the door.',
  watching:
    'A mainstream browser leaks identifiers to third parties with every request. Nav0 stops them at the door.',
  cookies:
    'Consent banners pile up endlessly — and clicking "Accept" rarely changes what is actually collected.',
  extensions:
    'Privacy extensions patch leaks one at a time, while the browser underneath keeps phoning home.',
  incognito:
    'Private mode hides your history from the people near you — not from the sites, networks, and trackers watching the wire.',
  aiBloat:
    'Sparkles, copilots, and assistants keep getting bolted onto the toolbar. Nav0 leaves the toolbar clean.',
  quic:
    'HTTP/3 rides on QUIC over UDP, skipping the round-trips that slow older connections down.',
  vpn:
    'A VPN wraps your traffic in a tunnel — but the browser itself is still the thing that needs to stop leaking.',
  fingerprint:
    'Dozens of small signals — fonts, screen size, headers — combine into one identifier that follows you across sites.',
  permissions:
    'Camera, location, notifications, sensors — every permission a site can ask for is a door. Nav0 keeps them shut by default.',
  flags:
    'Hidden experimental flags quietly change how your browser behaves, long after you have forgotten you set them.',
  strip:
    'Building Nav0 meant tearing the telemetry, services, and bloat out of Chromium until only the browser was left.',
  bloat:
    'A browser that starts clean accumulates feature after feature, until the product serves the vendor more than you.',
  processes:
    'Open more tabs and a heavy browser spawns process after process. Nav0 stays lean as the count climbs.',
  constellation:
    'A new generation of small, independent browsers is reclaiming the web from a handful of giants.',
  tabs:
    'The humble tab quietly reshaped how we browse — from one window per page to a whole session in a strip.',
  signin:
    'Every prompt to "sign in" funnels another browser into an account that exists to watch what you do.',
};

const caption = computed(() => {
  if (props.caption) return props.caption;
  const d = DEFAULT_CAPTIONS[props.scene];
  return typeof d === 'function' ? d(props.opponent) : d || '';
});
</script>

<template>
  <figure class="blog-anim" :class="`blog-anim--${scene}`" role="img" :aria-label="caption">
    <div class="ba-stage">
      <!-- VERSUS — two mini browser windows, side by side -->
      <div v-if="scene === 'versus'" class="ba-vs">
        <div class="ba-win ba-win--calm">
          <div class="ba-win__bar">
            <span class="ba-light" /><span class="ba-light" /><span class="ba-light" />
            <span class="ba-tab ba-tab--on" />
          </div>
          <div class="ba-win__body">
            <span class="ba-ring" />
          </div>
          <div class="ba-win__name">Nav0</div>
        </div>
        <div class="ba-vs__x">vs</div>
        <div class="ba-win ba-win--busy">
          <div class="ba-win__bar">
            <span class="ba-light" /><span class="ba-light" /><span class="ba-light" />
            <span class="ba-tab ba-tab--on" /><span class="ba-tab" /><span class="ba-tab" />
            <span class="ba-spark">✦</span>
            <span class="ba-badge" />
          </div>
          <div class="ba-win__body">
            <span v-for="i in range(3)" :key="i" class="ba-ping" :style="{ animationDelay: i * 0.5 + 's' }" />
          </div>
          <div class="ba-win__name">{{ opponent || 'Other browser' }}</div>
        </div>
      </div>

      <!-- SURVEILLANCE / WATCHING — packets fall toward a shield and dissolve -->
      <div v-else-if="scene === 'surveillance' || scene === 'watching'" class="ba-rain">
        <span
          v-for="i in range(9)"
          :key="i"
          class="ba-drop"
          :style="{ left: 6 + i * 10.5 + '%', animationDelay: (i % 3) * 0.6 + (i * 0.12) + 's' }"
        />
        <div class="ba-shield">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linejoin="round"
            />
            <path d="M8.5 12l2.5 2.5L16 9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="ba-baseline" />
      </div>

      <!-- COOKIES — consent banners stack up and crumble -->
      <div v-else-if="scene === 'cookies'" class="ba-cookies">
        <div v-for="i in range(4)" :key="i" class="ba-banner" :style="{ animationDelay: i * 0.9 + 's' }">
          <span class="ba-banner__txt" />
          <span class="ba-banner__btn" />
        </div>
      </div>

      <!-- EXTENSIONS — puzzle pieces patch leaks one by one -->
      <div v-else-if="scene === 'extensions'" class="ba-ext">
        <div class="ba-ext__base" />
        <span
          v-for="i in range(5)"
          :key="i"
          class="ba-puzzle"
          :style="{ left: 8 + i * 19 + '%', animationDelay: i * 0.4 + 's' }"
        />
        <span
          v-for="i in range(3)"
          :key="'leak' + i"
          class="ba-leak"
          :style="{ left: 24 + i * 26 + '%', animationDelay: i * 0.7 + 0.3 + 's' }"
        />
      </div>

      <!-- INCOGNITO — a mask hides the face, but packets still leak past -->
      <div v-else-if="scene === 'incognito'" class="ba-incog">
        <div class="ba-mask">
          <svg viewBox="0 0 64 28" aria-hidden="true">
            <path
              d="M4 8c0-3 3-5 9-5 5 0 7 2 9 4h12c2-2 4-4 9-4 6 0 9 2 9 5 0 8-5 14-12 14-5 0-8-3-9-8h-6c-1 5-4 8-9 8C9 22 4 16 4 8z"
              fill="currentColor"
              opacity="0.92"
            />
          </svg>
        </div>
        <span
          v-for="i in range(6)"
          :key="i"
          class="ba-escape"
          :style="{ top: 12 + (i % 3) * 30 + '%', animationDelay: i * 0.5 + 's' }"
        />
      </div>

      <!-- AI BLOAT — sparkle buttons crowd a toolbar, then get removed -->
      <div v-else-if="scene === 'aiBloat'" class="ba-ai">
        <div class="ba-toolbar">
          <span class="ba-tool ba-tool--keep" />
          <span class="ba-tool ba-tool--keep" />
          <span v-for="i in range(4)" :key="i" class="ba-tool ba-tool--ai" :style="{ animationDelay: i * 0.6 + 's' }">✦</span>
        </div>
        <div class="ba-toolbar ba-toolbar--clean">
          <span class="ba-tool ba-tool--keep" />
          <span class="ba-tool ba-tool--keep" />
        </div>
      </div>

      <!-- QUIC — HTTP/3 packet outruns the older handshake -->
      <div v-else-if="scene === 'quic'" class="ba-quic">
        <div class="ba-lane ba-lane--old">
          <span class="ba-lane__tag">TCP + TLS</span>
          <span class="ba-runner ba-runner--slow" />
        </div>
        <div class="ba-lane ba-lane--new">
          <span class="ba-lane__tag">HTTP/3 · QUIC</span>
          <span class="ba-runner ba-runner--fast" />
        </div>
      </div>

      <!-- VPN — traffic flows through an encrypted tunnel past watchers -->
      <div v-else-if="scene === 'vpn'" class="ba-vpn">
        <div class="ba-tunnel">
          <span v-for="i in range(5)" :key="i" class="ba-flow" :style="{ animationDelay: i * 0.5 + 's' }" />
          <span class="ba-lock">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </span>
        </div>
        <span class="ba-eye ba-eye--l" />
        <span class="ba-eye ba-eye--r" />
      </div>

      <!-- FINGERPRINT — small signals converge into one ridged identifier -->
      <div v-else-if="scene === 'fingerprint'" class="ba-fp">
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-linecap="round">
            <path class="ba-ridge" d="M40 18a22 22 0 0 1 22 22" stroke-width="2" />
            <path class="ba-ridge" d="M40 26a14 14 0 0 1 14 14" stroke-width="2" />
            <path class="ba-ridge" d="M40 34a6 6 0 0 1 6 6" stroke-width="2" />
            <path class="ba-ridge" d="M18 40a22 22 0 0 1 22-22" stroke-width="2" />
            <path class="ba-ridge" d="M26 40a14 14 0 0 1 14-14" stroke-width="2" />
            <path class="ba-ridge" d="M34 40a6 6 0 0 1 6-6" stroke-width="2" />
          </g>
        </svg>
        <span v-for="i in range(6)" :key="i" class="ba-signal" :style="{ animationDelay: i * 0.45 + 's' }" />
      </div>

      <!-- PERMISSIONS — a column of request toggles, all switched off -->
      <div v-else-if="scene === 'permissions'" class="ba-perms">
        <div v-for="i in range(4)" :key="i" class="ba-perm" :style="{ animationDelay: i * 0.5 + 's' }">
          <span class="ba-perm__label" />
          <span class="ba-switch"><span class="ba-switch__knob" /></span>
        </div>
      </div>

      <!-- FLAGS — experimental flag chips quietly flip on -->
      <div v-else-if="scene === 'flags'" class="ba-flags">
        <span
          v-for="i in range(8)"
          :key="i"
          class="ba-flag"
          :style="{ animationDelay: i * 0.35 + 's' }"
        >⚑</span>
      </div>

      <!-- STRIP — feature chips peel away from a Chromium block -->
      <div v-else-if="scene === 'strip'" class="ba-strip">
        <div class="ba-core">nav0</div>
        <span
          v-for="i in range(6)"
          :key="i"
          class="ba-chip ba-chip--out"
          :style="{ top: 8 + (i % 3) * 34 + '%', left: i < 3 ? '8%' : '70%', animationDelay: i * 0.4 + 's' }"
        />
      </div>

      <!-- BLOAT — a clean browser accretes feature after feature -->
      <div v-else-if="scene === 'bloat'" class="ba-bloat">
        <div class="ba-core ba-core--grow" />
        <span
          v-for="i in range(6)"
          :key="i"
          class="ba-chip ba-chip--in"
          :style="{ top: 6 + (i % 3) * 36 + '%', left: i < 3 ? '6%' : '74%', animationDelay: i * 0.5 + 's' }"
        />
      </div>

      <!-- PROCESSES — a lean cluster next to a sprawling one -->
      <div v-else-if="scene === 'processes'" class="ba-proc">
        <div class="ba-proc__col">
          <div class="ba-proc__field ba-proc__field--lean">
            <span v-for="i in range(4)" :key="i" class="ba-node" :style="{ animationDelay: i * 0.3 + 's' }" />
          </div>
          <div class="ba-proc__name">Nav0</div>
        </div>
        <div class="ba-proc__col">
          <div class="ba-proc__field ba-proc__field--heavy">
            <span v-for="i in range(20)" :key="i" class="ba-node ba-node--busy" :style="{ animationDelay: (i % 7) * 0.22 + 's' }" />
          </div>
          <div class="ba-proc__name">Heavy browser</div>
        </div>
      </div>

      <!-- CONSTELLATION — independent browsers light up across a field -->
      <div v-else-if="scene === 'constellation'" class="ba-const">
        <svg viewBox="0 0 100 50" aria-hidden="true" preserveAspectRatio="none">
          <g stroke="currentColor" stroke-width="0.4" opacity="0.35">
            <line x1="18" y1="14" x2="40" y2="30" /><line x1="40" y1="30" x2="64" y2="16" />
            <line x1="64" y1="16" x2="82" y2="34" /><line x1="40" y1="30" x2="28" y2="40" />
            <line x1="64" y1="16" x2="50" y2="8" />
          </g>
        </svg>
        <span
          v-for="(p, i) in [[18,14],[40,30],[64,16],[82,34],[28,40],[50,8]]"
          :key="i"
          class="ba-star"
          :style="{ left: p[0] + '%', top: p[1] * 2 + '%', animationDelay: i * 0.5 + 's' }"
        />
      </div>

      <!-- TABS — a strip fills in as the idea of tabbed browsing takes hold -->
      <div v-else-if="scene === 'tabs'" class="ba-tabs">
        <div class="ba-tabs__strip">
          <span v-for="i in range(7)" :key="i" class="ba-tabs__tab" :style="{ animationDelay: i * 0.45 + 's' }" />
        </div>
        <div class="ba-tabs__page" />
      </div>

      <!-- SIGNIN — identities funnel down into a single account -->
      <div v-else-if="scene === 'signin'" class="ba-signin">
        <span
          v-for="i in range(6)"
          :key="i"
          class="ba-id"
          :style="{ left: 12 + i * 13 + '%', animationDelay: i * 0.45 + 's' }"
        />
        <div class="ba-funnel" />
        <div class="ba-account">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="9" r="3.4" fill="currentColor" />
            <path d="M5 20c0-3.8 3.1-6 7-6s7 2.2 7 6" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
    <figcaption v-if="caption" class="ba-cap">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.blog-anim {
  margin: 2.75rem 0;
  border: 1px solid var(--ds-rule-soft);
  border-radius: var(--ds-radius-lg);
  background:
    radial-gradient(120% 80% at 50% 0%, var(--ds-accent-soft) 0%, transparent 55%),
    var(--ds-bg-soft);
  overflow: hidden;
  box-shadow: var(--ds-shadow-sm);
}

.ba-stage {
  position: relative;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  font-family: var(--ds-font-sans);
}

.ba-cap {
  margin: 0;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--ds-rule-soft);
  background: var(--ds-bg-card);
  color: var(--ds-ink-3);
  font-family: var(--ds-font-sans);
  font-size: 0.8rem;
  line-height: 1.45;
  text-align: center;
}

/* Shared atoms ----------------------------------------------------------- */
.ba-light {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ds-rule);
  flex: 0 0 auto;
}

/* ====================== VERSUS ====================== */
.ba-vs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.75rem, 4vw, 2rem);
  width: 100%;
}
.ba-vs__x {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ds-ink-4);
  letter-spacing: 0.04em;
}
.ba-win {
  width: clamp(120px, 32%, 200px);
  border: 1px solid var(--ds-rule);
  border-radius: var(--ds-radius-md);
  background: var(--ds-bg-card);
  box-shadow: var(--ds-shadow-sm);
  overflow: hidden;
}
.ba-win__bar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 10px;
  background: var(--ds-bg-muted);
  border-bottom: 1px solid var(--ds-rule-soft);
  position: relative;
}
.ba-tab {
  width: 26px;
  height: 9px;
  border-radius: 4px;
  background: var(--ds-rule);
}
.ba-tab--on {
  background: var(--ds-accent);
  margin-left: 4px;
}
.ba-win--busy .ba-tab--on {
  background: var(--ds-ink-3);
}
.ba-spark {
  margin-left: auto;
  font-size: 11px;
  line-height: 1;
  color: var(--ds-accent);
  animation: ba-twinkle 1.8s ease-in-out infinite;
}
.ba-badge {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ds-bad);
  animation: ba-pulse 1.4s ease-in-out infinite;
}
.ba-win__body {
  position: relative;
  height: 92px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ba-ring {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid var(--ds-accent);
  opacity: 0.6;
  animation: ba-breathe 3.4s ease-in-out infinite;
}
.ba-ping {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ds-ink-4);
  animation: ba-ripple 2s ease-out infinite;
}
.ba-ping:nth-child(1) { left: 28%; top: 34%; }
.ba-ping:nth-child(2) { left: 62%; top: 56%; }
.ba-ping:nth-child(3) { left: 44%; top: 22%; }
.ba-win__name {
  padding: 6px 10px 9px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ds-ink-2);
  text-align: center;
  border-top: 1px solid var(--ds-rule-soft);
}

/* ====================== SURVEILLANCE / WATCHING ====================== */
.ba-rain { position: absolute; inset: 0; }
.ba-drop {
  position: absolute;
  top: 0;
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--ds-ink-4);
  animation: ba-fall 2.4s linear infinite;
}
.ba-baseline {
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: 64px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--ds-accent), transparent);
  opacity: 0.7;
}
.ba-shield {
  position: absolute;
  left: 50%;
  bottom: 34px;
  width: 48px;
  height: 48px;
  margin-left: -24px;
  color: var(--ds-accent);
  animation: ba-breathe 3s ease-in-out infinite;
}
.ba-shield svg { width: 100%; height: 100%; }

/* ====================== COOKIES ====================== */
.ba-cookies {
  position: relative;
  width: min(360px, 100%);
  height: 100%;
}
.ba-banner {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--ds-rule);
  border-radius: var(--ds-radius-sm);
  background: var(--ds-bg-card);
  box-shadow: var(--ds-shadow-sm);
  animation: ba-stack 3.6s ease-in-out infinite;
}
.ba-banner__txt {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--ds-rule);
}
.ba-banner__btn {
  width: 56px;
  height: 18px;
  border-radius: 5px;
  background: var(--ds-accent);
  flex: 0 0 auto;
}

/* ====================== EXTENSIONS ====================== */
.ba-ext { position: absolute; inset: 0; }
.ba-ext__base {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 70px;
  height: 14px;
  border-radius: 7px;
  background: var(--ds-bg-muted);
  border: 1px solid var(--ds-rule);
}
.ba-puzzle {
  position: absolute;
  bottom: 66px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--ds-accent);
  opacity: 0.9;
  animation: ba-drop-in 3s ease-in-out infinite;
}
.ba-leak {
  position: absolute;
  bottom: 70px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ds-bad);
  animation: ba-seep 3s ease-in infinite;
}

/* ====================== INCOGNITO ====================== */
.ba-incog { position: absolute; inset: 0; }
.ba-mask {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 96px;
  height: 44px;
  margin: -22px 0 0 -48px;
  color: var(--ds-ink-2);
}
.ba-mask svg { width: 100%; height: 100%; }
.ba-escape {
  position: absolute;
  left: 50%;
  width: 7px;
  height: 7px;
  border-radius: 2px;
  background: var(--ds-bad);
  animation: ba-escape 2.6s ease-in infinite;
}

/* ====================== AI BLOAT ====================== */
.ba-ai {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
}
.ba-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--ds-rule);
  border-radius: var(--ds-radius-md);
  background: var(--ds-bg-card);
  box-shadow: var(--ds-shadow-sm);
}
.ba-tool {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}
.ba-tool--keep { background: var(--ds-bg-muted); border: 1px solid var(--ds-rule-soft); }
.ba-tool--ai {
  background: var(--ds-accent-soft);
  color: var(--ds-accent);
  animation: ba-vanish 4s ease-in-out infinite;
}
.ba-toolbar--clean { opacity: 0.9; }

/* ====================== QUIC ====================== */
.ba-quic {
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: min(420px, 100%);
}
.ba-lane {
  position: relative;
  height: 40px;
  border-radius: var(--ds-radius-sm);
  border: 1px dashed var(--ds-rule);
  background: var(--ds-bg-card);
  display: flex;
  align-items: center;
}
.ba-lane__tag {
  position: absolute;
  left: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--ds-ink-4);
  letter-spacing: 0.02em;
}
.ba-runner {
  position: absolute;
  left: 0;
  width: 16px;
  height: 16px;
  border-radius: 5px;
}
.ba-runner--slow { background: var(--ds-ink-4); animation: ba-race 4s cubic-bezier(0.5, 0, 0.7, 1) infinite; }
.ba-runner--fast { background: var(--ds-accent); animation: ba-race 2.2s cubic-bezier(0.2, 0.6, 0.3, 1) infinite; }

/* ====================== VPN ====================== */
.ba-vpn { position: relative; width: min(400px, 100%); }
.ba-tunnel {
  position: relative;
  height: 56px;
  border-radius: 28px;
  border: 2px solid var(--ds-accent);
  background: var(--ds-accent-soft);
  display: flex;
  align-items: center;
  overflow: hidden;
}
.ba-flow {
  position: absolute;
  top: 50%;
  margin-top: -4px;
  left: -10%;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--ds-accent);
  animation: ba-through 2.5s linear infinite;
}
.ba-lock {
  margin-left: auto;
  margin-right: 14px;
  width: 26px;
  height: 26px;
  color: var(--ds-accent);
  z-index: 1;
}
.ba-lock svg { width: 100%; height: 100%; }
.ba-eye {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--ds-ink-4);
  opacity: 0.55;
}
.ba-eye--l { left: 18%; top: -2px; }
.ba-eye--r { right: 24%; bottom: -2px; }

/* ====================== FINGERPRINT ====================== */
.ba-fp { position: relative; width: 120px; height: 120px; color: var(--ds-accent); }
.ba-fp svg { width: 100%; height: 100%; }
.ba-ridge {
  stroke-dasharray: 90;
  stroke-dashoffset: 90;
  animation: ba-trace 3.6s ease-in-out infinite;
}
.ba-ridge:nth-child(2) { animation-delay: 0.2s; }
.ba-ridge:nth-child(3) { animation-delay: 0.4s; }
.ba-ridge:nth-child(4) { animation-delay: 0.1s; }
.ba-ridge:nth-child(5) { animation-delay: 0.3s; }
.ba-ridge:nth-child(6) { animation-delay: 0.5s; }
.ba-signal {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ds-ink-4);
  top: 50%;
  left: 50%;
  animation: ba-converge 3s ease-in infinite;
}
.ba-signal:nth-child(2) { --bx: -70px; --by: -40px; }
.ba-signal:nth-child(3) { --bx: 72px; --by: -30px; }
.ba-signal:nth-child(4) { --bx: -64px; --by: 44px; }
.ba-signal:nth-child(5) { --bx: 68px; --by: 46px; }
.ba-signal:nth-child(6) { --bx: -84px; --by: 6px; }
.ba-signal:nth-child(7) { --bx: 84px; --by: 10px; }

/* ====================== PERMISSIONS ====================== */
.ba-perms { display: flex; flex-direction: column; gap: 12px; width: min(280px, 100%); }
.ba-perm {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 9px 12px;
  border: 1px solid var(--ds-rule-soft);
  border-radius: var(--ds-radius-sm);
  background: var(--ds-bg-card);
}
.ba-perm__label { flex: 1; height: 8px; border-radius: 4px; background: var(--ds-rule); }
.ba-switch {
  position: relative;
  width: 34px;
  height: 18px;
  border-radius: 9px;
  background: var(--ds-rule);
  flex: 0 0 auto;
  animation: ba-switch-bg 4s ease-in-out infinite;
}
.ba-switch__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--ds-bg-card);
  box-shadow: var(--ds-shadow-sm);
  animation: ba-switch-knob 4s ease-in-out infinite;
}

/* ====================== FLAGS ====================== */
.ba-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: min(320px, 100%);
  justify-content: center;
}
.ba-flag {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--ds-ink-4);
  background: var(--ds-bg-card);
  border: 1px solid var(--ds-rule-soft);
  animation: ba-flip 4s ease-in-out infinite;
}

/* ====================== STRIP / BLOAT ====================== */
.ba-strip, .ba-bloat { position: absolute; inset: 0; }
.ba-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 72px;
  height: 48px;
  margin: -24px 0 0 -36px;
  border-radius: var(--ds-radius-sm);
  background: var(--ds-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: var(--ds-shadow-sm);
}
.ba-core--grow { animation: ba-grow 4.2s ease-in-out infinite; }
.ba-chip {
  position: absolute;
  width: 40px;
  height: 16px;
  border-radius: 5px;
  background: var(--ds-ink-4);
  opacity: 0.85;
}
.ba-chip--out { animation: ba-peel 3.4s ease-in infinite; }
.ba-chip--in { animation: ba-accrete 3.6s ease-out infinite; }

/* ====================== PROCESSES ====================== */
.ba-proc { display: flex; gap: clamp(1rem, 6vw, 3rem); align-items: flex-end; }
.ba-proc__col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.ba-proc__field {
  width: 120px;
  height: 120px;
  border: 1px solid var(--ds-rule-soft);
  border-radius: var(--ds-radius-md);
  background: var(--ds-bg-card);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  padding: 12px;
  align-content: start;
}
.ba-proc__field--lean { align-content: center; justify-items: center; grid-template-columns: repeat(2, 1fr); }
.ba-node {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background: var(--ds-accent);
  animation: ba-pulse 2.6s ease-in-out infinite;
}
.ba-node--busy { background: var(--ds-ink-4); width: 11px; height: 11px; animation: ba-jitter 1.6s ease-in-out infinite; }
.ba-proc__name { font-size: 0.72rem; font-weight: 600; color: var(--ds-ink-2); }

/* ====================== CONSTELLATION ====================== */
.ba-const { position: relative; width: min(420px, 100%); height: 100%; }
.ba-const svg { position: absolute; inset: 0; width: 100%; height: 100%; color: var(--ds-accent); }
.ba-star {
  position: absolute;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  background: var(--ds-accent);
  box-shadow: 0 0 0 4px var(--ds-accent-soft);
  animation: ba-twinkle 3s ease-in-out infinite;
}

/* ====================== TABS ====================== */
.ba-tabs { width: min(360px, 100%); }
.ba-tabs__strip {
  display: flex;
  gap: 6px;
  padding: 8px 8px 0;
  border: 1px solid var(--ds-rule);
  border-bottom: none;
  border-radius: var(--ds-radius-sm) var(--ds-radius-sm) 0 0;
  background: var(--ds-bg-muted);
}
.ba-tabs__tab {
  flex: 1;
  height: 22px;
  border-radius: 6px 6px 0 0;
  background: var(--ds-bg-card);
  border: 1px solid var(--ds-rule-soft);
  border-bottom: none;
  transform-origin: bottom;
  animation: ba-tab-in 4.2s ease-in-out infinite;
}
.ba-tabs__page {
  height: 96px;
  border: 1px solid var(--ds-rule);
  border-radius: 0 0 var(--ds-radius-sm) var(--ds-radius-sm);
  background: var(--ds-bg-card);
}

/* ====================== SIGNIN ====================== */
.ba-signin { position: absolute; inset: 0; }
.ba-id {
  position: absolute;
  top: 16px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--ds-ink-4);
  animation: ba-funnel 3s ease-in infinite;
}
.ba-funnel {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 0;
  height: 0;
  margin-left: -40px;
  border-left: 40px solid transparent;
  border-right: 40px solid transparent;
  border-top: 34px solid var(--ds-rule-soft);
}
.ba-account {
  position: absolute;
  left: 50%;
  bottom: 30px;
  width: 40px;
  height: 40px;
  margin-left: -20px;
  color: var(--ds-accent);
}
.ba-account svg { width: 100%; height: 100%; }

/* ====================== KEYFRAMES ====================== */
@keyframes ba-twinkle {
  0%, 100% { opacity: 0.35; transform: scale(0.92); }
  50% { opacity: 1; transform: scale(1); }
}
@keyframes ba-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
@keyframes ba-breathe {
  0%, 100% { transform: scale(0.94); opacity: 0.55; }
  50% { transform: scale(1.06); opacity: 0.85; }
}
@keyframes ba-ripple {
  0% { transform: scale(0.6); opacity: 0.9; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes ba-fall {
  0% { transform: translateY(8px); opacity: 0; }
  18% { opacity: 0.9; }
  70% { transform: translateY(120px); opacity: 0.9; }
  86%, 100% { transform: translateY(142px); opacity: 0; }
}
@keyframes ba-stack {
  0% { transform: translateY(40px); opacity: 0; }
  16%, 70% { transform: translateY(0); opacity: 1; }
  84% { transform: translateY(-6px) scale(0.98); opacity: 0; }
  100% { transform: translateY(40px); opacity: 0; }
}
@keyframes ba-drop-in {
  0% { transform: translateY(-46px); opacity: 0; }
  24%, 84% { transform: translateY(0); opacity: 0.9; }
  100% { transform: translateY(0); opacity: 0.9; }
}
@keyframes ba-seep {
  0%, 30% { transform: translateY(0); opacity: 0; }
  55% { transform: translateY(26px); opacity: 0.85; }
  100% { transform: translateY(52px); opacity: 0; }
}
@keyframes ba-escape {
  0% { transform: translate(-50%, 0) scale(0.8); opacity: 0; }
  25% { opacity: 0.9; }
  100% { transform: translate(60px, 0) scale(1); opacity: 0; }
}
@keyframes ba-vanish {
  0%, 40% { transform: scale(1); opacity: 1; }
  70%, 100% { transform: scale(0.4); opacity: 0; }
}
@keyframes ba-race {
  0% { left: 0; }
  100% { left: calc(100% - 22px); }
}
@keyframes ba-through {
  0% { left: -6%; opacity: 0; }
  12% { opacity: 1; }
  82% { opacity: 1; }
  100% { left: 86%; opacity: 0; }
}
@keyframes ba-trace {
  0% { stroke-dashoffset: 90; }
  45%, 70% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 90; }
}
@keyframes ba-converge {
  0% { transform: translate(var(--bx, 0), var(--by, 0)); opacity: 0; }
  25% { opacity: 0.9; }
  100% { transform: translate(0, 0); opacity: 0; }
}
@keyframes ba-switch-bg {
  0%, 45% { background: var(--ds-rule); }
  55%, 100% { background: var(--ds-rule); }
  48%, 52% { background: var(--ds-accent); }
}
@keyframes ba-switch-knob {
  0%, 45%, 100% { transform: translateX(0); }
  55%, 95% { transform: translateX(0); }
}
@keyframes ba-flip {
  0%, 40% { color: var(--ds-ink-4); background: var(--ds-bg-card); transform: translateY(0); }
  55%, 90% { color: var(--ds-accent); background: var(--ds-accent-soft); transform: translateY(-3px); }
  100% { color: var(--ds-ink-4); background: var(--ds-bg-card); transform: translateY(0); }
}
@keyframes ba-peel {
  0%, 20% { transform: translate(0, 0); opacity: 0.85; }
  100% { transform: translate(var(--peel, -40px), -10px); opacity: 0; }
}
.ba-chip--out:nth-child(2) { --peel: -50px; }
.ba-chip--out:nth-child(3) { --peel: -36px; }
.ba-chip--out:nth-child(4) { --peel: -44px; }
.ba-chip--out:nth-child(5) { --peel: 54px; }
.ba-chip--out:nth-child(6) { --peel: 40px; }
.ba-chip--out:nth-child(7) { --peel: 50px; }
@keyframes ba-accrete {
  0% { transform: scale(0.4); opacity: 0; }
  30%, 100% { transform: scale(1); opacity: 0.85; }
}
@keyframes ba-grow {
  0%, 100% { transform: scale(0.92); }
  60% { transform: scale(1.08); }
}
@keyframes ba-jitter {
  0%, 100% { opacity: 0.45; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-2px); }
}
@keyframes ba-tab-in {
  0% { transform: scaleY(0.2); opacity: 0; }
  30%, 88% { transform: scaleY(1); opacity: 1; }
  100% { transform: scaleY(0.2); opacity: 0; }
}
@keyframes ba-funnel {
  0% { top: 16px; opacity: 0; }
  15% { opacity: 1; }
  55% { top: 46%; opacity: 1; left: 50%; margin-left: -6px; }
  80%, 100% { top: 64%; opacity: 0; left: 50%; margin-left: -6px; }
}

/* Resting state for reduced motion: hold a composed, legible frame. */
@media (prefers-reduced-motion: reduce) {
  .blog-anim * {
    animation: none !important;
  }
  .ba-ridge { stroke-dashoffset: 0; }
  .ba-drop, .ba-leak, .ba-escape, .ba-signal, .ba-id, .ba-flow { opacity: 0.6; }
  .ba-banner:not(:last-child) { display: none; }
  .ba-tool--ai { opacity: 1; }
}

/* Narrow screens */
@media (max-width: 520px) {
  .ba-stage { height: 200px; padding: 1rem; }
  .ba-win { width: 42%; }
}
</style>
