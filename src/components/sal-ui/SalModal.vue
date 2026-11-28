<script setup lang="ts">
import { useId } from 'vue'

export interface SalModalProps {
  title?: string
  closable?: boolean
}

const props = withDefaults(defineProps<SalModalProps>(), {
  title: undefined,
  closable: true
})

const open = defineModel<boolean>('open', { default: false })

const titleId = useId()

function close() {
  if (!props.closable) return
  open.value = false
}
</script>

<template>
  <div
    v-if="open"
    class="sal-modal__backdrop"
    @click.self="close"
    @keydown.escape="close">
    <div
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? titleId : undefined"
      class="sal-modal__dialog">
      <header
        v-if="title || closable"
        class="sal-modal__header">
        <h2
          v-if="title"
          :id="titleId"
          class="sal-modal__title">
          {{ title }}
        </h2>

        <button
          v-if="closable"
          type="button"
          aria-label="Cerrar"
          class="sal-modal__close"
          @click="close">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div class="sal-modal__body">
        <slot />
      </div>

      <footer
        v-if="$slots.footer"
        class="sal-modal__footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.sal-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--sal-z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sal-space-4);
  background-color: var(--sal-surface-overlay);
}

.sal-modal__dialog {
  width: 100%;
  max-width: 440px;
  max-height: 90dvh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border: var(--sal-border-width-step) solid var(--sal-border-strong);
  border-radius: var(--sal-radius-sm);
  background-color: var(--sal-surface-base);
  color: var(--sal-text-primary);
  box-shadow:
    var(--sal-shadow-bevel),
    var(--sal-shadow-pixel-md),
    var(--sal-shadow-modal);
}

.sal-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sal-space-3);
  padding: var(--sal-space-3) var(--sal-space-5);
  background-color: var(--sal-surface-header);
  border-bottom: var(--sal-border-width-step) solid var(--sal-border-hud);
}

.sal-modal__title {
  margin: 0;
  font-family: var(--sal-font-display);
  font-size: var(--sal-font-size-md);
  font-weight: var(--sal-font-weight-bold);
  letter-spacing: var(--sal-tracking-hud);
}

.sal-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--sal-control-sm);
  min-height: var(--sal-control-sm);
  padding: 0;
  border: var(--sal-border-width-thin) solid var(--sal-border-hud);
  border-radius: var(--sal-radius-pixel);
  background-color: var(--sal-surface-elevated);
  box-shadow: var(--sal-shadow-bevel);
  color: var(--sal-text-secondary);
  cursor: pointer;
  transition:
    background-color var(--sal-transition-instant),
    border-color var(--sal-transition-instant),
    color var(--sal-transition-instant);
}

.sal-modal__close:hover {
  background-color: var(--sal-surface-hover);
  border-color: var(--sal-accent-primary);
  color: var(--sal-text-primary);
}

.sal-modal__close:focus-visible {
  outline: var(--sal-focus-ring);
  outline-offset: var(--sal-focus-offset);
}

.sal-modal__body {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-3);
  padding: var(--sal-space-4) var(--sal-space-5);
}

.sal-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sal-space-2);
  padding: var(--sal-space-3) var(--sal-space-5);
  background-color: var(--sal-surface-panel);
  border-top: var(--sal-border-width-thin) solid var(--sal-border-hud);
}
</style>
