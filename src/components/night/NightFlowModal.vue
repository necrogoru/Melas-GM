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

const isNarrating = ref(false)
const activeCue = ref<AudioCueId | null>(null)

const isNightOpen = computed(
  () =>
    gameStore.phase === 'night-witches' ||
    gameStore.phase === 'night-constable' ||
    gameStore.phase === 'night-confession'
)

const modalTitle = computed(() => {
  const nightLabel = `Noche ${String(gameStore.nightNumber)}`
  if (gameStore.phase === 'night-witches') return `${nightLabel} · Brujas`
  if (gameStore.phase === 'night-constable') return `${nightLabel} · Alguacil`
  return `${nightLabel} · Confesión`
})

function getNightCue(phase: GamePhase): AudioCueId | null {
  if (phase === 'night-witches') return 'night-witches'
  if (phase === 'night-constable') return 'night-constable'
  if (phase === 'night-confession') return 'night-confession'
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

function handleAdvance(): void {
  gameStore.advanceNightStep()
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

      <SalCard
        variant="elevated"
        padding="sm">
        <p
          v-if="gameStore.phase === 'night-witches'"
          class="night-flow__intro">
          Llegó la noche. Todos cierren los ojos. Brujas, despierten en silencio y elijan a su víctima sobre la mesa.
        </p>

        <p
          v-else-if="gameStore.phase === 'night-constable'"
          class="night-flow__intro">
          Las brujas cierran los ojos. Alguacil, si tu carta sigue oculta en juego, despierta y coloca el martillo sobre otro jugador (nunca sobre ti mismo).
        </p>

        <p
          v-else
          class="night-flow__intro">
          El Alguacil cierra los ojos. Pueblo de Salem, despierten todos. Antes de revelar la carta de Muerte, quienes quieran confesar pueden voltear 1 carta de Juicio para salvarse esta noche.
        </p>
      </SalCard>
    </div>

    <template #footer>
      <SalButton
        v-if="gameStore.phase === 'night-witches'"
        variant="primary"
        size="lg"
        block
        data-testid="night-witches-next"
        @click="handleAdvance">
        Siguiente
      </SalButton>

      <SalButton
        v-else-if="gameStore.phase === 'night-constable'"
        variant="primary"
        size="lg"
        block
        data-testid="night-constable-next"
        @click="handleAdvance">
        Siguiente
      </SalButton>

      <SalButton
        v-else
        variant="primary"
        size="lg"
        block
        data-testid="night-reveal-button"
        @click="handleAdvance">
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
  line-height: 1.5;
}
</style>
