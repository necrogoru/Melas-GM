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
import SalModal from '@/components/sal-ui/SalModal.vue'
import GameStartTransition from '@/components/village/GameStartTransition.vue'
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

const selectedAccusedId = ref<string | null>(null)
const accuseError = ref<string | null>(null)

const isConstableModalOpen = ref(false)
const isRulesOpen = ref(false)
const isStartTransitionOpen = ref(false)
const selectedNewConstableId = ref<string | null>(null)
const constableError = ref<string | null>(null)

const isActiveGameplay = computed(
  () => store.phase !== 'lobby' && store.phase !== 'ended'
)

const phaseLabel = computed(() => {
  const map: Record<GamePhase, string> = {
    lobby: 'Sala inicial',
    gathering: 'Preparando El Alba',
    dawn: 'El Alba',
    day: 'Día en Salem',
    'night-witches': `Noche ${String(store.nightNumber)}`,
    'night-constable': `Noche ${String(store.nightNumber)}`,
    'night-ready-reveal': `Noche ${String(store.nightNumber)}`,
    reveal: `Amanecer · Noche ${String(store.nightNumber)}`,
    ended: 'Fin de partida'
  }
  return map[store.phase]
})

const wakeLockLabel = computed(() => {
  if (wakeLockActive.value) return 'Pantalla activa'
  if (!wakeLockSupported) return 'Sin Wake Lock'
  return isActiveGameplay.value ? 'Pantalla estándar' : 'En espera'
})

const wakeLockTone = computed(() => (wakeLockActive.value ? 'success' : 'neutral'))

const winnerTitle = computed(() =>
  store.winner === 'town'
    ? '¡El Pueblo de Salem ha ganado!'
    : '¡Las Brujas han ganado!'
)

const winnerDetail = computed(() =>
  store.winner === 'town'
    ? 'Todas las brujas han sido descubiertas y eliminadas.'
    : 'Las brujas han superado a los habitantes de Salem.'
)

function getCharacterName(characterId: CharacterId): string {
  return SALEM_CHARACTERS.find((character) => character.id === characterId)?.name ?? characterId
}

