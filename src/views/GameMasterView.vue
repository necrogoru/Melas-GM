<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'
import PlayerRegistration from '@/components/lobby/PlayerRegistration.vue'
import GameRulesModal from '@/components/lobby/GameRulesModal.vue'
import DawnSetupModal from '@/components/night/DawnSetupModal.vue'
import NightFlowModal from '@/components/night/NightFlowModal.vue'
import RevealModal from '@/components/night/RevealModal.vue'
import SalBadge from '@/components/sal-ui/SalBadge.vue'
import SalButton from '@/components/sal-ui/SalButton.vue'
import SalCard from '@/components/sal-ui/SalCard.vue'
import GameStartTransition from '@/components/village/GameStartTransition.vue'
import IsometricSalemBackdrop from '@/components/village/IsometricSalemBackdrop.vue'
import MiniatureVillage from '@/components/village/MiniatureVillage.vue'
import VillagerSprite from '@/components/village/VillagerSprite.vue'
import { SALEM_CHARACTERS } from '@/data/characters'
import {
  isMuted,
  playAmbient,
  playSfx,
  stopAmbient,
  stopNarration,
  toggleMute,
  type AmbientTrackId,
  type SfxId
} from '@/services/audioService'
import {
  isWakeLockActive,
  isWakeLockSupported,
  releaseWakeLock,
  requestWakeLock
} from '@/services/wakeLockService'
import { useGameStore } from '@/stores/gameStore'
import type { CharacterId, GamePhase } from '@/types/game'

const store = useGameStore()

const muted = ref(isMuted())
const wakeLockActive = ref(isWakeLockActive())
const wakeLockSupported = isWakeLockSupported()

const isRulesOpen = ref(false)
const isStartTransitionOpen = ref(false)

const isActiveGameplay = computed(() => store.phase !== 'lobby')

const phaseLabel = computed(() => {
  const map: Record<GamePhase, string> = {
    lobby: 'Sala inicial',
    gathering: 'Preparando El Alba',
    dawn: 'El Alba',
    day: 'Día en Salem',
    'night-witches': `Noche ${String(store.nightNumber)}`,
    'night-constable': `Noche ${String(store.nightNumber)}`,
    'night-confession': `Noche ${String(store.nightNumber)}`,
    reveal: `Amanecer · Noche ${String(store.nightNumber)}`
  }
  return map[store.phase]
})

const phaseTone = computed<'neutral' | 'accent' | 'danger' | 'success' | 'warning'>(() => {
  switch (store.phase) {
    case 'gathering':
    case 'dawn':
      return 'warning'
    case 'day':
      return 'accent'
    case 'night-witches':
    case 'night-constable':
    case 'night-confession':
    case 'reveal':
      return 'danger'
    default:
      return 'neutral'
  }
})

const wakeLockLabel = computed(() => {
  if (wakeLockActive.value) return 'Pantalla activa'
  if (!wakeLockSupported) return 'Sin Wake Lock'
  return isActiveGameplay.value ? 'Pantalla estándar' : 'En espera'
})

const wakeLockTone = computed(() => (wakeLockActive.value ? 'success' : 'neutral'))

function getCharacterName(characterId: CharacterId): string {
  return SALEM_CHARACTERS.find((character) => character.id === characterId)?.name ?? characterId
}

function getAmbientTrackForPhase(phase: GamePhase): AmbientTrackId {
  if (
    phase === 'dawn' ||
    phase === 'night-witches' ||
    phase === 'night-constable' ||
    phase === 'night-confession' ||
    phase === 'reveal'
  ) {
    return 'night'
  }
  return 'day'
}

function getTransitionSfx(
  previousPhase: GamePhase | undefined,
  nextPhase: GamePhase
): SfxId | null {
  if (!previousPhase || previousPhase === nextPhase) return null
  if (previousPhase === 'lobby' && nextPhase === 'gathering') return 'start'
  if (previousPhase === 'gathering' && nextPhase === 'dawn') return 'dawn'
  if (nextPhase === 'day') return 'day'
  if (previousPhase === 'day' && nextPhase === 'night-witches') return 'night'
  if (previousPhase === 'night-confession' && nextPhase === 'reveal') return 'reveal'
  return null
}

function syncWakeLockState(): void {
  wakeLockActive.value = isWakeLockActive()
}

function handleToggleMute(): void {
  muted.value = toggleMute()
}

function handleStartDawn(): void {
  store.startDawn()
}

function handleStartNight(): void {
  store.startNight()
}

