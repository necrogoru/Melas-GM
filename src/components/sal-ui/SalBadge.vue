<script setup lang="ts">
export interface SalBadgeProps {
  tone?: 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<SalBadgeProps>(), {
  tone: 'neutral',
  size: 'md'
})
</script>

<template>
  <span
    :class="[
      'sal-badge',
      `sal-badge--${tone}`,
      `sal-badge--${size}`
    ]">
    <slot />
  </span>
</template>

<style scoped>
.sal-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sal-space-1);
  border: var(--sal-border-width-thin) solid transparent;
  border-radius: var(--sal-radius-pixel);
  font-family: var(--sal-font-mono);
  font-weight: var(--sal-font-weight-bold);
  letter-spacing: var(--sal-tracking-hud);
  text-transform: uppercase;
  line-height: 1.2;
  white-space: nowrap;
  box-shadow: var(--sal-shadow-bevel);
}

.sal-badge--sm {
  padding: var(--sal-space-1) var(--sal-space-2);
  font-size: var(--sal-font-size-2xs);
}

.sal-badge--md {
  padding: var(--sal-space-1) var(--sal-space-3);
  font-size: var(--sal-font-size-xs);
}

.sal-badge--neutral {
  background-color: var(--sal-surface-elevated);
  border-color: var(--sal-border-strong);
  color: var(--sal-text-secondary);
}

.sal-badge--accent {
  background-color: var(--sal-accent-soft);
  border-color: var(--sal-accent-primary);
  color: var(--sal-accent-primary-hover);
}

.sal-badge--danger {
  background-color: var(--sal-danger-soft);
  border-color: var(--sal-danger);
  color: var(--sal-danger-text);
}

.sal-badge--success {
  background-color: var(--sal-success-soft);
  border-color: var(--sal-success);
  color: var(--sal-success-text);
}

.sal-badge--warning {
  background-color: var(--sal-warning-soft);
  border-color: var(--sal-warning);
  color: var(--sal-warning-text);
}
</style>
