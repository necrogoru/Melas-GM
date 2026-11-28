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

const COMPACT_THRESHOLD = 6

const props = defineProps<MiniatureVillageProps>()

const skyMood = computed<SkyMood>(() => PHASE_SKY_MAP[props.phase])
const isLitScene = computed(() => skyMood.value === 'night' || skyMood.value === 'twilight')
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
        viewBox="0 0 640 260"
        preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient
            id="salem-lantern-glow"
            cx="50%"
            cy="50%"
            r="50%">
            <stop
              offset="0%"
              stop-color="#f7c868"
              stop-opacity="0.75" />

            <stop
              offset="100%"
              stop-color="#f7c868"
              stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Stars & Crescent Moon (visible in twilight/night) -->
        <g class="miniature-village__celestial">
          <circle
            cx="88"
            cy="36"
            r="1.4"
            fill="#f5efe6" />

          <circle
            cx="152"
            cy="54"
            r="1.1"
            fill="#f5efe6" />

          <circle
            cx="228"
            cy="28"
            r="1.6"
            fill="#f5efe6" />

          <circle
            cx="388"
            cy="40"
            r="1.3"
            fill="#f5efe6" />

          <circle
            cx="476"
            cy="26"
            r="1.5"
            fill="#f5efe6" />

          <circle
            cx="564"
            cy="52"
            r="1.2"
            fill="#f5efe6" />

          <path
            d="M524 38 A18 18 0 1 0 546 58 A14 14 0 1 1 524 38 Z"
            fill="#f2cf99" />
        </g>

        <!-- Distant colonial hills -->
        <path
          d="M0 198 Q140 152 290 184 T640 176 L640 260 L0 260 Z"
          fill="#1b1c18" />

        <path
          d="M0 212 Q180 182 360 202 T640 196 L640 260 L0 260 Z"
          fill="#24211b" />

        <!-- Left miniature house -->
        <g
          data-village-landmark="house"
          transform="translate(54 128)">
          <rect
            x="46"
            y="6"
            width="10"
            height="22"
            fill="#46372a" />

          <polygon
            points="0,36 42,8 84,36"
            fill="#3a2a1e" />

          <rect
            x="8"
            y="36"
            width="68"
            height="44"
            fill="#594737" />

          <rect
            x="34"
            y="54"
            width="14"
            height="26"
            fill="#2b2017" />

          <rect
            class="miniature-village__window"
            x="16"
            y="46"
            width="12"
            height="12"
            rx="1" />

          <rect
            class="miniature-village__window"
            x="56"
            y="46"
            width="12"
            height="12"
            rx="1" />
        </g>

        <!-- Center church steeple -->
        <g
          data-village-landmark="church-steeple"
          transform="translate(262 56)">
          <line
            x1="58"
            y1="0"
            x2="58"
            y2="18"
            stroke="#cbb999"
            stroke-width="2" />

          <line
            x1="52"
            y1="6"
            x2="64"
            y2="6"
            stroke="#cbb999"
            stroke-width="2" />

          <polygon
            points="44,54 58,14 72,54"
            fill="#322c26" />

          <rect
            x="44"
            y="54"
            width="28"
            height="36"
            fill="#dcd1be" />

          <polygon
            points="10,96 58,70 106,96"
            fill="#3a2c22" />

          <rect
            x="18"
            y="96"
            width="80"
            height="58"
            fill="#cfc2ad" />

          <path
            d="M48 154 L48 124 C48 116, 68 116, 68 124 L68 154 Z"
            fill="#3a2a1e" />

          <path
            class="miniature-village__window"
            d="M52 78 L52 66 C52 61, 64 61, 64 66 L64 78 Z" />

          <rect
            class="miniature-village__window"
            x="28"
            y="108"
            width="12"
            height="18"
            rx="6" />

          <rect
            class="miniature-village__window"
            x="76"
            y="108"
            width="12"
            height="18"
            rx="6" />
        </g>

        <!-- Right miniature house -->
        <g
          data-village-landmark="house"
          transform="translate(474 134)">
          <rect
            x="20"
            y="2"
            width="10"
            height="22"
            fill="#46372a" />

          <polygon
            points="0,34 46,6 92,34"
            fill="#32241a" />

          <rect
            x="10"
            y="34"
            width="72"
            height="42"
            fill="#4f3e30" />

          <rect
            x="40"
            y="52"
            width="14"
            height="24"
            fill="#2b2017" />

          <rect
            class="miniature-village__window"
            x="20"
            y="44"
            width="12"
            height="12"
            rx="1" />

          <rect
            class="miniature-village__window"
            x="62"
            y="44"
            width="12"
            height="12"
            rx="1" />
        </g>

        <!-- Town lanterns -->
        <g
          data-village-landmark="lantern"
          transform="translate(184 166)">
          <circle
            class="miniature-village__lantern-glow"
            cx="6"
            cy="8"
            r="24"
            fill="url(#salem-lantern-glow)" />

          <rect
            x="4"
            y="12"
            width="4"
            height="36"
            fill="#26211c" />

          <rect
            x="1"
            y="4"
            width="10"
            height="10"
            rx="2"
            fill="#f2cf99" />
        </g>

        <g
          data-village-landmark="lantern"
          transform="translate(432 166)">
          <circle
            class="miniature-village__lantern-glow"
            cx="6"
            cy="8"
            r="24"
            fill="url(#salem-lantern-glow)" />

          <rect
            x="4"
            y="12"
            width="4"
            height="36"
            fill="#26211c" />

          <rect
            x="1"
            y="4"
            width="10"
            height="10"
            rx="2"
            fill="#f2cf99" />
        </g>

        <!-- Village cobblestone ground -->
        <rect
          x="0"
          y="206"
          width="640"
          height="54"
          fill="#241e18" />

        <line
          x1="0"
          y1="206"
          x2="640"
          y2="206"
          stroke="#3b3127"
          stroke-width="2" />
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
  border-radius: var(--sal-radius-lg);
  border: 1px solid var(--sal-border-subtle);
  overflow: hidden;
  background-color: var(--sal-surface-base);
  box-shadow: var(--sal-shadow-card);
  transition: background-color 600ms ease, border-color 600ms ease;
}

