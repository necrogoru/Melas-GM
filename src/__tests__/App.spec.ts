import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '@/App.vue'
import { SALEM_CHARACTERS } from '@/data/characters'
import { useGameStore } from '@/stores/gameStore'

const audioMocks = vi.hoisted(() => ({
  playCue: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  stopNarration: vi.fn<() => void>(),
  playAmbient: vi.fn<() => void>(),
  stopAmbient: vi.fn<() => void>(),
  isMuted: vi.fn<() => boolean>(() => false),
  toggleMute: vi.fn<() => boolean>(() => true)
}))

const wakeLockMocks = vi.hoisted(() => ({
  isWakeLockSupported: vi.fn<() => boolean>(() => true),
  isWakeLockActive: vi.fn<() => boolean>(() => false),
  requestWakeLock: vi.fn<() => Promise<boolean>>().mockResolvedValue(true),
  releaseWakeLock: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
}))

vi.mock('@/services/audioService', () => ({
  playCue: audioMocks.playCue,
  stopNarration: audioMocks.stopNarration,
  playAmbient: audioMocks.playAmbient,
  stopAmbient: audioMocks.stopAmbient,
  isMuted: audioMocks.isMuted,
  toggleMute: audioMocks.toggleMute
}))

vi.mock('@/services/wakeLockService', () => ({
  isWakeLockSupported: wakeLockMocks.isWakeLockSupported,
  isWakeLockActive: wakeLockMocks.isWakeLockActive,
  requestWakeLock: wakeLockMocks.requestWakeLock,
  releaseWakeLock: wakeLockMocks.releaseWakeLock
}))

async function registerPlayer(
  wrapper: VueWrapper,
  name: string,
  characterIndex: number
) {
  const character = SALEM_CHARACTERS[characterIndex]
  if (!character) {
    throw new Error(`Missing character at index ${String(characterIndex)}`)
  }

  await wrapper.get('input').setValue(name)
  await wrapper.get('[data-testid="open-character-picker"]').trigger('click')
  await wrapper.get(`[data-character-option="${character.id}"]`).trigger('click')
  await wrapper.get('form').trigger('submit')
}

