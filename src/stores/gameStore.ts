import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { SALEM_CHARACTERS } from '@/data/characters'
import type { ActionResult, CharacterId, GamePhase, Player } from '@/types/game'

export const MIN_PLAYERS = 4
export const MAX_PLAYERS = 12
export const STORAGE_KEY = 'salem-gm:state:v2'

interface PersistedGameState {
  phase: GamePhase
  players: Player[]
  nightNumber: number
}

const VALID_PHASES: readonly GamePhase[] = [
  'lobby',
  'gathering',
  'dawn',
  'day',
  'night-witches',
  'night-constable',
  'night-confession',
  'reveal'
]

const NEXT_NIGHT_PHASE: Partial<Record<GamePhase, GamePhase>> = {
  'night-witches': 'night-constable',
  'night-constable': 'night-confession',
  'night-confession': 'reveal'
}

const VALID_CHARACTER_IDS = new Set<string>(SALEM_CHARACTERS.map((character) => character.id))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPlayer(value: unknown): value is Player {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.characterId === 'string' &&
    VALID_CHARACTER_IDS.has(value.characterId)
  )
}

function parsePersistedState(raw: string): PersistedGameState | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null

    if (typeof parsed.phase !== 'string' || !VALID_PHASES.includes(parsed.phase as GamePhase)) {
      return null
    }
    if (!Array.isArray(parsed.players) || !parsed.players.every(isPlayer)) return null
    if (
      typeof parsed.nightNumber !== 'number' ||
      !Number.isInteger(parsed.nightNumber) ||
      parsed.nightNumber < 0
    ) {
      return null
    }

    return {
      phase: parsed.phase as GamePhase,
      players: parsed.players,
      nightNumber: parsed.nightNumber
    }
  } catch {
    return null
  }
}

function loadPersistedState(): PersistedGameState | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? parsePersistedState(raw) : null
  } catch {
    return null
  }
}

function savePersistedState(state: PersistedGameState): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage quota or privacy-mode errors
  }
}

function clearPersistedState(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage access errors
  }
}

export const useGameStore = defineStore('gameStore', () => {
  const initial = loadPersistedState()

  const phase = ref<GamePhase>(initial?.phase ?? 'lobby')
  const players = ref<Player[]>(initial?.players ?? [])
  const nightNumber = ref(initial?.nightNumber ?? 0)

  let skipPersist = false

  watch(
    [phase, players, nightNumber],
    () => {
      if (skipPersist) return
      savePersistedState({
        phase: phase.value,
        players: players.value,
        nightNumber: nightNumber.value
      })
    },
    { deep: true, flush: 'sync' }
  )

  const availableCharacters = computed(() => {
    const takenIds = new Set(players.value.map((player) => player.characterId))
    return SALEM_CHARACTERS.filter((character) => !takenIds.has(character.id))
  })

  const canStartGame = computed(
    () =>
      phase.value === 'lobby' &&
      players.value.length >= MIN_PLAYERS &&
      players.value.length <= MAX_PLAYERS
  )

  function addPlayer(name: string, characterId: CharacterId): ActionResult {
    if (phase.value !== 'lobby') {
      return { ok: false, error: 'Solo puedes registrar jugadores en la sala inicial.' }
    }

    const trimmedName = name.trim()
    if (!trimmedName) {
      return { ok: false, error: 'Ingresa el nombre del jugador.' }
    }

    if (players.value.length >= MAX_PLAYERS) {
      return { ok: false, error: `El máximo es de ${String(MAX_PLAYERS)} jugadores.` }
    }

    const characterExists = SALEM_CHARACTERS.some((character) => character.id === characterId)
    if (!characterExists) {
      return { ok: false, error: 'Personaje inválido.' }
    }

    const isTaken = players.value.some((player) => player.characterId === characterId)
    if (isTaken) {
      return { ok: false, error: 'Ese personaje ya fue elegido.' }
    }

    players.value.push({
      id: crypto.randomUUID(),
      name: trimmedName,
      characterId
    })

    return { ok: true }
  }

  function removePlayer(playerId: string): void {
    if (phase.value !== 'lobby') return
    players.value = players.value.filter((player) => player.id !== playerId)
  }

  function startGame(): ActionResult {
    if (!canStartGame.value) {
      return {
        ok: false,
        error: `Se necesitan entre ${String(MIN_PLAYERS)} y ${String(MAX_PLAYERS)} jugadores para comenzar.`
      }
    }

    nightNumber.value = 0
    phase.value = 'gathering'

    return { ok: true }
  }

  function startDawn(): ActionResult {
    if (phase.value !== 'gathering') {
      return { ok: false, error: 'El Alba solo puede iniciar después de reunir al pueblo.' }
    }

    phase.value = 'dawn'

    return { ok: true }
  }

  function completeDawn(): ActionResult {
    if (phase.value !== 'dawn') {
      return { ok: false, error: 'El Alba no está activo.' }
    }

    phase.value = 'day'

    return { ok: true }
  }

  function startNight(): ActionResult {
    if (phase.value !== 'day') {
      return { ok: false, error: 'La noche solo puede iniciar desde el día.' }
    }

    nightNumber.value += 1
    phase.value = 'night-witches'

    return { ok: true }
  }

  function advanceNightStep(): ActionResult {
    const nextPhase = NEXT_NIGHT_PHASE[phase.value]
    if (!nextPhase) {
      return { ok: false, error: 'No hay un paso nocturno activo para avanzar.' }
    }

    phase.value = nextPhase

    return { ok: true }
  }

  function proceedToDay(): ActionResult {
    if (phase.value !== 'reveal') {
      return { ok: false, error: 'No hay una revelación activa.' }
    }

    phase.value = 'day'
    return { ok: true }
  }

  function resetGame(): void {
    skipPersist = true
    try {
      phase.value = 'lobby'
      players.value = []
      nightNumber.value = 0
      clearPersistedState()
    } finally {
      skipPersist = false
    }
  }

  return {
    phase,
    players,
    nightNumber,
    availableCharacters,
    canStartGame,
    addPlayer,
    removePlayer,
    startGame,
    startDawn,
    completeDawn,
    startNight,
    advanceNightStep,
    proceedToDay,
    resetGame
  }
})
