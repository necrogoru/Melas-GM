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
  playSfx: vi.fn<() => void>(),
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
  playSfx: audioMocks.playSfx,
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
    localStorage.clear()
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

  it('mounts the GameMasterView and runs end-to-end Crier flow from lobby through day and night', async () => {
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
    expect(audioMocks.playAmbient).toHaveBeenCalledWith('day')

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

    expect(store.phase).toBe('gathering')
    expect(audioMocks.playSfx).toHaveBeenCalledWith('start')
    expect(wakeLockMocks.requestWakeLock).toHaveBeenCalled()
    expect(wrapper.get('[data-testid="wake-lock-indicator"]').text()).toContain('Pantalla activa')
    expect(wrapper.find('[data-testid="game-start-transition"]').exists()).toBe(true)

    // Skip transition overlay by clicking it
    await wrapper.get('[data-testid="game-start-transition"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-testid="game-start-transition"]').exists()).toBe(false)

    // Gathering roster and Iniciar El Alba button
    const gatheringCard = wrapper.get('[data-testid="gathering-card"]')
    expect(gatheringCard.text()).toContain('Ana')
    expect(gatheringCard.text()).toContain('Beto')
    expect(gatheringCard.text()).toContain('Clara')
    expect(gatheringCard.text()).toContain('Diego')

    await wrapper.get('[data-testid="start-dawn-button"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('dawn')
    expect(audioMocks.playSfx).toHaveBeenCalledWith('dawn')
    expect(audioMocks.playAmbient).toHaveBeenCalledWith('night')
    expect(wrapper.get('[role="dialog"]').text()).toContain('El Alba · Brujas')

    // Single-step Dawn completes into Day
    await wrapper.get('[data-testid="dawn-complete-button"]').trigger('click')
    await nextTick()

    expect(store.phase).toBe('day')
    expect(audioMocks.playSfx).toHaveBeenCalledWith('day')
    expect(audioMocks.playAmbient).toHaveBeenCalledWith('day')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="day-accuse-submit"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="open-constable-reassign"]').exists()).toBe(false)

    // Night cycle: Witches -> Constable -> Confession -> Reveal -> Day
    await wrapper.get('[data-testid="start-night-button"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('night-witches')
    expect(audioMocks.playSfx).toHaveBeenCalledWith('night')
    expect(audioMocks.playAmbient).toHaveBeenCalledWith('night')
    expect(wrapper.get('[role="dialog"]').text()).toContain('Noche 1 · Brujas')

    await wrapper.get('[data-testid="night-witches-next"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('night-constable')
    expect(wrapper.get('[role="dialog"]').text()).toContain('Noche 1 · Alguacil')

    await wrapper.get('[data-testid="night-constable-next"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('night-confession')
    expect(wrapper.get('[role="dialog"]').text()).toContain('Noche 1 · Confesión')

    await wrapper.get('[data-testid="night-reveal-button"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('reveal')
    expect(audioMocks.playSfx).toHaveBeenCalledWith('reveal')
    expect(wrapper.get('[role="dialog"]').text()).toContain('Amanecer · Noche 1')

    await wrapper.get('[data-testid="reveal-continue-button"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('day')
    expect(audioMocks.playSfx).toHaveBeenCalledWith('day')
    expect(audioMocks.playAmbient).toHaveBeenCalledWith('day')

    // Nueva partida returns to lobby and releases wake lock
    wakeLockMocks.isWakeLockActive.mockReturnValue(false)
    await wrapper.get('[data-testid="new-game-button"]').trigger('click')
    await nextTick()
    expect(store.phase).toBe('lobby')
    expect(store.players).toHaveLength(0)
    expect(wakeLockMocks.releaseWakeLock).toHaveBeenCalled()
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
    expect(dialog.text()).toContain('Confesión')
    expect(dialog.get('a').attributes('href')).toContain('ultraboardgames.com/salem/game-rules.php')
  })
})
