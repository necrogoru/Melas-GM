<script setup lang="ts">
export interface SalButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
}

withDefaults(defineProps<SalButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  block: false
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'sal-button',
      `sal-button--${variant}`,
      `sal-button--${size}`,
      {
        'sal-button--block': block,
        'is-disabled': disabled
      }
    ]">
    <slot />
  </button>
</template>

<style scoped>
.sal-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sal-space-2);
  border: var(--sal-border-width-step) solid transparent;
  border-radius: var(--sal-radius-pixel);
  font-family: var(--sal-font-mono);
  font-weight: var(--sal-font-weight-bold);
  letter-spacing: var(--sal-tracking-hud);
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--sal-shadow-bevel), var(--sal-shadow-pixel-sm);
  transition:
    background-color var(--sal-transition-instant),
    border-color var(--sal-transition-instant),
    color var(--sal-transition-instant),
    transform var(--sal-transition-instant),
    box-shadow var(--sal-transition-instant);
  user-select: none;
}

.sal-button:focus-visible {
  outline: var(--sal-focus-ring);
  outline-offset: var(--sal-focus-offset);
}

.sal-button:active:not(:disabled) {
  transform: translate(1px, 1px);
  box-shadow: var(--sal-shadow-bevel);
}

.sal-button--sm {
  min-height: var(--sal-control-sm);
  padding: 0 var(--sal-space-3);
  font-size: var(--sal-font-size-xs);
}

.sal-button--md {
  min-height: var(--sal-control-md);
  padding: 0 var(--sal-space-4);
  font-size: var(--sal-font-size-sm);
}

.sal-button--lg {
  min-height: var(--sal-control-lg);
  padding: 0 var(--sal-space-5);
  font-size: var(--sal-font-size-md);
}

.sal-button--block {
  width: 100%;
}

.sal-button--primary {
  background-color: var(--sal-accent-primary);
  border-color: var(--sal-accent-primary-active);
  color: var(--sal-accent-contrast);
}

.sal-button--primary:hover:not(:disabled) {
  background-color: var(--sal-accent-primary-hover);
  border-color: var(--sal-border-focus);
}

.sal-button--primary:active:not(:disabled) {
  background-color: var(--sal-accent-primary-active);
}

.sal-button--secondary {
  background-color: var(--sal-surface-elevated);
  border-color: var(--sal-border-hud);
  color: var(--sal-text-primary);
}

.sal-button--secondary:hover:not(:disabled) {
  background-color: var(--sal-surface-hover);
  border-color: var(--sal-accent-primary);
}

.sal-button--danger {
  background-color: var(--sal-danger);
  border-color: var(--sal-danger-hover);
  color: var(--sal-text-primary);
}

.sal-button--danger:hover:not(:disabled) {
  background-color: var(--sal-danger-hover);
  border-color: var(--sal-danger-text);
}

.sal-button--ghost {
  background-color: transparent;
  border-color: transparent;
  box-shadow: none;
  color: var(--sal-text-secondary);
}

.sal-button--ghost:hover:not(:disabled) {
  background-color: var(--sal-surface-elevated);
  border-color: var(--sal-border-subtle);
  box-shadow: var(--sal-shadow-bevel);
  color: var(--sal-text-primary);
}

.sal-button.is-disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
