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
  | 'gathering'
  | 'dawn'
  | 'day'
  | 'night-witches'
  | 'night-constable'
  | 'night-confession'
  | 'reveal'

export interface Player {
  id: string
  name: string
  characterId: CharacterId
}

export interface ActionResult {
  ok: boolean
  error?: string
}
