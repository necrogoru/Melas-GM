---
name: clean-code
description: Use when writing, changing or reviewing Vue, TypeScript, CSS or HTML code to keep it SOLID, small, layered, well named and semantic, and to reuse existing helpers and design-system components.
metadata:
  version: "1.0.0"
---

# Clean code

Checkable rules for code in this Vue + TypeScript codebase. Each one has a yes/no answer for an
agent or a reviewer. In a review, name the section (§4) and the fix it prescribes.

- **Scope: code you write or change.** The rules never justify refactoring untouched code. Report
  an old problem in one line and stay on the asked task.
- **Do not grow a hotspot.** In a file that already breaks §3, new logic goes in a new composable,
  util or child component. The old file only gains the lines that wire it in.
- **One source of truth.** A topic covered elsewhere gets a one-line pointer here, never a copy.

## 1. Simple first

The base is `AGENTS.md` "Quality bar": less is more, no dead code, no speculative abstraction.

- **Rule of three.** A new abstraction waits for its third real use. Code that already exists
  (§5, a near-identical component) is reused or extended from the second use.
- **Nothing for later.** No option, prop, emit, interface or wrapper that no caller uses yet.
- **One service file per domain resource.** Never one file per endpoint.
- **A function before a structure.** No class, factory or base component where a function or a composable does the job.

## 2. SOLID

`AGENTS.md` "Quality bar" asks for SOLID. In this stack it means:

| Principle | Here | Check |
|---|---|---|
| **S**ingle responsibility | A view composes, a component renders, a composable orchestrates, a service transports, a util is pure (§4). | Can you name the file's job without "and"? If not, split it (§3). |
| **O**pen/closed | Extend through props, slots and lookup maps. A new case is a new map entry or a new child component, not another branch in old code. | Adding a variant edits a map or adds a file, never a `v-else-if`. |
| **L**iskov substitution | A component that replaces or wraps another keeps its contract: the same `v-model`, emits and meaning of each prop. A typed function keeps its return type on every path. | Can every caller swap it in without a change? |
| **I**nterface segregation | Props and composable returns are the minimum a caller needs. Boolean mode props (`isAdmin`, `isEmbedded`, `isCompact`) that switch layouts mean several components. | Does every caller use what it receives? |
| **D**ependency inversion | Components depend on a composable's returned API, never on the transport. A composable takes what varies as arguments (e.g., `useTeams({ enabled })`). | Could a test pass the inputs in without mocking HTTP? |

## 3. One job per file, shallow folders

Size budgets are split triggers. Past one, split before adding more.

| Trigger | Split into |
|---|---|
| A `.vue` file past ~300 lines of script + template (CSS not counted) | Child components for template sections; a composable for stateful logic; a util for pure logic |
| A function past ~40 lines | Smaller named functions, each one step |
| A composable doing more than one job (fetch + filter + export) | One composable per job; the caller composes them |
| A `v-else-if` chain past 3 branches | A lookup map, a computed, or `<component :is>` over child components |

- **Shallow folders.** Depth counts sub-folders, not files. The deepest a component goes is
  `src/components/<domain>/<area>/Name.vue`; never a third level.
  - A deeper folder that already exists takes new siblings, but never a new level.
  - The same applies to `src/views/<domain>/`.
  - Shared design-system components keep their own `<Name>/<Name>.vue` layout under `src/components/ui/`.
  - No folder for a single file.

## 4. Layers

The flow is route/view → domain component → composable → service (`AGENTS.md` "Where code goes").
These rules are strict for new code.

| Layer | Does | Never |
|---|---|---|
| View, component | Renders, binds `v-model`, calls a composable | `fetch`, axios, a URL, or an `@/services/*` import |
| Composable (`src/composables/<domain>/`) | Calls services, holds reactive state, shows toasts | Raw HTTP client calls, `fetch` |
| Service (`src/services/<domain>/`) | The only transport: shared HTTP client for API calls | Reactive state, toasts |
| Store (`src/stores/`) | Shared state and the actions that change it; may call services | Toasts, DOM work, router calls |

- **Async jobs** (start, then poll): the service starts and reads the job; the composable holds the
  polling loop and its state.
