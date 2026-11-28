import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { SALEM_CHARACTERS } from '@/data/characters'
import { useGameStore } from '@/stores/gameStore'
import DawnSetupModal from '@/components/night/DawnSetupModal.vue'

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

function setupDawnGame(playerCount = 4) {
  const store = useGameStore()
  const names = ['Ana', 'Beto', 'Clara', 'Diego', 'Elena', 'Fran'].slice(0, playerCount)
  names.forEach((name, index) => {
    const character = SALEM_CHARACTERS[index]
    if (!character) throw new Error(`Missing character at index ${String(index)}`)
    const result = store.addPlayer(name, character.id)
    expect(result.ok).toBe(true)
  })
  expect(store.startGame().ok).toBe(true)
  expect(store.startDawn().ok).toBe(true)
  return store
}

describe('DawnSetupModal', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('does not render dialog or play cues outside dawn phase', () => {
    useGameStore()
    const wrapper = mount(DawnSetupModal)

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(audioMocks.playCue).not.toHaveBeenCalled()
  })

  it('plays dawn-witches cue, renders Black Cat instructions without player selections, and advances to day', async () => {
    const store = setupDawnGame()
    const wrapper = mount(DawnSetupModal)
    await nextTick()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(audioMocks.playCue).toHaveBeenCalledWith('dawn-witches')
    expect(wrapper.text()).toContain('Gato Negro')
    expect(wrapper.find('[data-testid^="witch-option-"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid^="black-cat-option-"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid^="constable-option-"]').exists()).toBe(false)

    const replayButton = wrapper.findAll('button').find((button) => button.text().includes('Repetir audio'))
    if (!replayButton) throw new Error('Missing replay button')
    await replayButton.trigger('click')
    expect(audioMocks.playCue).toHaveBeenCalledTimes(2)

    await wrapper.get('[data-testid="dawn-complete-button"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('day')
    expect(audioMocks.stopNarration).toHaveBeenCalled()
    expect(audioMocks.playAmbient).toHaveBeenCalledWith('day')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })
})