function getAmbientTrackForPhase(phase: GamePhase): AmbientTrackId {
  if (
    phase === 'dawn' ||
    phase === 'night-witches' ||
    phase === 'night-constable' ||
    phase === 'night-ready-reveal' ||
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
  if (previousPhase === 'night-ready-reveal' && nextPhase === 'reveal') return 'reveal'
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

function selectAccused(playerId: string): void {
  accuseError.value = null
  selectedAccusedId.value = playerId
}

function handleEliminateAccused(): void {
  accuseError.value = null
  if (!selectedAccusedId.value) {
    accuseError.value = 'Selecciona al jugador acusado.'
    return
  }

  const result = store.eliminatePlayer(selectedAccusedId.value)
  if (!result.ok) {
    accuseError.value = result.error ?? 'No se pudo eliminar al jugador.'
    return
  }

  selectedAccusedId.value = null
}

function handleStartNight(): void {
  accuseError.value = null
  selectedAccusedId.value = null
  store.startNight()
}

function openConstableModal(): void {
  selectedNewConstableId.value = null
  constableError.value = null
  isConstableModalOpen.value = true
}

function selectNewConstable(playerId: string): void {
  constableError.value = null
  selectedNewConstableId.value = playerId
}

function handleConfirmConstable(): void {
  constableError.value = null
  if (!selectedNewConstableId.value) {
    constableError.value = 'Selecciona al nuevo Alguacil.'
    return
  }

  const result = store.reassignConstable(selectedNewConstableId.value)
  if (!result.ok) {
    constableError.value = result.error ?? 'No se pudo asignar al Alguacil.'
    return
  }

  selectedNewConstableId.value = null
  isConstableModalOpen.value = false
}

function handleResetGame(): void {
  selectedAccusedId.value = null
  accuseError.value = null
  selectedNewConstableId.value = null
  constableError.value = null
  isConstableModalOpen.value = false
  isStartTransitionOpen.value = false
  stopNarration()
  store.resetGame()
  void releaseWakeLock().then(syncWakeLockState)
}

watch(
  () => store.phase,
  (phase, previousPhase) => {
    const wasActive = previousPhase !== undefined && previousPhase !== 'lobby' && previousPhase !== 'ended'
    const nowActive = phase !== 'lobby' && phase !== 'ended'

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
  <section class="game-master">
    <header class="game-master__header">
      <div class="game-master__brand">
        <h1 class="game-master__title">
          Salem 1692
        </h1>

        <SalBadge
          tone="accent"
          size="sm">
          {{ phaseLabel }}
        </SalBadge>
      </div>

      <div class="game-master__controls">
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

    <MiniatureVillage
      :players="store.players"
      :phase="store.phase"
      :black-cat-holder-id="store.blackCatHolderId" />

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
            {{ store.alivePlayers.length }} vivos
          </SalBadge>
        </div>
      </template>

      <div class="game-master__day-body">
        <SalButton
          variant="primary"
          size="lg"
          block
          data-testid="start-night-button"
          @click="handleStartNight">
          Llegó la noche
        </SalButton>

        <section class="game-master__accuse">
          <h3 class="game-master__subheading">
            Acusación del pueblo
          </h3>

          <p class="game-master__hint">
            Marca al aldeano eliminado por votación del día. Los roles permanecen en secreto.
          </p>

          <ul class="game-master__player-list">
            <li
              v-for="(player, index) in store.alivePlayers"
              :key="player.id"
              class="game-master__player-item">
              <SalButton
                :variant="selectedAccusedId === player.id ? 'danger' : 'secondary'"
                size="md"
                block
                :aria-pressed="selectedAccusedId === player.id"
                :data-testid="`day-accuse-option-${index}`"
                @click="selectAccused(player.id)">
                {{ player.name }}
              </SalButton>
            </li>
          </ul>

          <p
            v-if="accuseError"
            role="alert"
            class="game-master__error">
            {{ accuseError }}
          </p>

          <SalButton
            variant="danger"
            size="md"
            block
            data-testid="day-accuse-submit"
            @click="handleEliminateAccused">
            Eliminar al acusado
          </SalButton>
        </section>
      </div>

      <template #footer>
        <div class="game-master__day-footer">
          <SalButton
            variant="secondary"
            size="sm"
            data-testid="open-constable-reassign"
            @click="openConstableModal">
            Reasignar Alguacil
          </SalButton>

          <SalButton
            variant="ghost"
            size="sm"
            data-testid="new-game-button"
            @click="handleResetGame">
            Nueva partida
          </SalButton>
        </div>
      </template>
    </SalCard>

    <SalCard
      v-else-if="store.phase === 'ended'"
      variant="elevated">
      <div class="game-master__ended">
        <SalBadge
          :tone="store.winner === 'town' ? 'success' : 'danger'"
          size="md">
          Fin de la partida
        </SalBadge>

        <h2 class="game-master__ended-title">
          {{ winnerTitle }}
        </h2>

        <p class="game-master__hint">
          {{ winnerDetail }}
        </p>

        <SalButton
          variant="primary"
          size="lg"
          block
          data-testid="play-again-button"
          @click="handleResetGame">
          Nueva partida
        </SalButton>
      </div>
    </SalCard>

    <SalModal
      v-model:open="isConstableModalOpen"
      title="Alguacil secreto">
      <div class="game-master__constable-modal">
        <p class="game-master__hint">
          Pasa el teléfono en secreto. El nuevo Alguacil debe seleccionarse y pulsar Aceptar para ocultar su identidad.
        </p>

        <ul class="game-master__player-list">
          <li
            v-for="(player, index) in store.alivePlayers"
            :key="`reassign-${player.id}`"
            class="game-master__player-item">
            <SalButton
              :variant="selectedNewConstableId === player.id ? 'primary' : 'secondary'"
              size="md"
              block
              :aria-pressed="selectedNewConstableId === player.id"
              :data-testid="`reassign-constable-option-${index}`"
              @click="selectNewConstable(player.id)">
              {{ player.name }}
            </SalButton>
          </li>
        </ul>

        <p
          v-if="constableError"
          role="alert"
          class="game-master__error">
          {{ constableError }}
        </p>
      </div>

      <template #footer>
        <SalButton
          variant="primary"
          size="lg"
          block
          data-testid="confirm-constable-reassign"
          @click="handleConfirmConstable">
          Aceptar
        </SalButton>
      </template>
    </SalModal>

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
  gap: var(--sal-space-2);
  flex-wrap: wrap;
}

.game-master__brand {
  display: flex;
  align-items: center;
  gap: var(--sal-space-2);
  flex-wrap: wrap;
}

.game-master__title {
  margin: 0;
  font-size: var(--sal-font-size-xl);
  font-weight: var(--sal-font-weight-bold);
  color: var(--sal-text-primary);
}

.game-master__controls {
  display: flex;
  align-items: center;
  gap: var(--sal-space-2);
}

.game-master__day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-2);
}

.game-master__section-title {
  margin: 0;
  font-size: var(--sal-font-size-lg);
  font-weight: var(--sal-font-weight-bold);
}

.game-master__day-body {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-4);
}

.game-master__gathering-body {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-4);
}

.game-master__roster {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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
  border: 1px solid var(--sal-border-subtle);
  border-radius: var(--sal-radius-md);
  background-color: var(--sal-surface-base);
  min-width: 0;
}

.game-master__roster-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
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
  font-size: var(--sal-font-size-xs);
  color: var(--sal-text-secondary);
}

.game-master__accuse {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-3);
  padding-top: var(--sal-space-3);
  border-top: 1px solid var(--sal-border-subtle);
}

.game-master__subheading {
  margin: 0;
  font-size: var(--sal-font-size-md);
  font-weight: var(--sal-font-weight-semibold);
  color: var(--sal-text-primary);
}

.game-master__hint {
  margin: 0;
  font-size: var(--sal-font-size-sm);
  color: var(--sal-text-secondary);
  line-height: 1.45;
}

.game-master__player-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--sal-space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.game-master__player-item {
  min-width: 0;
}

.game-master__day-footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-2);
  flex-wrap: wrap;
}

.game-master__ended {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sal-space-3);
}

.game-master__ended-title {
  margin: 0;
  font-size: var(--sal-font-size-xl);
  font-weight: var(--sal-font-weight-bold);
  color: var(--sal-text-primary);
}

.game-master__constable-modal {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-3);
}

.game-master__error {
  margin: 0;
  padding: var(--sal-space-2) var(--sal-space-3);
  border-radius: var(--sal-radius-md);
  background-color: var(--sal-danger-soft);
  color: var(--sal-danger-text);
  font-size: var(--sal-font-size-sm);
}
</style>