- **No URL in a component or composable.** Base URLs come from `import.meta.env.VITE_*` or `src/constants/`, read in the service.
  - `VITE_*` values ship in the public bundle, so no secret goes there.

## 5. Reuse before writing

Before writing a helper, search for one: `rg -n "export (const|function) <verb>" src/utils src/composables`.

| Need | Use | Not |
|---|---|---|
| Date, time, range, relative time | Shared date-formatter composable/util | A local `formatDate`, `toLocaleDateString` |
| Number, money, percent, compact | Shared number-formatter composable/util | `toFixed` + string joins, `toLocaleString` |
| File size ("312 KB") | Shared `formatFileSize` util | Another `1024` formula |
| Copy to the clipboard | Shared clipboard util | Raw `navigator.clipboard.writeText` |
| Download a file | Shared file-download util | A hand-made `<a download>` |
| Log | Shared `logger` util | `console.*` |
| Deep copy | `structuredClone(toRaw(value))` | `JSON.parse(JSON.stringify(value))` |
| An id for `for`, `aria-*` | `useId()` from `vue` | `Math.random().toString(36)` |
| A client-side key for a new record | `crypto.randomUUID()` | `Math.random()`, `Date.now()` |
| A toast | Shared `useToast` composable | A custom notice |
| Any UI element | The design-system component (`product-designer` §2, §4) | A hand-made copy |

Two near-identical components are one component with a prop. Search by the component's words
before creating it.

## 6. Clean code

- **Early return.** Guard clauses first; no `if` nested more than two levels.
- **Thin templates.** An expression is a read, one ternary or one call. Anything more (a nested
  ternary, a filter, sort or join) is a computed, or a function such as `cardTag(card)` for per-item
  logic inside a `v-for`.
- **Named constants.** A number or string with meaning (a limit, a timeout, a status) is an UPPER_SNAKE constant (e.g., `MAX_UPLOAD_BYTES`).
- **No `any`.** Type the value explicitly with `import type` and proper interfaces/unions.
- **No `console.*`.** Use a structured logger (§5).
- **No commented-out code.** Git keeps it.
- **No unused code.** No unused prop, emit, import, export or variable.
- **Comments only for a non-obvious why** (`AGENTS.md` "Quality bar").
- **English only** for code identifiers, comments, and developer docs.

## 7. Naming

Names follow consistent Vue + TypeScript conventions.

