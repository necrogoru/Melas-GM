<script setup lang="ts">
import { computed, ref } from 'vue'
import SalBadge from '@/components/sal-ui/SalBadge.vue'
import SalButton from '@/components/sal-ui/SalButton.vue'
import SalCard from '@/components/sal-ui/SalCard.vue'
import SalModal from '@/components/sal-ui/SalModal.vue'
import { useNightFlow } from '@/composables/game/useNightFlow'
import { getWitchLimits } from '@/stores/gameStore'

const {
  isDawnOpen,
  dawnStep,
  alivePlayers,
  isNarrating,
  replayCue,
  submitDawnWitches,
  submitDawnConstable
} = useNightFlow()

const selectedWitchIds = ref<string[]>([])
const selectedBlackCatId = ref<string | null>(null)
const selectedConstableId = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const modalTitle = computed(() =>
  dawnStep.value === 'witches' ? 'El Alba · Brujas' : 'El Alba · Alguacil'
)

const witchLimits = computed(() => getWitchLimits(alivePlayers.value.length))
const isWitchLimitReached = computed(
  () => selectedWitchIds.value.length >= witchLimits.value.max
)
const witchLimitHint = computed(() => {
  const { min, max } = witchLimits.value
  const count = alivePlayers.value.length
  if (max === 1) {
    return `Con ${String(count)} jugadores: exactamente 1 bruja.`
  }
  return `Con ${String(count)} jugadores: entre ${String(min)} y ${String(max)} brujas.`
})

function isWitchSelected(playerId: string): boolean {
  return selectedWitchIds.value.includes(playerId)
}

function toggleWitch(playerId: string): void {
  errorMessage.value = null
  if (isWitchSelected(playerId)) {
    selectedWitchIds.value = selectedWitchIds.value.filter((id) => id !== playerId)
    return
  }
  if (isWitchLimitReached.value) return
  selectedWitchIds.value = [...selectedWitchIds.value, playerId]
}

function selectBlackCat(playerId: string): void {
  errorMessage.value = null
  selectedBlackCatId.value = playerId
}

function selectConstable(playerId: string): void {
  errorMessage.value = null
  selectedConstableId.value = playerId
}

function clearSecretSelections(): void {
  selectedWitchIds.value = []
  selectedBlackCatId.value = null
  selectedConstableId.value = null
  errorMessage.value = null
}

function handleWitchesSubmit(): void {
  errorMessage.value = null
  const result = submitDawnWitches(selectedWitchIds.value, selectedBlackCatId.value ?? '')
  if (!result.ok) {
    errorMessage.value = result.error ?? 'Selecciona al menos una bruja y al portador del Gato Negro.'
    return
  }
  clearSecretSelections()
}

function handleConstableSubmit(): void {
  errorMessage.value = null
  const result = submitDawnConstable(selectedConstableId.value ?? '')
  if (!result.ok) {
    errorMessage.value = result.error ?? 'Selecciona quién es el Alguacil.'
    return
  }
  clearSecretSelections()
}
</script>

