# Design brief — Chewie

**For a designer (human or Claude) who is going to make every screen of Chewie
more beautiful, without breaking what makes it work.**

Live app: <https://constantdynamics.github.io/chewie/> · Code: `src/` · Stack: React + Vite +
TypeScript, hand-written CSS in a single file (`src/index.css`). No Tailwind, no UI library,
no external fonts or images — the app must work offline.

---

## 1. What Chewie is

A calm mobile app that helps you eat slower and chew more. It is used **at the table, during
a meal**, often with other people around. That single fact drives every design decision: the
app must be glanceable, quiet, and never demand attention it hasn't earned.

Two ways to eat:

- **Ritme (rhythm)** — hands-off. The whole screen breathes between a *chew* colour and a
  *pause* colour on a timer. You just eat.
- **Sterren (stars)** — hands-on. You tap when a bite is done. The screen is **dark while you
  chew** and **lights up** with the result. Reach the chew target and the bite earns a star;
  25 stars fill a meal. There is a local leaderboard of your own meals.

Plus: generative mosaic art per meal (**ChewArt**), a gallery, and an optional adults-only
**Nourishment Mode** that scores portion size against a healthy two-sided range.

**The feeling we want:** unhurried, warm, a little bit magic. Closer to a well-made watch face
than to a fitness tracker. It should feel good to look at for two seconds and then look away.

---

## 2. Non-negotiables

These are product constraints, not style preferences. Please design **within** them.

1. **Dark between bites.** In star mode the chewing and pause screens stay near-black with
   minimal content. The lit-up result is the only bright moment. Do not add persistent bright
   surfaces to those screens.
2. **Glanceable, not readable.** During a meal the user looks for ~1 second. One idea per
   screen. If something needs reading, it belongs in a sheet, not on the meal screen.
3. **No shaming, ever.** No red "fail" states, no crosses, no downward arrows, no punishing
   streak visuals. A missed star is neutral-to-warm, never negative. (See
   [`08-responsible-design-and-safety.md`](08-responsible-design-and-safety.md).)
4. **Never reward eating less.** Nothing in the visual language may imply "less food = better".
5. **Thumb-first.** One-handed use, phone held low near a plate. Primary actions live in the
   bottom third; the top is for passive information.
6. **Everything themes.** Colour comes from tokens (§4). A design that hardcodes a colour will
   break the eight palettes and the neon style.
7. **Offline and light.** No web fonts, no CDN, no bitmap assets. System font stack, SVG and
   CSS only. Total JS+CSS is currently ~60 KB gzipped — keep it lean.
8. **Accessible.** Contrast is computed per theme (WCAG relative luminance). Respect
   `prefers-reduced-motion` (already wired). Minimum touch target 44 px.

---

## 3. Screen inventory

Every screen, what it is for, and where we think it falls short. **Improving these is the job.**

### 3.1 Rhythm meal screen — `src/components/MealScreen.tsx`
Full-bleed phase colour, centred icon, phase label, countdown bar, bite counter, optional edge
pulse, ChewArt preview top-right, tips during pauses.
*Weak spots:* the layout is a plain vertical stack and feels generic; the countdown bar is a
flat rounded rectangle; the ChewArt preview floats without relationship to anything; the
transition between phases is a plain colour cross-fade.

### 3.2 Bottom controls — `src/components/Controls.tsx`
A pill primary button plus a row of five round icon buttons.
*Weak spots:* five equal circles read as a toolbar dump; no hierarchy between "start" and the
rest; the mode-swap link above it is an afterthought.

### 3.3 Star: idle — `.star-idle` in `src/components/StarMode.tsx`
Emblem, title, one explanatory paragraph, goal pill, big start button, three text links,
mode-swap link.
*Weak spots:* six stacked elements competing; the explanation is long; the text links are weak.

### 3.4 Star: pause running — `.star-pausing`
A large dim countdown number, "Neem rustig je volgende hap…", "Tik om nu al te beginnen".
*Weak spots:* brand-new screen, barely designed. The countdown is just a big number. This is
where the eater looks between every single bite — it deserves the most care.

### 3.5 Star: chewing — `.star-chewing`
A dim ring that fills and turns to the accent colour once the bite is long enough (or, with the
ring switched off, a single orb). During the first seconds a lead-in counter shows instead.
*Weak spots:* the lead-in state and the chewing state look unrelated; the "you may swallow"
moment could be far more satisfying; the ring-less variant is plain.

### 3.6 Star: result — `.star-result`
The screen lights up: burst, big star, big duration, one line of feedback, then fades back.
*Weak spots:* this is the emotional payoff and the best screen we have — but the typography is
ordinary and the star/burst is a single flat shape. Star vs no-star differ only in colour.

### 3.7 Star track — `src/components/StarTrack.tsx`
Outlined stars across the top, ten per row, filling left to right as they are earned.
*Weak spots:* new; currently a plain wrap of identical glyphs. How does row 3 of 3 feel
different from row 1? How does the 25th star land?

