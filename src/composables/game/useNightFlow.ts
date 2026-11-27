import { computed, onScopeDispose, ref, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { playAmbient, playCue, stopNarration, type AudioCueId } from '@/services/audioService'
import type { ActionResult, DawnStep, GamePhase } from '@/types/game'

function getDawnCue(phase: GamePhase, step: DawnStep): AudioCueId | null {
  if (phase !== 'dawn') return null
  return step === 'witches' ? 'dawn-witches' : 'dawn-constable'
}

export function useNightFlow() {
  const gameStore = useGameStore()
  const isNarrating = ref(false)
  const activeCue = ref<AudioCueId | null>(null)

  const isDawnOpen = computed(() => gameStore.phase === 'dawn')
  const dawnStep = computed(() => gameStore.dawnStep)
  const alivePlayers = computed(() => gameStore.alivePlayers)

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

  function submitDawnWitches(witchIds: string[], blackCatHolderId: string): ActionResult {
    return gameStore.confirmDawnWitches(witchIds, blackCatHolderId)
  }

  function submitDawnConstable(constableId: string): ActionResult {
    return gameStore.confirmDawnConstable(constableId)
  }

  watch(
    [() => gameStore.phase, () => gameStore.dawnStep],
    ([phase, step], previous) => {
      const cue = getDawnCue(phase, step)
      if (cue) {
        void playStepCue(cue)
        return
      }

      const previousPhase = previous[0]
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
    dawnStep,
    alivePlayers,
    isNarrating,
    activeCue,
    playStepCue,
    replayCue,
    stopAudio,
    submitDawnWitches,
    submitDawnConstable
  }
}
