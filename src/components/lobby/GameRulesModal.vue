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
          El <strong>Alguacil</strong>
          es una carta de Juicio boca abajo repartida al inicio (no despierta en El Alba). Todos cierran los ojos; las Brujas despiertan en silencio, se reconocen y colocan el
          <strong>Gato Negro</strong>
          sobre la mesa para marcar quién inicia la partida.
        </p>

        <table
          class="rules-guide__table"
          aria-label="Cantidad oficial de brujas según jugadores">
          <thead>
            <tr>
              <th>Jugadores</th>

              <th>Cartas de Bruja</th>

              <th>Brujas en El Alba</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>4–5</td>

              <td>1</td>

              <td>1</td>
            </tr>

            <tr>
              <td>6–12</td>

              <td>2</td>

              <td>1–2</td>
            </tr>
          </tbody>
        </table>
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
          <li><strong>Brujas:</strong> abren los ojos y colocan la carta de Muerte sobre su víctima.</li>

          <li>
            <strong>Alguacil:</strong>

            si su carta de Juicio sigue oculta en juego, coloca el <strong>martillo</strong> para proteger a otro jugador (nunca a sí mismo).
          </li>

          <li>
            <strong>Confesión:</strong>

            todos despiertan; antes de revelar, quien quiera puede <em>Confesar</em> volteando 1 carta de Juicio para salvarse esta noche.
          </li>

          <li>
            <strong>Revelar:</strong>
            se revela la carta de Muerte (se salva con martillo, Confesión o Asilo); si muere, pronuncia 3 últimas palabras y se baraja el descarte con la carta de Noche al final del mazo.
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
  gap: var(--sal-space-2);
  padding: var(--sal-space-3);
  background-color: var(--sal-surface-panel);
  border: var(--sal-border-width-thin) solid var(--sal-border-hud);
  border-radius: var(--sal-radius-sm);
  box-shadow: var(--sal-shadow-bevel);
}

.rules-guide__heading {
  margin: 0;
  font-family: var(--sal-font-display);
  font-size: var(--sal-font-size-sm);
  font-weight: var(--sal-font-weight-bold);
  color: var(--sal-accent-primary-hover);
}

.rules-guide__text,
.rules-guide__list {
  margin: 0;
  font-size: var(--sal-font-size-sm);
  line-height: 1.45;
  color: var(--sal-text-primary);
}

.rules-guide__list {
  padding-left: var(--sal-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--sal-space-1);
}

.rules-guide__table {
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--sal-space-1);
  font-family: var(--sal-font-mono);
  font-size: var(--sal-font-size-xs);
  color: var(--sal-text-primary);
  background-color: var(--sal-surface-inset);
  border: var(--sal-border-width-thin) solid var(--sal-border-hud);
  border-radius: var(--sal-radius-pixel);
  overflow: hidden;
}

.rules-guide__table th,
.rules-guide__table td {
  padding: var(--sal-space-2);
  text-align: left;
  border-bottom: var(--sal-border-width-thin) solid var(--sal-border-subtle);
}

.rules-guide__table th {
  background-color: var(--sal-surface-header);
  color: var(--sal-text-secondary);
  font-weight: var(--sal-font-weight-bold);
  letter-spacing: var(--sal-tracking-hud);
  text-transform: uppercase;
}

.rules-guide__table tbody tr:last-child td {
  border-bottom: none;
}

.rules-guide__link {
  display: inline-flex;
  align-items: center;
  gap: var(--sal-space-1);
  margin-top: var(--sal-space-1);
  font-family: var(--sal-font-mono);
  font-size: var(--sal-font-size-xs);
  font-weight: var(--sal-font-weight-semibold);
  color: var(--sal-accent-primary-hover);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.rules-guide__link:focus-visible {
  outline: var(--sal-focus-ring);
  outline-offset: var(--sal-focus-offset);
}
</style>
