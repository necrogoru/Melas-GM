<script setup lang="ts">
import { onScopeDispose, watch } from 'vue'

const TRANSITION_DURATION_MS = 1600

const open = defineModel<boolean>('open', { default: false })

let dismissTimer: ReturnType<typeof setTimeout> | null = null

function clearDismissTimer(): void {
  if (dismissTimer !== null) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

function dismiss(): void {
  clearDismissTimer()
  open.value = false
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && open.value) {
    dismiss()
  }
}

function attachEscapeListener(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('keydown', handleKeydown)
}

function detachEscapeListener(): void {
  if (typeof window === 'undefined') return
  window.removeEventListener('keydown', handleKeydown)
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

watch(
  open,
  (isOpen) => {
    clearDismissTimer()

    if (!isOpen) {
      detachEscapeListener()
      return
    }

    if (prefersReducedMotion()) {
      open.value = false
      return
    }

    attachEscapeListener()
    dismissTimer = setTimeout(() => {
      dismiss()
    }, TRANSITION_DURATION_MS)
  },
  { immediate: true }
)

onScopeDispose(() => {
  clearDismissTimer()
  detachEscapeListener()
})
</script>

<template>
  <div
    v-if="open"
    class="game-start-transition"
    role="status"
    aria-live="polite"
    aria-label="Comienza la partida en Salem 1692"
    data-testid="game-start-transition"
    @click="dismiss">
    <div class="game-start-transition__scene">
      <svg
        class="game-start-transition__svg"
        viewBox="0 0 180 180"
        fill="none"
        aria-hidden="true">
        <circle
          class="game-start-transition__halo"
          cx="90"
          cy="92"
          r="62"
          fill="var(--sal-accent-soft)" />

        <circle
          class="game-start-transition__ring"
          cx="90"
          cy="92"
          r="52"
          stroke="var(--sal-accent-primary)"
          stroke-width="1.5"
          stroke-dasharray="4 4" />

        <!-- Crescent moon -->
        <path
          d="M126 36 A14 14 0 1 0 144 52 A11 11 0 1 1 126 36 Z"
          fill="var(--sal-warning-text)" />

        <!-- Lantern body -->
        <g class="game-start-transition__lantern">
          <path
            d="M78 46 H102 L96 58 H84 Z"
            fill="var(--sal-surface-elevated)"
            stroke="var(--sal-accent-primary)"
            stroke-width="2"
            stroke-linejoin="round" />

          <circle
            cx="90"
            cy="40"
            r="5"
            stroke="var(--sal-accent-primary)"
            stroke-width="2" />

          <rect
            x="70"
            y="58"
            width="40"
            height="56"
            rx="6"
            fill="var(--sal-surface-base)"
            stroke="var(--sal-accent-primary)"
            stroke-width="2.5" />

          <rect
            x="77"
            y="66"
            width="26"
            height="40"
            rx="3"
            fill="var(--sal-accent-soft)"
            stroke="var(--sal-border-strong)"
            stroke-width="1.5" />

          <path
            class="game-start-transition__flame"
            d="M90 74 C96 82, 98 92, 90 98 C82 92, 84 82, 90 74 Z"
            fill="var(--sal-accent-primary)" />

          <path
            d="M66 114 H114 L106 126 H74 Z"
            fill="var(--sal-surface-elevated)"
            stroke="var(--sal-accent-primary)"
            stroke-width="2"
            stroke-linejoin="round" />
        </g>
      </svg>

      <p class="game-start-transition__title">
        Salem 1692
      </p>

      <p class="game-start-transition__subtitle">
        El pueblo se reúne antes del Alba
      </p>

      <p class="game-start-transition__hint">
        Toca o pulsa Escape para continuar
      </p>
    </div>
  </div>
</template>

<style scoped>
.game-start-transition {
  position: fixed;
  inset: 0;
  z-index: var(--sal-z-modal);
  display: grid;
  place-items: center;
  padding: var(--sal-space-4);
  background-color: var(--sal-surface-overlay);
  cursor: pointer;
  animation: salem-transition-fade 1600ms ease forwards;
}

.game-start-transition__scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sal-space-2);
  text-align: center;
  max-width: 320px;
  animation: salem-transition-rise 420ms ease-out both;
}

.game-start-transition__svg {
  width: 160px;
  height: 160px;
}

.game-start-transition__halo {
  transform-origin: 90px 92px;
  animation: salem-lantern-pulse 1200ms ease-in-out infinite alternate;
}

.game-start-transition__ring {
  transform-origin: 90px 92px;
  animation: salem-ring-spin 8000ms linear infinite;
}

.game-start-transition__flame {
  transform-origin: 90px 92px;
  animation: salem-flame-flicker 600ms ease-in-out infinite alternate;
}

.game-start-transition__title {
  margin: 0;
  font-size: var(--sal-font-size-xl);
  font-weight: var(--sal-font-weight-bold);
  color: var(--sal-text-primary);
  letter-spacing: 0.04em;
}

.game-start-transition__subtitle {
  margin: 0;
  font-size: var(--sal-font-size-md);
  color: var(--sal-text-secondary);
}

.game-start-transition__hint {
  margin: var(--sal-space-2) 0 0;
  font-size: var(--sal-font-size-xs);
  color: var(--sal-text-muted);
}

@keyframes salem-transition-fade {
  0% {
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes salem-transition-rise {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes salem-lantern-pulse {
  from {
    opacity: 0.55;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes salem-ring-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes salem-flame-flicker {
  from {
    transform: scaleY(0.94);
  }
  to {
    transform: scaleY(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-start-transition,
  .game-start-transition__scene,
  .game-start-transition__halo,
  .game-start-transition__ring,
  .game-start-transition__flame {
    animation: none;
  }
}
</style>
