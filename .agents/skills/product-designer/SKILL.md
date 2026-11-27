---
name: product-designer
description: Use when a UI change adds or changes something users see (a screen, section, flow, component, state or filter) before any Vue or CSS is written, or when asked to design, mock up, propose or review UI.
metadata:
  version: "1.2.0"
---

# Product Designer

Design with the project's shared design system / UI library (e.g. `src/components/ui/`). Four rules
carry the skill:

1. **Build only from design-system components, never from their classes.** Use `<UiButton variant="secondary">`, not `<button class="btn btn-secondary">`. The design system is reusable because every screen goes through the same component.
2. **Never customize a component locally; ask for a change instead.** When a design-system component can't do what the design needs, propose the change to the component itself and ask the user to approve it.
3. **No name is invented.** A new component takes its name from UIGuideline or from mainstream UI libraries.
4. **Design comes before code, and the user picks how.** Before drawing anything (a screen, a presentation, a piece of content), ask how many designs they want and which tool to draw in. Neither has a default (§7).

**Reusing components does not remove the design step.** Where things go, what stands out and how
every state looks *is* the design. "Every piece already exists, so no mockup is needed" is the
mistake this skill exists to stop.

## 1. Brief

Before anything else, write five lines. Ask the user only what the code cannot answer.

- **Who and why:** who uses it (user role / permissions) and the job they are doing.
- **Where:** the route and entry point. Say whether the route supports mobile viewports.
- **Data:** where it comes from (API / store / props). If a required field or filter does not exist yet, say so now.
- **States:** empty, loading, error, success, partial, and no-permission.
- **Surfaces:** light and dark themes, density modes, and copy lengths across supported locales.

## 2. Reuse ledger

For every UI element in the brief, search in this order and stop at the first match.

1. **A design-system component as it is today.** Read its API: the variant, size, prop or slot the design needs may already exist.
2. **A design-system component with a change** (rule 2, §5). Only when no prop or slot covers the need.
3. **A domain component already built from the design system** (search `src/components` by pattern or domain terms).
   - A domain component that draws its own markup or CSS instead of the design system is a migration target. Don't copy it.

Record every element as a row: `Element | DS component / DS change / New | Component and props | Why`.
An element is **New** only after all steps found nothing; then §3 names it.

## 3. Naming anything new

