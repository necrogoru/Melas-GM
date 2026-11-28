<script setup lang="ts">
import GameMasterView from '@/views/GameMasterView.vue'
</script>

<template>
  <main class="sal-app">
    <GameMasterView />
  </main>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  overflow-x: clip;
}

body {
  min-height: 100dvh;
  background-color: var(--sal-bg-night);
  color: var(--sal-text-primary);
  font-family: var(--sal-font-sans);
  -webkit-font-smoothing: antialiased;
}

:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: var(--sal-focus-ring);
  outline-offset: var(--sal-focus-offset);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>

<style scoped>
.sal-app {
  position: relative;
  z-index: var(--sal-z-shell);
  min-height: 100dvh;
  width: 100%;
  max-width: var(--sal-container-max);
  margin: 0 auto;
  padding: var(--sal-space-3);
}

@media (min-width: 768px) {
  .sal-app {
    padding: var(--sal-space-5) var(--sal-space-6);
  }
}
</style>
