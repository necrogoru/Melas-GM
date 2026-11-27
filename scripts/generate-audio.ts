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
    filename: 'ambience-day.mp3',
    prompt:
      '1692 colonial New England village daytime ambience, gentle wind through pine trees, distant wooden cart creaking on dirt road, soft quiet town murmur, subtle atmospheric loop',
    durationSeconds: 22
  },
  {
    filename: 'ambience-night.mp3',
    prompt:
      '1692 Salem colonial village eerie midnight ambience, soft cold night breeze, distant crickets, faint crackling hearth embers, ominous quiet tension, subtle atmospheric loop',
    durationSeconds: 22
  }
]

function loadApiKey(): string {
  const fromEnv = process.env.ELEVENLABS_API_KEY?.trim()
  if (fromEnv) return fromEnv

  const envLocalPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envLocalPath)) {
    throw new Error('ELEVENLABS_API_KEY is not set and .env.local was not found.')
  }

  const raw = readFileSync(envLocalPath, 'utf8')
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

  throw new Error('ELEVENLABS_API_KEY was not found in environment or .env.local.')
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

  for (const cue of AMBIENT_CUES) {
    const targetPath = resolve(OUTPUT_DIR, cue.filename)
    if (!force && existsSync(targetPath)) {
      console.log(`Skipping existing ${cue.filename}`)
      continue
    }

    console.log(`Generating ambient loop ${cue.filename}...`)
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
