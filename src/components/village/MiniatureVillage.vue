<script setup lang="ts">
import { computed } from 'vue'
import VillagerSprite from '@/components/village/VillagerSprite.vue'
import type { GamePhase, Player } from '@/types/game'

export interface MiniatureVillageProps {
  players: Player[]
  phase: GamePhase
}

type SkyMood = 'twilight' | 'dawn' | 'day' | 'night'

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
  twilight: ['#151a28', '#222233', '#332934', '#241e18'],
  dawn: ['#262338', '#683933', '#b37130', '#2b2018'],
  day: ['#465b6c', '#637988', '#83959f', '#362f28'],
  night: ['#0a0d15', '#101522', '#171c29', '#191512']
}

const STARS: ReadonlyArray<{ x: number; y: number; fill: string }> = [
  { x: 38, y: 14, fill: '#f5efe6' },
  { x: 74, y: 24, fill: '#d8cfb8' },
  { x: 112, y: 12, fill: '#f5efe6' },
  { x: 196, y: 18, fill: '#f2cf99' },
  { x: 238, y: 11, fill: '#f5efe6' },
  { x: 282, y: 22, fill: '#d8cfb8' }
]

function isoDiamondPoints(cx: number, cy: number, halfW: number, halfH: number): string {
  return [
    `${String(cx)},${String(cy - halfH)}`,
    `${String(cx + halfW)},${String(cy)}`,
    `${String(cx)},${String(cy + halfH)}`,
    `${String(cx - halfW)},${String(cy)}`
  ].join(' ')
}

const PLAZA_TILES: readonly string[] = (() => {
  const tiles: string[] = []
  const tileW = 16
  const tileH = 8
  for (let row = 0; row < 4; row++) {
    const yBase = 104 + row * tileH
    const xOffset = row % 2 === 0 ? 0 : tileW / 2
    for (let col = -1; col < 21; col++) {
      tiles.push(isoDiamondPoints(col * tileW + xOffset, yBase, tileW / 2, tileH / 2))
    }
  }
  return tiles
})()

const COMPACT_THRESHOLD = 6

const props = defineProps<MiniatureVillageProps>()

const skyMood = computed<SkyMood>(() => PHASE_SKY_MAP[props.phase])
const isLitScene = computed(() => skyMood.value === 'night' || skyMood.value === 'twilight')
const skyBands = computed(() => SKY_BANDS[skyMood.value])
const spriteSize = computed(() => (props.players.length > COMPACT_THRESHOLD ? 'sm' : 'md'))

function spriteDelay(index: number): string {
  return `${String((index % 5) * 0.35)}s`
}
</script>

