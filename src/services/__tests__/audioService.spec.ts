import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AMBIENT_BASE_VOLUME,
  AMBIENT_DUCKED_VOLUME,
  AUDIO_CUES,
  SFX_VOLUME,
  getAmbientVolume,
  isMuted,
  playAmbient,
  playCue,
  playSfx,
  setMuted,
  stopAmbient,
  stopNarration,
  toggleMute,
  unlockAudio,
  type AudioCueId
} from '@/services/audioService'
import {
  isWakeLockActive,
  isWakeLockSupported,
  releaseWakeLock,
  requestWakeLock
} from '@/services/wakeLockService'

type EventHandler = () => void

class MockAudio {
  static instances: MockAudio[] = []
  static shouldFailPlay = false

  src: string
  loop = false
  volume = 1
  currentTime = 0
  paused = true
  private listeners = new Map<string, Set<EventHandler>>()

  constructor(src = '') {
    this.src = src
    MockAudio.instances.push(this)
  }

  addEventListener(event: string, handler: EventHandler): void {
    const existing = this.listeners.get(event) ?? new Set<EventHandler>()
    existing.add(handler)
    this.listeners.set(event, existing)
  }

  removeEventListener(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler)
  }

  emit(event: string): void {
    for (const handler of this.listeners.get(event) ?? []) {
      handler()
    }
  }

  play(): Promise<void> {
    if (MockAudio.shouldFailPlay) {
      return Promise.reject(new Error('Audio load failed'))
    }
    this.paused = false
    return Promise.resolve()
  }

  pause(): void {
    this.paused = true
  }
}

class MockUtterance {
  text: string
  lang = ''
  rate = 1
  private listeners = new Map<string, Set<EventHandler>>()

  constructor(text: string) {
    this.text = text
  }

  addEventListener(event: string, handler: EventHandler): void {
    const existing = this.listeners.get(event) ?? new Set<EventHandler>()
    existing.add(handler)
    this.listeners.set(event, existing)
  }

  removeEventListener(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler)
  }

  emit(event: string): void {
    for (const handler of this.listeners.get(event) ?? []) {
      handler()
    }
  }
}