| What | Convention | Example |
|---|---|---|
| `.vue` file | PascalCase; route screens `*View.vue`, shells `*Layout.vue` | `TaskOwner.vue`, `SettingsView.vue`, `HomeLayout.vue` |
| Domain component | `<Domain><UI noun>` (`product-designer` §3) | `OrderStatusBadge` |
| Design-system component | `Ui<Name>` (or the project's shared UI prefix) | `UiTable`, `UiButton` |
| Folder | camelCase domain | `userSettings/`, `billingFlow/` |
| Template tag | PascalCase, `<RouterLink>` not `<router-link>` | `<UiCard>` |
| Prop | camelCase in script, kebab-case in the template | `clickableRows` / `clickable-rows` |
| Boolean prop | Bare adjective | `open`, `disabled`, `loading` |
| Boolean ref or computed | `is` / `has` / `can` / `show` prefix | `isSaving`, `hasError`, `canEdit`, `showDetails` |
| Emit, listener | One word or kebab-case; `@kebab-case` | `close`, `row-click`, `update:modelValue` |
| Composable | `useX.ts`, returns an object of named values | `useUserTeams` |
| Store | `useXStore`, setup style, id = file name | `useAuthStore` in `src/stores/auth.ts` |
| Service | `<resource>Service.ts`, `export const verbNoun` | `saveUserLanguage` |
| Type | PascalCase, no `I` prefix; `interface` for shapes, `type` for unions; no `enum` | `OwnerView` |
| Util file | camelCase | `clipboard.ts` |
| Exported constant | UPPER_SNAKE | `MAX_UPLOAD_BYTES` |
| Locale key | camelCase file per domain, nested camelCase keys | `settings.profile.general` |

A name says what the thing is or does, never how it looks (`OrderStatusBadge`, not `GreenPill`).

## 8. CSS

- **`<style scoped>`** in every domain component.
- **BEM for new components and views.**
  - The block is the component name in kebab-case, on an element you own (never on a design-system component).
  - `TaskOwner.vue` → `.task-owner`, `.task-owner__name`, a variant `.task-owner--compact`.
  - Elements are one level deep: `.task-owner__name`, never `.task-owner__row__name`.
  - New classes in an existing non-BEM file follow that file's pattern; converting it is a refactor.
- **Variant vs state.** A `--modifier` is fixed by the parent (`--compact`). A state changes at run
  time and is `.is-*` on the block: `.task-owner.is-selected`, never a bare `.active` or `.selected`.
- **A design-system component changes look only through its props** (`tone`, `variant`, `size`).
- **Tokens only.** No hex or `rgb()` for colour, no raw px for space or radius (`anti-ai-design-slop` §4).
- **Never restyle a design-system component from outside:** no `:deep()`, no extra class (`product-designer` §3, §5).
- **Buttons** use the shared button component (`UiButton`); never redefine `.btn-*` classes in scoped styles.

## 9. Semantic HTML

Design-system components first, then the native element.

| Need | Use | Not |
|---|---|---|
| An action | `UiButton` (`type="button"` by default) | `<div @click>`, `<span @click>`, a raw `<button>` |
| An icon-only action | `UiButton icon-only label="…"` | An icon with no accessible name |
| Navigation | `UiButton` `to` / `href`, or `<RouterLink>` | `router.push` in a `@click` |
| A clickable card | `UiCard interactive` (+ `to` / `href`); no buttons or links in its slots | `<div class="card" @click>` |
| A clickable table row | `UiTable clickable-rows @row-click` | `<tr @click>`, `<td @click>` |
| A field and its label | The design-system input with `label` (`UiTextInput`, `UiSelect`…); native: `<label :for="id">` with `useId()` | A sibling `<label>` without `for`, a placeholder as the label |
| A form | `<form @submit.prevent="save">` + `UiButton type="submit"` | A button `@click` that reads the fields |
| A list | `<ul>` / `<ol>` with `v-for` on `<li>` | `v-for` on a `<div>` |
| A dialog, drawer or confirmation | `UiModal` | An overlay `<div>` without `role="dialog"` |
| The page landmark | `<main>` in `src/App.vue` wraps every view; a view's root is a `<section>` or `<div>` | A second `<main>` |
| Headings | One `<h1>` per page, then `h2`, `h3` in order | Skipped levels, a heading tag for its size |

- **Accessibility rules:** `product-designer` §4, `anti-ai-design-slop` §4 (targets, contrast).
- **Form UX:** `product-designer` §4.

## Red flags

| Thought | Reality |
|---|---|
| "The file is already 2000 lines, a few more won't matter" | Hotspots grow one change at a time. Put the new logic in a new composable or child component. |
| "While I'm here I'll clean up this old file" | Stay on the task. Report it in one line. |
| "A quick `fetch` in the component is simpler" | It skips auth and retry handling. Add a service function and call it from a composable. |
| "The store can show the toast itself" | Stores hold state. The composable that called it shows the toast. |
| "I'll write a small `formatDate` here" | Use the shared date-formatting utility/composable so formatting stays consistent and localized. |
| "`JSON.parse(JSON.stringify(x))` is fine" | It turns a `Date` into a string and drops `undefined` and `Map` entries. Use `structuredClone(toRaw(x))`. |
| "One more `mode` prop is quicker than a new component" | Mode props grow into a god component (§2, I). Make a second component. |
| "I'll make it configurable in case we need it" | Nothing for later. Add the option when a caller needs it. |
| "A nested ternary keeps it in one line" | Nobody can read it. Make it a computed. |
| "A `<div @click>` works fine with a mouse" | Not with a keyboard or a screen reader. Use `UiButton` or `UiCard interactive`. |
| "`router.push` in a click handler is the same as a link" | No middle-click, no new tab, no link role. Use `to`. |
| "The `<label>` is right next to the input" | Without `for` it labels nothing. Use the field's `label` prop. |
| "`.active` is clear enough" | State is `.is-active` on the block, and the block follows BEM. |
| "A sub-sub-folder keeps it tidy" | Deep trees hide files. One level under the domain at most. |
| "`console.log` is just for now" | It ships. Use the structured logger. |
