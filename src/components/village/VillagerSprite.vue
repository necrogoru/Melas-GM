<script setup lang="ts">
import { computed } from 'vue'
import SalBadge from '@/components/sal-ui/SalBadge.vue'
import { SALEM_CHARACTERS } from '@/data/characters'
import type { CharacterId } from '@/types/game'

export interface VillagerSpriteProps {
  characterId: CharacterId
  playerName?: string
  alive?: boolean
  hasBlackCat?: boolean
  size?: 'sm' | 'md' | 'lg'
  animationDelay?: string
}

type HatStyle =
  | 'coif'
  | 'tall-buckle'
  | 'wide-brim'
  | 'farmer-hat'
  | 'tricorne'
  | 'bonnet'
  | 'kerchief'
  | 'pleated-cap'
  | 'clerical'
  | 'hood'
  | 'headwrap'
  | 'governor-tricorne'

type PropStyle =
  | 'pointing'
  | 'book'
  | 'lantern'
  | 'pitchfork'
  | 'tankard'
  | 'beads'
  | 'broom'
  | 'cane'
  | 'quill'
  | 'pipe'
  | 'vial'
  | 'seal'

interface CharacterVisual {
  hat: HatStyle
  prop: PropStyle
  coat: string
  trim: string
  skin: string
  hair: string
}

const CHARACTER_VISUALS: Record<CharacterId, CharacterVisual> = {
  'abigail-williams': {
    hat: 'coif',
    prop: 'pointing',
    coat: '#6e2323',
    trim: '#f0e4ce',
    skin: '#efd1b8',
    hair: '#4a2c1d'
  },
  'cotton-mather': {
    hat: 'tall-buckle',
    prop: 'book',
    coat: '#263442',
    trim: '#f3ede0',
    skin: '#ebd0b9',
    hair: '#5c4632'
  },
  'george-burroughs': {
    hat: 'wide-brim',
    prop: 'lantern',
    coat: '#344431',
    trim: '#d8cbb4',
    skin: '#e3bfa2',
    hair: '#3b2b20'
  },
  'giles-corey': {
    hat: 'farmer-hat',
    prop: 'pitchfork',
    coat: '#5a412a',
    trim: '#c8b496',
    skin: '#dfb898',
    hair: '#8a8278'
  },
  'john-proctor': {
    hat: 'tricorne',
    prop: 'tankard',
    coat: '#48382b',
    trim: '#d9c8ae',
    skin: '#e4be9f',
    hair: '#3a2719'
  },
  'martha-corey': {
    hat: 'bonnet',
    prop: 'beads',
    coat: '#4e3750',
    trim: '#efe6d5',
    skin: '#ebd0ba',
    hair: '#6e5c4f'
  },
  'mary-warren': {
    hat: 'kerchief',
    prop: 'broom',
    coat: '#664f33',
    trim: '#f2e8d7',
    skin: '#f0d3bc',
    hair: '#785032'
  },
  'rebecca-nurse': {
    hat: 'pleated-cap',
    prop: 'cane',
    coat: '#2c4641',
    trim: '#f3ead9',
    skin: '#ead0ba',
    hair: '#b9b2a8'
  },
  'samuel-parris': {
    hat: 'clerical',
    prop: 'quill',
    coat: '#252834',
    trim: '#f5efe2',
    skin: '#e6c8b0',
    hair: '#4b3b2c'
  },
  'sarah-good': {
    hat: 'hood',
    prop: 'pipe',
    coat: '#4f3f36',
    trim: '#b8a894',
    skin: '#d9b597',
    hair: '#5e5248'
  },
  tituba: {
    hat: 'headwrap',
    prop: 'vial',
    coat: '#442d48',
    trim: '#d49e46',
    skin: '#9d6b4c',
    hair: '#221712'
  },
  'william-phips': {
    hat: 'governor-tricorne',
    prop: 'seal',
    coat: '#594420',
    trim: '#e4be6a',
    skin: '#e8c7ab',
    hair: '#695849'
  }
}

const HAT_PATHS: Record<HatStyle, string> = {
  coif: 'M27 29 C27 17, 53 17, 53 29 L51 35 L29 35 Z',
  'tall-buckle': 'M21 30 L59 30 L59 33 L21 33 Z M29 14 L51 14 L53 30 L27 30 Z',
  'wide-brim': 'M18 30 L62 30 L62 33 L18 33 Z M28 19 C28 15, 52 15, 52 19 L53 30 L27 30 Z',
  'farmer-hat': 'M16 31 Q40 26 64 31 L62 34 Q40 30 18 34 Z M29 20 L51 20 L52 30 L28 30 Z',
  tricorne: 'M20 31 L40 20 L60 31 L54 34 L26 34 Z',
  bonnet: 'M25 32 C24 16, 56 16, 55 32 L52 38 L28 38 Z',
  kerchief: 'M26 28 Q40 16 54 28 L56 36 L40 31 L24 36 Z',
  'pleated-cap': 'M25 31 C25 14, 55 14, 55 31 L56 36 L24 36 Z',
  clerical: 'M24 29 L56 29 L54 33 L26 33 Z M30 18 L50 18 L51 29 L29 29 Z',
  hood: 'M23 36 C23 14, 57 14, 57 36 L53 45 L27 45 Z',
  headwrap: 'M25 28 C25 15, 55 15, 55 28 C55 33, 25 33, 25 28 Z',
  'governor-tricorne': 'M18 31 L40 17 L62 31 L56 35 L24 35 Z'
}

