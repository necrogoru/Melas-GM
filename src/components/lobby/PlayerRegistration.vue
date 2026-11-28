<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CharacterPickerModal from '@/components/lobby/CharacterPickerModal.vue'
import SalBadge from '@/components/sal-ui/SalBadge.vue'
import SalButton from '@/components/sal-ui/SalButton.vue'
import SalCard from '@/components/sal-ui/SalCard.vue'
import SalInput from '@/components/sal-ui/SalInput.vue'
import VillagerSprite from '@/components/village/VillagerSprite.vue'
import { SALEM_CHARACTERS } from '@/data/characters'
import { MAX_PLAYERS, MIN_PLAYERS, useGameStore } from '@/stores/gameStore'
import type { CharacterId, SalemCharacter } from '@/types/game'

const store = useGameStore()

const playerName = ref('')
const selectedCharacterId = ref<CharacterId | null>(null)
const isPickerOpen = ref(false)
const formError = ref<string | undefined>(undefined)

const takenCharacterIds = computed(() =>
  store.players.map((player) => player.characterId)
)

const isLobbyFull = computed(() => store.players.length >= MAX_PLAYERS)

const selectedCharacter = computed(() => findCharacter(selectedCharacterId.value))

const countTone = computed(() => (store.canStartGame ? 'success' : 'neutral'))

watch([playerName, selectedCharacterId], () => {
  formError.value = undefined
})

function findCharacter(characterId: CharacterId | null): SalemCharacter | undefined {
  if (!characterId) return undefined
  return SALEM_CHARACTERS.find((character) => character.id === characterId)
}

function getCharacterName(characterId: CharacterId): string {
  return findCharacter(characterId)?.name ?? characterId
}

function handleAddPlayer(): void {
  const trimmedName = playerName.value.trim()
  if (!trimmedName) {
    formError.value = 'Ingresa el nombre del jugador.'
    return
  }

  if (!selectedCharacterId.value) {
    formError.value = 'Elige un personaje de Salem.'
    return
  }

  const result = store.addPlayer(trimmedName, selectedCharacterId.value)
  if (!result.ok) {
    formError.value = result.error
    return
  }

  playerName.value = ''
  selectedCharacterId.value = null
  formError.value = undefined
}

function handleStartGame(): void {
  const result = store.startGame()
  if (!result.ok) {
    formError.value = result.error
  }
}
</script>

<template>
  <section class="player-registration">
    <SalCard variant="elevated">
      <template #header>
        <div class="player-registration__header">
          <h2 class="player-registration__title">
            Registro de jugadores
          </h2>

          <SalBadge :tone="countTone">
            {{ store.players.length }} / {{ MAX_PLAYERS }} jugadores
          </SalBadge>
        </div>
      </template>

      <p class="player-registration__hint">
        Registra entre {{ MIN_PLAYERS }} y {{ MAX_PLAYERS }} jugadores con personajes únicos de
        Salem.
      </p>

      <form
        class="player-registration__form"
        @submit.prevent="handleAddPlayer">
        <SalInput
          v-model="playerName"
          label="Nombre del jugador"
          placeholder="Ej. Ana"
          :maxlength="32"
          :disabled="isLobbyFull"
          :error="formError" />

        <div class="player-registration__picker-row">
          <SalButton
            data-testid="open-character-picker"
            variant="secondary"
            block
            :disabled="isLobbyFull || store.availableCharacters.length === 0"
            @click="isPickerOpen = true">
            <template v-if="selectedCharacter">
              <span>Personaje: {{ selectedCharacter.name }}</span>
            </template>

            <template v-else>
              <span>Elegir personaje</span>
            </template>
          </SalButton>

          <SalButton
            type="submit"
            variant="primary"
            block
            :disabled="isLobbyFull">
            Agregar jugador
          </SalButton>
        </div>
      </form>

      <div
        v-if="selectedCharacter"
        class="player-registration__preview">
        <VillagerSprite
          :character-id="selectedCharacter.id"
          size="sm" />

        <div class="player-registration__preview-text">
          <strong>{{ selectedCharacter.name }}</strong>

          <span>{{ selectedCharacter.roleHint }}</span>
        </div>
      </div>

      <ul
        v-if="store.players.length > 0"
        class="player-registration__list">
        <li
          v-for="player in store.players"
          :key="player.id"
          class="player-registration__item">
          <div class="player-registration__player">
            <VillagerSprite
              :character-id="player.characterId"
              size="sm" />

            <div class="player-registration__player-info">
              <span class="player-registration__player-name">{{ player.name }}</span>

              <span class="player-registration__player-character">
                {{ getCharacterName(player.characterId) }}
              </span>
            </div>
          </div>

          <SalButton
            variant="ghost"
            size="sm"
            :aria-label="`Quitar a ${player.name}`"
            @click="store.removePlayer(player.id)">
            Quitar
          </SalButton>
        </li>
      </ul>

      <p
        v-else
        class="player-registration__empty">
        Aún no hay jugadores registrados.
      </p>

      <template #footer>
        <SalButton
          data-testid="play-button"
          variant="primary"
          size="lg"
          block
          :disabled="!store.canStartGame"
          @click="handleStartGame">
          Jugar
        </SalButton>
      </template>
    </SalCard>

    <CharacterPickerModal
      v-model:open="isPickerOpen"
      v-model="selectedCharacterId"
      :taken-character-ids="takenCharacterIds" />
  </section>
