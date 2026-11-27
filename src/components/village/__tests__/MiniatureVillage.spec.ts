import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { SALEM_CHARACTERS } from '@/data/characters'
import type { GamePhase, Player } from '@/types/game'
import VillagerSprite from '@/components/village/VillagerSprite.vue'
import MiniatureVillage from '@/components/village/MiniatureVillage.vue'

function createAllPlayers(): Player[] {
  return SALEM_CHARACTERS.map((character, index) => ({
    id: `player-${String(index + 1)}`,
    name: `Jugador ${String(index + 1)}`,
    characterId: character.id,
    alive: true
  }))
}

describe('VillagerSprite', () => {
  it('renders bespoke SVG sprites for all 12 Salem 1692 characters', () => {
    const svgSignatures = new Set<string>()

    for (const character of SALEM_CHARACTERS) {
      const wrapper = mount(VillagerSprite, {
        props: {
          characterId: character.id,
          playerName: character.name,
          alive: true,
          hasBlackCat: false
        }
      })

      expect(wrapper.attributes('data-character-id')).toBe(character.id)
      const svg = wrapper.find('svg.villager-sprite__svg')
      expect(svg.exists()).toBe(true)
      svgSignatures.add(svg.html())
    }

    expect(svgSignatures.size).toBe(12)
  })

  it('reflects alive and dead ghost states without exposing secret roles', () => {
    const aliveWrapper = mount(VillagerSprite, {
      props: {
        characterId: 'john-proctor',
        playerName: 'Ana',
        alive: true,
        hasBlackCat: false
      }
    })

    expect(aliveWrapper.classes()).toContain('is-alive')
    expect(aliveWrapper.classes()).not.toContain('is-dead')
    expect(aliveWrapper.attributes('data-alive')).toBe('true')

    const deadWrapper = mount(VillagerSprite, {
      props: {
        characterId: 'john-proctor',
        playerName: 'Ana',
        alive: false,
        hasBlackCat: false
      }
    })

    expect(deadWrapper.classes()).toContain('is-dead')
    expect(deadWrapper.attributes('data-alive')).toBe('false')
    expect(deadWrapper.text()).toContain('Eliminado')
    expect(deadWrapper.text()).not.toMatch(/bruja|witch|alguacil|constable/i)
  })

  it('displays the public Black Cat badge only when hasBlackCat is true', () => {
    const withoutCat = mount(VillagerSprite, {
      props: {
        characterId: 'tituba',
        playerName: 'Luis',
        alive: true,
        hasBlackCat: false
      }
    })
    expect(withoutCat.text()).not.toContain('Gato Negro')

    const withCat = mount(VillagerSprite, {
      props: {
        characterId: 'tituba',
        playerName: 'Luis',
        alive: true,
        hasBlackCat: true
      }
    })
    expect(withCat.classes()).toContain('has-black-cat')
    expect(withCat.text()).toContain('Gato Negro')
  })
})

describe('MiniatureVillage', () => {
  it('renders church steeple, miniature houses, lanterns, and all 12 positioned villagers', () => {
    const players = createAllPlayers()
    const deadPlayer = players[2]
    const catPlayer = players[4]
    if (!deadPlayer || !catPlayer) {
      throw new Error('Expected at least 5 players')
    }
    deadPlayer.alive = false

    const wrapper = mount(MiniatureVillage, {
      props: {
        players,
        phase: 'day',
        blackCatHolderId: catPlayer.id
      }
    })

    expect(wrapper.find('[data-village-landmark="church-steeple"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-village-landmark="house"]').length).toBeGreaterThanOrEqual(2)
    expect(wrapper.findAll('[data-village-landmark="lantern"]').length).toBeGreaterThanOrEqual(1)

    const sprites = wrapper.findAllComponents(VillagerSprite)
    expect(sprites).toHaveLength(12)

    const deadSprite = sprites[2]
    expect(deadSprite?.classes()).toContain('is-dead')

    const catSprite = sprites[4]
    expect(catSprite?.text()).toContain('Gato Negro')

    expect(wrapper.html()).not.toMatch(/bruja|witch|alguacil|constable/i)
  })

  it('transitions sky mood across lobby, dawn, day, and night phases', () => {
    const players = createAllPlayers().slice(0, 4)
    const cases: Array<{ phase: GamePhase; expectedSky: string }> = [
      { phase: 'lobby', expectedSky: 'twilight' },
      { phase: 'dawn', expectedSky: 'dawn' },
      { phase: 'day', expectedSky: 'day' },
      { phase: 'night-witches', expectedSky: 'night' },
      { phase: 'night-constable', expectedSky: 'night' },
      { phase: 'night-ready-reveal', expectedSky: 'night' },
      { phase: 'reveal', expectedSky: 'day' }
    ]

    for (const { phase, expectedSky } of cases) {
      const wrapper = mount(MiniatureVillage, {
        props: {
          players,
          phase,
          blackCatHolderId: null
        }
      })

      expect(wrapper.attributes('data-sky')).toBe(expectedSky)
    }
  })
})
