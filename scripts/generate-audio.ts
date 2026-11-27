import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DEFAULT_VOICE_ID = 'OLmSqlYzB06EIKJRy5b0'
const TTS_MODEL_ID = 'eleven_multilingual_v2'
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'
const OUTPUT_DIR = resolve(process.cwd(), 'public/audio')

interface NarrationCue {
  filename: string
  text: string
}

interface AmbientCue {
  filename: string
  prompt: string
  durationSeconds: number
}

const NARRATION_CUES: NarrationCue[] = [
  {
    filename: 'dawn-witches.mp3',
    text: 'El alba cae sobre Salem. Todos cierren los ojos. Brujas, abran los ojos, reconózcanse en silencio y entreguen el Gato Negro.'
  },
  {
    filename: 'dawn-constable.mp3',
    text: 'Las brujas cierran los ojos. Alguacil, abre los ojos y márcate en secreto antes de que despierte el pueblo.'
  },
  {
    filename: 'night-witches.mp3',
    text: 'Llegó la noche a Salem. Todos cierren los ojos. Brujas, despierten en silencio y elijan a su víctima.'
  },
  {
    filename: 'night-constable.mp3',
    text: 'Las brujas vuelven a dormir. Alguacil, despierta y coloca el martillo sobre el aldeano que deseas proteger.'
  },
  {
    filename: 'night-ready-reveal.mp3',
    text: 'El Alguacil cierra los ojos. Pueblo de Salem, despierten todos. Es momento de revelar lo ocurrido esta noche.'
  },
  {
    filename: 'reveal-killed.mp3',
    text: 'Las campanas doblan por Salem. La oscuridad cobró una vida durante la noche.'
  },
  {
    filename: 'reveal-saved.mp3',
    text: 'El alba trae alivio a Salem. El martillo del Alguacil protegió al pueblo y nadie murió esta noche.'
  }
]

const AMBIENT_CUES: AmbientCue[] = [
  {
    filename: 'music-day.mp3',
    prompt:
      '1692 colonial New England village daytime background music, warm yet tense acoustic folk drone, subtle wooden lute and low bowed strings, understated atmospheric loop',
    durationSeconds: 22
  },
  {
    filename: 'music-night.mp3',
    prompt:
      '1692 Salem midnight dark ambient background music, eerie low orchestral string drone, subtle brooding tension, sparse haunting colonial atmosphere, loopable',
    durationSeconds: 22
  }
]

const SFX_CUES: AmbientCue[] = [
  {
    filename: 'sfx-start.mp3',
    prompt:
      'dramatic colonial wooden door latch and distant church bell chime, mysterious 1692 Salem atmosphere, short transition sting',
    durationSeconds: 2.0
  },
  {
    filename: 'sfx-dawn.mp3',
    prompt:
      'soft eerie dawn wind chime and low bowed string swell, solemn 1692 colonial morning transition',
    durationSeconds: 2.0
  },
  {
    filename: 'sfx-day.mp3',
    prompt:
      'crisp wooden gavel tap with subtle warm acoustic chord, colonial town gathering cue',
    durationSeconds: 1.5
  },
  {
    filename: 'sfx-night.mp3',
    prompt:
      'deep ominous church bell toll fading into cold night wind, 1692 Salem nightfall cue',
    durationSeconds: 2.0
  },
  {
    filename: 'sfx-reveal.mp3',
    prompt:
      'tense dramatic orchestral timpani roll and low brass sting, solemn courtroom reveal',
    durationSeconds: 2.5
  }
]

function parseApiKeyFromEnvFile(filePath: string): string | null {
  if (!existsSync(filePath)) return null

  const raw = readFileSync(filePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue

    const key = trimmed.slice(0, eqIndex).trim()
    if (key !== 'ELEVENLABS_API_KEY') continue

    let value = trimmed.slice(eqIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith('\'') && value.endsWith('\''))
    ) {
      value = value.slice(1, -1)
    }

    if (value) return value
  }

  return null
}

function loadApiKey(): string {
  const fromEnv = process.env.ELEVENLABS_API_KEY?.trim()
  if (fromEnv) return fromEnv

  for (const filename of ['.env.local', '.env']) {
    const found = parseApiKeyFromEnvFile(resolve(process.cwd(), filename))
    if (found) return found
  }

  throw new Error('ELEVENLABS_API_KEY was not found in environment, .env.local, or .env.')
}

async function generateTts(apiKey: string, voiceId: string, cue: NarrationCue): Promise<Uint8Array> {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg'
    },
    body: JSON.stringify({
      text: cue.text,
      model_id: TTS_MODEL_ID,
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.75
      }
    })
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`TTS failed for ${cue.filename} (${String(response.status)}): ${detail}`)
  }

  return new Uint8Array(await response.arrayBuffer())
}

async function generateSoundEffect(apiKey: string, cue: AmbientCue): Promise<Uint8Array> {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/sound-generation`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg'
    },
    body: JSON.stringify({
      text: cue.prompt,
      duration_seconds: cue.durationSeconds,
      prompt_influence: 0.35
    })
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`SFX failed for ${cue.filename} (${String(response.status)}): ${detail}`)
  }

  return new Uint8Array(await response.arrayBuffer())
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force')
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID
  const apiKey = loadApiKey()

  mkdirSync(OUTPUT_DIR, { recursive: true })

  for (const cue of NARRATION_CUES) {
    const targetPath = resolve(OUTPUT_DIR, cue.filename)
    if (!force && existsSync(targetPath)) {
      console.log(`Skipping existing ${cue.filename}`)
      continue
    }

    console.log(`Generating narration ${cue.filename}...`)
    const bytes = await generateTts(apiKey, voiceId, cue)
    writeFileSync(targetPath, bytes)
  }

  for (const cue of [...AMBIENT_CUES, ...SFX_CUES]) {
    const targetPath = resolve(OUTPUT_DIR, cue.filename)
    if (!force && existsSync(targetPath)) {
      console.log(`Skipping existing ${cue.filename}`)
      continue
    }

    console.log(`Generating sound effect ${cue.filename}...`)
    const bytes = await generateSoundEffect(apiKey, cue)
    writeFileSync(targetPath, bytes)
  }

  console.log(`Audio generation complete in ${OUTPUT_DIR}`)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})
