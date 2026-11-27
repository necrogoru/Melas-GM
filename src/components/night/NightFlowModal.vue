<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'
import SalBadge from '@/components/sal-ui/SalBadge.vue'
import SalButton from '@/components/sal-ui/SalButton.vue'
import SalCard from '@/components/sal-ui/SalCard.vue'
import SalModal from '@/components/sal-ui/SalModal.vue'
import { playAmbient, playCue, stopNarration, type AudioCueId } from '@/services/audioService'
import { useGameStore } from '@/stores/gameStore'
import type { GamePhase } from '@/types/game'

const gameStore = useGameStore()

const selectedTargetId = ref<string | null>(null)
const selectedProtectedId = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const isNarrating = ref(false)
const activeCue = ref<AudioCueId | null>(null)

const isNightOpen = computed(
  () =>
    gameStore.phase === 'night-witches' ||
    gameStore.phase === 'night-constable' ||
    gameStore.phase === 'night-ready-reveal'
)

const modalTitle = computed(() => {
  const nightLabel = `Noche ${String(gameStore.nightNumber)}`
  if (gameStore.phase === 'night-witches') return `${nightLabel} · Brujas`
  if (gameStore.phase === 'night-constable') return `${nightLabel} · Alguacil`
  return `${nightLabel} · Revelación`
})

function getNightCue(phase: GamePhase): AudioCueId | null {
  if (phase === 'night-witches') return 'night-witches'
  if (phase === 'night-constable') return 'night-constable'
  if (phase === 'night-ready-reveal') return 'night-ready-reveal'
  return null
}

async function playStepCue(cueId: AudioCueId): Promise<void> {
  activeCue.value = cueId
  isNarrating.value = true
  try {
    await playCue(cueId)
  } finally {
    if (activeCue.value === cueId) {
      isNarrating.value = false
    }
  }
}

async function replayCue(): Promise<void> {
  if (!activeCue.value) return
  await playStepCue(activeCue.value)
}

function stopAudio(): void {
  stopNarration()
  isNarrating.value = false
}

function clearSecretSelections(): void {
  selectedTargetId.value = null
  selectedProtectedId.value = null
  errorMessage.value = null
}

function selectTarget(playerId: string): void {
  errorMessage.value = null
  selectedTargetId.value = playerId
}

function selectProtected(playerId: string): void {
  if (gameStore.isConstable(playerId)) return
  errorMessage.value = null
  selectedProtectedId.value = playerId
}

function handleWitchesSubmit(): void {
  errorMessage.value = null
  if (!selectedTargetId.value) {
    errorMessage.value = 'Selecciona el objetivo de las Brujas.'
    return
  }

  const result = gameStore.confirmWitchTarget(selectedTargetId.value)
  if (!result.ok) {
    errorMessage.value = result.error ?? 'Selecciona el objetivo de las Brujas.'
    return
  }

  clearSecretSelections()
}

function handleConstableSubmit(): void {
  errorMessage.value = null
  if (gameStore.hasAliveConstable && !selectedProtectedId.value) {
    errorMessage.value = 'Selecciona a quién proteger con el martillo.'
    return
  }

  const targetId = gameStore.hasAliveConstable ? selectedProtectedId.value : null
  const result = gameStore.confirmConstableProtection(targetId)
  if (!result.ok) {
    errorMessage.value = result.error ?? 'Selecciona a quién proteger con el martillo.'
    return
  }

  clearSecretSelections()
}

function handleReveal(): void {
  errorMessage.value = null
  const result = gameStore.revealNightOutcome()
  if (!result.ok) {
    errorMessage.value = result.error ?? 'No se pudo revelar el resultado de la noche.'
  }
}

watch(
  () => gameStore.phase,
  (phase, previousPhase) => {
    const cue = getNightCue(phase)
    if (cue) {
      if (phase === 'night-witches' && previousPhase !== 'night-witches') {
        playAmbient('night')
      }
      void playStepCue(cue)
      return
    }

    if (previousPhase && getNightCue(previousPhase)) {
      stopAudio()
      clearSecretSelections()
    }
  },
  { immediate: true }
)

onScopeDispose(() => {
  stopAudio()
})
</script>

