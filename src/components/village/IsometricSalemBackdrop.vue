<script setup lang="ts">
import { computed } from 'vue'
import type { GamePhase } from '@/types/game'

export interface IsometricSalemBackdropProps {
  phase: GamePhase
}

type SkyMood = 'twilight' | 'dawn' | 'day' | 'night'

interface PixelRect {
  x: number
  y: number
  w: number
  h: number
  fill: string
  opacity?: number
}

interface EmberParticle {
  id: number
  x: number
  y: number
  size: number
  delay: string
  duration: string
  fill: string
}

const PHASE_SKY_MAP: Record<GamePhase, SkyMood> = {
  lobby: 'twilight',
  gathering: 'twilight',
  dawn: 'dawn',
  day: 'day',
  'night-witches': 'night',
  'night-constable': 'night',
  'night-confession': 'night',
  reveal: 'day'
}

const SKY_BANDS: Record<SkyMood, readonly string[]> = {
  twilight: ['#121522', '#1a1e2e', '#262332', '#35272d', '#241c17'],
  dawn: ['#1f1d30', '#482d32', '#7e4332', '#b57331', '#2b2018'],
  day: ['#3d5163', '#52687a', '#6b808f', '#83949e', '#342c24'],
  night: ['#080a11', '#0e121d', '#141926', '#191d28', '#14110f']
}

const STARS: ReadonlyArray<{ x: number; y: number; fill: string }> = [
  { x: 26, y: 14, fill: '#f5efe6' },
  { x: 58, y: 24, fill: '#d8cfb8' },
  { x: 94, y: 11, fill: '#f5efe6' },
  { x: 142, y: 20, fill: '#f2cf99' },
  { x: 186, y: 12, fill: '#f5efe6' },
  { x: 224, y: 26, fill: '#d8cfb8' },
  { x: 268, y: 15, fill: '#f5efe6' },
  { x: 298, y: 28, fill: '#f2cf99' }
]

const EMBER_PARTICLES: readonly EmberParticle[] = [
  { id: 1, x: 48, y: 128, size: 2, delay: '0s', duration: '6.5s', fill: '#f3c15a' },
  { id: 2, x: 92, y: 140, size: 1, delay: '1.4s', duration: '7.2s', fill: '#e0893e' },
  { id: 3, x: 134, y: 132, size: 2, delay: '2.8s', duration: '8s', fill: '#f3c15a' },
  { id: 4, x: 188, y: 138, size: 1, delay: '0.8s', duration: '6.8s', fill: '#f2cf99' },
  { id: 5, x: 236, y: 126, size: 2, delay: '3.4s', duration: '7.6s', fill: '#e0893e' },
  { id: 6, x: 274, y: 142, size: 1, delay: '2.1s', duration: '6.2s', fill: '#f3c15a' }
]

function isoDiamondPoints(cx: number, cy: number, halfW: number, halfH: number): string {
  return [
    `${String(cx)},${String(cy - halfH)}`,
    `${String(cx + halfW)},${String(cy)}`,
    `${String(cx)},${String(cy + halfH)}`,
    `${String(cx - halfW)},${String(cy)}`
  ].join(' ')
}

// Generate an isometric cobblestone diamond grid for the lower diorama plane
const COBBLESTONE_TILES: readonly string[] = (() => {
  const tiles: string[] = []
  const tileW = 16
  const tileH = 8
  for (let row = 0; row < 10; row++) {
    const yBase = 112 + row * tileH
    const xOffset = row % 2 === 0 ? 0 : tileW / 2
    for (let col = -1; col < 21; col++) {
      tiles.push(isoDiamondPoints(col * tileW + xOffset, yBase, tileW / 2, tileH / 2))
    }
  }
  return tiles
})()

const HEARTH_FLAMES: readonly PixelRect[] = [
  { x: 158, y: 122, w: 4, h: 4, fill: '#c95b2b' },
  { x: 159, y: 120, w: 2, h: 4, fill: '#f3c15a' },
  { x: 157, y: 125, w: 6, h: 2, fill: '#4e3c2e' }
]

const props = defineProps<IsometricSalemBackdropProps>()

