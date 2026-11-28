<script setup lang="ts">
import SalBadge from '@/components/sal-ui/SalBadge.vue'
import SalButton from '@/components/sal-ui/SalButton.vue'
import SalCard from '@/components/sal-ui/SalCard.vue'
import SalModal from '@/components/sal-ui/SalModal.vue'
import { useNightFlow } from '@/composables/game/useNightFlow'

const {
  isDawnOpen,
  isNarrating,
  replayCue,
  completeDawn
} = useNightFlow()

function handleCompleteDawn(): void {
  completeDawn()
}
</script>

<template>
  <SalModal
    :open="isDawnOpen"
    :closable="false"
    title="El Alba · Brujas">
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

      <SalCard
        variant="elevated"
        padding="sm">
        <p class="dawn-setup__intro">
          Todos cierren los ojos. Brujas, abran los ojos en silencio, reconózcanse y coloquen el Gato Negro sobre la mesa. Al terminar, cierren los ojos y pulsen el botón para despertar al pueblo.
        </p>
      </SalCard>
    </div>

    <template #footer>
      <SalButton
        variant="primary"
        size="lg"
        block
        data-testid="dawn-complete-button"
        @click="handleCompleteDawn">
        Despertar al pueblo
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
  line-height: 1.5;
}
</style>
