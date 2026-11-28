import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { SALEM_CHARACTERS } from '@/data/characters'
import { STORAGE_KEY, useGameStore } from '@/stores/gameStore'

function charIdAt(index: number) {
  const character = SALEM_CHARACTERS[index]
  if (!character) throw new Error(`Missing character at index ${String(index)}`)
  return character.id
}

function registerPlayers(count: number): string[] {
  const store = useGameStore()
  const ids: string[] = []
  for (let i = 0; i < count; i++) {
    const result = store.addPlayer(`Player ${String(i + 1)}`, charIdAt(i))
    expect(result.ok).toBe(true)
    const created = store.players[store.players.length - 1]
    if (!created) throw new Error('Expected created player')
    ids.push(created.id)
  }
  return ids
}

function setupDawnGame(count = 4) {
  const store = useGameStore()
  registerPlayers(count)
  expect(store.startGame().ok).toBe(true)
  expect(store.startDawn().ok).toBe(true)
  return store
}

describe('SALEM_CHARACTERS', () => {
  it('defines all 12 unique Salem 1692 characters', () => {
    expect(SALEM_CHARACTERS).toHaveLength(12)
    const ids = new Set(SALEM_CHARACTERS.map((c) => c.id))
    expect(ids.size).toBe(12)
  })
})

describe('useGameStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('lobby and player registration', () => {
    it('starts in lobby phase with no players', () => {
      const store = useGameStore()
      expect(store.phase).toBe('lobby')
      expect(store.players).toEqual([])
      expect(store.nightNumber).toBe(0)
      expect(store.canStartGame).toBe(false)
    })

    it('rejects empty player names and duplicate characters', () => {
      const store = useGameStore()
      const charA = charIdAt(0)

      expect(store.addPlayer('   ', charA).ok).toBe(false)
      expect(store.addPlayer('Alice', charA).ok).toBe(true)
      expect(store.addPlayer('Bob', charA).ok).toBe(false)
      expect(store.players).toHaveLength(1)
    })

    it('stores only id, name, and characterId on players', () => {
      const store = useGameStore()
      const charA = charIdAt(0)
      expect(store.addPlayer('Alice', charA).ok).toBe(true)

      const alice = store.players[0]
      expect(alice).toBeDefined()
      expect(new Set(Object.keys(alice ?? {}))).toEqual(new Set(['characterId', 'id', 'name']))
    })

    it('enforces 4 to 12 players to start the game', () => {
      const store = useGameStore()
      registerPlayers(3)
      expect(store.canStartGame).toBe(false)
      expect(store.startGame().ok).toBe(false)

      expect(store.addPlayer('Player 4', charIdAt(3)).ok).toBe(true)
      expect(store.canStartGame).toBe(true)
      expect(store.startGame().ok).toBe(true)
      expect(store.phase).toBe('gathering')
      expect(store.startDawn().ok).toBe(true)
      expect(store.phase).toBe('dawn')
    })

    it('prevents adding more than 12 players', () => {
      const store = useGameStore()
      registerPlayers(12)
      expect(store.players).toHaveLength(12)
      expect(store.addPlayer('Extra', charIdAt(0)).ok).toBe(false)
    })

    it('allows removing a player in lobby and frees their character', () => {
      const store = useGameStore()
      const charA = charIdAt(0)
      store.addPlayer('Alice', charA)
      const alice = store.players[0]
      if (!alice) throw new Error('Expected Alice')

      store.removePlayer(alice.id)
      expect(store.players).toHaveLength(0)
      expect(store.availableCharacters.some((c) => c.id === charA)).toBe(true)
    })
  })

  describe('town crier phase transitions', () => {
    it('completes single-step dawn into day and rejects invalid calls', () => {
      const store = useGameStore()
      expect(store.completeDawn().ok).toBe(false)

      setupDawnGame()
      expect(store.phase).toBe('dawn')
      expect(store.completeDawn().ok).toBe(true)
      expect(store.phase).toBe('day')
    })

    it('steps through night-witches -> night-constable -> night-confession -> reveal -> day', () => {
      const store = setupDawnGame()
      expect(store.completeDawn().ok).toBe(true)

      expect(store.advanceNightStep().ok).toBe(false)
      expect(store.proceedToDay().ok).toBe(false)

      expect(store.startNight().ok).toBe(true)
      expect(store.nightNumber).toBe(1)
      expect(store.phase).toBe('night-witches')

      expect(store.advanceNightStep().ok).toBe(true)
      expect(store.phase).toBe('night-constable')

      expect(store.advanceNightStep().ok).toBe(true)
      expect(store.phase).toBe('night-confession')

      expect(store.advanceNightStep().ok).toBe(true)
      expect(store.phase).toBe('reveal')

      expect(store.advanceNightStep().ok).toBe(false)
      expect(store.proceedToDay().ok).toBe(true)
      expect(store.phase).toBe('day')

      expect(store.startNight().ok).toBe(true)
      expect(store.nightNumber).toBe(2)
      expect(store.phase).toBe('night-witches')
    })
  })

  describe('removal of board-state tracking', () => {
    it('does not expose secret role, alive, or table resolution state or actions', () => {
      const store = useGameStore()
      const removedKeys = [
        'alivePlayers',
        'blackCatHolderId',
        'lastResolution',
        'winner',
        'dawnStep',
        'hasAliveConstable',
        'isWitch',
        'isConstable',
        'confirmDawnWitches',
        'confirmDawnConstable',
        'confirmWitchTarget',
        'confirmConstableProtection',
        'revealNightOutcome',
        'eliminatePlayer',
        'reassignConstable'
      ]

      for (const key of removedKeys) {
        expect(key in store).toBe(false)
      }
    })
  })

  describe('localStorage persistence', () => {
    it('persists Crier state under v2 key and restores it on store re-instantiation', () => {
      expect(STORAGE_KEY).toBe('salem-gm:state:v2')
      const store = setupDawnGame()
      store.completeDawn()
      store.startNight()
      store.advanceNightStep()
      store.advanceNightStep()

      expect(store.phase).toBe('night-confession')
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()

      setActivePinia(createPinia())
      const restored = useGameStore()

      expect(restored.phase).toBe('night-confession')
      expect(restored.nightNumber).toBe(1)
      expect(restored.players).toHaveLength(4)

      expect(restored.advanceNightStep().ok).toBe(true)
      expect(restored.phase).toBe('reveal')
    })

    it('falls back safely when localStorage contains corrupt JSON, invalid shape, or legacy phases', () => {
      localStorage.setItem(STORAGE_KEY, '{corrupt json')
      setActivePinia(createPinia())
      const fromCorrupt = useGameStore()
      expect(fromCorrupt.phase).toBe('lobby')
      expect(fromCorrupt.players).toEqual([])

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ phase: 'unknown-phase', players: 'not-an-array' })
      )
      setActivePinia(createPinia())
      const fromInvalid = useGameStore()
      expect(fromInvalid.phase).toBe('lobby')
      expect(fromInvalid.players).toEqual([])

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ phase: 'ended', players: [], nightNumber: 1 })
      )
      setActivePinia(createPinia())
      const fromLegacyPhase = useGameStore()
      expect(fromLegacyPhase.phase).toBe('lobby')
    })

    it('clears persisted state on resetGame', () => {
      const store = setupDawnGame()
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()

      store.resetGame()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

      setActivePinia(createPinia())
      const fresh = useGameStore()
      expect(fresh.phase).toBe('lobby')
      expect(fresh.players).toEqual([])
      expect(fresh.nightNumber).toBe(0)
    })
  })
})
