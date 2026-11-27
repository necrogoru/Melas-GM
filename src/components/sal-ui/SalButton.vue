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
  border: 1px solid transparent;
  border-radius: var(--sal-radius-md);
  font-family: inherit;
  font-weight: var(--sal-font-weight-semibold);
  line-height: 1;
  cursor: pointer;
  transition:
    background-color var(--sal-transition-fast),
    border-color var(--sal-transition-fast),
    color var(--sal-transition-fast);
  user-select: none;
}

.sal-button:focus-visible {
  outline: 2px solid var(--sal-border-focus);
  outline-offset: 2px;
}

.sal-button--sm {
  min-height: var(--sal-control-sm);
  padding: 0 var(--sal-space-3);
  font-size: var(--sal-font-size-sm);
}

.sal-button--md {
  min-height: var(--sal-control-md);
  padding: 0 var(--sal-space-4);
  font-size: var(--sal-font-size-md);
}

.sal-button--lg {
  min-height: var(--sal-control-lg);
  padding: 0 var(--sal-space-5);
  font-size: var(--sal-font-size-lg);
}

.sal-button--block {
  width: 100%;
}

.sal-button--primary {
  background-color: var(--sal-accent-primary);
  color: var(--sal-accent-contrast);
}

.sal-button--primary:hover:not(:disabled) {
  background-color: var(--sal-accent-primary-hover);
}

.sal-button--primary:active:not(:disabled) {
  background-color: var(--sal-accent-primary-active);
}

.sal-button--secondary {
  background-color: var(--sal-surface-elevated);
  border-color: var(--sal-border-strong);
  color: var(--sal-text-primary);
}

.sal-button--secondary:hover:not(:disabled) {
  border-color: var(--sal-accent-primary);
}

.sal-button--danger {
  background-color: var(--sal-danger);
  color: var(--sal-text-primary);
}

.sal-button--danger:hover:not(:disabled) {
  background-color: var(--sal-danger-hover);
}

.sal-button--ghost {
  background-color: transparent;
  color: var(--sal-text-secondary);
}

.sal-button--ghost:hover:not(:disabled) {
  background-color: var(--sal-surface-elevated);
  color: var(--sal-text-primary);
}

.sal-button.is-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
