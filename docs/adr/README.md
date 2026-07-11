# Architecture Decision Records

Load-bearing decisions for Chewie, each with the context that forced it, the decision,
the main alternative rejected, and the consequences. Design documents reference these by
number (e.g. `ADR-0005`, `ADR-0008`, `ADR-0010`).

| ADR | Decision | Status |
|-----|----------|--------|
| [0001](#adr-0001) | React Native + Expo as the single client | Accepted |
| [0002](#adr-0002) | Concentric rings with strict dependency ordering | Accepted |
| [0003](#adr-0003) | Supabase as the single managed EU backend | Accepted |
| [0004](#adr-0004) | On-device-first AI; cloud AI is one opt-in blurred still frame | Accepted |
| [0005](#adr-0005) | BLE kitchen scale is the primary sensor; camera is secondary | Accepted |
| [0006](#adr-0006) | Scale-driver fallback chain (standard GATT → vendor → OCR → manual) | Accepted |
| [0007](#adr-0007) | Companion is WebRTC P2P (no SFU); state and video planes are separate | Accepted |
| [0008](#adr-0008) | The behaviour scoring function structurally cannot receive intake | Accepted |
| [0009](#adr-0009) | Local-first encrypted SQLite; ChewArt stored as seed+params | Accepted |
| [0010](#adr-0010) | Drift-free monotonic-clock session engine | Accepted |
| [0011](#adr-0011) | Guarded, two-sided Nourishment plane (supersedes the intake prohibition) | Accepted |

_Date: 2026-07-11. All ADRs are "Accepted" as the design baseline; implementation may surface amendments._

---

## ADR-0001
**React Native + Expo (dev-client/CNG) + TypeScript as the single client.**

- **Context:** One small team needs reliable camera, BLE, WebRTC, background timing, and
  app-store presence, plus a shared language with the backend.
- **Decision:** React Native + Expo with Reanimated (60fps phase transitions) and Skia
  (deterministic generative art).
- **Rejected:** Flutter (best determinism, but splits off TypeScript, loses the shared-language
  backend, weaker/less-proven WebRTC+BLE); Capacitor/React-webview (weaker native sensor access).
- **Consequences:** One TypeScript codebase across client, engine, and backend functions; Skia
  gives pixel-reproducible ChewArt without leaving TS.

## ADR-0002
**Concentric rings (Calm Core → Sensing → Companion) with strict dependency ordering.**

- **Context:** The ambitious features must never be able to break the simple, lovable one.
- **Decision:** Three rings gated by feature flags and module-boundary lint; Ring N may never
  import Ring N+1. Ring 1 is a complete, shippable, offline product on its own.
- **Rejected:** A single feature-flagged monolith (risks a failed cloud call breaking the core);
  a cloud-first thin client (violates local-first).
- **Consequences:** Removing the entire cloud plane still leaves a complete app; each ring is
  independently testable and shippable.

## ADR-0003
**Supabase as the single managed EU backend.**

- **Context:** Companion pairing and optional sync need auth, realtime, and a database, without
  a second language or heavy ops for a small team.
- **Decision:** Supabase (Postgres + Row-Level Security, Auth, Realtime Broadcast + Presence,
  Edge Functions, Storage), EU region.
- **Rejected:** Phoenix/Elixir (excellent presence semantics, but a second language + ops burden);
  bespoke services.
- **Consequences:** The calm core touches none of it; the backend is only ever reachable from Ring 3.

## ADR-0004
**On-device-first AI; cloud AI is a single explicit, blurred, still-frame, zero-retention call.**

- **Context:** Camera imagery of food and faces is sensitive; continuous cloud vision is a privacy,
  cost, and surveillance problem.
- **Decision:** All routine inference runs on-device. A cloud "second opinion" is one explicit,
  face/PII-blurred still frame to the Claude API, on demand, with zero retention — never continuous,
  never automatic.
- **Rejected:** Cloud-first/streaming vision (higher accuracy, but rejected on privacy/cost/offline);
  no AI at all (loses food-ID value).
- **Consequences:** Works offline; cloud vision is a deliberate, visible user action.

## ADR-0005
**Treat the BLE kitchen scale as the primary quantitative sensor; the camera is secondary.**

- **Context:** Estimating grams and pace from a camera alone is inherently rough and would violate
  the honesty mandate.
- **Decision:** The scale's weight-vs-time curve is ground truth for per-bite mass and pace; the
  camera adds food-ID and cues. A Fusion Engine supports four first-class modes:
  `NONE / SCALE_ONLY / CAMERA_ONLY / BOTH`.
- **Rejected:** Camera-only estimation as the backbone (kept only as the `CAMERA_ONLY` fallback,
  always shown with ranges).
- **Consequences:** Accuracy comes from hardware truth, not guesswork; every mode degrades gracefully.

## ADR-0006
**Scale-driver abstraction with a fallback chain.**

- **Context:** Consumer BLE scales are fragmented across vendors and protocols.
- **Decision:** Try the standardised GATT Weight Scale Service (0x181D) first, per-vendor proprietary
  drivers second, camera-OCR of the LCD as a universal fallback, and manual entry always available.
- **Rejected:** Assuming standardised GATT only (supports few real scales); integrating one vendor SDK
  (locks the product to one hardware maker).
- **Consequences:** Broad hardware coverage without hardware lock-in; OCR fallback reuses the camera.

## ADR-0007
**Companion is WebRTC P2P (video + data channel) with Supabase signalling; no media server.**

- **Context:** The companion view must be ephemeral, private, and never recorded.
- **Decision:** Peer-to-peer WebRTC (DTLS-SRTP) for the live view plus a DataChannel carrying
  structured Chewie state; Supabase Broadcast for signalling; managed TURN for NAT traversal. The
  **state plane and video plane are kept separate** so a state-only companion works when video fails.
- **Rejected:** A managed SFU (LiveKit/Daily/Agora) — routes media through a vendor, adds cost, and
  contradicts ephemeral-by-design; kept only as a future group-watch path.
- **Consequences:** No server ever sees the media; the mirror survives poor networks by dropping to
  state-only.

## ADR-0008
**Structurally isolate the behaviour score so it cannot receive intake.**

- **Context:** The primary score must be impossible to game toward eating less — a hard ethical
  requirement, not a policy note.
- **Decision:** The Session Engine, the Behaviour Score, and the Nutrition insight are separate pure
  packages. `@chewie/scoring`'s function signature cannot even accept grams or calories; a type "intake
  wall" and property-based tests enforce it.
- **Rejected:** Logic embedded in components/hooks (untestable, would leak intake into scoring); a
  single blended score mixing behaviour and amount.
- **Consequences:** "Ate less" is architecturally incapable of raising the score. Amount is scored only
  in the separate, opt-in Nourishment plane (ADR-0011), never in the always-on behaviour score.

## ADR-0009
**Local-first encrypted SQLite with a repository seam for optional E2E sync; ChewArt as seed+params.**

- **Context:** No account is required for the core, and eating/health data is sensitive.
- **Decision:** op-sqlite + SQLCipher + Drizzle for encrypted-at-rest local storage; a repository seam
  allows optional zero-knowledge, client-side-E2E-encrypted cloud sync later. ChewArt is stored as its
  seed + parameters, never as rendered images.
- **Rejected:** A cloud database of record (breaks offline/no-account/privacy); storing rendered tile
  PNGs (heavier, leakier).
- **Consequences:** The device is the system of record; sync is additive and opt-in; art stays tiny and
  reproducible.

## ADR-0010
**Drift-free timing via a monotonic-clock phase engine.**

- **Context:** A meal lasts 20–40 minutes with the screen dimming; naive timers drift and freeze when
  backgrounded.
- **Decision:** Compute elapsed time from a monotonic clock (`ChewieClock`), not by accumulating
  `setInterval` ticks; add keep-awake, haptics, and local notifications as background cues, and a
  sleep-inclusive recovery path.
- **Rejected:** `setInterval` tick accumulation (drifts/freezes); true background execution (heavily
  restricted on iOS and unnecessary for a foreground timer).
- **Consequences:** The rhythm stays accurate across screen-dim and interruptions.

## ADR-0011
**A guarded, two-sided Nourishment plane — superseding the earlier absolute intake prohibition.**

- **Context:** An early hardening of the ethics mandate structurally *banned* all weight/BMI/quantity
  features. The product owner then clarified the actual goal: not "eat less", but hitting the **ideal
  amount** — a healthy, two-sided range — and being coached to stay inside it, including entering
  height/weight to compute BMI and a healthy target. A blanket ban does not serve that legitimate,
  health-positive goal.
- **Decision:** Add an **opt-in, adults-only, off-by-default** `@chewie/nourishment` plane, kept
  entirely separate from the intake-free behaviour score (ADR-0008 is untouched). It derives BMI, the
  WHO healthy-weight range, and Mifflin–St Jeor TDEE from an opt-in, encrypted, Article-9 anthropometric
  profile, then a per-meal **two-sided target band** and a Portion Balance score that peaks at the centre
  and drops on **both** sides — so under-eating lowers it exactly like over-eating and "minimise" is
  impossible. Targets clamp to the healthy range; underweight inputs/goals route to a care pathway, not
  optimisation. Live coaching is qualitative (no live number readout); estimates are always ranged; it is
  explicitly not medical advice; and it is gated behind an eating-disorder-clinician design review
  (roadmap Phase 5). See [`docs/10-nourishment-and-intake-targets.md`](../10-nourishment-and-intake-targets.md).
- **Rejected:** The earlier absolute prohibition (fails the owner's real, healthy goal); a naive
  one-sided "less is better" intake score (unsafe); folding intake into the behaviour score (would break
  ADR-0008).
- **Consequences:** The feature the owner asked for is fully buildable, while every safeguard is preserved
  as a guardrail on an opt-in feature rather than a ban. The calm core stays numberless and intake-free.
