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

type FaceStyle = 'short' | 'long' | 'bearded' | 'hooded'
type OutfitStyle = 'coat-pants' | 'clerical-robe' | 'dress-apron' | 'shawl-gown'

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
  face: FaceStyle
  outfit: OutfitStyle
  prop: PropStyle
  coat: string
  trim: string
  skin: string
  hair: string
  hatFill: string
  accent: string
}

interface PixelRect {
  x: number
  y: number
  w: number
  fill: string
  opacity?: number
}

const OUTLINE = '#16120f'
const HAT_DARK = '#221b15'
const BOOT_DARK = '#1f1915'
const GOLD = '#e4be6a'
const SHADOW = '#090807'
const WOOD = '#6e4d2e'
const IRON = '#8f969e'
const FLAME = '#f3c15a'
const POTION = '#62a87c'
const WAX_RED = '#9e2a2b'
const PARCHMENT = '#efe3cc'
const SMOKE = '#b8b0a4'

const CHARACTER_VISUALS: Record<CharacterId, CharacterVisual> = {
  'abigail-williams': {
    hat: 'coif',
    face: 'long',
    outfit: 'dress-apron',
    prop: 'pointing',
    coat: '#6e2323',
    trim: '#f0e4ce',
    skin: '#efd1b8',
    hair: '#4a2c1d',
    hatFill: '#f0e4ce',
    accent: '#8b2e2e'
  },
  'cotton-mather': {
    hat: 'tall-buckle',
    face: 'short',
    outfit: 'clerical-robe',
    prop: 'book',
    coat: '#263442',
    trim: '#f3ede0',
    skin: '#ebd0b9',
    hair: '#5c4632',
    hatFill: HAT_DARK,
    accent: '#3e5469'
  },
  'george-burroughs': {
    hat: 'wide-brim',
    face: 'bearded',
    outfit: 'coat-pants',
    prop: 'lantern',
    coat: '#344431',
    trim: '#d8cbb4',
    skin: '#e3bfa2',
    hair: '#3b2b20',
    hatFill: HAT_DARK,
    accent: '#4c6148'
  },
  'giles-corey': {
    hat: 'farmer-hat',
    face: 'bearded',
    outfit: 'coat-pants',
    prop: 'pitchfork',
    coat: '#5a412a',
    trim: '#c8b496',
    skin: '#dfb898',
    hair: '#8a8278',
    hatFill: '#9c7e4c',
    accent: '#7a5a3a'
  },
  'john-proctor': {
    hat: 'tricorne',
    face: 'short',
    outfit: 'coat-pants',
    prop: 'tankard',
    coat: '#48382b',
    trim: '#d9c8ae',
    skin: '#e4be9f',
    hair: '#3a2719',
    hatFill: HAT_DARK,
    accent: '#5c4938'
  },
  'martha-corey': {
    hat: 'bonnet',
    face: 'long',
    outfit: 'dress-apron',
    prop: 'beads',
    coat: '#4e3750',
    trim: '#efe6d5',
    skin: '#ebd0ba',
    hair: '#6e5c4f',
    hatFill: '#efe6d5',
    accent: '#6b4c6e'
  },
  'mary-warren': {
    hat: 'kerchief',
    face: 'long',
    outfit: 'dress-apron',
    prop: 'broom',
    coat: '#664f33',
    trim: '#f2e8d7',
    skin: '#f0d3bc',
    hair: '#785032',
    hatFill: '#f2e8d7',
    accent: '#8c6d46'
  },
  'rebecca-nurse': {
    hat: 'pleated-cap',
    face: 'long',
    outfit: 'shawl-gown',
    prop: 'cane',
    coat: '#2c4641',
    trim: '#f3ead9',
    skin: '#ead0ba',
    hair: '#b9b2a8',
    hatFill: '#f3ead9',
    accent: '#3f635c'
  },
  'samuel-parris': {
    hat: 'clerical',
    face: 'short',
    outfit: 'clerical-robe',
    prop: 'quill',
    coat: '#252834',
    trim: '#f5efe2',
    skin: '#e6c8b0',
    hair: '#4b3b2c',
    hatFill: HAT_DARK,
    accent: '#383d4f'
  },
  'sarah-good': {
    hat: 'hood',
    face: 'hooded',
    outfit: 'shawl-gown',
    prop: 'pipe',
    coat: '#4f3f36',
    trim: '#b8a894',
    skin: '#d9b597',
    hair: '#5e5248',
    hatFill: '#4f3f36',
    accent: '#6d574b'
  },
  tituba: {
    hat: 'headwrap',
    face: 'long',
    outfit: 'shawl-gown',
    prop: 'vial',
    coat: '#442d48',
    trim: '#d49e46',
    skin: '#9d6b4c',
    hair: '#221712',
    hatFill: '#442d48',
    accent: '#593d5e'
  },
  'william-phips': {
    hat: 'governor-tricorne',
    face: 'short',
    outfit: 'clerical-robe',
    prop: 'seal',
    coat: '#594420',
    trim: '#e4be6a',
    skin: '#e8c7ab',
    hair: '#695849',
    hatFill: HAT_DARK,
    accent: '#785e2f'
  }
}

