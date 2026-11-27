export type AudioCueId =
  | 'dawn-witches'
  | 'dawn-constable'
  | 'night-witches'
  | 'night-constable'
  | 'night-ready-reveal'
  | 'reveal-killed'
  | 'reveal-saved'

export type AmbientTrackId = 'day' | 'night'

interface AudioCueDefinition {
  src: string
  fallbackText: string
}

export const AMBIENT_BASE_VOLUME = 0.25
export const AMBIENT_DUCKED_VOLUME = 0.06

export const AMBIENT_TRACKS: Record<AmbientTrackId, string> = {
  day: '/audio/ambience-day.mp3',
  night: '/audio/ambience-night.mp3'
}

export const AUDIO_CUES: Record<AudioCueId, AudioCueDefinition> = {
  'dawn-witches': {
    src: '/audio/dawn-witches.mp3',
    fallbackText:
      'El alba cae sobre Salem. Todos cierren los ojos. Brujas, abran los ojos, reconózcanse en silencio y entreguen el Gato Negro.'
  },
  'dawn-constable': {
    src: '/audio/dawn-constable.mp3',
    fallbackText:
      'Las brujas cierran los ojos. Alguacil, abre los ojos y márcate en secreto antes de que despierte el pueblo.'
  },
  'night-witches': {
    src: '/audio/night-witches.mp3',
    fallbackText:
      'Llegó la noche a Salem. Todos cierren los ojos. Brujas, despierten en silencio y elijan a su víctima.'
  },
  'night-constable': {
    src: '/audio/night-constable.mp3',
    fallbackText:
      'Las brujas vuelven a dormir. Alguacil, despierta y coloca el martillo sobre el aldeano que deseas proteger.'
  },
  'night-ready-reveal': {
    src: '/audio/night-ready-reveal.mp3',
    fallbackText:
      'El Alguacil cierra los ojos. Pueblo de Salem, despierten todos. Es momento de revelar lo ocurrido esta noche.'
  },
  'reveal-killed': {
    src: '/audio/reveal-killed.mp3',
    fallbackText:
      'Las campanas doblan por Salem. La oscuridad cobró una vida durante la noche.'
  },
  'reveal-saved': {
    src: '/audio/reveal-saved.mp3',
    fallbackText:
      'El alba trae alivio a Salem. El martillo del Alguacil protegió al pueblo y nadie murió esta noche.'
  }
}

let activeAmbientAudio: HTMLAudioElement | null = null
let currentAmbientTrack: AmbientTrackId | null = null
let activeNarrationAudio: HTMLAudioElement | null = null
let muted = false
let narrating = false
let narrationGeneration = 0

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

export function playAmbient(track: AmbientTrackId): void {
  if (currentAmbientTrack === track && activeAmbientAudio) {
    syncAmbientVolume()
    if (activeAmbientAudio.paused) {
      void activeAmbientAudio.play().catch(() => undefined)
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

  void audio.play().catch(() => undefined)
}

export function stopAmbient(): void {
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
}

export function toggleMute(): boolean {
  setMuted(!muted)
  return muted
}