const PROP_PATHS: Record<PropStyle, string> = {
  pointing: 'M56 54 L70 46 L71 49 L57 58 Z',
  book: 'M54 50 L68 50 L68 65 L54 65 Z M56 53 L66 53',
  lantern: 'M61 48 L61 52 M57 52 L65 52 L66 64 L56 64 Z',
  pitchfork: 'M65 34 L65 76 M61 34 L61 42 M69 34 L69 42 M61 42 L69 42',
  tankard: 'M56 54 L66 54 L65 66 L57 66 Z M66 56 C70 56, 70 63, 66 63',
  beads: 'M56 54 C56 65, 65 65, 65 54',
  broom: 'M64 36 L58 76 M54 70 L63 70 L61 80 L51 78 Z',
  cane: 'M63 48 C63 44, 69 44, 69 48 L69 78',
  quill: 'M57 54 L67 54 L67 66 L57 66 Z M64 42 L68 54',
  pipe: 'M56 56 L66 58 L67 54 L70 54 L70 61 L65 61',
  vial: 'M60 50 L64 50 L64 54 L67 62 C67 65, 57 65, 57 62 L60 54 Z',
  seal: 'M56 50 L68 52 L66 66 L54 64 Z M61 58 A3 3 0 1 0 61.1 58'
}

const props = withDefaults(defineProps<VillagerSpriteProps>(), {
  playerName: '',
  alive: true,
  hasBlackCat: false,
  size: 'md',
  animationDelay: '0s'
})

const character = computed(() => {
  const found = SALEM_CHARACTERS.find((entry) => entry.id === props.characterId)
  if (!found) {
    throw new Error(`Unknown Salem character: ${props.characterId}`)
  }
  return found
})

const visual = computed(() => CHARACTER_VISUALS[props.characterId])
const hatPath = computed(() => HAT_PATHS[visual.value.hat])
const propPath = computed(() => PROP_PATHS[visual.value.prop])

const ariaLabel = computed(() => {
  const namePart = props.playerName ? `${props.playerName}, ` : ''
  const statusPart = props.alive ? 'vivo' : 'eliminado'
  const catPart = props.hasBlackCat ? ', portador del Gato Negro' : ''
  return `${namePart}${character.value.name} (${statusPart}${catPart})`
})
</script>