const HAT_GRIDS: Record<HatStyle, readonly string[]> = {
  coif: [
    '................',
    '.....OOOOOO.....',
    '....OHHHHHHO....',
    '...OHHHHHHHHO...',
    '...OHBBBBBBHO...'
  ],
  'tall-buckle': [
    '.....OOOOOO.....',
    '....OHHHHHHO....',
    '....OHHHHHHO....',
    '....OHHGGHHO....',
    '..OOOOOOOOOOOO..'
  ],
  'wide-brim': [
    '................',
    '.....OOOOOO.....',
    '....OHHHHHHO....',
    '....OHBBBBHO....',
    '.OOOOOOOOOOOOOO.'
  ],
  'farmer-hat': [
    '................',
    '.....OOOOOO.....',
    '....OHHHHHHO....',
    '...OHBBBBBBHO...',
    '.OOHHHHHHHHHHOO.'
  ],
  tricorne: [
    '................',
    '......OOOO......',
    '....OHHHHHHO....',
    '...OHHHHHHHHO...',
    '..OOBBBBBBBBOO..'
  ],
  bonnet: [
    '................',
    '....OOOOOOOO....',
    '...OHHHHHHHHO...',
    '...OHHCCCCCHHO..',
    '..OHHHBBBBHHHO..'
  ],
  kerchief: [
    '................',
    '.....OOOOOO.....',
    '....OHHHHHHO....',
    '...OHHHHHHHHO...',
    '...OOHHHHHHOO...'
  ],
  'pleated-cap': [
    '....OOOOOOOO....',
    '...OHHHHHHHHO...',
    '...OHCHHHHCHO...',
    '...OHHHHHHHHO...',
    '...OOBBBBBBOO...'
  ],
  clerical: [
    '................',
    '....OOOOOOOO....',
    '....OHHHHHHO....',
    '....OHBBBBHO....',
    '..OOOOOOOOOOOO..'
  ],
  hood: [
    '................',
    '....OOOOOOOO....',
    '...OCCCCCCCCO...',
    '...OCCBBBBCCO...',
    '..OCCSSSSSSCCO..'
  ],
  headwrap: [
    '................',
    '....OOOOOOOO....',
    '...OHHGGGGHHO...',
    '...OHGHHHHGHO...',
    '...OHHHHHHHHO...'
  ],
  'governor-tricorne': [
    '......OOOO......',
    '....OGGGGGGO....',
    '...OHHHHHHHHO...',
    '..OHGGGGGGGGHO..',
    '..OOOOOOOOOOOO..'
  ]
}