<template>
  <SalModal
    :open="isDawnOpen"
    :closable="false"
    :title="modalTitle">
    <div class="dawn-setup">
      <div class="dawn-setup__audio-bar">
        <SalBadge
          :tone="isNarrating ? 'accent' : 'neutral'"
          size="sm">
          {{ isNarrating ? 'Pregonero hablando…' : 'Audio en pausa' }}
        </SalBadge>

        <SalButton
          variant="ghost"
          size="sm"
          @click="replayCue">
          Repetir audio
        </SalButton>
      </div>

      <template v-if="dawnStep === 'witches'">
        <SalCard
          variant="elevated"
          padding="sm">
          <p class="dawn-setup__intro">
            Todos cierren los ojos. Brujas, abran los ojos en silencio, márquense aquí y elijan quién recibe el Gato Negro.
          </p>
        </SalCard>

        <section class="dawn-setup__section">
          <h3 class="dawn-setup__heading">
            1. ¿Quiénes son las Brujas?
          </h3>

          <p
            class="dawn-setup__hint"
            data-testid="witch-limit-hint">
            {{ witchLimitHint }}
          </p>

          <ul class="dawn-setup__list">
            <li
              v-for="(player, index) in alivePlayers"
              :key="`witch-${player.id}`"
              class="dawn-setup__item">
              <SalButton
                :variant="isWitchSelected(player.id) ? 'primary' : 'secondary'"
                size="md"
                block
                :disabled="!isWitchSelected(player.id) && isWitchLimitReached"
                :aria-pressed="isWitchSelected(player.id)"
                :data-testid="`witch-option-${index}`"
                @click="toggleWitch(player.id)">
                {{ player.name }}
              </SalButton>
            </li>
          </ul>
        </section>

        <section class="dawn-setup__section">
          <h3 class="dawn-setup__heading">
            2. ¿Quién recibe el Gato Negro?
          </h3>

          <ul class="dawn-setup__list">
            <li
              v-for="(player, index) in alivePlayers"
              :key="`cat-${player.id}`"
              class="dawn-setup__item">
              <SalButton
                :variant="selectedBlackCatId === player.id ? 'primary' : 'secondary'"
                size="md"
                block
                :aria-pressed="selectedBlackCatId === player.id"
                :data-testid="`black-cat-option-${index}`"
                @click="selectBlackCat(player.id)">
                {{ player.name }}
              </SalButton>
            </li>
          </ul>
        </section>
      </template>

      <template v-else>
        <SalCard
          variant="elevated"
          padding="sm">
          <p class="dawn-setup__intro">
            Las brujas cierran los ojos. Alguacil, abre los ojos, márcate en secreto y pulsa Aceptar para ocultar tu identidad.
          </p>
        </SalCard>

        <section class="dawn-setup__section">
          <h3 class="dawn-setup__heading">
            ¿Quién es el Alguacil?
          </h3>

          <ul class="dawn-setup__list">
            <li
              v-for="(player, index) in alivePlayers"
              :key="`constable-${player.id}`"
              class="dawn-setup__item">
              <SalButton
                :variant="selectedConstableId === player.id ? 'primary' : 'secondary'"
                size="md"
                block
                :aria-pressed="selectedConstableId === player.id"
                :data-testid="`constable-option-${index}`"
                @click="selectConstable(player.id)">
                {{ player.name }}
              </SalButton>
            </li>
          </ul>
        </section>
      </template>

      <p
        v-if="errorMessage"
        role="alert"
        class="dawn-setup__error">
        {{ errorMessage }}
      </p>
    </div>

    <template #footer>
      <SalButton
        v-if="dawnStep === 'witches'"
        variant="primary"
        size="lg"
        block
        data-testid="dawn-witches-accept"
        @click="handleWitchesSubmit">
        Aceptar
      </SalButton>

      <SalButton
        v-else
        variant="primary"
        size="lg"
        block
        data-testid="dawn-constable-accept"
        @click="handleConstableSubmit">
        Aceptar
      </SalButton>
    </template>
  </SalModal>
</template>

<style scoped>
.dawn-setup {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-4);
}

.dawn-setup__audio-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-2);
}

.dawn-setup__intro {
  margin: 0;
  font-size: var(--sal-font-size-sm);
  color: var(--sal-text-secondary);
  line-height: 1.45;
}

.dawn-setup__section {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-2);
}

.dawn-setup__heading {
  margin: 0;
  font-size: var(--sal-font-size-sm);
  font-weight: var(--sal-font-weight-semibold);
  color: var(--sal-text-primary);
}

.dawn-setup__hint {
  margin: 0;
  font-size: var(--sal-font-size-xs);
  color: var(--sal-text-secondary);
}

.dawn-setup__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--sal-space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.dawn-setup__item {
  min-width: 0;
}

.dawn-setup__error {
  margin: 0;
  padding: var(--sal-space-2) var(--sal-space-3);
  border-radius: var(--sal-radius-md);
  background-color: var(--sal-danger-soft);
  color: var(--sal-danger-text);
  font-size: var(--sal-font-size-sm);
}
</style>
