import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { SALEM_CHARACTERS } from '@/data/characters'
import type {
  ActionResult,
  CharacterId,
  DawnStep,
  GamePhase,
  GameWinner,
  NightResolution,
  Player
} from '@/types/game'

export const MIN_PLAYERS = 4
export const MAX_PLAYERS = 12
export const STORAGE_KEY = 'salem-gm:state:v1'

interface PersistedGameState {
  phase: GamePhase
  dawnStep: DawnStep
  players: Player[]
  blackCatHolderId: string | null
  nightNumber: number
  lastResolution: NightResolution | null
  winner: GameWinner | null
  witchIds: string[]
  constableId: string | null
  pendingTargetId: string | null
  pendingProtectedId: string | null
}

const VALID_PHASES: readonly GamePhase[] = [
  'lobby',
  'gathering',
  'dawn',
  'day',
  'night-witches',
  'night-constable',
  'night-ready-reveal',
  'reveal',
  'ended'
]
const VALID_CHARACTER_IDS = new Set<string>(SALEM_CHARACTERS.map((character) => character.id))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isPlayer(value: unknown): value is Player {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.characterId === 'string' &&
    VALID_CHARACTER_IDS.has(value.characterId) &&
    typeof value.alive === 'boolean'
  )
}

function isNightResolution(value: unknown): value is NightResolution {
  return (
    isRecord(value) &&
    typeof value.nightNumber === 'number' &&
    Number.isInteger(value.nightNumber) &&
    value.nightNumber >= 0 &&
    isNullableString(value.targetId) &&
    isNullableString(value.protectedId) &&
    isNullableString(value.killedPlayerId) &&
    typeof value.savedByConstable === 'boolean'
  )
}