<template>
  <SalModal
    :open="isNightOpen"
    :closable="false"
    :title="modalTitle">
    <div class="night-flow">
      <div class="night-flow__audio-bar">
        <SalBadge
          :tone="isNarrating ? 'accent' : 'neutral'"
          size="sm">
          {{ isNarrating ? 'Pregonero hablando…' : 'Audio en pausa' }}
        </SalBadge>

        <SalButton
          variant="ghost"
          size="sm"
          @click="replayCue">
          Repetir audio
        </SalButton>
      </div>

      <template v-if="gameStore.phase === 'night-witches'">
        <SalCard
          variant="elevated"
          padding="sm">
          <p class="night-flow__intro">
            Llegó la noche. Todos cierren los ojos. Brujas, elijan en silencio a su víctima y pulsen Aceptar.
          </p>
        </SalCard>

        <section class="night-flow__section">
          <h3 class="night-flow__heading">
            ¿A quién atacan las Brujas?
          </h3>

          <ul class="night-flow__list">
            <li
              v-for="(player, index) in gameStore.alivePlayers"
              :key="`target-${player.id}`"
              class="night-flow__item">
              <SalButton
                :variant="selectedTargetId === player.id ? 'primary' : 'secondary'"
                size="md"
                block
                :aria-pressed="selectedTargetId === player.id"
                :data-testid="`night-target-option-${index}`"
                @click="selectTarget(player.id)">
                {{ player.name }}
              </SalButton>
            </li>
          </ul>
        </section>
      </template>

      <template v-else-if="gameStore.phase === 'night-constable'">
        <SalCard
          variant="elevated"
          padding="sm">
          <p class="night-flow__intro">
            <template v-if="gameStore.hasAliveConstable">
              Las brujas cierran los ojos. Alguacil, coloca el martillo sobre quien deseas proteger (no puedes protegerte a ti mismo).
            </template>

            <template v-else>
              El Alguacil ya no está en el pueblo. Pulsa Aceptar para continuar hacia el amanecer.
            </template>
          </p>
        </SalCard>

        <section
          v-if="gameStore.hasAliveConstable"
          class="night-flow__section">
          <h3 class="night-flow__heading">
            ¿A quién protege el Alguacil?
          </h3>

          <ul class="night-flow__list">
            <li
              v-for="(player, index) in gameStore.alivePlayers"
              :key="`protect-${player.id}`"
              class="night-flow__item">
              <SalButton
                :variant="selectedProtectedId === player.id ? 'primary' : 'secondary'"
                size="md"
                block
                :disabled="gameStore.isConstable(player.id)"
                :aria-pressed="selectedProtectedId === player.id"
                :data-testid="`night-protect-option-${index}`"
                @click="selectProtected(player.id)">
                {{ player.name }}
              </SalButton>
            </li>
          </ul>
        </section>
      </template>

      <template v-else>
        <SalCard
          variant="elevated"
          padding="sm">
          <p class="night-flow__intro">
            El Alguacil cierra los ojos. Pueblo de Salem, despierten todos. Pulsen Revelar para anunciar lo ocurrido esta noche.
          </p>
        </SalCard>
      </template>

      <p
        v-if="errorMessage"
        role="alert"
        class="night-flow__error">
        {{ errorMessage }}
      </p>
    </div>

    <template #footer>
      <SalButton
        v-if="gameStore.phase === 'night-witches'"
        variant="primary"
        size="lg"
        block
        data-testid="night-witches-accept"
        @click="handleWitchesSubmit">
        Aceptar
      </SalButton>

      <SalButton
        v-else-if="gameStore.phase === 'night-constable'"
        variant="primary"
        size="lg"
        block
        data-testid="night-constable-accept"
        @click="handleConstableSubmit">
        Aceptar
      </SalButton>

      <SalButton
        v-else
        variant="primary"
        size="lg"
        block
        data-testid="night-reveal-button"
        @click="handleReveal">
        Revelar
      </SalButton>
    </template>
  </SalModal>
</template>

<style scoped>
.night-flow {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-4);
}

.night-flow__audio-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-2);
}

.night-flow__intro {
  margin: 0;
  font-size: var(--sal-font-size-sm);
  color: var(--sal-text-secondary);
  line-height: 1.45;
}

.night-flow__section {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-2);
}

.night-flow__heading {
  margin: 0;
  font-size: var(--sal-font-size-sm);
  font-weight: var(--sal-font-weight-semibold);
  color: var(--sal-text-primary);
}

.night-flow__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--sal-space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.night-flow__item {
  min-width: 0;
}

.night-flow__error {
  margin: 0;
  padding: var(--sal-space-2) var(--sal-space-3);
  border-radius: var(--sal-radius-md);
  background-color: var(--sal-danger-soft);
  color: var(--sal-danger-text);
  font-size: var(--sal-font-size-sm);
}
</style>