const skyMood = computed<SkyMood>(() => PHASE_SKY_MAP[props.phase])
const isLitScene = computed(() => skyMood.value === 'night' || skyMood.value === 'twilight')
const skyBands = computed(() => SKY_BANDS[skyMood.value])
</script>

<template>
  <div
    :class="[
      'isometric-backdrop',
      `isometric-backdrop--${skyMood}`,
      { 'is-lit': isLitScene }
    ]"
    :data-backdrop-sky="skyMood"
    aria-hidden="true">
    <svg
      class="isometric-backdrop__svg"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      shape-rendering="crispEdges">
      <!-- Stepped pixel sky bands -->
      <rect
        x="0"
        y="0"
        width="320"
        height="26"
        :fill="skyBands[0]" />

      <rect
        x="0"
        y="26"
        width="320"
        height="24"
        :fill="skyBands[1]" />

      <rect
        x="0"
        y="50"
        width="320"
        height="24"
        :fill="skyBands[2]" />

      <rect
        x="0"
        y="74"
        width="320"
        height="24"
        :fill="skyBands[3]" />

      <rect
        x="0"
        y="98"
        width="320"
        height="82"
        :fill="skyBands[4]" />

      <!-- Stars & pixel crescent moon -->
      <g class="isometric-backdrop__celestial">
        <rect
          v-for="(star, idx) in STARS"
          :key="idx"
          :x="star.x"
          :y="star.y"
          width="1"
          height="1"
          :fill="star.fill" />

        <rect
          x="252"
          y="16"
          width="6"
          height="8"
          fill="#f2cf99" />

        <rect
          x="254"
          y="17"
          width="5"
          height="6"
          :fill="skyBands[0]" />
      </g>

      <!-- Distant pixel pine ridge -->
      <polygon
        points="0,104 28,90 52,100 84,86 116,98 148,88 182,99 216,85 248,96 286,87 320,100 320,112 0,112"
        fill="#191b16" />

      <polygon
        points="0,108 40,98 78,106 122,95 168,104 210,94 260,103 300,96 320,104 320,114 0,114"
        fill="#211d18" />

      <!-- Isometric cobblestone ground plane -->
      <g class="isometric-backdrop__cobbles">
        <rect
          x="0"
          y="108"
          width="320"
          height="72"
          fill="#1b1713" />

        <polygon
          v-for="(points, idx) in COBBLESTONE_TILES"
          :key="idx"
          :points="points"
          fill="#241e18"
          stroke="#15120e"
          stroke-width="0.6" />
      </g>

      <!-- Isometric timber meetinghouse (left-background) -->
      <g class="isometric-backdrop__meetinghouse">
        <!-- Spire cross -->
        <rect
          x="55"
          y="34"
          width="2"
          height="10"
          fill="#cbb999" />

        <rect
          x="52"
          y="37"
          width="8"
          height="2"
          fill="#cbb999" />

        <!-- Steeple pyramid -->
        <polygon
          points="56,42 46,60 56,64"
          fill="#2d2620" />

        <polygon
          points="56,42 66,60 56,64"
          fill="#3d342c" />

        <!-- Belfry -->
        <polygon
          points="46,60 56,64 56,78 46,74"
          fill="#cfc2ad" />

        <polygon
          points="56,64 66,60 66,74 56,78"
          fill="#b3a48d" />

        <!-- Main hall isometric roof -->
        <polygon
          points="56,68 30,82 56,94"
          fill="#35271d" />

        <polygon
          points="56,68 82,82 56,94"
          fill="#4a3729" />

        <!-- Main hall walls -->
        <polygon
          points="32,82 56,94 56,118 32,106"
          fill="#bdb09a" />

        <polygon
          points="56,94 80,82 80,106 56,118"
          fill="#9e907b" />

        <!-- Timber framing & lit windows -->
        <rect
          x="40"
          y="92"
          width="4"
          height="7"
          class="isometric-backdrop__window" />

        <rect
          x="64"
          y="92"
          width="4"
          height="7"
          class="isometric-backdrop__window" />
      </g>

      <!-- Isometric colonial timber cottage (right-background) -->
      <g class="isometric-backdrop__cottage">
        <!-- Chimney -->
        <rect
          x="252"
          y="64"
          width="6"
          height="14"
          fill="#4a3a2d" />

        <!-- Isometric gable roof -->
        <polygon
          points="258,70 234,84 258,96"
          fill="#2f2218" />

        <polygon
          points="258,70 282,84 258,96"
          fill="#433124" />

        <!-- Timber walls -->
        <polygon
          points="236,84 258,96 258,118 236,106"
          fill="#594737" />

        <polygon
          points="258,96 280,84 280,106 258,118"
          fill="#433428" />

        <!-- Lit cottage windows -->
        <rect
          x="244"
          y="94"
          width="4"
          height="5"
          class="isometric-backdrop__window" />

        <rect
          x="266"
          y="94"
          width="4"
          height="5"
          class="isometric-backdrop__window" />
      </g>

      <!-- Glowing square hearth & lanterns -->
      <g class="isometric-backdrop__hearth">
        <rect
          x="151"
          y="115"
          width="18"
          height="16"
          class="isometric-backdrop__glow"
          fill="#f7c868"
          opacity="0.18" />

        <rect
          v-for="(px, idx) in HEARTH_FLAMES"
          :key="idx"
          :x="px.x"
          :y="px.y"
          :width="px.w"
          :height="px.h"
          :fill="px.fill" />
      </g>

      <g class="isometric-backdrop__lantern">
        <rect
          x="104"
          y="108"
          width="2"
          height="14"
          fill="#26211c" />

        <rect
          x="103"
          y="105"
          width="4"
          height="4"
          fill="#f2cf99" />

        <rect
          x="212"
          y="108"
          width="2"
          height="14"
          fill="#26211c" />

        <rect
          x="211"
          y="105"
          width="4"
          height="4"
          fill="#f2cf99" />
      </g>

      <!-- Drifting pixel embers / fireflies -->
      <g class="isometric-backdrop__embers">
        <rect
          v-for="ember in EMBER_PARTICLES"
          :key="ember.id"
          class="isometric-backdrop__ember"
          :x="ember.x"
          :y="ember.y"
          :width="ember.size"
          :height="ember.size"
          :fill="ember.fill"
          :style="{
            animationDelay: ember.delay,
            animationDuration: ember.duration
          }" />
      </g>
    </svg>

    <div class="isometric-backdrop__vignette" />
  </div>