function handleResetGame(): void {
  isStartTransitionOpen.value = false
  stopNarration()
  store.resetGame()
  void releaseWakeLock().then(syncWakeLockState)
}

watch(
  () => store.phase,
  (phase, previousPhase) => {
    const wasActive = previousPhase !== undefined && previousPhase !== 'lobby'
    const nowActive = phase !== 'lobby'

    if (nowActive && !wasActive) {
      void requestWakeLock().then(syncWakeLockState)
    } else if (!nowActive && wasActive) {
      void releaseWakeLock().then(syncWakeLockState)
    }

    if (phase === 'gathering' && previousPhase === 'lobby') {
      isStartTransitionOpen.value = true
    } else if (phase !== 'gathering') {
      isStartTransitionOpen.value = false
    }

    playAmbient(getAmbientTrackForPhase(phase))

    const sfx = getTransitionSfx(previousPhase, phase)
    if (sfx) {
      playSfx(sfx)
    }
  },
  { immediate: true }
)

onScopeDispose(() => {
  stopNarration()
  stopAmbient()
  void releaseWakeLock()
})
</script>

<template>
  <IsometricSalemBackdrop :phase="store.phase" />

  <section class="game-master">
    <header class="game-master__header">
      <div class="game-master__brand">
        <span
          class="game-master__brand-dot"
          aria-hidden="true" />

        <h1 class="game-master__title">
          Salem 1692
        </h1>

        <SalBadge
          :tone="phaseTone"
          size="sm">
          {{ phaseLabel }}
        </SalBadge>
      </div>

      <div class="game-master__controls">
        <SalBadge
          v-if="store.players.length > 0"
          tone="neutral"
          size="sm">
          {{ store.players.length }} jugadores
        </SalBadge>

        <SalBadge
          :tone="wakeLockTone"
          size="sm"
          data-testid="wake-lock-indicator">
          {{ wakeLockLabel }}
        </SalBadge>

        <SalButton
          variant="ghost"
          size="sm"
          :aria-pressed="muted"
          data-testid="mute-toggle"
          @click="handleToggleMute">
          {{ muted ? 'Silenciado' : 'Audio activo' }}
        </SalButton>

        <SalButton
          variant="ghost"
          size="sm"
          aria-label="Guía del juego"
          data-testid="rules-button"
          @click="isRulesOpen = true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true">
            <circle
              cx="12"
              cy="12"
              r="10" />

            <line
              x1="12"
              y1="16"
              x2="12"
              y2="12" />

            <line
              x1="12"
              y1="8"
              x2="12.01"
              y2="8" />
          </svg>
        </SalButton>
      </div>
    </header>

    <div class="game-master__workspace">
      <div class="game-master__stage">
        <MiniatureVillage
          :players="store.players"
          :phase="store.phase" />
      </div>

      <div class="game-master__panel">
        <PlayerRegistration v-if="store.phase === 'lobby'" />

        <SalCard
          v-else-if="store.phase === 'gathering'"
          variant="elevated"
          data-testid="gathering-card">
          <template #header>
            <div class="game-master__day-header">
              <h2 class="game-master__section-title">
                Pueblo reunido
              </h2>

              <SalBadge tone="accent">
                {{ store.players.length }} jugadores
              </SalBadge>
            </div>
          </template>

          <div class="game-master__gathering-body">
            <p class="game-master__hint">
              Revisa a los participantes antes de cerrar los ojos e iniciar El Alba.
            </p>

            <ul class="game-master__roster">
              <li
                v-for="player in store.players"
                :key="player.id"
                class="game-master__roster-item">
                <VillagerSprite
                  :character-id="player.characterId"
                  size="sm" />

                <div class="game-master__roster-info">
                  <span class="game-master__roster-name">{{ player.name }}</span>

                  <span class="game-master__roster-character">
                    {{ getCharacterName(player.characterId) }}
                  </span>
                </div>
              </li>
            </ul>

            <SalButton
              variant="primary"
              size="lg"
              block
              data-testid="start-dawn-button"
              @click="handleStartDawn">
              Iniciar El Alba
            </SalButton>
          </div>

          <template #footer>
            <SalButton
              variant="ghost"
              size="sm"
              data-testid="new-game-button"
              @click="handleResetGame">
              Nueva partida
            </SalButton>
          </template>
        </SalCard>

        <SalCard
          v-else-if="store.phase === 'day'"
          variant="elevated">
          <template #header>
            <div class="game-master__day-header">
              <h2 class="game-master__section-title">
                Día en Salem
              </h2>

              <SalBadge tone="neutral">
                {{ store.players.length }} jugadores
              </SalBadge>
            </div>
          </template>

          <div class="game-master__day-body">
            <p class="game-master__hint">
              El pueblo debate, roba cartas y juega acusaciones en la mesa. Cuando caiga la noche, continúa aquí.
            </p>

            <SalButton
              variant="primary"
              size="lg"
              block
              data-testid="start-night-button"
              @click="handleStartNight">
              Llegó la noche
            </SalButton>
          </div>

          <template #footer>
            <SalButton
              variant="ghost"
              size="sm"
              data-testid="new-game-button"
              @click="handleResetGame">
              Nueva partida
            </SalButton>
          </template>
        </SalCard>

        <SalCard
          v-else
          variant="default">
          <template #header>
            <div class="game-master__day-header">
              <h2 class="game-master__section-title">
                {{ phaseLabel }}
              </h2>

              <SalBadge :tone="phaseTone">
                En curso
              </SalBadge>
            </div>
          </template>

          <p class="game-master__hint">
            Sigue las instrucciones en pantalla para continuar con la ronda.
          </p>
        </SalCard>
      </div>
    </div>

    <DawnSetupModal />

    <NightFlowModal />

    <RevealModal />

    <GameStartTransition v-model:open="isStartTransitionOpen" />

    <GameRulesModal v-model:open="isRulesOpen" />
  </section>
