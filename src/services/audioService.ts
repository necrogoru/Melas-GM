export type AudioCueId =
  | 'dawn-witches'
  | 'night-witches'
  | 'night-constable'
  | 'night-confession'
  | 'reveal-night'

export type AmbientTrackId = 'day' | 'night'

export type SfxId = 'start' | 'dawn' | 'day' | 'night' | 'reveal'

interface AudioCueDefinition {
  src: string
  fallbackText: string
}

export const AMBIENT_BASE_VOLUME = 0.25
export const AMBIENT_DUCKED_VOLUME = 0.06
export const SFX_VOLUME = 0.5

export const AMBIENT_TRACKS: Record<AmbientTrackId, string> = {
  day: '/audio/music-day.mp3',
  night: '/audio/music-night.mp3'
}

export const SFX_TRACKS: Record<SfxId, string> = {
  start: '/audio/sfx-start.mp3',
  dawn: '/audio/sfx-dawn.mp3',
  day: '/audio/sfx-day.mp3',
  night: '/audio/sfx-night.mp3',
  reveal: '/audio/sfx-reveal.mp3'
}

export const AUDIO_CUES: Record<AudioCueId, AudioCueDefinition> = {
  'dawn-witches': {
    src: '/audio/dawn-witches.mp3',
    fallbackText:
      'El alba cae sobre Salem. Todos cierren los ojos. Brujas, abran los ojos, reconózcanse en silencio y coloquen el Gato Negro sobre la mesa.'
  },
  'night-witches': {
    src: '/audio/night-witches.mp3',
    fallbackText:
      'Llegó la noche a Salem. Todos cierren los ojos. Brujas, despierten en silencio y elijan a su víctima.'
  },
  'night-constable': {
    src: '/audio/night-constable.mp3',
    fallbackText:
      'Las brujas vuelven a dormir. Alguacil, si sigues en juego, despierta y coloca el martillo sobre otro jugador.'
  },
  'night-confession': {
    src: '/audio/night-confession.mp3',
    fallbackText:
      'El Alguacil cierra los ojos. Pueblo de Salem, despierten todos. Antes de revelar la víctima, pueden confesar volteando una carta de Juicio para salvarse esta noche.'
  },
  'reveal-night': {
    src: '/audio/reveal-night.mp3',
    fallbackText:
      'Es momento de revelar lo ocurrido esta noche. Comprueben si la víctima fue salvada por el martillo, una confesión o el asilo; si muere, pronuncia sus tres últimas palabras.'
  }
}

let activeAmbientAudio: HTMLAudioElement | null = null
let currentAmbientTrack: AmbientTrackId | null = null
let activeNarrationAudio: HTMLAudioElement | null = null
let muted = false
let narrating = false
let narrationGeneration = 0
let unlockListenersAttached = false

const UNLOCK_EVENTS = ['pointerdown', 'keydown'] as const

function handleUnlockInteraction(): void {
  unlockAudio()
}

function attachUnlockListeners(): void {
  if (unlockListenersAttached || typeof document === 'undefined') return
  unlockListenersAttached = true
  for (const eventName of UNLOCK_EVENTS) {
    document.addEventListener(eventName, handleUnlockInteraction, { passive: true })
  }
}

function detachUnlockListeners(): void {
  if (!unlockListenersAttached || typeof document === 'undefined') return
  unlockListenersAttached = false
  for (const eventName of UNLOCK_EVENTS) {
    document.removeEventListener(eventName, handleUnlockInteraction)
  }
}

function attemptAmbientPlay(audio: HTMLAudioElement): void {
  void audio.play().then(
    () => {
      if (activeAmbientAudio === audio) {
        detachUnlockListeners()
      }
    },
    () => {
      if (activeAmbientAudio === audio) {
        attachUnlockListeners()
      }
    }
  )
}

export function getAmbientVolume(): number {
  if (muted) return 0
  return narrating ? AMBIENT_DUCKED_VOLUME : AMBIENT_BASE_VOLUME
}

function syncAmbientVolume(): void {
  if (activeAmbientAudio) {
    activeAmbientAudio.volume = getAmbientVolume()
  }
}

