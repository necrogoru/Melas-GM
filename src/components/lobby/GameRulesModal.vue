<script setup lang="ts">
import SalBadge from '@/components/sal-ui/SalBadge.vue'
import SalButton from '@/components/sal-ui/SalButton.vue'
import SalModal from '@/components/sal-ui/SalModal.vue'

const open = defineModel<boolean>('open', { default: false })

const OFFICIAL_RULES_URL =
  'https://www.ultraboardgames.com/salem/game-rules.php?utm_source=chatgpt.com'
</script>

<template>
  <SalModal
    v-model:open="open"
    title="Guía de Salem 1692">
    <div class="rules-guide">
      <section class="rules-guide__section">
        <div class="rules-guide__badges">
          <SalBadge tone="accent">
            Pueblo: revela todas las Brujas
          </SalBadge>

          <SalBadge tone="danger">
            Brujas: eliminan al Pueblo
          </SalBadge>
        </div>
      </section>

      <section class="rules-guide__section">
        <h3 class="rules-guide__heading">
          1. El Alba (inicio)
        </h3>

        <p class="rules-guide__text">
          Todos cierran los ojos. Las Brujas se reconocen en secreto y asignan el
          <strong>Gato Negro</strong>
          (quien lo recibe empieza la partida). Después, el
          <strong>Alguacil</strong> se marca en secreto.
        </p>
      </section>

      <section class="rules-guide__section">
        <h3 class="rules-guide__heading">
          2. El Día y las 5 Leyes
        </h3>

        <ul class="rules-guide__list">
          <li>
            En tu turno: <strong>roba 2 cartas</strong>

            o <strong>juega cartas</strong> sobre otros.
          </li>

          <li>Con <strong>7 acusaciones</strong> (cartas rojas) se revela una carta de Juicio.</li>

          <li>Nunca puedes jugar cartas ni el <strong>martillo</strong> sobre ti mismo.</li>

          <li>Al morir tienes 3 últimas palabras y luego guardas silencio.</li>
        </ul>
      </section>

      <section class="rules-guide__section">
        <h3 class="rules-guide__heading">
          3. La Noche
        </h3>

        <ul class="rules-guide__list">
          <li><strong>Brujas:</strong> abren los ojos y eligen a quién atacar.</li>

          <li>
            <strong>Alguacil:</strong>

            coloca el <strong>martillo</strong> para proteger a alguien (nunca a sí mismo).
          </li>

          <li>
            <strong>Revelar:</strong>

            antes de revelar, un jugador puede <em>Confesar</em> una carta de Juicio para salvarse.
          </li>
        </ul>
      </section>

      <a
        class="rules-guide__link"
        :href="OFFICIAL_RULES_URL"
        target="_blank"
        rel="noopener noreferrer">
        Ver reglamento completo (Ultra BoardGames) ↗
      </a>
    </div>

    <template #footer>
      <SalButton
        variant="primary"
        block
        @click="open = false">
        Entendido
      </SalButton>
    </template>
  </SalModal>
</template>

<style scoped>
.rules-guide {
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-3);
}

.rules-guide__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sal-space-2);
}

.rules-guide__section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.rules-guide__heading {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--sal-accent);
}

.rules-guide__text,
.rules-guide__list {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--sal-text);
}

.rules-guide__list {
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rules-guide__link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: var(--sal-space-1);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sal-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
