<script setup lang="ts">
import { onScopeDispose, watch } from 'vue'
import SalBadge from '@/components/sal-ui/SalBadge.vue'

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
      <div class="game-start-transition__stage">
        <svg
          class="game-start-transition__svg"
          viewBox="0 0 48 48"
          shape-rendering="crispEdges"
          aria-hidden="true">
          <!-- Ambient lantern halo -->
          <rect
            class="game-start-transition__halo"
            x="12"
            y="14"
            width="24"
            height="24"
            fill="var(--sal-accent-soft)" />

          <!-- Pixel stars -->
          <rect
            x="7"
            y="9"
            width="1"
            height="1"
            fill="var(--sal-text-secondary)" />

          <rect
            x="11"
            y="15"
            width="1"
            height="1"
            fill="var(--sal-text-muted)" />

          <rect
            x="40"
            y="20"
            width="1"
            height="1"
            fill="var(--sal-text-secondary)" />

          <!-- Pixel crescent moon -->
          <rect
            x="34"
            y="6"
            width="4"
            height="1"
            fill="var(--sal-warning-text)" />

          <rect
            x="33"
            y="7"
            width="2"
            height="1"
            fill="var(--sal-warning-text)" />

          <rect
            x="32"
            y="8"
            width="2"
            height="4"
            fill="var(--sal-warning-text)" />

          <rect
            x="33"
            y="12"
            width="2"
            height="1"
            fill="var(--sal-warning-text)" />

          <rect
            x="34"
            y="13"
            width="4"
            height="1"
            fill="var(--sal-warning-text)" />

          <rect
            x="37"
            y="12"
            width="2"
            height="1"
            fill="var(--sal-warning-text)" />

          <!-- Lantern ring & cap -->
          <rect
            x="22"
            y="7"
            width="4"
            height="1"
            fill="var(--sal-accent-primary)" />

          <rect
            x="21"
            y="8"
            width="1"
            height="3"
            fill="var(--sal-accent-primary)" />

          <rect
            x="26"
            y="8"
            width="1"
            height="3"
            fill="var(--sal-accent-primary)" />

          <rect
            x="19"
            y="11"
            width="10"
            height="2"
            fill="var(--sal-border-strong)" />

          <rect
            x="17"
            y="13"
            width="14"
            height="2"
            fill="var(--sal-accent-primary)" />

          <rect
            x="15"
            y="15"
            width="18"
            height="2"
            fill="var(--sal-surface-elevated)" />

          <rect
            x="15"
            y="15"
            width="18"
            height="1"
            fill="var(--sal-accent-primary)" />

          <!-- Lantern frame & glass -->
          <rect
            x="16"
            y="17"
            width="2"
            height="17"
            fill="var(--sal-accent-primary)" />

          <rect
            x="30"
            y="17"
            width="2"
            height="17"
            fill="var(--sal-accent-primary)" />

          <rect
            x="18"
            y="17"
            width="12"
            height="17"
            fill="var(--sal-surface-inset)" />

          <rect
            x="19"
            y="18"
            width="10"
            height="15"
            fill="var(--sal-accent-soft)" />

          <!-- Pixel flame -->
          <g class="game-start-transition__flame">
            <rect
              x="23"
              y="21"
              width="2"
              height="2"
              fill="var(--sal-warning-text)" />

            <rect
              x="22"
              y="23"
              width="4"
              height="4"
              fill="var(--sal-accent-primary-hover)" />

            <rect
              x="23"
              y="24"
              width="2"
              height="3"
              fill="var(--sal-warning-text)" />

            <rect
              x="22"
              y="27"
              width="4"
              height="2"
              fill="var(--sal-accent-primary)" />

            <rect
              x="23"
              y="29"
              width="2"
              height="2"
              fill="var(--sal-danger)" />
          </g>

          <!-- Lantern base -->
          <rect
            x="15"
            y="34"
            width="18"
            height="2"
            fill="var(--sal-accent-primary)" />

          <rect
            x="16"
            y="36"
            width="16"
            height="2"
            fill="var(--sal-surface-elevated)" />

          <rect
            x="18"
            y="38"
            width="12"
            height="2"
            fill="var(--sal-border-strong)" />
        </svg>
      </div>

      <SalBadge
        tone="accent"
        size="sm">
        El Alba se acerca
      </SalBadge>

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
  width: 100%;
  max-width: 340px;
  padding: var(--sal-space-6) var(--sal-space-5);
  background-color: var(--sal-surface-panel);
  border: var(--sal-border-width-step) solid var(--sal-border-strong);
  border-radius: var(--sal-radius-sm);
  box-shadow:
    var(--sal-shadow-bevel),
    var(--sal-shadow-pixel-md),
    var(--sal-shadow-modal);
  animation: salem-transition-rise 320ms steps(4, end) both;
}

.game-start-transition__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sal-space-2);
  margin-bottom: var(--sal-space-1);
  background-color: var(--sal-surface-inset);
  border: var(--sal-border-width-thin) solid var(--sal-border-hud);
  border-radius: var(--sal-radius-pixel);
  box-shadow: var(--sal-shadow-pixel-inset);
}

.game-start-transition__svg {
  width: 136px;
  height: 136px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.game-start-transition__halo {
  animation: salem-lantern-pulse 900ms steps(2, end) infinite alternate;
}

.game-start-transition__flame {
  transform-origin: 24px 26px;
  animation: salem-flame-flicker 500ms steps(2, end) infinite alternate;
}

.game-start-transition__title {
  margin: 0;
  font-family: var(--sal-font-display);
  font-size: var(--sal-font-size-xl);
  font-weight: var(--sal-font-weight-bold);
  color: var(--sal-text-primary);
  letter-spacing: var(--sal-tracking-hud);
}

.game-start-transition__subtitle {
  margin: 0;
  font-size: var(--sal-font-size-sm);
  color: var(--sal-text-secondary);
}

.game-start-transition__hint {
  margin: var(--sal-space-1) 0 0;
  font-family: var(--sal-font-mono);
  font-size: var(--sal-font-size-2xs);
  color: var(--sal-text-muted);
  letter-spacing: var(--sal-tracking-hud);
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
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes salem-lantern-pulse {
  from {
    opacity: 0.55;
  }
  to {
    opacity: 1;
  }
}

@keyframes salem-flame-flicker {
  from {
    transform: translateY(1px);
  }
  to {
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-start-transition,
  .game-start-transition__scene,
  .game-start-transition__halo,
  .game-start-transition__flame {
    animation: none;
  }
}
</style>
