import { computed, onScopeDispose, ref, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { playAmbient, playCue, stopNarration, type AudioCueId } from '@/services/audioService'
import type { ActionResult, GamePhase } from '@/types/game'

function getDawnCue(phase: GamePhase): AudioCueId | null {
  return phase === 'dawn' ? 'dawn-witches' : null
}

export function useNightFlow() {
  const gameStore = useGameStore()
  const isNarrating = ref(false)
  const activeCue = ref<AudioCueId | null>(null)

  const isDawnOpen = computed(() => gameStore.phase === 'dawn')

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

  function completeDawn(): ActionResult {
    return gameStore.completeDawn()
  }

  watch(
    () => gameStore.phase,
    (phase, previousPhase) => {
      const cue = getDawnCue(phase)
      if (cue) {
        void playStepCue(cue)
        return
      }

      if (previousPhase === 'dawn') {
        stopAudio()
        if (phase === 'day') {
          playAmbient('day')
        }
      }
    },
    { immediate: true }
  )

  onScopeDispose(() => {
    stopAudio()
  })

  return {
    isDawnOpen,
    isNarrating,
    activeCue,
    playStepCue,
    replayCue,
    stopAudio,
    completeDawn
  }
}