- **Generic, design-system-level component:** use the UIGuideline title (https://www.uiguideline.com/components).
  - If UIGuideline has no such component, use the name that at least two mainstream libraries give it (MUI, Radix, Mantine, Ant Design, Carbon, shadcn…). Cite them.
  - If neither applies, it is a variant of an existing component, or it does not belong in the design system.
- **Domain component** (belongs to one section): name it `<Domain><UI noun>`, and take the noun from the same lists. Examples: `ConversationPriorityMenu`; a month grid of days to toggle is a `Calendar`, not a `SendDayGrid`.
- **Naming a component by its use is inventing.** `PriorityPill`, `StatusChip`, `InfoWidget`: look up the noun instead.
- **A new design-system component must ship with:** its folder, `index.ts`, documentation/demo, and passing unit tests.
- **A domain component composes design-system components only.** It has no styling of its own beyond layout: arranging design-system components is fine, repainting them is not.

## 4. Components, not classes

Every element in every option is a design-system component, with its variant, size and tone set through props.

| Need | Use | Not |
|---|---|---|
| Any button, link-button, icon button or toggle | `UiButton` (`variant`, `size`, `icon`, `icon-only` + `label`, `loading`, `pressed`, `to` / `href`) | `<button class="btn btn-*">`, `.icon-btn`, `.close-btn` |
| Segmented options | `UiToggleButton` | `.segment-control`, `.segment-pill` |
| Status, count | `UiBadge` | `.x-badge`, `.x-pill` |
| Chip, filter chip, removable label | `UiTag` | `.filter-chip`, `.x-chip` |
| Inline message | `UiAlert` | `.x-banner`, `.alert` |
| Empty, error or success state | `UiEmptyState` | `.empty-state` |
| Loading | `UiSpinner`, `UiSkeleton`, `UiProgressBar` | `@keyframes spin`, `.x-skeleton` |
| Field with label, hint or error | `UiTextInput`, `UiTextarea`, `UiSelect`, `UiNumberInput`, `UiDatePicker` | `.form-input`, `.form-group`, a hand-made label wrapper |
| Table, card | `UiTable`, `UiCard` | `.dt-*`, `.x-card` |
| Menu, tabs, steps | `UiMenu`, `UiTabs`, `UiStepper` | hand-made `role="tablist"`, kebab menus |
| Dialog, drawer, confirmation | `UiModal` | a custom overlay |
| Ephemeral notice | `useToast` | a custom toast |

**Rules the components enforce:**
- **Colour:**
  - Tokens only, never hex or `rgb()`.
  - Tones are `neutral | brand | success | warning | danger | info`.
  - Green is the only "done" colour.
- **Sizes:** `sm | md | lg`.
- **Icons:** consistent stroke weight and rounded ends/corners (`stroke-linecap="round"`, `stroke-linejoin="round"`).
- **Form controls** bind their value with `v-model`.
- **Copy:**
  - User-facing strings use i18n keys when i18n is enabled.
  - Numbers and dates go through shared formatters.
- **Accessibility:**
  - A full keyboard path.
  - Icon-only controls carry a `label`.
  - Motion respects `prefers-reduced-motion`.

**Form UX: Google's approach.**
Start with no error states or messages, even when required fields are empty. Show a field's error
after that field loses focus (blur), or show errors for all invalid or incomplete fields on submit.

1. When the form opens, focus its first input as soon as it is ready, so the user can type without a
   click. Skip it when focus would open the on-screen keyboard over the form, or when the form was
   not the reason the screen opened.
2. Keep the submit or action button enabled so users can click it at any time, rather than disabling
   it because required fields are incomplete or invalid.
3. Validate on submit and show clear, helpful inline error messages next to each field that needs attention.
4. Move focus or scroll smoothly to the first field with an error so users know where to start.
5. Mark required fields clearly from the start. Use high-contrast feedback, such as red borders and
   explicit error text, rather than relying on a grayed-out button; never rely on colour alone.

## 5. A component needs a change: ask

When an option needs something no design-system prop or slot gives (a variant, a prop, a slot, a
size, a tone, a state, a behaviour), it is a **design-system change**, not a local customization.

- **Never customize locally:**
  - no scoped CSS or `:deep()` aimed at a design-system component;
  - no extra class to restyle it;
  - no wrapper that repaints it;
  - no copy of the component;
  - no hex or inline style.
- **Write the change as a proposal:**
  - the component;
  - the new prop, variant or slot and its default (existing screens must not change);
  - which other screens would use it.
- **Ask the user to approve it** before the option relies on it. Ask together with the option choice (§7), in the same question.
  - If the user approves, it goes in the handoff under "Design-system changes": documentation, demo, and tests are part of the work.
  - If the user declines, the option is redrawn with what the design system has today.
- **With several options, make at least one use the design system exactly as it is,** so the cost of each change is visible.

## 6. Quality lenses: `anti-ai-design-slop` and `impeccable`

Both run on every design, and the handoff records what each one found. Being short on time is not
a reason to skip either.

- **`anti-ai-design-slop`** lives in this repo, so it always runs.
  - Load it before drawing the options.
  - Run its check on every option before showing it, and again on the finished option.
  - An option with an open P0 is not shown.
  - Its principles (4px grid, proximity, alignment, hierarchy, concentric corners, targets, contrast) bind every option.
- **`impeccable`** (if installed): load it.
  - The visual world is the project's design system: every task is a refinement inside it, never a new world or a redesign of the brand.
  - Use `critique` / `audit` on the options, `harden` for states and edge cases, and `polish` on the chosen option.
  - If `impeccable` is missing from your skill list, say so in the handoff. `anti-ai-design-slop` still runs.
- **The design system wins any conflict.** A suggestion of a new font, palette, gradient, glass effect or shadow is dropped. A suggestion that needs a component to look or behave differently becomes a design-system change request (§5).

## 7. Designs in a tool, before code

**Design is needed** whenever the change adds or rearranges something users see.

It is **not needed** only for these cases; for them, go straight to the handoff with the ledger:
- no visible change;
- a copy-only change;
- a 1:1 swap to a design-system component with the same layout;
- restoring a look that is already documented.

When design is needed:

1. **Ask two things in one message, before drawing.** This applies to every design request: a screen, a flow, a presentation or a piece of content. Mark neither answer as recommended, and never assume one.
   - **How many designs:** one, or several options to compare. When the user wants several, they say how many; don't fill in a number for them.
   - **Which tool:** **OpenPencil**, **HTML**, or **Figma** (offer Figma only if Figma MCP tools are present).

   If the user already answered either one in the request, don't ask it again.
2. **Make the designs the user asked for.**
   - **One design:** draw your best answer to the main design question, and say in one line which alternatives you left out and why.
   - **Several options:** each one gives a different answer to the main design question: placement, hierarchy, interaction model, density or flow length. Colour variations do not count as options.
     - Name each option after its idea ("B · Inline badge + row menu").
     - At least one option needs no design-system change.
     - Time is short? Then keep them low-fidelity, never fewer.
3. **Present the designs in one message.**
   - Each design has passed the slop check, with no open P0.
   - For each: its idea in one line, its trade-off, and the design-system changes it needs (or "none").
   - With several options, recommend one and ask in one question which to take and which of its design-system changes to approve. The user may also combine options.
   - With one design, ask in one question whether to go ahead and which of its design-system changes to approve.
4. **Finish the chosen design:**
   - every state from the brief;
   - dark mode;
   - mobile, if the route allows it.

**OpenPencil** ([openpencil.dev](https://openpencil.dev)):
- Call `list_documents` first. Draw in the document the user names, or create one with `new_document` at `~/Documents/<Feature>.fig`.
- Give the feature its own page (`create_page`, then pass its `page_id` on every call).
- Draw each design-system specimen once, make each a component (`create_component`), and compose options from its instances (`create_instance`).
- One frame per option, side by side and labelled (`arrange`). Width 1280 for desktop, 390 for mobile.
- Check before showing: `export_image` each option and look at it; run `lint` for contrast, target size and off-scale spacing.
- Ask the user to save the document; don't save their file yourself.

**Figma:**
- Use its MCP tools the same way: read the file first, one frame per option, built from the design-system components.

**HTML:**
- One self-contained file holds every option side by side, with a light/dark switch.
- Save it at `.claude/tmp/designs/<feature>.html` (gitignored); never under `src/`.

## 8. Handoff

This is the output, in this shape. The implementer builds from it.

```markdown
## Design handoff: <feature>
Chosen option: <letter · idea>, <OpenPencil file + page | Figma URL | HTML path>
Brief: <role> · <job> · <route> · data: <source; backend gaps>
Reuse ledger:
| Element | DS component / DS change / New | Component and props | Why |
Design-system changes (approved by the user): <component · new prop/variant/slot + default · other screens that gain it · docs + demo + tests> (or "none")
New components: <name> · name source (UIGuideline | mainstream libraries) · DS or domain · obligations
States: empty · loading · error · success · partial · no-permission
Copy: <i18n keys / copy>
Accessibility: <keyboard path, labels, focus order>
Surfaces: desktop · mobile (if allowed) · dark · compact
Quality pass: anti-ai-design-slop <P0 / P1 / P2 and principles for the chosen option; what it changed> · impeccable <critique / audit findings and what changed> (or "impeccable not installed")
Open questions: <for the user or PM>
```

## Red flags

| Thought | Reality |
|---|---|
| "`<button class="btn btn-primary">` is the same as `UiButton`" | It isn't reusable through the design system. Use the component and its `variant`. |
| "A little scoped CSS or `:deep()` makes it fit" | That's a local customization. Propose a design-system change and ask. |
| "I'll wrap it in a domain component that restyles it" | Same thing: a domain component arranges design-system components, it never repaints it. |
| "Menu just needs a selected state; I'll add it" | That's a design-system change. Ask first, then it ships in the component, with its demo. |
| "Every piece exists, so the design is obvious" | Placement, hierarchy and states are the design. Draw it. |
| "Three options is the usual, I'll just make three" | Ask: one design or several. The user sets the number. |
| "OpenPencil is the usual tool, I'll just use it" / "HTML is faster" | Ask: OpenPencil, HTML, or Figma. None is the default or the recommendation. |
| "This needs a `PriorityPill` / `DayGrid`" | Look up the noun: Badge, Tag, Calendar… |
| "The options are rough, the slop check can wait for the final one" | Rough options are where slop starts. Check every option before showing it. |
| "6px / 10px / 14px looks right here" | 4px grid: use a multiple of 4 that matches a token. |
