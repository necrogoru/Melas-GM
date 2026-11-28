import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { SALEM_CHARACTERS } from '@/data/characters'
import { useGameStore } from '@/stores/gameStore'
import NightFlowModal from '@/components/night/NightFlowModal.vue'
import RevealModal from '@/components/night/RevealModal.vue'

const audioMocks = vi.hoisted(() => ({
  playCue: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  stopNarration: vi.fn<() => void>(),
  playAmbient: vi.fn<() => void>()
}))

vi.mock('@/services/audioService', () => ({
  playCue: audioMocks.playCue,
  stopNarration: audioMocks.stopNarration,
  playAmbient: audioMocks.playAmbient
}))

function setupDayGame() {
  const store = useGameStore()
  const names = ['Ana', 'Beto', 'Clara', 'Diego']
  names.forEach((name, index) => {
    const character = SALEM_CHARACTERS[index]
    if (!character) throw new Error(`Missing character at index ${String(index)}`)
    expect(store.addPlayer(name, character.id).ok).toBe(true)
  })
  expect(store.startGame().ok).toBe(true)
  expect(store.startDawn().ok).toBe(true)
  expect(store.completeDawn().ok).toBe(true)
  return store
}

describe('NightFlowModal and RevealModal', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('does not render dialogs or play cues during day phase', () => {
    setupDayGame()
    const nightWrapper = mount(NightFlowModal)
    const revealWrapper = mount(RevealModal)

    expect(nightWrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(revealWrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(audioMocks.playCue).not.toHaveBeenCalled()
  })

  it('steps manually through witches, constable, confession, reveal, and back to day without player selections', async () => {
    const store = setupDayGame()
    const nightWrapper = mount(NightFlowModal)
    const revealWrapper = mount(RevealModal)

    expect(store.startNight().ok).toBe(true)
    await nextTick()

    expect(nightWrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(audioMocks.playAmbient).toHaveBeenCalledWith('night')
    expect(audioMocks.playCue).toHaveBeenCalledWith('night-witches')
    expect(nightWrapper.find('[data-testid^="night-target-option-"]').exists()).toBe(false)

    await nightWrapper.get('[data-testid="night-witches-next"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('night-constable')
    expect(audioMocks.playCue).toHaveBeenCalledWith('night-constable')
    expect(nightWrapper.find('[data-testid^="night-protect-option-"]').exists()).toBe(false)

    await nightWrapper.get('[data-testid="night-constable-next"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('night-confession')
    expect(audioMocks.playCue).toHaveBeenCalledWith('night-confession')
    expect(nightWrapper.text()).toContain('confesar')

    await nightWrapper.get('[data-testid="night-reveal-button"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('reveal')
    expect(nightWrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(revealWrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(audioMocks.playCue).toHaveBeenCalledWith('reveal-night')
    expect(revealWrapper.text()).toContain('martillo')
    expect(revealWrapper.text()).toContain('tres últimas palabras')
    expect(revealWrapper.text()).toContain('Barajen el descarte')

    await revealWrapper.get('[data-testid="reveal-continue-button"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('day')
    expect(revealWrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(audioMocks.playAmbient).toHaveBeenCalledWith('day')
  })

  it('replays the active audio cue in NightFlowModal and RevealModal', async () => {
    const store = setupDayGame()
    const nightWrapper = mount(NightFlowModal)
    const revealWrapper = mount(RevealModal)

    expect(store.startNight().ok).toBe(true)
    await nextTick()

    const nightReplay = nightWrapper
      .findAll('button')
      .find((button) => button.text().includes('Repetir audio'))
    if (!nightReplay) throw new Error('Missing NightFlowModal replay button')
    await nightReplay.trigger('click')
    expect(audioMocks.playCue).toHaveBeenCalledTimes(2)
    expect(audioMocks.playCue).toHaveBeenLastCalledWith('night-witches')

    await nightWrapper.get('[data-testid="night-witches-next"]').trigger('click')
    await nightWrapper.get('[data-testid="night-constable-next"]').trigger('click')
    await nightWrapper.get('[data-testid="night-reveal-button"]').trigger('click')
    await nextTick()

    const revealReplay = revealWrapper
      .findAll('button')
      .find((button) => button.text().includes('Repetir audio'))
    if (!revealReplay) throw new Error('Missing RevealModal replay button')
    await revealReplay.trigger('click')
    expect(audioMocks.playCue).toHaveBeenLastCalledWith('reveal-night')
  })
})
