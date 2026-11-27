import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { SALEM_CHARACTERS } from '@/data/characters'
import { useGameStore } from '@/stores/gameStore'

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

function setupActiveGame(count = 4) {
  const store = useGameStore()
  const ids = registerPlayers(count)
  const [p1, p2, p3, p4] = ids
  if (!p1 || !p2 || !p3 || !p4) throw new Error('Expected at least 4 players')
  store.startGame()
  return { store, p1, p2, p3, p4 }
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
    setActivePinia(createPinia())
  })

  describe('lobby and player registration', () => {
    it('starts in lobby phase with no players', () => {
      const store = useGameStore()
      expect(store.phase).toBe('lobby')
      expect(store.players).toEqual([])
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

    it('enforces 4 to 12 players to start the game', () => {
      const store = useGameStore()
      registerPlayers(3)
      expect(store.canStartGame).toBe(false)
      expect(store.startGame().ok).toBe(false)

      expect(store.addPlayer('Player 4', charIdAt(3)).ok).toBe(true)
      expect(store.canStartGame).toBe(true)
      expect(store.startGame().ok).toBe(true)
      expect(store.phase).toBe('dawn')
      expect(store.dawnStep).toBe('witches')
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

  describe('dawn secret setup', () => {
    it('stores witches and Black Cat privately without exposing roles on public players', () => {
      const { store, p1, p2, p3, p4 } = setupActiveGame()

      const witchResult = store.confirmDawnWitches([p1], p3)
      expect(witchResult.ok).toBe(true)
      expect(store.dawnStep).toBe('constable')
      expect(store.blackCatHolderId).toBe(p3)

      for (const player of store.players) {
        expect('isWitch' in player).toBe(false)
        expect('isConstable' in player).toBe(false)
      }

      const constableResult = store.confirmDawnConstable(p2)
      expect(constableResult.ok).toBe(true)
      expect(store.phase).toBe('day')
      expect(store.isConstable(p2)).toBe(true)
      expect(store.isWitch(p1)).toBe(true)
      expect(store.isWitch(p4)).toBe(false)
    })

    it('validates Constable selection in dawn', () => {
      const { store, p1, p3 } = setupActiveGame()
      store.confirmDawnWitches([p1], p3)

      expect(store.confirmDawnConstable('non-existent').ok).toBe(false)
      expect(store.phase).toBe('dawn')
    })
  })

  describe('night flow and reveal resolution', () => {
    it('blocks Constable self-protection', () => {
      const { store, p1, p2, p3, p4 } = setupActiveGame()
      store.confirmDawnWitches([p1], p3)
      store.confirmDawnConstable(p2)

      expect(store.startNight().ok).toBe(true)
      expect(store.phase).toBe('night-witches')

      expect(store.confirmWitchTarget(p4).ok).toBe(true)
      expect(store.phase).toBe('night-constable')

      const selfProtect = store.confirmConstableProtection(p2)
      expect(selfProtect.ok).toBe(false)
      expect(store.phase).toBe('night-constable')

      const validProtect = store.confirmConstableProtection(p3)
      expect(validProtect.ok).toBe(true)
      expect(store.phase).toBe('night-ready-reveal')
    })

    it('eliminates targeted player when not protected by Constable', () => {
      const { store, p1, p2, p3, p4 } = setupActiveGame()
      store.confirmDawnWitches([p1], p3)
      store.confirmDawnConstable(p2)

      store.startNight()
      store.confirmWitchTarget(p4)
      store.confirmConstableProtection(p3)

      const reveal = store.revealNightOutcome()
      expect(reveal.ok).toBe(true)
      expect(store.phase).toBe('reveal')
      expect(store.lastResolution).toEqual({
        nightNumber: 1,
        targetId: p4,
        protectedId: p3,
        killedPlayerId: p4,
        savedByConstable: false
      })
      expect(store.players.find((p) => p.id === p4)?.alive).toBe(false)
    })

    it('saves targeted player when protected by Constable', () => {
      const { store, p1, p2, p3, p4 } = setupActiveGame()
      store.confirmDawnWitches([p1], p3)
      store.confirmDawnConstable(p2)

      store.startNight()
      store.confirmWitchTarget(p4)
      store.confirmConstableProtection(p4)
      store.revealNightOutcome()

      expect(store.lastResolution).toEqual({
        nightNumber: 1,
        targetId: p4,
        protectedId: p4,
        killedPlayerId: null,
        savedByConstable: true
      })
      expect(store.players.find((p) => p.id === p4)?.alive).toBe(true)
    })
  })

  describe('day elimination and constable reassignment', () => {
    it('eliminates an accused player, clears their Constable/Black Cat role, and allows reassignment', () => {
      const { store, p1, p2, p3 } = setupActiveGame()
      store.confirmDawnWitches([p1], p2)
      store.confirmDawnConstable(p2)

      const elim = store.eliminatePlayer(p2)
      expect(elim.ok).toBe(true)
      expect(store.players.find((p) => p.id === p2)?.alive).toBe(false)
      expect(store.blackCatHolderId).toBeNull()
      expect(store.isConstable(p2)).toBe(false)

      expect(store.reassignConstable(p2).ok).toBe(false)
      expect(store.reassignConstable(p3).ok).toBe(true)
      expect(store.isConstable(p3)).toBe(true)
    })

    it('ends the game when all witches are eliminated', () => {
      const { store, p1, p2, p3 } = setupActiveGame()
      store.confirmDawnWitches([p1], p3)
      store.confirmDawnConstable(p2)

      store.eliminatePlayer(p1)
      expect(store.phase).toBe('ended')
      expect(store.winner).toBe('town')
    })
  })
})