</template>

<style scoped>
.game-master {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-4);
}

.game-master__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-3);
  flex-wrap: wrap;
  padding: var(--sal-space-3) var(--sal-space-4);
  background-color: var(--sal-surface-glass);
  border: var(--sal-border-width-step) solid var(--sal-border-hud);
  border-radius: var(--sal-radius-sm);
  box-shadow: var(--sal-shadow-bevel), var(--sal-shadow-pixel-sm);
}

.game-master__brand {
  display: flex;
  align-items: center;
  gap: var(--sal-space-2);
  flex-wrap: wrap;
}

.game-master__brand-dot {
  width: var(--sal-space-2);
  height: var(--sal-space-2);
  background-color: var(--sal-accent-primary);
  border: var(--sal-border-width-thin) solid var(--sal-border-focus);
  border-radius: var(--sal-radius-pixel);
  flex-shrink: 0;
}

.game-master__title {
  margin: 0;
  font-family: var(--sal-font-display);
  font-size: var(--sal-font-size-xl);
  font-weight: var(--sal-font-weight-bold);
  letter-spacing: var(--sal-tracking-tight);
  color: var(--sal-text-primary);
}

.game-master__controls {
  display: flex;
  align-items: center;
  gap: var(--sal-space-2);
  flex-wrap: wrap;
}

.game-master__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--sal-space-4);
  align-items: start;
}

.game-master__stage,
.game-master__panel {
  min-width: 0;
}

@media (min-width: 900px) {
  .game-master__workspace {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.95fr);
    gap: var(--sal-space-5);
  }

  .game-master__stage {
    position: sticky;
    top: var(--sal-space-4);
  }
}

.game-master__day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-2);
}

.game-master__section-title {
  margin: 0;
  font-family: var(--sal-font-display);
  font-size: var(--sal-font-size-lg);
  font-weight: var(--sal-font-weight-bold);
}

.game-master__day-body,
.game-master__gathering-body {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-4);
}

.game-master__roster {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  gap: var(--sal-space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.game-master__roster-item {
  display: flex;
  align-items: center;
  gap: var(--sal-space-3);
  padding: var(--sal-space-2) var(--sal-space-3);
  border: var(--sal-border-width-thin) solid var(--sal-border-hud);
  border-radius: var(--sal-radius-sm);
  background-color: var(--sal-surface-panel);
  box-shadow: var(--sal-shadow-bevel);
  min-width: 0;
}

.game-master__roster-info {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-1);
  min-width: 0;
}

.game-master__roster-name {
  font-size: var(--sal-font-size-md);
  font-weight: var(--sal-font-weight-semibold);
  color: var(--sal-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.game-master__roster-character {
  font-family: var(--sal-font-mono);
  font-size: var(--sal-font-size-xs);
  color: var(--sal-text-secondary);
}

.game-master__hint {
  margin: 0;
  font-size: var(--sal-font-size-sm);
  color: var(--sal-text-secondary);
  line-height: 1.45;
}
</style>