describe('App', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
    wakeLockMocks.isWakeLockActive.mockReturnValue(false)
    audioMocks.isMuted.mockReturnValue(false)
    audioMocks.toggleMute.mockImplementation(() => {
      const next = !audioMocks.isMuted()
      audioMocks.isMuted.mockReturnValue(next)
      return next
    })
  })

  it('mounts the GameMasterView and runs end-to-end phase transitions without exposing secret roles', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })
    const store = useGameStore()

    expect(wrapper.text()).toContain('Salem 1692')
    expect(wrapper.find('[aria-label="Aldea de Salem 1692"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="wake-lock-indicator"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="mute-toggle"]').exists()).toBe(true)

    // Toggle mute
    await wrapper.get('[data-testid="mute-toggle"]').trigger('click')
    expect(audioMocks.toggleMute).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-testid="mute-toggle"]').attributes('aria-pressed')).toBe('true')

    // Register 4 players and start game
    await registerPlayer(wrapper, 'Ana', 0)
    await registerPlayer(wrapper, 'Beto', 1)
    await registerPlayer(wrapper, 'Clara', 2)
    await registerPlayer(wrapper, 'Diego', 3)

    wakeLockMocks.isWakeLockActive.mockReturnValue(true)
    await wrapper.get('[data-testid="play-button"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('dawn')
    expect(wakeLockMocks.requestWakeLock).toHaveBeenCalled()
    expect(wrapper.get('[data-testid="wake-lock-indicator"]').text()).toContain('Pantalla activa')

    // Dawn step 1: Witches (Ana = 0) + Black Cat (Clara = 2)
    await wrapper.get('[data-testid="witch-option-0"]').trigger('click')
    await wrapper.get('[data-testid="black-cat-option-2"]').trigger('click')
    await wrapper.get('[data-testid="dawn-witches-accept"]').trigger('click')
    await nextTick()

    expect(store.dawnStep).toBe('constable')

    // Dawn step 2: Constable (Beto = 1)
    await wrapper.get('[data-testid="constable-option-1"]').trigger('click')
    await wrapper.get('[data-testid="dawn-constable-accept"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('day')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    // Public Black Cat badge is shown on Clara, but Witch/Constable roles are never shown
    expect(wrapper.text()).toContain('Gato Negro')
    expect(wrapper.text()).not.toContain('Bruja:')
    expect(wrapper.text()).not.toContain('Alguacil:')

    // Night cycle: Witches target Diego (3), Constable protects Clara (2)
    await wrapper.get('[data-testid="start-night-button"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('night-witches')

    await wrapper.get('[data-testid="night-target-option-3"]').trigger('click')
    await wrapper.get('[data-testid="night-witches-accept"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('night-constable')

    await wrapper.get('[data-testid="night-protect-option-2"]').trigger('click')
    await wrapper.get('[data-testid="night-constable-accept"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('night-ready-reveal')

    await wrapper.get('[data-testid="night-reveal-button"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('reveal')
    expect(wrapper.text()).toContain('Diego')

    await wrapper.get('[data-testid="reveal-continue-button"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('day')

    // Day accusation: eliminate Ana (only witch) -> town wins
    await wrapper.get('[data-testid="day-accuse-submit"]').trigger('click')
    expect(wrapper.get('[role="alert"]').text()).toContain('acusado')

    await wrapper.get('[data-testid="day-accuse-option-0"]').trigger('click')
    wakeLockMocks.isWakeLockActive.mockReturnValue(false)
    await wrapper.get('[data-testid="day-accuse-submit"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('ended')
    expect(store.winner).toBe('town')
    expect(wakeLockMocks.releaseWakeLock).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Pueblo')

    // Play again returns to lobby
    await wrapper.get('[data-testid="play-again-button"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('lobby')
    expect(store.players).toHaveLength(0)
  })

  it('allows secret Constable reassignment during Day without exposing roles', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })
    const store = useGameStore()

    await registerPlayer(wrapper, 'Ana', 0)
    await registerPlayer(wrapper, 'Beto', 1)
    await registerPlayer(wrapper, 'Clara', 2)
    await registerPlayer(wrapper, 'Diego', 3)
    await wrapper.get('[data-testid="play-button"]').trigger('click')
    await nextTick()

    await wrapper.get('[data-testid="witch-option-0"]').trigger('click')
    await wrapper.get('[data-testid="black-cat-option-2"]').trigger('click')
    await wrapper.get('[data-testid="dawn-witches-accept"]').trigger('click')
    await nextTick()

    await wrapper.get('[data-testid="constable-option-1"]').trigger('click')
    await wrapper.get('[data-testid="dawn-constable-accept"]').trigger('click')
    await nextTick()

    const clara = store.players[2]
    if (!clara) throw new Error('Expected Clara')
    expect(store.isConstable(clara.id)).toBe(false)

    await wrapper.get('[data-testid="open-constable-reassign"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    await wrapper.get('[data-testid="confirm-constable-reassign"]').trigger('click')
    expect(wrapper.get('[role="alert"]').text()).toContain('Alguacil')

    await wrapper.get('[data-testid="reassign-constable-option-2"]').trigger('click')
    await wrapper.get('[data-testid="confirm-constable-reassign"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(store.isConstable(clara.id)).toBe(true)
    expect(wrapper.text()).not.toContain('Alguacil:')
  })

  it('opens the Salem 1692 rules guide from the info button', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    await wrapper.get('[data-testid="rules-button"]').trigger('click')
    await nextTick()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.text()).toContain('Guía de Salem 1692')
    expect(dialog.get('a').attributes('href')).toContain('ultraboardgames.com/salem/game-rules.php')
  })
})
