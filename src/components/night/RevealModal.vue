<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'
import SalBadge from '@/components/sal-ui/SalBadge.vue'
import SalButton from '@/components/sal-ui/SalButton.vue'
import SalCard from '@/components/sal-ui/SalCard.vue'
import SalModal from '@/components/sal-ui/SalModal.vue'
import { playAmbient, playCue, stopNarration, type AudioCueId } from '@/services/audioService'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const isNarrating = ref(false)
const activeCue = ref<AudioCueId | null>(null)

const resolution = computed(() => gameStore.lastResolution)

const isRevealOpen = computed(
  () => gameStore.phase === 'reveal' && resolution.value !== null
)

const killedPlayer = computed(() => {
  const killedId = resolution.value?.killedPlayerId
  if (!killedId) return null
  return gameStore.players.find((player) => player.id === killedId) ?? null
})

const modalTitle = computed(() => {
  const night = resolution.value?.nightNumber ?? gameStore.nightNumber
  return `Amanecer · Noche ${String(night)}`
})

async function playRevealCue(cueId: AudioCueId): Promise<void> {
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
  await playRevealCue(activeCue.value)
}

function stopAudio(): void {
  stopNarration()
  isNarrating.value = false
}

function handleContinue(): void {
  stopAudio()
  const result = gameStore.proceedToDay()
  if (result.ok && gameStore.phase === 'day') {
    playAmbient('day')
  }
}

watch(
  () => gameStore.phase,
  (phase, previousPhase) => {
    if (phase === 'reveal' && resolution.value) {
      const cue: AudioCueId = resolution.value.killedPlayerId
        ? 'reveal-killed'
        : 'reveal-saved'
      void playRevealCue(cue)
      return
    }

    if (previousPhase === 'reveal') {
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
    :open="isRevealOpen"
    :closable="false"
    :title="modalTitle">
    <div
      v-if="resolution"
      class="reveal-modal">
      <div class="reveal-modal__audio-bar">
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
        padding="md">
        <div
          v-if="killedPlayer"
          class="reveal-modal__outcome">
          <SalBadge
            tone="danger"
            size="md">
            Víctima de la noche
          </SalBadge>

          <p class="reveal-modal__headline">
            {{ killedPlayer.name }} fue eliminado durante la noche.
          </p>

          <p class="reveal-modal__detail">
            Las campanas doblan por Salem. Su rol permanece oculto hasta que el pueblo revise sus cartas.
          </p>
        </div>

        <div
          v-else
          class="reveal-modal__outcome">
          <SalBadge
            tone="success"
            size="md">
            ¡Nadie murió esta noche!
          </SalBadge>

          <p class="reveal-modal__headline">
            El martillo del Alguacil protegió al pueblo.
          </p>

          <p class="reveal-modal__detail">
            Todos los aldeanos despiertan con vida para iniciar un nuevo día en Salem.
          </p>
        </div>
      </SalCard>
    </div>

    <template #footer>
      <SalButton
        variant="primary"
        size="lg"
        block
        data-testid="reveal-continue-button"
        @click="handleContinue">
        Continuar al día
      </SalButton>
    </template>
  </SalModal>
</template>

<style scoped>
.reveal-modal {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-4);
}

.reveal-modal__audio-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-2);
}

.reveal-modal__outcome {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sal-space-2);
}

.reveal-modal__headline {
  margin: 0;
  font-size: var(--sal-font-size-md);
  font-weight: var(--sal-font-weight-bold);
  color: var(--sal-text-primary);
}

.reveal-modal__detail {
  margin: 0;
  font-size: var(--sal-font-size-sm);
  color: var(--sal-text-secondary);
  line-height: 1.45;
}
</style>