</template>

<style scoped>
.isometric-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--sal-z-backdrop);
  pointer-events: none;
  overflow: hidden;
  background-color: var(--sal-bg-night);
}

.isometric-backdrop__svg {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0.72;
}

.isometric-backdrop__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 35%,
    transparent 30%,
    var(--sal-bg-night) 95%
  );
}

.isometric-backdrop__celestial {
  opacity: 0;
  transition: opacity 500ms ease;
}

.isometric-backdrop.is-lit .isometric-backdrop__celestial {
  opacity: 1;
}

.isometric-backdrop__window {
  fill: var(--sal-surface-elevated);
  transition: fill 450ms ease;
}

.isometric-backdrop.is-lit .isometric-backdrop__window,
.isometric-backdrop--dawn .isometric-backdrop__window {
  fill: var(--sal-accent-primary-hover);
}

.isometric-backdrop__glow {
  opacity: 0.12;
  transition: opacity 450ms ease;
}

.isometric-backdrop.is-lit .isometric-backdrop__glow {
  opacity: 0.24;
  animation: backdrop-hearth-flicker 3s ease-in-out infinite;
}

.isometric-backdrop__ember {
  opacity: 0;
  animation-name: backdrop-ember-drift;
  animation-timing-function: steps(8, end);
  animation-iteration-count: infinite;
}

@keyframes backdrop-hearth-flicker {
  0%,
  100% {
    opacity: 0.18;
  }
  50% {
    opacity: 0.28;
  }
}

@keyframes backdrop-ember-drift {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0);
  }
  20% {
    opacity: 0.75;
  }
  80% {
    opacity: 0.45;
  }
  100% {
    opacity: 0;
    transform: translate3d(6px, -32px, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .isometric-backdrop.is-lit .isometric-backdrop__glow,
  .isometric-backdrop__ember {
    animation: none;
  }
}
</style>