.miniature-village--twilight {
  background: linear-gradient(180deg, #1b2232 0%, #3a2d38 56%, #241e18 100%);
}

.miniature-village--dawn {
  background: linear-gradient(180deg, #2d2940 0%, #8a4b38 52%, #c98a32 82%, #241e18 100%);
}

.miniature-village--day {
  background: linear-gradient(180deg, #566b7c 0%, #8b9aa3 58%, #3c362e 100%);
}

.miniature-village--night {
  background: linear-gradient(180deg, #0b0e17 0%, #141a29 58%, #1c1815 100%);
}

.miniature-village__sky {
  position: relative;
  width: 100%;
  min-height: 168px;
}

.miniature-village__backdrop {
  display: block;
  width: 100%;
  height: auto;
  max-height: 240px;
}

.miniature-village__celestial {
  opacity: 0;
  transition: opacity 600ms ease;
}

.miniature-village.is-lit .miniature-village__celestial {
  opacity: 1;
}

.miniature-village__window {
  fill: #2c241d;
  transition: fill 500ms ease;
}

.miniature-village.is-lit .miniature-village__window,
.miniature-village--dawn .miniature-village__window {
  fill: #e8b454;
}

.miniature-village__lantern-glow {
  opacity: 0.15;
  transition: opacity 500ms ease;
}

.miniature-village.is-lit .miniature-village__lantern-glow {
  opacity: 0.95;
  animation: village-lantern-pulse 3.2s ease-in-out infinite;
}

.miniature-village__square {
  position: relative;
  padding: var(--sal-space-3) var(--sal-space-4) var(--sal-space-4);
  background-color: var(--sal-surface-base);
  border-top: 1px solid var(--sal-border-subtle);
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
    opacity: 0.78;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .miniature-village.is-lit .miniature-village__lantern-glow {
    animation: none;
  }
}
</style>