describe('audioService', () => {
  const originalAudio = globalThis.Audio
  const originalSpeechSynthesis = window.speechSynthesis
  const originalUtterance = globalThis.SpeechSynthesisUtterance

  beforeEach(() => {
    MockAudio.instances = []
    MockAudio.shouldFailPlay = false
    vi.stubGlobal('Audio', MockAudio)
    setMuted(false)
    stopNarration()
    stopAmbient()
  })

  afterEach(() => {
    stopNarration()
    stopAmbient()
    setMuted(false)
    globalThis.Audio = originalAudio
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: originalSpeechSynthesis
    })
    globalThis.SpeechSynthesisUtterance = originalUtterance
    vi.unstubAllGlobals()
  })

  it('plays ambient loop for day and night and stops cleanly', () => {
    playAmbient('day')
    expect(MockAudio.instances).toHaveLength(1)
    const dayAudio = MockAudio.instances[0]
    expect(dayAudio?.src).toBe('/audio/music-day.mp3')
    expect(dayAudio?.loop).toBe(true)
    expect(dayAudio?.volume).toBe(AMBIENT_BASE_VOLUME)
    expect(dayAudio?.paused).toBe(false)

    playAmbient('night')
    expect(dayAudio?.paused).toBe(true)
    expect(MockAudio.instances).toHaveLength(2)
    const nightAudio = MockAudio.instances[1]
    expect(nightAudio?.src).toBe('/audio/music-night.mp3')
    expect(nightAudio?.loop).toBe(true)

    stopAmbient()
    expect(nightAudio?.paused).toBe(true)
  })

  it('defines the 5 official Town Crier cues with MP3 sources and Spanish fallback text', () => {
    const expectedCueIds: AudioCueId[] = [
      'dawn-witches',
      'night-witches',
      'night-constable',
      'night-confession',
      'reveal-night'
    ]

    expect(new Set(Object.keys(AUDIO_CUES))).toEqual(new Set(expectedCueIds))
    for (const cueId of expectedCueIds) {
      expect(AUDIO_CUES[cueId].src).toBe(`/audio/${cueId}.mp3`)
      expect(AUDIO_CUES[cueId].fallbackText.trim().length).toBeGreaterThan(0)
    }
  })

  it.each<AudioCueId>([
    'dawn-witches',
    'night-witches',
    'night-constable',
    'night-confession',
    'reveal-night'
  ])('ducks ambient audio while playing %s and restores volume when ended', async (cueId) => {
    playAmbient('night')
    const ambientAudio = MockAudio.instances[0]
    expect(ambientAudio?.volume).toBe(AMBIENT_BASE_VOLUME)

    const cuePromise = playCue(cueId)
    expect(MockAudio.instances).toHaveLength(2)

    const cueAudio = MockAudio.instances[1]
    expect(cueAudio?.src).toBe(`/audio/${cueId}.mp3`)
    expect(getAmbientVolume()).toBe(AMBIENT_DUCKED_VOLUME)
    expect(ambientAudio?.volume).toBe(AMBIENT_DUCKED_VOLUME)

    cueAudio?.emit('ended')
    await cuePromise

    expect(getAmbientVolume()).toBe(AMBIENT_BASE_VOLUME)
    expect(ambientAudio?.volume).toBe(AMBIENT_BASE_VOLUME)
  })

  it('falls back to Spanish speechSynthesis when MP3 fails to play', async () => {
    MockAudio.shouldFailPlay = true

    const speakMock = vi.fn<(utterance: MockUtterance) => void>((utterance) => {
      expect(getAmbientVolume()).toBe(AMBIENT_DUCKED_VOLUME)
      utterance.emit('end')
    })

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: {
        speak: speakMock,
        cancel: vi.fn<() => void>()
      }
    })
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance)

    playAmbient('day')
    await playCue('dawn-witches')

    expect(speakMock).toHaveBeenCalledTimes(1)
    const spoken = speakMock.mock.calls[0]?.[0]
    expect(spoken?.lang).toBe('es-ES')
    expect(spoken?.text.length).toBeGreaterThan(0)
    expect(getAmbientVolume()).toBe(AMBIENT_BASE_VOLUME)
  })

  it('resolves gracefully when both MP3 and speechSynthesis are unavailable', async () => {
    MockAudio.shouldFailPlay = true
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: undefined
    })

    await expect(playCue('night-confession')).resolves.toBeUndefined()
  })

  it('mutes ambient audio and skips narration when muted', async () => {
    playAmbient('day')
    const ambientAudio = MockAudio.instances[0]

    expect(isMuted()).toBe(false)
    expect(toggleMute()).toBe(true)
    expect(isMuted()).toBe(true)
    expect(ambientAudio?.volume).toBe(0)

    await playCue('night-constable')
    expect(MockAudio.instances).toHaveLength(1)

    expect(toggleMute()).toBe(false)
    expect(ambientAudio?.volume).toBe(AMBIENT_BASE_VOLUME)
  })

  it('plays stage SFX and skips SFX when muted', () => {
    playSfx('start')
    playSfx('dawn')
    playSfx('day')
    playSfx('night')
    playSfx('reveal')

    expect(MockAudio.instances.map((instance) => instance.src)).toEqual([
      '/audio/sfx-start.mp3',
      '/audio/sfx-dawn.mp3',
      '/audio/sfx-day.mp3',
      '/audio/sfx-night.mp3',
      '/audio/sfx-reveal.mp3'
    ])
    for (const instance of MockAudio.instances) {
      expect(instance.volume).toBe(SFX_VOLUME)
      expect(instance.paused).toBe(false)
    }

    setMuted(true)
    playSfx('reveal')
    expect(MockAudio.instances).toHaveLength(5)
  })

  it('retries autoplay-blocked ambient playback on unlockAudio and user interaction', async () => {
    MockAudio.shouldFailPlay = true
    playAmbient('day')
    const dayAudio = MockAudio.instances[0]
    expect(dayAudio?.paused).toBe(true)

    await Promise.resolve()
    MockAudio.shouldFailPlay = false

    unlockAudio()
    await Promise.resolve()
    expect(dayAudio?.paused).toBe(false)

    stopAmbient()
    MockAudio.shouldFailPlay = true
    playAmbient('night')
    const nightAudio = MockAudio.instances[1]
    expect(nightAudio?.paused).toBe(true)

    await Promise.resolve()
    MockAudio.shouldFailPlay = false
    document.dispatchEvent(new Event('pointerdown'))
    await Promise.resolve()
    expect(nightAudio?.paused).toBe(false)
  })

  it('has generated ambient music and stage SFX MP3 files in public/audio', () => {
    const audioDir = resolve(process.cwd(), 'public/audio')
    const expectedFiles = [
      'music-day.mp3',
      'music-night.mp3',
      'sfx-start.mp3',
      'sfx-dawn.mp3',
      'sfx-day.mp3',
      'sfx-night.mp3',
      'sfx-reveal.mp3'
    ]

    for (const file of expectedFiles) {
      expect(existsSync(resolve(audioDir, file)), `${file} should exist in public/audio`).toBe(true)
    }
  })
})

