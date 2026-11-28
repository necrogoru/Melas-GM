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
    const result = store.addPlayer(name, character.id)
    expect(result.ok).toBe(true)
  })
  expect(store.startGame().ok).toBe(true)
  expect(store.startDawn().ok).toBe(true)

  const [ana, beto, clara, diego] = store.players
  if (!ana || !beto || !clara || !diego) throw new Error('Expected 4 players')

  expect(store.confirmDawnWitches([ana.id], clara.id).ok).toBe(true)
  expect(store.confirmDawnConstable(beto.id).ok).toBe(true)
  return { store, ana, beto, clara, diego }
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

  it('runs the full night sequence, excludes Constable self-protection, and reveals a kill', async () => {
    const { store, clara, diego } = setupDayGame()
    const nightWrapper = mount(NightFlowModal)
    const revealWrapper = mount(RevealModal)

    expect(store.startNight().ok).toBe(true)
    await nextTick()

    expect(nightWrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(audioMocks.playAmbient).toHaveBeenCalledWith('night')
    expect(audioMocks.playCue).toHaveBeenCalledWith('night-witches')

    // Validation on empty witch target submit
    await nightWrapper.get('[data-testid="night-witches-accept"]').trigger('click')
    expect(nightWrapper.get('[role="alert"]').text()).toContain('objetivo')
    expect(store.phase).toBe('night-witches')

    // Witches target Diego (index 3) and hide selection on Accept
    await nightWrapper.get('[data-testid="night-target-option-3"]').trigger('click')
    await nightWrapper.get('[data-testid="night-witches-accept"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('night-constable')
    expect(audioMocks.playCue).toHaveBeenCalledWith('night-constable')
    expect(nightWrapper.find('[data-testid="night-target-option-3"]').exists()).toBe(false)

    // Constable is Beto (index 1): self-protection button must be disabled
    const constableSelfButton = nightWrapper.get('[data-testid="night-protect-option-1"]')
    expect(constableSelfButton.attributes('disabled')).toBeDefined()

    // Validation on empty Constable protection submit
    await nightWrapper.get('[data-testid="night-constable-accept"]').trigger('click')
    expect(nightWrapper.get('[role="alert"]').text()).toContain('proteger')
    expect(store.phase).toBe('night-constable')

    // Constable protects Clara (index 2) and hides selection on Accept
    await nightWrapper.get('[data-testid="night-protect-option-2"]').trigger('click')
    await nightWrapper.get('[data-testid="night-constable-accept"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('night-ready-reveal')
    expect(audioMocks.playCue).toHaveBeenCalledWith('night-ready-reveal')
    expect(nightWrapper.find('[data-testid="night-protect-option-2"]').exists()).toBe(false)
    expect(nightWrapper.html()).not.toContain(clara.name)
    expect(nightWrapper.html()).not.toContain(diego.name)

    // Click Revelar -> closes NightFlowModal and opens RevealModal with killed outcome
    await nightWrapper.get('[data-testid="night-reveal-button"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('reveal')
    expect(nightWrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(revealWrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(audioMocks.playCue).toHaveBeenCalledWith('reveal-killed')
    expect(revealWrapper.text()).toContain('Diego')
    expect(store.players.find((p) => p.id === diego.id)?.alive).toBe(false)

    // Continue to day
    await revealWrapper.get('[data-testid="reveal-continue-button"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('day')
    expect(revealWrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(audioMocks.playAmbient).toHaveBeenCalledWith('day')
  })

  it('reveals saved outcome without exposing target or protector when Constable saves victim', async () => {
    const { store, clara, diego } = setupDayGame()
    const nightWrapper = mount(NightFlowModal)
    const revealWrapper = mount(RevealModal)

    expect(store.startNight().ok).toBe(true)
    await nextTick()

    // Witches target Diego (index 3)
    await nightWrapper.get('[data-testid="night-target-option-3"]').trigger('click')
    await nightWrapper.get('[data-testid="night-witches-accept"]').trigger('click')
    await nextTick()

    // Constable protects Diego (index 3)
    await nightWrapper.get('[data-testid="night-protect-option-3"]').trigger('click')
    await nightWrapper.get('[data-testid="night-constable-accept"]').trigger('click')
    await nextTick()

    await nightWrapper.get('[data-testid="night-reveal-button"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('reveal')
    expect(audioMocks.playCue).toHaveBeenCalledWith('reveal-saved')
    expect(revealWrapper.text()).toContain('Nadie murió')
    expect(revealWrapper.text()).not.toContain(diego.name)
    expect(revealWrapper.text()).not.toContain(clara.name)
    expect(store.players.find((p) => p.id === diego.id)?.alive).toBe(true)
  })

  it('allows continuing Constable step when Constable is already eliminated', async () => {
    const { store, beto, diego } = setupDayGame()
    expect(store.eliminatePlayer(beto.id).ok).toBe(true)

    const nightWrapper = mount(NightFlowModal)
    const revealWrapper = mount(RevealModal)

    expect(store.startNight().ok).toBe(true)
    await nextTick()

    await nightWrapper.get('[data-testid="night-target-option-2"]').trigger('click')
    await nightWrapper.get('[data-testid="night-witches-accept"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('night-constable')
    expect(nightWrapper.findAll('[data-testid^="night-protect-option-"]')).toHaveLength(0)

    await nightWrapper.get('[data-testid="night-constable-accept"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('night-ready-reveal')

    await nightWrapper.get('[data-testid="night-reveal-button"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('reveal')
    expect(revealWrapper.text()).toContain(diego.name)
    expect(store.players.find((p) => p.id === diego.id)?.alive).toBe(false)
  })
})
