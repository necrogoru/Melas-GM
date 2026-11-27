export type CharacterId =
  | 'abigail-williams'
  | 'cotton-mather'
  | 'george-burroughs'
  | 'giles-corey'
  | 'john-proctor'
  | 'martha-corey'
  | 'mary-warren'
  | 'rebecca-nurse'
  | 'samuel-parris'
  | 'sarah-good'
  | 'tituba'
  | 'william-phips'

export interface SalemCharacter {
  id: CharacterId
  name: string
  roleHint: string
  ability: string
  accentColor: string
}

export type GamePhase =
  | 'lobby'
  | 'dawn'
  | 'day'
  | 'night-witches'
  | 'night-constable'
  | 'night-ready-reveal'
  | 'reveal'
  | 'ended'

export type DawnStep = 'witches' | 'constable'

export type GameWinner = 'town' | 'witches'

export interface Player {
  id: string
  name: string
  characterId: CharacterId
  alive: boolean
}

export interface NightResolution {
  nightNumber: number
  targetId: string | null
  protectedId: string | null
  killedPlayerId: string | null
  savedByConstable: boolean
}

export interface ActionResult {
  ok: boolean
  error?: string
}
