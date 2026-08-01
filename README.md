# Chewie 🥢

**A calm app that helps you eat slower, chew more, and stay in your ideal amount.**

The whole screen breathes between a **chew** colour and a **pause** colour so you learn a
slower rhythm without staring at numbers. Every finished meal becomes a unique piece of
generative mosaic art (**ChewArt**). An optional, adults-only **Nourishment Mode** helps you
land inside your *ideal amount* — a healthy **two-sided** range where eating too little counts
against you just like eating too much — using your normal kitchen scale and a photo (no
Bluetooth, no account).

Built as an installable **PWA** (React + Vite + TypeScript), and packaged for **Android /
Google Play** with Capacitor.

## Try it

- **Install on Android:** open the live URL in Chrome → menu → **Install app**. It lands on
  your home screen, works offline, no account.
  Live: `https://constantdynamics.github.io/chewie/`
- **Google Play internal testing:** see **[ANDROID.md](ANDROID.md)**.

## What's in it

- Full-screen chew/pause loop with a drift-free timer, contrast-aware icon/text, countdown and
  bite counter.
- Settings: chew/pause times, colours, gentle edge pulse, haptics, tips, and a “hide numbers”
  calm mode.
- Quick Mode for snacks; gentle tips during pauses.
- **Star mode** — you time every bite yourself. Tap when you take a bite, tap when you
  swallow; reach your chew target and the bite earns a star. The screen stays dark while you
  chew (a dim ring quietly fills and turns gold once you're past the target) and **lights up**
  with the duration and verdict the moment a bite ends. Fill 25 stars to complete a meal, and
  **double-tap any time** to see the full card: star grid, average and longest bite, hit rate.
- **Leaderboard** — your own meals ranked by stars and average bite length, with medals and
  personal records. Local to the device; you play against yourself.
- **ChewArt** — a unique generative tile per meal, a growing gallery, and simple stats.
- **Nourishment Mode** (opt-in): enter height/weight/age/sex/activity → BMI, WHO healthy-weight
  range and Mifflin–St Jeor energy needs → a per-meal **two-sided** target band. After a meal you
  can snap a photo of your plate on the scale, enter the weight and food type, and see your
  **Portion Balance** score (100 in the middle; lower both below *and* above your range).

Everything is stored **locally on the device**. No account, no tracking.

### Coming next (needs device hardware / a small backend)
- AI that reads the weight + food straight from the photo (a small serverless vision proxy).
- Camera hand-to-mouth / chew sensing and a companion “watch-along” phone.

## Develop

```bash
npm install
npm run dev          # local dev server
npm run build        # production PWA build (GitHub Pages target) -> dist/
npm run build:app    # web build bundled for the Capacitor Android app
```

## Design docs

The full architecture and product design (10 documents + ADRs) lives in **[docs/](docs/)** —
product vision, system architecture, the chewing engine & ChewArt, sensing & AI, the scoring
model, companion mode, data & privacy, responsible design & safety, roadmap, and the
Nourishment Mode spec.

## Responsibility

Chewie touches eating and (optionally) intake and weight. The calm core is numberless, the
behaviour never rewards eating *less*, intake features are opt-in and two-sided, targets clamp
to a healthy range, and underweight inputs route to a gentle care message. Chewie is a
wellbeing companion, **not a medical device** — estimates are always rough ranges. See
[docs/08-responsible-design-and-safety.md](docs/08-responsible-design-and-safety.md).