<template>
  <section
    :class="[
      'miniature-village',
      `miniature-village--${skyMood}`,
      { 'is-lit': isLitScene }
    ]"
    :data-sky="skyMood"
    aria-label="Aldea de Salem 1692">
    <div
      class="miniature-village__sky"
      aria-hidden="true">
      <svg
        class="miniature-village__backdrop"
        viewBox="0 0 320 130"
        preserveAspectRatio="xMidYMax slice"
        shape-rendering="crispEdges">
        <!-- Stepped pixel sky bands -->
        <rect
          x="0"
          y="0"
          width="320"
          height="24"
          :fill="skyBands[0]" />

        <rect
          x="0"
          y="24"
          width="320"
          height="24"
          :fill="skyBands[1]" />

        <rect
          x="0"
          y="48"
          width="320"
          height="28"
          :fill="skyBands[2]" />

        <rect
          x="0"
          y="76"
          width="320"
          height="54"
          :fill="skyBands[3]" />

        <!-- Stars & pixel crescent moon (visible in twilight/night) -->
        <g class="miniature-village__celestial">
          <rect
            v-for="(star, idx) in STARS"
            :key="idx"
            :x="star.x"
            :y="star.y"
            width="1"
            height="1"
            :fill="star.fill" />

          <rect
            x="262"
            y="14"
            width="7"
            height="9"
            fill="#f2cf99" />

          <rect
            x="264"
            y="15"
            width="6"
            height="7"
            :fill="skyBands[0]" />
        </g>

        <!-- Distant colonial hills -->
        <polygon
          points="0,96 42,80 94,90 144,78 202,88 260,77 320,89 320,104 0,104"
          fill="#1b1c18" />

        <polygon
          points="0,102 68,90 132,99 196,88 266,97 320,92 320,106 0,106"
          fill="#24211b" />

        <!-- Isometric cobblestone ground -->
        <rect
          x="0"
          y="100"
          width="320"
          height="30"
          fill="#211c16" />

        <polygon
          v-for="(points, idx) in PLAZA_TILES"
          :key="idx"
          :points="points"
          fill="#29221b"
          stroke="#191410"
          stroke-width="0.6" />

        <!-- Left isometric house -->
        <g
          data-village-landmark="house"
          transform="translate(24 58)">
          <!-- Chimney -->
          <rect
            x="24"
            y="2"
            width="5"
            height="12"
            fill="#46372a" />

          <!-- Isometric roof -->
          <polygon
            points="22,6 0,20 22,30"
            fill="#32241a" />

          <polygon
            points="22,6 44,20 22,30"
            fill="#483426" />

          <!-- Isometric walls -->
          <polygon
            points="2,20 22,30 22,50 2,40"
            fill="#5c4938" />

          <polygon
            points="22,30 42,20 42,40 22,50"
            fill="#47372a" />

          <!-- Door & lit windows -->
          <rect
            x="10"
            y="32"
            width="5"
            height="10"
            fill="#2b2017" />

          <rect
            class="miniature-village__window"
            x="28"
            y="30"
            width="5"
            height="5" />

          <rect
            class="miniature-village__window"
            x="35"
            y="27"
            width="4"
            height="5" />
        </g>

        <!-- Center isometric church steeple -->
        <g
          data-village-landmark="church-steeple"
          transform="translate(124 22)">
          <!-- Steeple cross -->
          <rect
            x="35"
            y="0"
            width="2"
            height="10"
            fill="#cbb999" />

          <rect
            x="32"
            y="3"
            width="8"
            height="2"
            fill="#cbb999" />

          <!-- Steeple pyramid -->
          <polygon
            points="36,8 27,26 36,30"
            fill="#2d2620" />

          <polygon
            points="36,8 45,26 36,30"
            fill="#3f362e" />

          <!-- Belfry -->
          <polygon
            points="27,26 36,30 36,44 27,40"
            fill="#dcd1be" />

          <polygon
            points="36,30 45,26 45,40 36,44"
            fill="#bfb19b" />

          <rect
            class="miniature-village__window"
            x="30"
            y="31"
            width="4"
            height="6" />

          <!-- Hall isometric roof -->
          <polygon
            points="36,36 8,52 36,64"
            fill="#35271d" />

          <polygon
            points="36,36 64,52 36,64"
            fill="#4b382a" />

          <!-- Hall isometric walls -->
          <polygon
            points="10,52 36,64 36,88 10,76"
            fill="#cfc2ad" />

          <polygon
            points="36,64 62,52 62,76 36,88"
            fill="#b3a48d" />

          <!-- Main door & windows -->
          <rect
            x="20"
            y="66"
            width="7"
            height="14"
            fill="#3a2a1e" />

          <rect
            class="miniature-village__window"
            x="43"
            y="64"
            width="5"
            height="8" />

          <rect
            class="miniature-village__window"
            x="52"
            y="60"
            width="5"
            height="8" />
        </g>

        <!-- Right isometric house -->
        <g
          data-village-landmark="house"
          transform="translate(244 60)">
          <!-- Chimney -->
          <rect
            x="14"
            y="0"
            width="5"
            height="12"
            fill="#46372a" />

          <!-- Isometric roof -->
          <polygon
            points="24,6 2,20 24,30"
            fill="#32241a" />

          <polygon
            points="24,6 46,20 24,30"
            fill="#483426" />

          <!-- Isometric walls -->
          <polygon
            points="4,20 24,30 24,50 4,40"
            fill="#524032" />

          <polygon
            points="24,30 44,20 44,40 24,50"
            fill="#3e3024" />

          <!-- Door & lit windows -->
          <rect
            x="30"
            y="32"
            width="5"
            height="10"
            fill="#2b2017" />

          <rect
            class="miniature-village__window"
            x="9"
            y="27"
            width="4"
            height="5" />

          <rect
            class="miniature-village__window"
            x="16"
            y="30"
            width="5"
            height="5" />
        </g>

        <!-- Town lanterns -->
        <g
          data-village-landmark="lantern"
          transform="translate(94 82)">
          <rect
            class="miniature-village__lantern-glow"
            x="-4"
            y="-4"
            width="14"
            height="14"
            fill="#f7c868" />

          <rect
            x="2"
            y="6"
            width="2"
            height="18"
            fill="#26211c" />

          <rect
            x="0"
            y="1"
            width="6"
            height="6"
            fill="#f2cf99" />
        </g>

        <g
          data-village-landmark="lantern"
          transform="translate(214 82)">
          <rect
            class="miniature-village__lantern-glow"
            x="-4"
            y="-4"
            width="14"
            height="14"
            fill="#f7c868" />

          <rect
            x="2"
            y="6"
            width="2"
            height="18"
            fill="#26211c" />

          <rect
            x="0"
            y="1"
            width="6"
            height="6"
            fill="#f2cf99" />
        </g>
      </svg>
    </div>

    <div class="miniature-village__square">
      <ul
        v-if="players.length > 0"
        class="miniature-village__villagers">
        <li
          v-for="(player, index) in players"
          :key="player.id"
          class="miniature-village__slot">
          <VillagerSprite
            :character-id="player.characterId"
            :player-name="player.name"
            :size="spriteSize"
            :animation-delay="spriteDelay(index)" />
        </li>
      </ul>

      <p
        v-else
        class="miniature-village__empty">
        La plaza de Salem aguarda a los aldeanos.
      </p>
    </div>
  </section>
