<script setup lang="ts">
import { computed } from 'vue'
import SalBadge from '@/components/sal-ui/SalBadge.vue'
import SalModal from '@/components/sal-ui/SalModal.vue'
import VillagerSprite from '@/components/village/VillagerSprite.vue'
import { SALEM_CHARACTERS } from '@/data/characters'
import type { CharacterId } from '@/types/game'

export interface CharacterPickerModalProps {
  takenCharacterIds?: readonly CharacterId[]
}

const props = withDefaults(defineProps<CharacterPickerModalProps>(), {
  takenCharacterIds: () => []
})

const open = defineModel<boolean>('open', { default: false })
const selectedCharacterId = defineModel<CharacterId | null>({ default: null })

const takenSet = computed(() => new Set(props.takenCharacterIds))

function isTaken(characterId: CharacterId): boolean {
  return takenSet.value.has(characterId)
}

function selectCharacter(characterId: CharacterId): void {
  if (isTaken(characterId)) return
  selectedCharacterId.value = characterId
  open.value = false
}
</script>

<template>
  <SalModal
    v-model:open="open"
    title="Elige tu personaje">
    <ul class="character-picker__grid">
      <li
        v-for="character in SALEM_CHARACTERS"
        :key="character.id"
        class="character-picker__item">
        <button
          type="button"
          :data-character-option="character.id"
          :disabled="isTaken(character.id)"
          :aria-pressed="selectedCharacterId === character.id"
          :class="[
            'character-picker__option',
            {
              'is-selected': selectedCharacterId === character.id,
              'is-taken': isTaken(character.id)
            }
          ]"
          @click="selectCharacter(character.id)">
          <div class="character-picker__portrait">
            <VillagerSprite
              :character-id="character.id"
              size="md" />
          </div>

          <div class="character-picker__info">
            <div class="character-picker__heading">
              <span class="character-picker__name">{{ character.name }}</span>

              <SalBadge
                v-if="isTaken(character.id)"
                tone="neutral"
                size="sm">
                Elegido
              </SalBadge>

              <SalBadge
                v-else-if="selectedCharacterId === character.id"
                tone="accent"
                size="sm">
                Seleccionado
              </SalBadge>
            </div>

            <span class="character-picker__role">{{ character.roleHint }}</span>

            <p class="character-picker__ability">
              {{ character.ability }}
            </p>
          </div>
        </button>
      </li>
    </ul>
  </SalModal>
</template>

<style scoped>
.character-picker__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sal-space-2);
}

@media (min-width: 520px) {
  .character-picker__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.character-picker__item {
  display: flex;
  min-width: 0;
}

.character-picker__option {
  width: 100%;
  min-height: var(--sal-control-lg);
  display: flex;
  align-items: center;
  gap: var(--sal-space-3);
  padding: var(--sal-space-3);
  border: var(--sal-border-width-step) solid var(--sal-border-hud);
  border-radius: var(--sal-radius-sm);
  background-color: var(--sal-surface-panel);
  color: var(--sal-text-primary);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: var(--sal-shadow-bevel), var(--sal-shadow-pixel-sm);
  transition:
    border-color var(--sal-transition-instant),
    background-color var(--sal-transition-instant);
}

.character-picker__option:hover:not(:disabled) {
  border-color: var(--sal-accent-primary);
  background-color: var(--sal-surface-elevated);
}

.character-picker__option:focus-visible {
  outline: var(--sal-focus-ring);
  outline-offset: var(--sal-focus-offset);
}

.character-picker__option.is-selected {
  border-color: var(--sal-accent-primary);
  background-color: var(--sal-accent-soft);
}

.character-picker__option.is-taken {
  opacity: 0.48;
  cursor: not-allowed;
  box-shadow: none;
}

.character-picker__portrait {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: var(--sal-space-2);
  border: var(--sal-border-width-thin) solid var(--sal-border-subtle);
  border-radius: var(--sal-radius-pixel);
  background-color: var(--sal-surface-inset);
  box-shadow: var(--sal-shadow-pixel-inset);
}

.character-picker__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-1);
}

.character-picker__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-2);
  flex-wrap: wrap;
}

.character-picker__name {
  font-family: var(--sal-font-display);
  font-size: var(--sal-font-size-sm);
  font-weight: var(--sal-font-weight-bold);
  color: var(--sal-text-primary);
}

.character-picker__role {
  font-family: var(--sal-font-mono);
  font-size: var(--sal-font-size-xs);
  font-weight: var(--sal-font-weight-medium);
  color: var(--sal-accent-primary-hover);
}

.character-picker__ability {
  margin: 0;
  font-size: var(--sal-font-size-xs);
  color: var(--sal-text-secondary);
  line-height: 1.35;
}
</style>
