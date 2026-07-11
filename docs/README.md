# Chewie — Design Documentation

This directory holds the complete architecture and product design for Chewie, a calm
mindful-eating companion. The [root README](../README.md) is the elevator pitch; this
index is the map.

## How the design is organised

The product is built as **three concentric rings**, and the docs follow the same shape:

- **Ring 1 · Calm Core** — a complete, offline, account-free app (docs 01, 03, 05).
- **Ring 2 · Sensing** — an optional, fully on-device sensing & scoring layer (docs 04, 10).
- **Ring 3 · Companion** — the only cloud-touching layer, opt-in and consent-first (doc 06).

Docs 02, 07, 08 and 09 are cross-cutting (architecture, data/privacy, safety, delivery).

## Reading paths

- **New to the project?** → 01 → 02 → 09.
- **Building the MVP?** → 02 → 03 → 05 → 07, then 09 for sequencing.
- **Working on sensing / scoring / intake?** → 04 → 05 → 10, with 08 as the guardrail.
- **Reviewing safety & ethics?** → 08 first, then 05 §1–2, 07 §3, and 10 §0–2.

## The documents

| # | File | Summary |
|---|------|---------|
| 01 | [`01-product-vision.md`](01-product-vision.md) | Problem, personas & jobs-to-be-done, the calm chew/pause core loop, calm-technology principles, explicit non-goals, and the healthy reframing of "battle yourself" (personal baseline, never punishment). |
| 02 | [`02-system-architecture.md`](02-system-architecture.md) | The authoritative architecture: concentric-ring topology with strict dependency ordering, React Native + Expo client, EU-hosted Supabase backend, what-runs-where, on-device-first AI, and CI/deployment. |
| 03 | [`03-chewing-engine-and-art.md`](03-chewing-engine-and-art.md) | The drift-free session state machine (monotonic clock, backgrounding-safe), the full-screen colour/contrast visual system, and the deterministic generative ChewArt engine, gallery and export. |
| 04 | [`04-sensing-and-ai.md`](04-sensing-and-ai.md) | The optional on-device sensing layer: BLE scale as primary sensor with a driver fallback chain, camera food-ID and cues, sensor fusion with four graceful-degradation modes, and honestly-ranged nutrition estimation. |
| 05 | [`05-scoring-model.md`](05-scoring-model.md) | The behaviour-only Mindful-Eating score: banded sub-scores (pace, chew, rhythm, uniformity, consistency), the structural "intake wall" keeping grams out of scoring, live coaching, and self-competition. |
| 06 | [`06-companion-and-pairing.md`](06-companion-and-pairing.md) | Companion mode: WebRTC P2P live view + a data-channel state mirror, Supabase signalling, secure short-lived/QR pairing with MITM protection, and consent-first, ephemeral, revocable sharing. |
| 07 | [`07-data-model-and-privacy.md`](07-data-model-and-privacy.md) | Local-first encrypted data model (TypeScript + Postgres + RLS), consent tiers, optional zero-knowledge sync, GDPR (Article 9 handling, export/delete), and the table-scoped schema guards. |
| 08 | [`08-responsible-design-and-safety.md`](08-responsible-design-and-safety.md) | Eating-disorder-risk analysis and concrete mitigations, onboarding & age gate, honesty-of-estimate rules, accessibility, a lexicon guard, and a product red-team. The checklist other docs must satisfy. |
| 09 | [`09-roadmap-and-mvp.md`](09-roadmap-and-mvp.md) | The phased delivery plan (calm core → scale → camera → companion → cloud), definition of done per phase, build-vs-buy calls, testing spikes, and the riskiest assumptions to validate early. |
| 10 | [`10-nourishment-and-intake-targets.md`](10-nourishment-and-intake-targets.md) | Opt-in, adults-only Nourishment Mode: the anthropometric profile → BMI, WHO healthy range and Mifflin–St Jeor TDEE → a two-sided per-meal target band and Portion Balance score, with all safeguards. |

## Architecture decisions

Load-bearing choices are recorded as ADRs in [`adr/`](adr/README.md).

## Conventions

- Docs reference each other by their **on-disk filename** (e.g. `docs/05-scoring-model.md`);
  a CI link-checker is intended to keep these honest.
- Package names follow `@chewie/*` (e.g. `@chewie/engine`, `@chewie/scoring`,
  `@chewie/fusion`, `@chewie/nourishment`).
- "Ring N may never import Ring N+1" is enforced by module boundaries and lint rules.