<template>
  <figure
    :class="[
      'villager-sprite',
      `villager-sprite--${size}`,
      alive ? 'is-alive' : 'is-dead',
      { 'has-black-cat': hasBlackCat }
    ]"
    :style="{ '--villager-delay': animationDelay }"
    :data-character-id="characterId"
    :data-alive="String(alive)"
    :data-black-cat="String(hasBlackCat)"
    :aria-label="ariaLabel">
    <div
      v-if="hasBlackCat"
      class="villager-sprite__badge">
      <SalBadge
        tone="warning"
        size="sm">
        <svg
          class="villager-sprite__cat-icon"
          viewBox="0 0 20 20"
          aria-hidden="true">
          <path
            d="M4 16 L4 9 L3 4 L7 7 L13 7 L17 4 L16 9 L16 16 Z"
            fill="currentColor" />

          <circle
            cx="8"
            cy="11"
            r="1"
            fill="#f2cf99" />

          <circle
            cx="12"
            cy="11"
            r="1"
            fill="#f2cf99" />
        </svg>

        <span>Gato Negro</span>
      </SalBadge>
    </div>

    <div class="villager-sprite__frame">
      <svg
        class="villager-sprite__svg"
        viewBox="0 0 80 100"
        aria-hidden="true">
        <!-- Salem 1692 parchment card arch backdrop -->
        <rect
          x="6"
          y="4"
          width="68"
          height="90"
          rx="10"
          fill="#f4ebd9"
          :stroke="character.accentColor"
          stroke-width="2.5" />

        <path
          d="M12 88 L12 34 C12 16, 68 16, 68 34 L68 88 Z"
          fill="#e8dcc4"
          stroke="#cbb999"
          stroke-width="1.2" />

        <!-- Character animated body -->
        <g class="villager-sprite__body">
          <!-- Torso / Puritan coat -->
          <path
            d="M23 86 L26 48 C26 44, 54 44, 54 48 L57 86 Z"
            :fill="visual.coat" />
          <!-- Collar / Shawl -->
          <path
            d="M30 46 L40 57 L50 46 L45 44 L35 44 Z"
            :fill="visual.trim" />

          <!-- Head & hair -->
          <circle
            cx="40"
            cy="34"
            r="10.5"
            :fill="visual.skin" />

          <path
            d="M29.5 34 C29.5 25, 50.5 25, 50.5 34 C48 29, 32 29, 29.5 34 Z"
            :fill="visual.hair" />

          <!-- Eyes -->
          <circle
            cx="36.5"
            cy="34.5"
            r="1.1"
            fill="#221b15" />

          <circle
            cx="43.5"
            cy="34.5"
            r="1.1"
            fill="#221b15" />

          <!-- Distinct headwear -->
          <path
            :d="hatPath"
            :fill="visual.hat === 'coif' || visual.hat === 'bonnet' || visual.hat === 'pleated-cap' || visual.hat === 'kerchief' ? visual.trim : '#221b15'"
            stroke="#221b15"
            stroke-width="1" />

          <rect
            v-if="visual.hat === 'tall-buckle'"
            x="37"
            y="26"
            width="6"
            height="4"
            fill="#d49e46" />

          <path
            v-if="visual.hat === 'governor-tricorne'"
            d="M20 31 L40 19 L60 31"
            fill="none"
            stroke="#e4be6a"
            stroke-width="1.6" />

          <!-- Animated arm & character prop -->
          <g class="villager-sprite__arm">
            <path
              :d="propPath"
              :fill="visual.prop === 'book' || visual.prop === 'seal' ? character.accentColor : 'none'"
              :stroke="visual.prop === 'lantern' ? '#d49e46' : '#3a2b1d'"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round" />

            <circle
              v-if="visual.prop === 'lantern'"
              cx="61"
              cy="58"
              r="2.8"
              fill="#f3c15a" />

            <circle
              v-if="visual.prop === 'vial'"
              cx="62"
              cy="60"
              r="2.6"
              fill="#62a87c" />
          </g>
        </g>

        <!-- Ghostly overlay when eliminated -->
        <g
          v-if="!alive"
          class="villager-sprite__ghost-mark">
          <circle
            cx="40"
            cy="14"
            r="6"
            fill="none"
            stroke="#8c7f6e"
            stroke-width="1.5"
            stroke-dasharray="2 2" />

          <path
            d="M20 78 L60 22"
            stroke="#9e2a2b"
            stroke-width="2.2"
            stroke-linecap="round"
            opacity="0.7" />
        </g>
      </svg>
    </div>

    <figcaption
      v-if="playerName"
      class="villager-sprite__caption">
      <span class="villager-sprite__name">{{ playerName }}</span>

      <span
        v-if="!alive"
        class="villager-sprite__status">Eliminado</span>
    </figcaption>

    <span
      v-else-if="!alive"
      class="villager-sprite__status">Eliminado</span>
  </figure>
</template>

<style scoped>
.villager-sprite {
  margin: 0;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sal-space-1);
  position: relative;
  user-select: none;
}

.villager-sprite--sm .villager-sprite__frame {
  width: 56px;
  height: 70px;
}

.villager-sprite--md .villager-sprite__frame {
  width: 72px;
  height: 90px;
}

.villager-sprite--lg .villager-sprite__frame {
  width: 88px;
  height: 110px;
}

.villager-sprite__frame {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(var(--sal-shadow-card));
  transition: opacity var(--sal-transition-fast), filter var(--sal-transition-fast);
}

.villager-sprite__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.villager-sprite.is-alive .villager-sprite__body {
  transform-origin: 40px 84px;
  animation: villager-bob 2.8s ease-in-out infinite;
  animation-delay: var(--villager-delay, 0s);
}

.villager-sprite.is-alive .villager-sprite__arm {
  transform-origin: 54px 54px;
  animation: villager-wave 3.4s ease-in-out infinite;
  animation-delay: var(--villager-delay, 0s);
}

.villager-sprite.is-dead .villager-sprite__frame {
  opacity: 0.45;
  filter: grayscale(0.85);
  animation: villager-ghost-float 3.6s ease-in-out infinite;
}

.villager-sprite__badge {
  position: relative;
  z-index: 2;
}

.villager-sprite__cat-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.villager-sprite__caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  max-width: 84px;
  text-align: center;
}

.villager-sprite__name {
  padding: 2px var(--sal-space-2);
  border-radius: var(--sal-radius-sm);
  background-color: var(--sal-surface-overlay);
  color: var(--sal-text-primary);
  font-size: var(--sal-font-size-xs);
  font-weight: var(--sal-font-weight-medium);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.villager-sprite__status {
  color: var(--sal-danger-text);
  font-size: var(--sal-font-size-xs);
  font-weight: var(--sal-font-weight-semibold);
  line-height: 1.1;
}

@keyframes villager-bob {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-2.5px) rotate(1deg);
  }
}

@keyframes villager-wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-6deg);
  }
}

@keyframes villager-ghost-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .villager-sprite.is-alive .villager-sprite__body,
  .villager-sprite.is-alive .villager-sprite__arm,
  .villager-sprite.is-dead .villager-sprite__frame {
    animation: none;
  }
}
</style>