describe('wakeLockService', () => {
  afterEach(async () => {
    await releaseWakeLock()
    vi.restoreAllMocks()
  })

  it('handles unsupported environments gracefully', async () => {
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: undefined
    })

    expect(isWakeLockSupported()).toBe(false)
    await expect(requestWakeLock()).resolves.toBe(false)
    expect(isWakeLockActive()).toBe(false)
  })

  it('acquires wake lock, re-acquires on visibilitychange, and releases cleanly', async () => {
    const releaseMock = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    const listeners = new Map<string, Set<() => void>>()

    const createSentinel = () => ({
      released: false,
      type: 'screen' as const,
      release: releaseMock,
      addEventListener: (event: string, handler: () => void) => {
        const set = listeners.get(event) ?? new Set<() => void>()
        set.add(handler)
        listeners.set(event, set)
      },
      removeEventListener: (event: string, handler: () => void) => {
        listeners.get(event)?.delete(handler)
      },
      dispatchEvent: () => true,
      onrelease: null
    })

    type MockSentinel = {
      released: boolean
      type: 'screen'
      release: typeof releaseMock
      addEventListener: (event: string, handler: () => void) => void
      removeEventListener: (event: string, handler: () => void) => void
      dispatchEvent: () => boolean
      onrelease: null
    }

    const requestMock = vi
      .fn<() => Promise<MockSentinel>>()
      .mockImplementation(() => Promise.resolve(createSentinel()))

    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request: requestMock }
    })

    expect(isWakeLockSupported()).toBe(true)
    await expect(requestWakeLock()).resolves.toBe(true)
    expect(requestMock).toHaveBeenCalledWith('screen')
    expect(isWakeLockActive()).toBe(true)

    // Simulate OS releasing the wake lock when tab is hidden, then returning visible
    for (const handler of listeners.get('release') ?? []) {
      handler()
    }
    expect(isWakeLockActive()).toBe(false)

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible'
    })
    document.dispatchEvent(new Event('visibilitychange'))

    await vi.waitFor(() => {
      expect(requestMock).toHaveBeenCalledTimes(2)
    })
    expect(isWakeLockActive()).toBe(true)

    await releaseWakeLock()
    expect(releaseMock).toHaveBeenCalledTimes(1)
    expect(isWakeLockActive()).toBe(false)
  })
})
