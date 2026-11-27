---
name: anti-ai-design-slop
description: Use when producing or reviewing a UI design (an option in OpenPencil, Figma or HTML, a design handoff, or new Vue markup and layout) to check it does not read as default AI output; product-designer runs it on every option before showing it.
metadata:
  version: "1.0.0"
---

# Anti AI design slop

These are checkable rules that tell a purposefully designed product UI apart from default model
output, adapted to the project's design system and Vue frontend.

- **P0:** fix before the option is shown.
- **P1:** should fix.
- **P2:** nice to fix.
- **Principles** (§4) apply to every option.

The project's design system comes first. When a rule here and a design-system component disagree,
use the component as it is, and report the conflict as a proposed design-system change
(`product-designer` §5).

## 1. P0: the seven cardinal sins

1. **The default AI accent.** Tailwind indigo or violet anywhere: fills, borders, text, shadows or glows.
   - The values: `#6366f1`, `#4f46e5`, `#4338ca`, `#3730a3`, `#8b5cf6`, `#7c3aed`, `#a855f7`, or their `rgba()`.
   - Indigo is the textbook AI tell. Use the project's brand accent token (`--color-brand-*` or `--tone-brand-*`).
2. **A two-stop "trust" gradient** (purple→blue, blue→cyan, indigo→pink) on any surface, header or button. A flat surface with clear type beats it every time.
3. **Emoji as icons** (✨ 🚀 🎯 ⚡ 🔥 💡) in headings, buttons, list items, menus, tiles or empty states.
   - Use the design system's icons (`UiButton` `icon`) or the repo's monoline SVGs.
   - They use `currentColor` and the design system's stroke weight.
4. **A hardcoded font family** (Inter, Roboto, `system-ui`, any web font).
   - The app's font stack is set once in the root stylesheet (`src/style.css` or `src/assets/main.css`).
   - Sizes come from `--font-size-*` tokens.
5. **A card with a coloured left-border accent:** the canonical "AI dashboard tile". A card is `UiCard` as it is.
   - An alert's left rule belongs to `UiAlert`, not to a card. Use the alert as it is, and never copy its border onto a card.
6. **Invented metrics:** "10× faster", "99.9% uptime", "+38% vs. average".
   - Every figure comes from a real source (name it), or it is a labelled placeholder.
   - A caption describes its own number and names its denominator.
7. **Filler copy:** lorem ipsum, "Feature one / two / three", "placeholder text", "sample content", "John Doe", "Acme".
   - An empty area is a composition problem.
   - Solve it with `UiEmptyState` and the real next step, never with invented words.

## 2. P1: soft tells

- **A template skeleton, unchanged.**
  - For product UI that means a hero, then a row of KPI tiles, then a chart, then a table; or a title, a subtitle and a 3-card grid.
  - Start from the user's job instead. What does the person need to see first?
- **External placeholder images** (`unsplash.com`, `placehold.co`, `picsum.photos`, `placekitten.com`). Use `UiSkeleton`, `UiAvatar` (`name`) or real assets.
- **Any raw value outside tokens:**
  - a hex value, `white`, `rgba()`;
  - a px value that is not a token.

  The app tolerates zero raw hex values outside token definitions.
- **The brand accent on more than 2 visible elements per screen.** The primary action and at most one more brand mark.
  - Headings, numbers and links in brand colour all count.
  - Status tones mean status only.
  - Green means "done", never decoration.
- **More than one primary action per view or dialog.** One `UiButton variant="primary"`, and every other button a quieter variant.
- **Everything centred, or everything in a card.** Text and numbers align left; no card inside a card.
- **Generic microcopy:** "Get started", "Submit", "Welcome back!", "Powerful insights", "Unlock…", or mixing languages in the same screen.
  - Use the verb of the job: "Duplicate and edit", "Set priority".
  - Reuse existing i18n wording for things that already have a name.

## 3. P2: polish tells

- **Decorative backgrounds:** blobs, waves, dot grids, glass panels, tinted glows under cards.
- **Perfect symmetry with no tension.** Alternate density (one tight section, one with air) so the important part reads first.
- **Motion that decorates:** bouncing, looping, parallax. Motion only shows a change: a changed value highlights once, and a live state pulses.

## 4. Principles

- **4px grid.** In the default density, every spacing, size and radius is a multiple of 4.
  - Spacing comes from `--space-*`.
  - Sizes come from `--control-height-*` (e.g., 32 / 40 / 48).
  - Radii come from `--border-radius-*` (e.g., 8 to 28).
  - In a mockup, every distance is a multiple of 4 that matches a token. In code, it is the token, never a px value.
  - Compact density rescales the tokens itself. Design in the default density and let compact follow.
- **Proximity.** The space inside a group is at least one step smaller than the space between groups (e.g. 8 inside, 16–24 between). Group with space first, then with borders, then with cards.
- **Alignment.**
  - One left edge per column.
  - Text aligns left.
  - Numbers align right in tables, with tabular figures, and are formatted with the app's number formatter.
- **Hierarchy.**
  - One thing reads first in each view.
  - At most 3 font sizes and 2 weights per view, all from the tokens.
  - Build hierarchy with size, weight and space before colour.
- **Concentric corners.** A rounded element inside another takes inner radius = outer radius − padding (the nearest token), or no radius at all. Equal radii nested inside padding look wrong.
- **Targets.**
  - Every interactive target is at least 24×24 px (WCAG 2.5.8).
  - On touch (mobile-allowed routes), use the md control height, 40px.
- **Contrast.**
  - Text meets AA: 4.5:1, or 3:1 for large text.
  - Controls and their states are 3:1 against their surroundings (WCAG 1.4.11).
  - Design-system tokens are measured; any new token must be too, in light AND dark.

## 5. Soul: about 80% proven patterns, 20% product

In a mature design system, the distinctive 20% is never a new colour or font. It lives in:

- **Voice and microcopy:** consistent with the product's domain vocabulary and active locale.
- **One remembered micro-interaction from the system:** e.g., a value that just changed highlights once.
- **A detail only someone who used the app would add:** a ⌘K shortcut hint, a domain-specific status badge, or contextual empty-state guidance.

The test: someone outside the project sees a screenshot and can tell it belongs to this product. If not, it is a template.

## 6. Output

Run it once per option, in this shape:

```markdown
Slop check: <option>
P0: none | <rule · where · fix>
P1: none | <rule · where · fix>
P2: none | <rule · where · fix>
Principles: 4px grid <ok | where it breaks> · proximity <…> · alignment <…> · hierarchy <…> · corners <…> · targets <…> · contrast <…>
Design system conflicts: none | <rule · component · proposed design-system change>
```

An option with an open P0 is not shown to the user: fix it, then run the check again.

---

Adapted from OpenDesign's
[`craft/anti-ai-slop.md`](https://github.com/nexu-io/open-design/blob/main/craft/anti-ai-slop.md)
(commit `f1a0b60`, [Apache License 2.0](https://github.com/nexu-io/open-design/blob/main/LICENSE)), which is
itself adapted from [refero_skill](https://github.com/referodesign/refero_skill) (MIT).
