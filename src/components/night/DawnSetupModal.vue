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
        <div class="dawn-setup__audio-status">
          <span
            :class="['dawn-setup__audio-dot', { 'is-live': isNarrating }]"
            aria-hidden="true" />

          <SalBadge
            :tone="isNarrating ? 'accent' : 'neutral'"
            size="sm">
            {{ isNarrating ? 'Pregonero hablando…' : 'Audio en pausa' }}
          </SalBadge>
        </div>

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
  gap: var(--sal-space-3);
}

.dawn-setup__audio-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-2);
  padding: var(--sal-space-2) var(--sal-space-3);
  background-color: var(--sal-surface-panel);
  border: var(--sal-border-width-thin) solid var(--sal-border-hud);
  border-radius: var(--sal-radius-sm);
  box-shadow: var(--sal-shadow-bevel);
}

.dawn-setup__audio-status {
  display: inline-flex;
  align-items: center;
  gap: var(--sal-space-2);
}

.dawn-setup__audio-dot {
  width: var(--sal-space-2);
  height: var(--sal-space-2);
  border-radius: var(--sal-radius-pixel);
  background-color: var(--sal-text-muted);
  flex-shrink: 0;
}

.dawn-setup__audio-dot.is-live {
  background-color: var(--sal-telemetry-live);
  animation: sal-audio-pulse 900ms steps(2, end) infinite;
}

.dawn-setup__intro {
  margin: 0;
  font-size: var(--sal-font-size-sm);
  color: var(--sal-text-secondary);
  line-height: 1.45;
}

@keyframes sal-audio-pulse {
  from {
    opacity: 0.45;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dawn-setup__audio-dot.is-live {
    animation: none;
  }
}
</style>
