import { useCallback, useEffect, useRef, useState } from 'react'
import { useStarSession, type StarSummary } from '../hooks/useStarSession'
import { useTapGesture } from '../hooks/useTapGesture'
import { Star, StarGrid } from './StarGrid'
import { GearIcon, GridIcon, PlayIcon, StopIcon } from './Icons'

const RING_R = 92
const RING_C = 2 * Math.PI * RING_R
const RESULT_MS = 2600

function fmtSec(s: number): string {
  return `${s.toFixed(1).replace('.', ',')}\u00A0s`
}

function fmtClock(s: number): string {
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${Math.round(s % 60)}s` : `${Math.round(s)}s`
}

/** Dim ring that quietly fills while you chew, and turns gold once the bite is long enough. */
function ChewRing({ elapsed, target }: { elapsed: number; target: number }) {
  const ratio = Math.min(1, elapsed / target)
  const reached = elapsed >= target
  return (
    <div className={`chew-ring${reached ? ' reached' : ''}`}>
      <svg viewBox="0 0 220 220" aria-hidden>
        <circle className="ring-track" cx="110" cy="110" r={RING_R} />
        <circle
          className="ring-arc"
          cx="110"
          cy="110"
          r={RING_R}
          strokeDasharray={RING_C}
          strokeDashoffset={RING_C * (1 - ratio)}
        />
      </svg>
      <div className="ring-core">
        <Star size={reached ? 46 : 34} filled={reached} />
      </div>
    </div>
  )
}

export function StarMode(props: {
  targetSec: number
  goal: number
  haptics: boolean
  hideNumbers: boolean
  onMealEnd: (summary: StarSummary) => void
  onOpenLeaderboard: () => void
  onOpenGallery: () => void
  onOpenSettings: () => void
  onSwitchToRhythm: () => void
}) {
  const { targetSec, goal, haptics, hideNumbers, onMealEnd } = props
  const s = useStarSession(targetSec)
  const { phase, stars, last, elapsed, bites } = s

  const [hud, setHud] = useState(false)
  const [popped, setPopped] = useState(false)
  const resultTimer = useRef<number | undefined>(undefined)

  const buzz = useCallback(
    (pattern: number | number[]) => {
      if (haptics && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
    },
    [haptics],
  )

  // Auto-fade the bright result back to the dark screen.
  useEffect(() => {
    if (phase !== 'result') return
    setPopped(true)
    resultTimer.current = window.setTimeout(() => s.dismissResult(), RESULT_MS)
    return () => {
      if (resultTimer.current) clearTimeout(resultTimer.current)
      setPopped(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, last?.index])

  // A tap is only acted on after the double-tap window, by which time the phase may
  // have moved on (a result fades out on its own). Read the live phase, not the one
  // captured when the finger landed, or that tap would be spent on the wrong action.
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const hudRef = useRef(hud)
  hudRef.current = hud
  const { beginBite, endBite, dismissResult } = s

  const handleSingleTap = useCallback(
    (atMs: number) => {
      if (hudRef.current) return
      const now = phaseRef.current
      if (now === 'waiting') {
        buzz(12)
        beginBite(atMs)
      } else if (now === 'chewing') {
        endBite(atMs)
      } else if (now === 'result') {
        dismissResult()
      }
    },
    [beginBite, endBite, dismissResult, buzz],
  )

  const handleDoubleTap = useCallback(() => setHud((v) => !v), [])
  const { onPointerDown } = useTapGesture(handleSingleTap, handleDoubleTap)

  // A star landing deserves a different buzz than a short bite.
  const lastIndex = useRef(0)
  useEffect(() => {
    if (!last || last.index === lastIndex.current) return
    lastIndex.current = last.index
    buzz(last.star ? [18, 60, 26] : 14)
  }, [last, buzz])

  const running = phase !== 'idle'
  const goalReached = stars >= goal
  const avg = bites.length ? bites.reduce((a, b) => a + b.durationSec, 0) / bites.length : 0
  const best = bites.length ? Math.max(...bites.map((b) => b.durationSec)) : 0

  const stopMeal = () => {
    const summary = s.endMeal()
    setHud(false)
    if (summary.bites > 0) onMealEnd(summary)
  }

  const stopBubble = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation()

  return (
    <div className={`star-screen phase-${phase}${goalReached ? ' goal-reached' : ''}`} onPointerDown={onPointerDown}>
      {/* ---------- Idle: pick your meal ---------- */}
      {phase === 'idle' && (
        <div className="star-idle" onPointerDown={stopBubble}>
          <div className="star-idle-emblem">
            <Star size={62} filled glow />
          </div>
          <h1>Sterrenmodus</h1>
          <p className="star-idle-lead">
            Jij bepaalt elke hap. Tik als je hapt, tik als je slikt — haal je <b>{targetSec} seconden</b>, dan verdien
            je een ster.
          </p>
          <div className="goal-pill">
            <Star size={18} filled /> {goal} sterren per maaltijd
          </div>

          <button className="star-start" onClick={s.startMeal}>
            <PlayIcon size={20} color="#0b0f14" />
            <span>Start maaltijd</span>
          </button>

          <div className="star-idle-links">
            <button onClick={props.onOpenLeaderboard}>Ranglijst</button>
            <span>·</span>
            <button onClick={props.onOpenGallery}>Galerij</button>
            <span>·</span>
            <button onClick={props.onOpenSettings}>Instellingen</button>
          </div>

          <button className="mode-swap" onClick={props.onSwitchToRhythm}>
            Liever het rustige ritme? →
          </button>
        </div>
      )}

      {/* ---------- Waiting: dark, almost nothing ---------- */}
      {phase === 'waiting' && (
        <div className="star-waiting">
          <div className="waiting-pulse" />
          <p className="waiting-hint">Tik zodra je een hap neemt</p>
          {!hideNumbers && (
            <div className="waiting-count">
              <Star size={15} filled /> {stars} / {goal}
            </div>
          )}
        </div>
      )}

      {/* ---------- Chewing: dim ring only ---------- */}
      {phase === 'chewing' && (
        <div className="star-chewing">
          <ChewRing elapsed={elapsed} target={targetSec} />
          <p className="chewing-hint">{elapsed >= targetSec ? 'Lang genoeg — tik als je slikt' : 'Rustig kauwen…'}</p>
        </div>
      )}

      {/* ---------- Result: the screen lights up ---------- */}
      {phase === 'result' && last && (
        <div className={`star-result${last.star ? ' win' : ' short'}${popped ? ' in' : ''}`}>
          <div className="result-burst" />
          <div className="result-star">
            <Star size={104} filled={last.star} glow={last.star} />
          </div>
          <div className="result-time">{fmtSec(last.durationSec)}</div>
          <div className="result-verdict">
            {last.star ? 'Mooi gekauwd — ster verdiend!' : `Net te kort · doel ${targetSec} s`}
          </div>
          <div className="result-tally">
            <Star size={20} filled /> {stars} / {goal}
          </div>
          {goalReached && last.star && <div className="result-goal">🎉 Je kaart is vol!</div>}
        </div>
      )}

      {/* ---------- HUD: double-tap to see everything ---------- */}
      {hud && (
        // Tap the dimmed area around the panel to close. The tap must not reach the
        // screen behind it, or closing the HUD would also start a bite.
        <div
          className="star-hud"
          onPointerDown={(e) => {
            e.stopPropagation()
            setHud(false)
          }}
        >
          <div className="hud-inner" onPointerDown={stopBubble}>
            <div className="hud-top">
              <div>
                <div className="hud-stars">
                  {stars}
                  <small>/ {goal} sterren</small>
                </div>
                <div className="hud-sub">
                  {bites.length} {bites.length === 1 ? 'hap' : 'happen'} · doel {targetSec} s per hap
                </div>
              </div>
              <button className="hud-close" onClick={() => setHud(false)} aria-label="Sluiten">
                ✕
              </button>
            </div>

            <StarGrid earned={stars} goal={goal} />

            <div className="hud-stats">
              <div>
                <b>{bites.length ? fmtSec(avg) : '—'}</b>
                <small>gemiddeld</small>
              </div>
              <div>
                <b>{bites.length ? fmtSec(best) : '—'}</b>
                <small>langste hap</small>
              </div>
              <div>
                <b>{bites.length ? `${Math.round((stars / bites.length) * 100)}%` : '—'}</b>
                <small>raak</small>
              </div>
            </div>

            {running && (
              <button className="hud-stop" onClick={stopMeal}>
                <StopIcon size={18} color="#0b0f14" />
                <span>Maaltijd afronden</span>
              </button>
            )}

            <div className="hud-actions">
              <button onClick={props.onOpenLeaderboard}>
                <Star size={18} filled /> Ranglijst
              </button>
              <button onClick={props.onOpenGallery}>
                <GridIcon size={18} /> Galerij
              </button>
              <button onClick={props.onOpenSettings}>
                <GearIcon size={18} /> Instellingen
              </button>
            </div>

            <p className="hud-tip">Dubbeltik op het donkere scherm om dit te openen · tik ernaast om te sluiten.</p>
          </div>
        </div>
      )}

      {/* Persistent, very dim meal indicator so you know a meal is running. */}
      {running && !hud && phase !== 'result' && !hideNumbers && (
        <div className="star-corner">
          <span className="corner-dot" />{' '}
          {fmtClock(bites.reduce((a, b) => a + b.durationSec, 0) + (phase === 'chewing' ? elapsed : 0))} gekauwd
        </div>
      )}
    </div>
  )
}