const FACE_GRIDS: Record<FaceStyle, readonly string[]> = {
  short: [
    '....ORSSSSRO....',
    '....ORESSERO....',
    '....ORSSSSRO....',
    '.....OSSSSO.....'
  ],
  long: [
    '....ORRRRRRO....',
    '....ORESSERO....',
    '....ORSSSSRO....',
    '....ORSSSSRO....'
  ],
  bearded: [
    '....ORSSSSRO....',
    '....ORESSERO....',
    '....ORRRRRRO....',
    '.....ORRRRO.....'
  ],
  hooded: [
    '...OCRSSSSRCO...',
    '...OCRESSERCO...',
    '...OCSSSSSSCO...',
    '....OSSSSSSO....'
  ]
}

const OUTFIT_GRIDS: Record<OutfitStyle, readonly string[]> = {
  'coat-pants': [
    '....OOTTTTOO....',
    '...OCCCCCCCCO...',
    '..OSCCCTTTCCCO..',
    '..OSCCCCCCCCCO..',
    '..O.OCCCCCCCO...',
    '....OCCGGGCCO...',
    '....OCCCCCCCO...',
    '....OLLO.OLLO...',
    '....OLLO.OLLO...',
    '...OLLLO.OLLLO..',
    '....WWWWWWWW....'
  ],
  'clerical-robe': [
    '....OOTTTTOO....',
    '...OCCCTTCCCO...',
    '..OSCCCTTCCCCO..',
    '..OSCCCTTCCCCO..',
    '..O.OCCGGGCCO...',
    '....OCCCCCCCO...',
    '....OCCCCCCCO...',
    '....OCCCCCCCO...',
    '....OCCCCCCCO...',
    '....OLLO.OLLO...',
    '....WWWWWWWW....'
  ],
  'dress-apron': [
    '....OOTTTTOO....',
    '...OCCTTTTCCO...',
    '..OSCCTTTTCCCO..',
    '..OSCCTTTTCCCO..',
    '..O.OCTTTTCCO...',
    '....OCTTTTCCO...',
    '...OCCTTTTCCCO..',
    '...OCCTTTTCCCO..',
    '...OCCTTTTCCCO..',
    '....OLLO.OLLO...',
    '....WWWWWWWW....'
  ],
  'shawl-gown': [
    '....OOTTTTOO....',
    '...OTTTTTTTTO...',
    '..OSTTCCCCTTCO..',
    '..OSCCCCCCCCCO..',
    '..O.OCCCCCCCO...',
    '....OCCCCCCCO...',
    '...OCCCCCCCCCO..',
    '...OCCCTTCCCCO..',
    '...OCCCCCCCCCO..',
    '....OLLO.OLLO...',
    '....WWWWWWWW....'
  ]
}

const PROP_GRIDS: Record<PropStyle, { yOffset: number; rows: readonly string[] }> = {
  pointing: {
    yOffset: 10,
    rows: [
      '............SSSO',
      '............SO..',
      '............O...'
    ]
  },
  book: {
    yOffset: 10,
    rows: [
      '............OOO.',
      '...........OSAOO',
      '...........OAPOO',
      '............OGO.'
    ]
  },
  lantern: {
    yOffset: 10,
    rows: [
      '............OOO.',
      '...........OSGYO',
      '............OYO.',
      '............OOO.'
    ]
  },
  pitchfork: {
    yOffset: 6,
    rows: [
      '............I.I.',
      '............III.',
      '.............I..',
      '.............W..',
      '.............W..',
      '............SW..',
      '.............W..',
      '.............W..',
      '.............W..',
      '.............W..',
      '.............W..',
      '.............W..'
    ]
  },
  tankard: {
    yOffset: 10,
    rows: [
      '............PPP.',
      '...........OSWWO',
      '............WWO.',
      '............OOO.'
    ]
  },
  beads: {
    yOffset: 11,
    rows: [
      '...........OS...',
      '............O.G.',
      '............G.O.',
      '.............G..'
    ]
  },
  broom: {
    yOffset: 7,
    rows: [
      '..............W.',
      '..............W.',
      '..............W.',
      '.............W..',
      '............SW..',
      '.............W..',
      '............W...',
      '............W...',
      '...........YYY..',
      '...........YYY..',
      '..........YYYY..'
    ]
  },
  cane: {
    yOffset: 10,
    rows: [
      '............OOO.',
      '...........OS.W.',
      '............W...',
      '............W...',
      '............W...',
      '............W...',
      '............W...',
      '............W...',
      '............W...'
    ]
  },
  quill: {
    yOffset: 8,
    rows: [
      '..............P.',
      '.............PP.',
      '............OP..',
      '...........OSPO.',
      '............PPO.',
      '............OOO.'
    ]
  },
  pipe: {
    yOffset: 9,
    rows: [
      '..............M.',
      '.............M..',
      '............SOO.',
      '............O.O.'
    ]
  },
  vial: {
    yOffset: 10,
    rows: [
      '.............O..',
      '...........OSVO.',
      '............VVO.',
      '............OOO.'
    ]
  },
  seal: {
    yOffset: 10,
    rows: [
      '............PPP.',
      '...........OSRPO',
      '............PPP.',
      '............OOO.'
    ]
  }
}

