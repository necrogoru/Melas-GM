import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount, type VueWrapper } from '@vue/test-utils'
import { SALEM_CHARACTERS } from '@/data/characters'
import { useGameStore } from '@/stores/gameStore'
import PlayerRegistration from '@/components/lobby/PlayerRegistration.vue'
import CharacterPickerModal from '@/components/lobby/CharacterPickerModal.vue'

function mountRegistration() {
  return mount(PlayerRegistration)
}

async function registerPlayer(
  wrapper: VueWrapper,
  name: string,
  characterIndex: number
) {
  const character = SALEM_CHARACTERS[characterIndex]
  if (!character) {
    throw new Error(`Missing character at index ${String(characterIndex)}`)
  }

  await wrapper.get('input').setValue(name)
  await wrapper.get('[data-testid="open-character-picker"]').trigger('click')
  await wrapper
    .get(`[data-character-option="${character.id}"]`)
    .trigger('click')
  await wrapper.get('form').trigger('submit')
}

describe('PlayerRegistration', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('adds players with selected Salem characters and validates missing fields', async () => {
    const wrapper = mountRegistration()
    const store = useGameStore()

    await wrapper.get('form').trigger('submit')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(store.players).toHaveLength(0)

    await registerPlayer(wrapper, 'Ana', 0)

    expect(store.players).toHaveLength(1)
    expect(store.players[0]?.name).toBe('Ana')
    expect(store.players[0]?.characterId).toBe(SALEM_CHARACTERS[0]?.id)
    expect(wrapper.text()).toContain('Ana')
    expect(wrapper.text()).toContain(SALEM_CHARACTERS[0]?.name ?? '')
  })

  it('enforces unique character selection in CharacterPickerModal', async () => {
    const wrapper = mountRegistration()

    await registerPlayer(wrapper, 'Ana', 0)

    await wrapper.get('[data-testid="open-character-picker"]').trigger('click')
    const modal = wrapper.findComponent(CharacterPickerModal)
    expect(modal.exists()).toBe(true)

    const takenId = SALEM_CHARACTERS[0]?.id ?? ''
    const takenButton = wrapper.get(`[data-character-option="${takenId}"]`)
    expect(takenButton.attributes('disabled')).toBeDefined()
    expect(takenButton.text()).toContain('Elegido')

    const availableId = SALEM_CHARACTERS[1]?.id ?? ''
    const availableButton = wrapper.get(`[data-character-option="${availableId}"]`)
    expect(availableButton.attributes('disabled')).toBeUndefined()
  })

  it('enables Play only when 4 to 12 players are registered and starts the game on click', async () => {
    const wrapper = mountRegistration()
    const store = useGameStore()

    const playButton = () => wrapper.get('[data-testid="play-button"]')
    expect(playButton().attributes('disabled')).toBeDefined()

    await registerPlayer(wrapper, 'Ana', 0)
    await registerPlayer(wrapper, 'Luis', 1)
    await registerPlayer(wrapper, 'Marta', 2)
    expect(playButton().attributes('disabled')).toBeDefined()

    await registerPlayer(wrapper, 'Pedro', 3)
    expect(playButton().attributes('disabled')).toBeUndefined()

    await playButton().trigger('click')
    expect(store.phase).toBe('gathering')
  })

  it('allows removing a player and frees their character', async () => {
    const wrapper = mountRegistration()
    const store = useGameStore()

    await registerPlayer(wrapper, 'Ana', 0)
    await registerPlayer(wrapper, 'Luis', 1)
    await registerPlayer(wrapper, 'Marta', 2)
    await registerPlayer(wrapper, 'Pedro', 3)

    expect(store.players).toHaveLength(4)

    await wrapper.get('[aria-label="Quitar a Ana"]').trigger('click')
    expect(store.players).toHaveLength(3)
    expect(wrapper.get('[data-testid="play-button"]').attributes('disabled')).toBeDefined()

    await wrapper.get('[data-testid="open-character-picker"]').trigger('click')
    const freedId = SALEM_CHARACTERS[0]?.id ?? ''
    expect(
      wrapper.get(`[data-character-option="${freedId}"]`).attributes('disabled')
    ).toBeUndefined()
  })
})