</template>

<style scoped>
.miniature-village {
  position: relative;
  border-radius: var(--sal-radius-pixel);
  border: var(--sal-border-width-step) solid var(--sal-border-hud);
  overflow: hidden;
  background-color: var(--sal-surface-panel);
  box-shadow: var(--sal-shadow-bevel), var(--sal-shadow-pixel-md);
  transition: background-color 500ms ease, border-color 500ms ease;
}

.miniature-village__sky {
  position: relative;
  width: 100%;
  min-height: 140px;
}

.miniature-village__backdrop {
  display: block;
  width: 100%;
  height: auto;
  max-height: 220px;
}

.miniature-village__celestial {
  opacity: 0;
  transition: opacity 500ms ease;
}

.miniature-village.is-lit .miniature-village__celestial {
  opacity: 1;
}

.miniature-village__window {
  fill: var(--sal-surface-elevated);
  transition: fill 450ms ease;
}

.miniature-village.is-lit .miniature-village__window,
.miniature-village--dawn .miniature-village__window {
  fill: var(--sal-accent-primary-hover);
}

.miniature-village__lantern-glow {
  opacity: 0.08;
  transition: opacity 450ms ease;
}

.miniature-village.is-lit .miniature-village__lantern-glow {
  opacity: 0.32;
  animation: village-lantern-pulse 3.2s ease-in-out infinite;
}

.miniature-village__square {
  position: relative;
  padding: var(--sal-space-3) var(--sal-space-4) var(--sal-space-4);
  background-color: var(--sal-surface-base);
  border-top: var(--sal-border-width-step) solid var(--sal-border-hud);
  box-shadow: var(--sal-shadow-pixel-inset);
}

.miniature-village__villagers {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
  gap: var(--sal-space-3);
}

.miniature-village__slot {
  display: flex;
  justify-content: center;
}

.miniature-village__empty {
  margin: 0;
  padding: var(--sal-space-4) 0;
  text-align: center;
  color: var(--sal-text-secondary);
  font-size: var(--sal-font-size-sm);
}

@keyframes village-lantern-pulse {
  0%,
  100% {
    opacity: 0.24;
  }
  50% {
    opacity: 0.42;
  }
}

@media (prefers-reduced-motion: reduce) {
  .miniature-village.is-lit .miniature-village__lantern-glow {
    animation: none;
  }
}
</style>