function parsePersistedState(raw: string): PersistedGameState | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null

    if (typeof parsed.phase !== 'string' || !VALID_PHASES.includes(parsed.phase as GamePhase)) {
      return null
    }
    if (parsed.dawnStep !== 'witches' && parsed.dawnStep !== 'constable') return null
    if (!Array.isArray(parsed.players) || !parsed.players.every(isPlayer)) return null
    if (!isNullableString(parsed.blackCatHolderId)) return null
    if (
      typeof parsed.nightNumber !== 'number' ||
      !Number.isInteger(parsed.nightNumber) ||
      parsed.nightNumber < 0
    ) {
      return null
    }
    if (parsed.lastResolution !== null && !isNightResolution(parsed.lastResolution)) return null
    if (parsed.winner !== null && parsed.winner !== 'town' && parsed.winner !== 'witches') {
      return null
    }
    if (!isStringArray(parsed.witchIds)) return null
    if (!isNullableString(parsed.constableId)) return null
    if (!isNullableString(parsed.pendingTargetId)) return null
    if (!isNullableString(parsed.pendingProtectedId)) return null

    return {
      phase: parsed.phase as GamePhase,
      dawnStep: parsed.dawnStep,
      players: parsed.players,
      blackCatHolderId: parsed.blackCatHolderId,
      nightNumber: parsed.nightNumber,
      lastResolution: parsed.lastResolution,
      winner: parsed.winner,
      witchIds: parsed.witchIds,
      constableId: parsed.constableId,
      pendingTargetId: parsed.pendingTargetId,
      pendingProtectedId: parsed.pendingProtectedId
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

export function getWitchLimits(playerCount: number): { min: number; max: number } {
  return playerCount <= 5 ? { min: 1, max: 1 } : { min: 1, max: 2 }
}

export const useGameStore = defineStore('gameStore', () => {
  const initial = loadPersistedState()

  const phase = ref<GamePhase>(initial?.phase ?? 'lobby')
  const dawnStep = ref<DawnStep>(initial?.dawnStep ?? 'witches')
  const players = ref<Player[]>(initial?.players ?? [])
  const blackCatHolderId = ref<string | null>(initial?.blackCatHolderId ?? null)
  const nightNumber = ref(initial?.nightNumber ?? 0)
  const lastResolution = ref<NightResolution | null>(initial?.lastResolution ?? null)
  const winner = ref<GameWinner | null>(initial?.winner ?? null)

  // Secret role and night-action state kept private from public player objects
  const witchIds = ref<string[]>(initial?.witchIds ?? [])
  const constableId = ref<string | null>(initial?.constableId ?? null)
  const pendingTargetId = ref<string | null>(initial?.pendingTargetId ?? null)
  const pendingProtectedId = ref<string | null>(initial?.pendingProtectedId ?? null)

  let skipPersist = false

  watch(
    [
      phase,
      dawnStep,
      players,
      blackCatHolderId,
      nightNumber,
      lastResolution,
      winner,
      witchIds,
      constableId,
      pendingTargetId,
      pendingProtectedId
    ],
    () => {
      if (skipPersist) return
      savePersistedState({
        phase: phase.value,
        dawnStep: dawnStep.value,
        players: players.value,
        blackCatHolderId: blackCatHolderId.value,
        nightNumber: nightNumber.value,
        lastResolution: lastResolution.value,
        winner: winner.value,
        witchIds: witchIds.value,
        constableId: constableId.value,
        pendingTargetId: pendingTargetId.value,
        pendingProtectedId: pendingProtectedId.value
      })
    },
    { deep: true, flush: 'sync' }
  )

  const alivePlayers = computed(() => players.value.filter((player) => player.alive))

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

  const hasAliveConstable = computed(
    () => constableId.value !== null && isPlayerAlive(constableId.value)
  )

  function findPlayer(playerId: string): Player | undefined {
    return players.value.find((player) => player.id === playerId)
  }

  function isPlayerAlive(playerId: string): boolean {
    return findPlayer(playerId)?.alive === true
  }

  function isWitch(playerId: string): boolean {
    return witchIds.value.includes(playerId)
  }

  function isConstable(playerId: string): boolean {
    return constableId.value === playerId
  }

  function evaluateWinner(): GameWinner | null {
    if (witchIds.value.length === 0) return null

    const aliveWitches = alivePlayers.value.filter((player) => isWitch(player.id))
    if (aliveWitches.length === 0) return 'town'

    const aliveTownsfolk = alivePlayers.value.filter((player) => !isWitch(player.id))
    if (aliveTownsfolk.length === 0) return 'witches'

    return null
  }

  function clearPlayerPublicAndSecretRoles(playerId: string) {
    if (blackCatHolderId.value === playerId) {
      blackCatHolderId.value = null
    }
    if (constableId.value === playerId) {
      constableId.value = null
    }
  }

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
      characterId,
      alive: true
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

    witchIds.value = []
    constableId.value = null
    blackCatHolderId.value = null
    pendingTargetId.value = null
    pendingProtectedId.value = null
    lastResolution.value = null
    winner.value = null
    nightNumber.value = 0
    dawnStep.value = 'witches'
    phase.value = 'gathering'

    return { ok: true }
  }

  function startDawn(): ActionResult {
    if (phase.value !== 'gathering') {
      return { ok: false, error: 'El Alba solo puede iniciar después de reunir al pueblo.' }
    }

    dawnStep.value = 'witches'
    phase.value = 'dawn'

    return { ok: true }
  }

  function confirmDawnWitches(
    selectedWitchIds: string[],
    selectedBlackCatHolderId: string
  ): ActionResult {
    if (phase.value !== 'dawn' || dawnStep.value !== 'witches') {
      return { ok: false, error: 'No estamos en el paso de brujas del Alba.' }
    }

    const limits = getWitchLimits(players.value.length)
    const uniqueWitchIds = [...new Set(selectedWitchIds)]
    if (uniqueWitchIds.length < limits.min) {
      return { ok: false, error: 'Selecciona al menos una bruja.' }
    }

    if (uniqueWitchIds.length > limits.max) {
      return {
        ok: false,
        error:
          limits.max === 1
            ? 'Con 4 o 5 jugadores solo puede haber 1 bruja.'
            : `Con ${String(players.value.length)} jugadores el máximo es de ${String(limits.max)} brujas.`
      }
    }

    if (uniqueWitchIds.some((id) => !isPlayerAlive(id))) {
      return { ok: false, error: 'Todas las brujas deben ser jugadores válidos.' }
    }

    if (!isPlayerAlive(selectedBlackCatHolderId)) {
      return { ok: false, error: 'Selecciona quién recibe el Gato Negro.' }
    }

    witchIds.value = uniqueWitchIds
    blackCatHolderId.value = selectedBlackCatHolderId
    dawnStep.value = 'constable'

    return { ok: true }
  }

  function confirmDawnConstable(selectedConstableId: string): ActionResult {
    if (phase.value !== 'dawn' || dawnStep.value !== 'constable') {
      return { ok: false, error: 'No estamos en el paso del Alguacil del Alba.' }
    }

    if (!isPlayerAlive(selectedConstableId)) {
      return { ok: false, error: 'El Alguacil debe ser un jugador vivo válido.' }
    }

    constableId.value = selectedConstableId
    phase.value = 'day'

    return { ok: true }
  }

  function startNight(): ActionResult {
    if (phase.value !== 'day') {
      return { ok: false, error: 'La noche solo puede iniciar desde el día.' }
    }

    nightNumber.value += 1
    pendingTargetId.value = null
    pendingProtectedId.value = null
    lastResolution.value = null
    phase.value = 'night-witches'

    return { ok: true }
  }

  function confirmWitchTarget(targetId: string): ActionResult {
    if (phase.value !== 'night-witches') {
      return { ok: false, error: 'No es el turno nocturno de las brujas.' }
    }

    if (!isPlayerAlive(targetId)) {
      return { ok: false, error: 'El objetivo debe ser un jugador vivo.' }
    }

    pendingTargetId.value = targetId
    phase.value = 'night-constable'

    return { ok: true }
  }

  function confirmConstableProtection(targetId: string | null): ActionResult {
    if (phase.value !== 'night-constable') {
      return { ok: false, error: 'No es el turno nocturno del Alguacil.' }
    }

    if (targetId !== null) {
      if (!isPlayerAlive(targetId)) {
        return { ok: false, error: 'Solo puedes proteger a un jugador vivo.' }
      }

      if (targetId === constableId.value) {
        return { ok: false, error: 'El Alguacil no puede protegerse a sí mismo.' }
      }
    }

    pendingProtectedId.value = targetId
    phase.value = 'night-ready-reveal'

    return { ok: true }
  }

  function revealNightOutcome(): ActionResult {
    if (phase.value !== 'night-ready-reveal') {
      return { ok: false, error: 'La noche aún no está lista para revelarse.' }
    }

    const targetId = pendingTargetId.value
    const protectedId = pendingProtectedId.value
    const savedByConstable = Boolean(targetId && protectedId && targetId === protectedId)
    const killedPlayerId = targetId && !savedByConstable ? targetId : null

    if (killedPlayerId) {
      const killedPlayer = findPlayer(killedPlayerId)
      if (killedPlayer) {
        killedPlayer.alive = false
        clearPlayerPublicAndSecretRoles(killedPlayerId)
      }
    }

    lastResolution.value = {
      nightNumber: nightNumber.value,
      targetId,
      protectedId,
      killedPlayerId,
      savedByConstable
    }

    pendingTargetId.value = null
    pendingProtectedId.value = null
    phase.value = 'reveal'

    return { ok: true }
  }

  function proceedToDay(): ActionResult {
    if (phase.value !== 'reveal') {
      return { ok: false, error: 'No hay una revelación activa.' }
    }

    const detectedWinner = evaluateWinner()
    if (detectedWinner) {
      winner.value = detectedWinner
      phase.value = 'ended'
      return { ok: true }
    }

    phase.value = 'day'
    return { ok: true }
  }

  function eliminatePlayer(playerId: string): ActionResult {
    if (phase.value !== 'day') {
      return { ok: false, error: 'Solo puedes acusar y eliminar durante el día.' }
    }

    const target = findPlayer(playerId)
    if (!target || !target.alive) {
      return { ok: false, error: 'El jugador seleccionado no está vivo.' }
    }

    target.alive = false
    clearPlayerPublicAndSecretRoles(playerId)

    const detectedWinner = evaluateWinner()
    if (detectedWinner) {
      winner.value = detectedWinner
      phase.value = 'ended'
    }

    return { ok: true }
  }

  function reassignConstable(playerId: string): ActionResult {
    if (!isPlayerAlive(playerId)) {
      return { ok: false, error: 'El nuevo Alguacil debe ser un jugador vivo.' }
    }

    constableId.value = playerId
    return { ok: true }
  }

  function resetGame(): void {
    skipPersist = true
    try {
      phase.value = 'lobby'
      dawnStep.value = 'witches'
      players.value = []
      blackCatHolderId.value = null
      nightNumber.value = 0
      lastResolution.value = null
      winner.value = null
      witchIds.value = []
      constableId.value = null
      pendingTargetId.value = null
      pendingProtectedId.value = null
      clearPersistedState()
    } finally {
      skipPersist = false
    }
  }

  return {
    phase,
    dawnStep,
    players,
    blackCatHolderId,
    nightNumber,
    lastResolution,
    winner,
    alivePlayers,
    availableCharacters,
    canStartGame,
    hasAliveConstable,
    isWitch,
    isConstable,
    addPlayer,
    removePlayer,
    startGame,
    startDawn,
    confirmDawnWitches,
    confirmDawnConstable,
    startNight,
    confirmWitchTarget,
    confirmConstableProtection,
    revealNightOutcome,
    proceedToDay,
    eliminatePlayer,
    reassignConstable,
    resetGame
  }
})