### 3.8 HUD (double-tap) — `.star-hud`
Score, 5×5 star grid, three stat tiles, finish button, three actions, hint line.
*Weak spots:* reads like a settings panel; the stat tiles are generic cards.

### 3.9 Sheets — `src/components/Sheet.tsx` + `*Sheet.tsx`
Bottom sheets on a dark surface: **Instellingen**, **Galerij**, **Ranglijst**,
**Ideale hoeveelheid**, **Maaltijd afgerond**.
*Weak spots:* settings is a long undifferentiated list of rows; the leaderboard rows are dense;
the meal-done sheet stacks four unrelated blocks; the gallery grid has no rhythm.

### 3.10 Theme & style pickers — `src/components/ThemePicker.tsx`
Twelve palette cards (four across) and a two-option style switch.
*Weak spots:* the three-band swatch doesn't convey what a theme feels like in use.

---

## 4. The token contract

**Colour must come from these.** They are set at runtime from the active theme
(`src/lib/themes.ts` → `src/lib/color.ts` → `document.documentElement`).

| Token | Meaning |
|---|---|
| `--gold` | the accent (star colour) of the active theme — *not necessarily gold* |
| `--gold-deep` | a deeper shade of the accent, for gradients |
| `--gold-a05 … --gold-a60` | the accent at 5–60 % alpha (tints, glows, borders, fills) |
| `--gold-deep-a05/-a14/-a32` | deep accent at 5/14/32 % alpha |
| `--sheet-bg`, `--sheet-bg-2` | sheet surfaces |
| `--sheet-fg`, `--sheet-muted` | sheet text, secondary text |
| `--sheet-line` | hairlines and borders |
| `--night` | the near-black of star mode |

Phase colours (chew/pause) are applied inline per element because they change during a meal;
read them from the theme, never hardcode.

**If you need a new tint, add an alpha step to `ACCENT_ALPHAS` in `src/lib/color.ts` and a
matching `:root` fallback in `src/index.css` — never write `rgba(251,191,36,…)`.** A padded
name is required (`--gold-a08`, not `--gold-a8`).

Two visual treatments exist, switched by a class on the app root:

- `.style-calm` — soft, full-colour screens
- `.style-neon` — near-black screens where the colour becomes the light (glows, bloom)

Anything you design should hold up in both, and across all twelve palettes — including
**Avond** (dark slate) and the four neon ones.

---

## 5. Current type, spacing and motion

Not sacred. Improve them — this is a description, not a spec.

- **Type:** system stack. Display sizes 5rem (pause count), 3.4rem (score), 3.2rem (result
  time), 2rem (phase label); body ~0.95rem; captions 0.72–0.85rem. Weights 200–800. Numerals
  use `tabular-nums`.
- **Spacing:** 6/8/10/14/18/22 px rhythm, sheets padded 18 px, safe-area insets respected.
- **Radii:** 10–16 px for cards and fields, 999 px for pills and buttons, 20 px for sheet tops.
- **Motion:** 160–300 ms for state, 500–700 ms for phase colour, `cubic-bezier(.2,.8,.2,1)`
  for entrances, a spring-ish `cubic-bezier(.18,1.5,.4,1)` for the star pop. Everything is
  disabled under `prefers-reduced-motion`.
- **Icons:** hand-rolled SVG in `src/components/Icons.tsx`, 2 px stroke, round caps.

---

## 6. What we'd love from you

In rough priority order:

1. **A real visual identity.** Right now Chewie looks like tasteful defaults. Give it a point
   of view — through type, spacing, shape language, and how light behaves — that survives
   twelve palettes and two styles.
2. **Redesign the pause screen (§3.4).** Most-seen screen, least designed. It should make
   waiting feel pleasant rather than idle.
3. **Make the chew→"you may swallow" moment sing (§3.5).** The instant the target is reached is
   the core feedback of the whole product.
4. **Give the star track a sense of progress (§3.7).** Twenty-five identical outlines is a
   checklist; make it feel like a collection filling up.
5. **Bring order to the sheets (§3.9),** especially settings — group, breathe, add hierarchy.
6. **A proper app icon and splash.** Currently a generated chevron-ish mark; it deserves better.

**Deliverables that are easy for us to use:** annotated screen mockups at 390 × 844, a token
sheet mapped onto §4, motion notes in words, and — best of all — CSS we can drop into
`src/index.css` against the existing class names listed in §3.

**Please don't:** introduce a component library or web fonts, hardcode colours, add bright
chrome to the chewing/pause screens, or invent negative/failure states.

---

## 7. Handy context

- Baseline canvas **390 × 844** (Android reference), must survive 320 → 480 px wide and
  landscape without breaking.
- The app is installed to the home screen and runs full-bleed; design to the safe areas.
- Dutch UI copy. Words run ~20 % longer than English — leave room.
- Deeper background on why the product behaves as it does:
  [`01-product-vision.md`](01-product-vision.md),
  [`03-chewing-engine-and-art.md`](03-chewing-engine-and-art.md),
  [`08-responsible-design-and-safety.md`](08-responsible-design-and-safety.md).