const GHOST_MARK_RECTS: readonly PixelRect[] = [
  { x: 6, y: 0, w: 4, fill: '#c4b8a5', opacity: 0.85 },
  { x: 3, y: 15, w: 1, fill: WAX_RED, opacity: 0.75 },
  { x: 4, y: 14, w: 1, fill: WAX_RED, opacity: 0.75 },
  { x: 5, y: 13, w: 1, fill: WAX_RED, opacity: 0.75 },
  { x: 6, y: 12, w: 1, fill: WAX_RED, opacity: 0.75 },
  { x: 7, y: 11, w: 1, fill: WAX_RED, opacity: 0.75 },
  { x: 8, y: 10, w: 1, fill: WAX_RED, opacity: 0.75 },
  { x: 9, y: 9, w: 1, fill: WAX_RED, opacity: 0.75 },
  { x: 10, y: 8, w: 1, fill: WAX_RED, opacity: 0.75 },
  { x: 11, y: 7, w: 1, fill: WAX_RED, opacity: 0.75 },
  { x: 12, y: 6, w: 1, fill: WAX_RED, opacity: 0.75 }
]

const BLACK_CAT_RECTS: readonly PixelRect[] = [
  { x: 2, y: 1, w: 1, fill: 'currentColor' },
  { x: 8, y: 1, w: 1, fill: 'currentColor' },
  { x: 2, y: 2, w: 2, fill: 'currentColor' },
  { x: 7, y: 2, w: 2, fill: 'currentColor' },
  { x: 2, y: 3, w: 7, fill: 'currentColor' },
  { x: 2, y: 4, w: 2, fill: 'currentColor' },
  { x: 4, y: 4, w: 1, fill: FLAME },
  { x: 5, y: 4, w: 2, fill: 'currentColor' },
  { x: 7, y: 4, w: 1, fill: FLAME },
  { x: 8, y: 4, w: 1, fill: 'currentColor' },
  { x: 3, y: 5, w: 5, fill: 'currentColor' },
  { x: 3, y: 6, w: 5, fill: 'currentColor' },
  { x: 10, y: 6, w: 1, fill: 'currentColor' },
  { x: 2, y: 7, w: 7, fill: 'currentColor' },
  { x: 10, y: 7, w: 1, fill: 'currentColor' },
  { x: 2, y: 8, w: 8, fill: 'currentColor' },
  { x: 2, y: 9, w: 2, fill: 'currentColor' },
  { x: 6, y: 9, w: 2, fill: 'currentColor' }
]

function compilePixelRows(
  rows: readonly string[],
  palette: Record<string, string>,
  yOffset = 0
): PixelRect[] {
  const rects: PixelRect[] = []
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex]
    if (!row) continue
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      const fill = ch ? palette[ch] : undefined
      if (!ch || ch === '.' || !fill) {
        x++
        continue
      }
      let end = x + 1
      while (end < row.length && row[end] === ch) {
        end++
      }
      rects.push({
        x,
        y: rowIndex + yOffset,
        w: end - x,
        fill,
        opacity: ch === 'W' && yOffset === 0 && rowIndex === 19 ? 0.35 : undefined
      })
      x = end
    }
  }
  return rects
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

