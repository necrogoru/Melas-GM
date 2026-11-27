import { computed, ref } from 'vue'
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

export const useGameStore = defineStore('gameStore', () => {
  const phase = ref<GamePhase>('lobby')
  const dawnStep = ref<DawnStep>('witches')
  const players = ref<Player[]>([])
  const blackCatHolderId = ref<string | null>(null)
  const nightNumber = ref(0)
  const lastResolution = ref<NightResolution | null>(null)
  const winner = ref<GameWinner | null>(null)

  // Secret role and night-action state kept private from public player objects
  const witchIds = ref<string[]>([])
  const constableId = ref<string | null>(null)
  const pendingTargetId = ref<string | null>(null)
  const pendingProtectedId = ref<string | null>(null)

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

    const uniqueWitchIds = [...new Set(selectedWitchIds)]
    if (uniqueWitchIds.length === 0) {
      return { ok: false, error: 'Selecciona al menos una bruja.' }
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
