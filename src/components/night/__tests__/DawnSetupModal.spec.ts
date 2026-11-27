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

function setupDawnGame() {
  const store = useGameStore()
  const names = ['Ana', 'Beto', 'Clara', 'Diego']
  names.forEach((name, index) => {
    const character = SALEM_CHARACTERS[index]
    if (!character) throw new Error(`Missing character at index ${String(index)}`)
    const result = store.addPlayer(name, character.id)
    expect(result.ok).toBe(true)
  })
  const startResult = store.startGame()
  expect(startResult.ok).toBe(true)
  return store
}

describe('DawnSetupModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('does not render dialog or play cues outside dawn phase', () => {
    useGameStore()
    const wrapper = mount(DawnSetupModal)

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(audioMocks.playCue).not.toHaveBeenCalled()
  })

  it('plays dawn-witches cue and validates selections on submit', async () => {
    setupDawnGame()
    const wrapper = mount(DawnSetupModal)
    await nextTick()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(audioMocks.playCue).toHaveBeenCalledWith('dawn-witches')

    const submitButton = wrapper.get('[data-testid="dawn-witches-accept"]')
    await submitButton.trigger('click')
    expect(wrapper.get('[role="alert"]').text()).toContain('bruja')

    await wrapper.get('[data-testid="witch-option-0"]').trigger('click')
    await submitButton.trigger('click')
    expect(wrapper.get('[role="alert"]').text()).toContain('Gato Negro')
  })

  it('marks witches and Black Cat, hides witch identities on Accept, then marks Constable secretly', async () => {
    const store = setupDawnGame()
    const [ana, beto, clara, diego] = store.players
    if (!ana || !beto || !clara || !diego) throw new Error('Expected 4 players')

    const wrapper = mount(DawnSetupModal)
    await nextTick()

    await wrapper.get('[data-testid="witch-option-0"]').trigger('click')
    await wrapper.get('[data-testid="witch-option-1"]').trigger('click')
    await wrapper.get('[data-testid="black-cat-option-2"]').trigger('click')
    await wrapper.get('[data-testid="dawn-witches-accept"]').trigger('click')
    await nextTick()

    expect(store.isWitch(ana.id)).toBe(true)
    expect(store.isWitch(beto.id)).toBe(true)
    expect(store.isWitch(clara.id)).toBe(false)
    expect(store.blackCatHolderId).toBe(clara.id)
    expect(store.dawnStep).toBe('constable')
    expect(audioMocks.playCue).toHaveBeenCalledWith('dawn-constable')

    // Secrecy after Accept: no witch selections or witch-step UI remain in the DOM
    expect(wrapper.find('[data-testid="witch-option-0"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="dawn-witches-accept"]').exists()).toBe(false)
    const constableButtons = wrapper.findAll('[data-testid^="constable-option-"]')
    expect(constableButtons).toHaveLength(4)
    constableButtons.forEach((button) => {
      expect(button.attributes('aria-pressed')).toBe('false')
    })

    // Constable validation on submit
    await wrapper.get('[data-testid="dawn-constable-accept"]').trigger('click')
    expect(wrapper.get('[role="alert"]').text()).toContain('Alguacil')
    expect(store.phase).toBe('dawn')

    // Constable selects themselves and hides identity on Accept
    await wrapper.get('[data-testid="constable-option-3"]').trigger('click')
    await wrapper.get('[data-testid="dawn-constable-accept"]').trigger('click')
    await nextTick()

    expect(store.isConstable(diego.id)).toBe(true)
    expect(store.phase).toBe('day')
    expect(audioMocks.stopNarration).toHaveBeenCalled()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('Diego')
  })
})
