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

body {
  margin: 0;
  min-height: 100dvh;
  background-color: var(--sal-bg-night);
  color: var(--sal-text-primary);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>

<style scoped>
.sal-app {
  min-height: 100dvh;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: var(--sal-space-4);
}
</style>
