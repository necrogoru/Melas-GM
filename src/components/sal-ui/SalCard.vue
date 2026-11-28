<script setup lang="ts">
export interface SalCardProps {
  variant?: 'default' | 'parchment' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  selected?: boolean
}

withDefaults(defineProps<SalCardProps>(), {
  variant: 'default',
  padding: 'md',
  selected: false
})
</script>

<template>
  <section
    :class="[
      'sal-card',
      `sal-card--${variant}`,
      `sal-card--pad-${padding}`,
      { 'is-selected': selected }
    ]">
    <header
      v-if="$slots.header"
      class="sal-card__header">
      <slot name="header" />
    </header>

    <div class="sal-card__body">
      <slot />
    </div>

    <footer
      v-if="$slots.footer"
      class="sal-card__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.sal-card {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-3);
  border: var(--sal-border-width-step) solid var(--sal-border-hud);
  border-radius: var(--sal-radius-sm);
  box-shadow: var(--sal-shadow-bevel), var(--sal-shadow-pixel-md);
  transition:
    border-color var(--sal-transition-instant),
    box-shadow var(--sal-transition-instant);
}

.sal-card--default {
  background-color: var(--sal-surface-panel);
  color: var(--sal-text-primary);
}

.sal-card--elevated {
  background-color: var(--sal-surface-elevated);
  border-color: var(--sal-border-strong);
  color: var(--sal-text-primary);
}

.sal-card--parchment {
  background-color: var(--sal-surface-parchment);
  border-color: var(--sal-border-parchment);
  color: var(--sal-text-ink);
}

.sal-card--pad-none {
  padding: 0;
}

.sal-card--pad-sm {
  padding: var(--sal-space-3);
}

.sal-card--pad-md {
  padding: var(--sal-space-4);
}

.sal-card--pad-lg {
  padding: var(--sal-space-6);
}

.sal-card.is-selected {
  border-color: var(--sal-accent-primary);
  box-shadow:
    0 0 0 var(--sal-border-width-thin) var(--sal-accent-primary),
    var(--sal-shadow-bevel),
    var(--sal-shadow-pixel-md);
}

.sal-card__header {
  font-family: var(--sal-font-display);
  font-weight: var(--sal-font-weight-bold);
  font-size: var(--sal-font-size-md);
  letter-spacing: var(--sal-tracking-tight);
  padding-bottom: var(--sal-space-2);
  border-bottom: var(--sal-border-width-thin) solid var(--sal-border-hud);
}

.sal-card--pad-none .sal-card__header {
  padding: var(--sal-space-3) var(--sal-space-4);
  background-color: var(--sal-surface-header);
}

.sal-card--parchment .sal-card__header {
  border-bottom-color: var(--sal-border-parchment);
}

.sal-card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sal-space-2);
  padding-top: var(--sal-space-3);
  border-top: var(--sal-border-width-thin) solid var(--sal-border-hud);
}

.sal-card--pad-none .sal-card__footer {
  padding: var(--sal-space-3) var(--sal-space-4);
}

.sal-card--parchment .sal-card__footer {
  border-top-color: var(--sal-border-parchment);
}
</style>