const bodyPalette = computed<Record<string, string>>(() => ({
  O: OUTLINE,
  H: visual.value.hatFill,
  B: visual.value.trim,
  G: GOLD,
  C: visual.value.coat,
  T: visual.value.trim,
  S: visual.value.skin,
  R: visual.value.hair,
  E: OUTLINE,
  L: BOOT_DARK,
  W: SHADOW
}))

const propPalette = computed<Record<string, string>>(() => ({
  O: OUTLINE,
  S: visual.value.skin,
  A: visual.value.accent,
  G: GOLD,
  W: WOOD,
  I: IRON,
  Y: FLAME,
  P: PARCHMENT,
  V: POTION,
  R: WAX_RED,
  M: SMOKE
}))

const bodyRects = computed<PixelRect[]>(() => {
  const rows = [
    ...HAT_GRIDS[visual.value.hat],
    ...FACE_GRIDS[visual.value.face],
    ...OUTFIT_GRIDS[visual.value.outfit]
  ]
  return compilePixelRows(rows, bodyPalette.value)
})

const propRects = computed<PixelRect[]>(() => {
  const spec = PROP_GRIDS[visual.value.prop]
  return compilePixelRows(spec.rows, propPalette.value, spec.yOffset)
})

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
          viewBox="0 0 12 10"
          shape-rendering="crispEdges"
          aria-hidden="true">
          <rect
            v-for="(rect, idx) in BLACK_CAT_RECTS"
            :key="idx"
            :x="rect.x"
            :y="rect.y"
            :width="rect.w"
            height="1"
            :fill="rect.fill" />
        </svg>

        <span>Gato Negro</span>
      </SalBadge>
    </div>

    <div class="villager-sprite__frame">
      <svg
        class="villager-sprite__svg"
        viewBox="0 0 16 20"
        shape-rendering="crispEdges"
        aria-hidden="true">
        <g class="villager-sprite__body">
          <rect
            v-for="(rect, idx) in bodyRects"
            :key="idx"
            :x="rect.x"
            :y="rect.y"
            :width="rect.w"
            height="1"
            :fill="rect.fill"
            :fill-opacity="rect.opacity" />
        </g>

        <g class="villager-sprite__arm">
          <rect
            v-for="(rect, idx) in propRects"
            :key="idx"
            :x="rect.x"
            :y="rect.y"
            :width="rect.w"
            height="1"
            :fill="rect.fill" />
        </g>

        <g
          v-if="!alive"
          class="villager-sprite__ghost-mark">
          <rect
            v-for="(rect, idx) in GHOST_MARK_RECTS"
            :key="idx"
            :x="rect.x"
            :y="rect.y"
            :width="rect.w"
            height="1"
            :fill="rect.fill"
            :fill-opacity="rect.opacity" />
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

.villager-sprite__svg,
.villager-sprite__cat-icon {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.villager-sprite__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.villager-sprite.is-alive .villager-sprite__body {
  transform-origin: 8px 18px;
  animation: villager-bob 2.4s steps(2, end) infinite;
  animation-delay: var(--villager-delay, 0s);
}

.villager-sprite.is-alive .villager-sprite__arm {
  transform-origin: 11px 11px;
  animation: villager-wave 2.8s steps(2, end) infinite;
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
  width: 14px;
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
  border: var(--sal-border-width-thin) solid var(--sal-border-subtle);
  border-radius: var(--sal-radius-pixel);
  background-color: var(--sal-surface-overlay);
  color: var(--sal-text-primary);
  font-family: var(--sal-font-mono);
  font-size: var(--sal-font-size-2xs);
  font-weight: var(--sal-font-weight-semibold);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.villager-sprite__status {
  color: var(--sal-danger-text);
  font-family: var(--sal-font-mono);
  font-size: var(--sal-font-size-2xs);
  font-weight: var(--sal-font-weight-bold);
  letter-spacing: var(--sal-tracking-hud);
  text-transform: uppercase;
  line-height: 1.1;
}

@keyframes villager-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.5px);
  }
}

@keyframes villager-wave {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.5px);
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