function playAudioFile(src: string, generation: number): Promise<boolean> {
  if (typeof Audio === 'undefined') {
    return Promise.resolve(false)
  }

  return new Promise<boolean>((resolve) => {
    const audio = new Audio(src)
    activeNarrationAudio = audio
    let settled = false

    const finish = (played: boolean) => {
      if (settled) return
      settled = true
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      if (activeNarrationAudio === audio) {
        activeNarrationAudio = null
      }
      resolve(played)
    }

    const onEnded = () => {
      finish(true) 
    }
    const onError = () => {
      finish(false) 
    }

    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    audio.play().catch(() => {
      if (generation === narrationGeneration) {
        finish(false)
      } else {
        finish(true)
      }
    })
  })
}

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const synthesis = (window as { speechSynthesis?: SpeechSynthesis }).speechSynthesis
  return synthesis ?? null
}

function speakSpanish(text: string, generation: number): Promise<void> {
  const synthesis = getSpeechSynthesis()
  if (!synthesis || typeof SpeechSynthesisUtterance === 'undefined') {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    if (generation !== narrationGeneration || isMuted()) {
      resolve()
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-ES'
    utterance.rate = 0.95

    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      utterance.removeEventListener('end', finish)
      utterance.removeEventListener('error', finish)
      resolve()
    }

    utterance.addEventListener('end', finish)
    utterance.addEventListener('error', finish)

    synthesis.speak(utterance)
  })
}

export async function playCue(cueId: AudioCueId, customText?: string): Promise<void> {
  if (isMuted()) return

  stopNarration()
  const generation = narrationGeneration
  const cue = AUDIO_CUES[cueId]

  narrating = true
  syncAmbientVolume()

  try {
    const playedMp3 = await playAudioFile(cue.src, generation)
    if (!playedMp3 && generation === narrationGeneration && !isMuted()) {
      await speakSpanish(customText ?? cue.fallbackText, generation)
    }
  } finally {
    if (generation === narrationGeneration) {
      narrating = false
      syncAmbientVolume()
    }
  }
}

export function stopNarration(): void {
  narrationGeneration += 1

  if (activeNarrationAudio) {
    activeNarrationAudio.pause()
    activeNarrationAudio.currentTime = 0
    activeNarrationAudio = null
  }

  const synthesis = getSpeechSynthesis()
  if (synthesis) {
    synthesis.cancel()
  }

  narrating = false
  syncAmbientVolume()
}

export function playSfx(id: SfxId): void {
  if (isMuted() || typeof Audio === 'undefined') return

  const audio = new Audio(SFX_TRACKS[id])
  audio.volume = SFX_VOLUME
  void audio.play().catch(() => undefined)
}

export function unlockAudio(): void {
  if (!activeAmbientAudio || !activeAmbientAudio.paused || !currentAmbientTrack || muted) {
    return
  }

  syncAmbientVolume()
  attemptAmbientPlay(activeAmbientAudio)
}

export function playAmbient(track: AmbientTrackId): void {
  if (currentAmbientTrack === track && activeAmbientAudio) {
    syncAmbientVolume()
    if (activeAmbientAudio.paused) {
      attemptAmbientPlay(activeAmbientAudio)
    }
    return
  }

  stopAmbient()

  if (typeof Audio === 'undefined') return

  const audio = new Audio(AMBIENT_TRACKS[track])
  audio.loop = true
  activeAmbientAudio = audio
  currentAmbientTrack = track
  syncAmbientVolume()

  attemptAmbientPlay(audio)
}

export function stopAmbient(): void {
  detachUnlockListeners()
  if (activeAmbientAudio) {
    activeAmbientAudio.pause()
    activeAmbientAudio.currentTime = 0
    activeAmbientAudio = null
  }
  currentAmbientTrack = null
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(nextMuted: boolean): void {
  muted = nextMuted
  if (muted) {
    stopNarration()
  }
  syncAmbientVolume()
  if (!muted && activeAmbientAudio?.paused) {
    unlockAudio()
  }
}

export function toggleMute(): boolean {
  setMuted(!muted)
  return muted
}
