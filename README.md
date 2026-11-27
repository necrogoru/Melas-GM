# Salem 1692 · Game Master

A mobile-first, gamified **Game Master** web application for running tabletop **Salem 1692** sessions from a single phone placed in the center of the table.

## Features

- **Player Registration & Character Cards:** Register 4–12 players with unique portraits inspired by the 12 classic Salem 1692 Town Hall character cards.
- **Animated Miniature Village:** Twilight, dawn, day, and night atmosphere with animated character sprites, public Black Cat badge, and eliminated/ghost states.
- **Secret Dawn & Night Flows:**
  - **Dawn (El Alba):** Witches secretly mark themselves and assign the **Black Cat**, then the **Constable** secretly marks themselves. Both roles remain hidden throughout the game.
  - **Night (La Noche):** Guided by Spanish Town Crier narration, Witches select their target and hide it, then the Constable places the **Gavel** to protect any alive player except themselves, followed by a **Reveal** resolution.
- **ElevenLabs Voice & 1692 Ambience:** Pre-generated Spanish Town Crier cues and looping colonial day/night ambient audio (`public/audio/*.mp3`) with automatic volume ducking and `speechSynthesis` fallback.
- **Screen Wake Lock:** Keeps the phone screen awake during active gameplay so the table never loses the flow.
- **In-Game Rules Guide:** Quick-access info modal summarizing the [official Salem 1692 rules](docs/salem-1692-rules.md).
- **Sal UI (`src/components/sal-ui/`):** Reusable design system primitives built with Vue 3 `<script setup lang="ts">` and `defineModel`.

## Commands

```sh
# Install dependencies
bun install --frozen-lockfile

# Start dev server (use --host to test from a phone on the same Wi-Fi)
bun dev --host

# Type-check, lint, test, and build
bun run type-check
bun lint
bun test:unit --run
bun run build
```

### Regenerate ElevenLabs Audio

Set `ELEVENLABS_API_KEY` in `.env` or `.env.local` (never commit keys) and run:

```sh
bun scripts/generate-audio.ts
```

## Documentation

- [Salem 1692 Rules Summary (ES)](docs/salem-1692-rules.md)