</template>

<style scoped>
.player-registration {
  width: 100%;
}

.player-registration__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-2);
  flex-wrap: wrap;
}

.player-registration__title {
  margin: 0;
  font-family: var(--sal-font-display);
  font-size: var(--sal-font-size-lg);
  font-weight: var(--sal-font-weight-bold);
}

.player-registration__hint {
  margin: 0 0 var(--sal-space-3);
  font-size: var(--sal-font-size-sm);
  color: var(--sal-text-secondary);
  line-height: 1.45;
}

.player-registration__form {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-3);
}

.player-registration__picker-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sal-space-2);
}

@media (min-width: 480px) {
  .player-registration__picker-row {
    grid-template-columns: 1fr 1fr;
  }
}

.player-registration__preview {
  margin-top: var(--sal-space-3);
  display: flex;
  align-items: center;
  gap: var(--sal-space-3);
  padding: var(--sal-space-2) var(--sal-space-3);
  border: var(--sal-border-width-thin) solid var(--sal-accent-primary);
  border-radius: var(--sal-radius-sm);
  background-color: var(--sal-surface-inset);
  box-shadow: var(--sal-shadow-pixel-inset);
}

.player-registration__preview-text {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-1);
  font-size: var(--sal-font-size-sm);
}

.player-registration__preview-text span {
  font-family: var(--sal-font-mono);
  font-size: var(--sal-font-size-xs);
  color: var(--sal-accent-primary-hover);
}

.player-registration__list {
  list-style: none;
  margin: var(--sal-space-4) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-2);
}

.player-registration__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-3);
  padding: var(--sal-space-2) var(--sal-space-3);
  border: var(--sal-border-width-thin) solid var(--sal-border-hud);
  border-radius: var(--sal-radius-sm);
  background-color: var(--sal-surface-panel);
  box-shadow: var(--sal-shadow-bevel);
}

.player-registration__player {
  display: flex;
  align-items: center;
  gap: var(--sal-space-3);
  min-width: 0;
}

.player-registration__player-info {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-1);
  min-width: 0;
}

.player-registration__player-name {
  font-size: var(--sal-font-size-md);
  font-weight: var(--sal-font-weight-semibold);
  color: var(--sal-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-registration__player-character {
  font-family: var(--sal-font-mono);
  font-size: var(--sal-font-size-xs);
  color: var(--sal-text-secondary);
}

.player-registration__empty {
  margin: var(--sal-space-4) 0 0;
  padding: var(--sal-space-4) var(--sal-space-3);
  border: var(--sal-border-width-thin) dashed var(--sal-border-hud);
  border-radius: var(--sal-radius-sm);
  background-color: var(--sal-surface-inset);
  font-family: var(--sal-font-mono);
  font-size: var(--sal-font-size-xs);
  color: var(--sal-text-muted);
  text-align: center;
}
</style>
