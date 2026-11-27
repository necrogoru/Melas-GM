# AGENTS.md

This is a Vue 3 + Vite + TypeScript seed repository for building web applications.

`CLAUDE.md` is a symlink to this file: edit `AGENTS.md` only and never replace the symlink with a
copy. Skills live in `.agents/skills`; `.claude/skills` is a symlink to it, so add skills there only.

## Skills to invoke

| When | Skill |
|---|---|
| A change users see (screen, section, flow, component, state), before any Vue or CSS. A single trivial state (e.g., an empty or no-access state) skips it | `product-designer` |
| Producing or reviewing a design or new Vue markup and layout | `anti-ai-design-slop` |
| Writing, changing or reviewing code (Vue, TS, CSS, HTML) | `clean-code` |
| Opening a pull request | `antfu-create-pr` |
| Touching that tool (reference) | `vue`, `pinia`, `vite`, `pnpm` |

## Where code goes

- Follow the flow route/view → domain component → composable → service. Transport details go in
  services; cross-component reactive workflows go in composables.
- `src/router/index.ts` holds the route tree and guards; `src/views/**` holds route-level screens.
- `src/components/<domain>/**` holds domain UI. Reach for the shared design system / UI components
  (`src/components/ui/`) first; add components there only when they are genuinely reusable, not
  when they are domain-specific.
- `src/composables/<domain>/**` orchestrates; `src/stores/**` is Pinia state.
- `src/services/**` is the API client layer.
- Shared domain types live in `src/types/`, one module per domain, no barrel.
- User-facing strings belong in locale files when i18n is configured (`src/locales/`).

## Commands

| Task | Command |
|---|---|
| Install dependencies | `bun install --frozen-lockfile` |
| Dev server | `bun dev` |
| Type-check | `bun run type-check` |
| Build (type-check + bundle) | `bun run build` |
| Unit tests | `bun test:unit` |
| Lint (oxlint + eslint) | `bun lint` |

## Rules that always apply

- Every change reaches `main` through a pull request (`gh pr create --base main`), merged with
  Squash and merge only. Never push to `main` or merge into it locally.
- The PR title is a Conventional Commit, `type(Scope): subject`, with a PascalCase scope
  (`docs(Agents): ...`), a lowercase subject and no trailing period.
- Install with `bun install --frozen-lockfile` only. If it fails, stop and report it. A dependency
  change is its own deliberate change, with `package.json` and `bun.lock` together.
- New modules are TypeScript and new components use `<script setup lang="ts">`.
- Use `@/` imports.
- Write code identifiers, comments, and documentation in English; user-facing translations belong in
  locale files.
- Form UX golden rule: keep submit available and validate on submit with clear, actionable field
  errors; see `product-designer` for the complete guidance.
- Before creating a UI component, always check the shared design system / UI library and use an
  existing component if it meets the need; never duplicate it or redefine shared button/control
  classes in scoped styles.
- Every input or control, in the design system or a domain folder, takes its value through `v-model`:
  `defineModel` in the component, `v-model="..."` at the call site. No other prop or event carries
  the value (no `:value` + `@input`, no value in `@change`).
- Never expose `.env.local`, tokens, or credentials. `VITE_*` values ship in the public bundle.

## Quality bar

- Less is more: the simplest solution that meets the goal.
- Small, focused files. Code reads like its surroundings.
- Use as few comments as possible, only for a non-obvious why.
- Follow SOLID principles and reuse existing code where appropriate.
- No dead code and no speculative abstraction.
- Verify before you claim it is done: run `bun run type-check`, `bun lint`, `bun test:unit`, and
  `bun run build`, and inspect the output.
