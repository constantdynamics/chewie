import { useCallback, useEffect, useRef, useState } from 'react'
import { useStarSession, type StarSummary } from '../hooks/useStarSession'
import { useTapGesture } from '../hooks/useTapGesture'
import { Star, StarGrid } from './StarGrid'
import { StarTrack } from './StarTrack'
import { GearIcon, GridIcon, PlayIcon, StopIcon } from './Icons'

const RING_R = 92
const RING_C = 2 * Math.PI * RING_R
const RESULT_MS = 2600

function fmtSec(s: number): string {
  return `${s.toFixed(1).replace('.', ',')} s`
}

function fmtClock(s: number): string {
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${Math.round(s % 60)}s` : `${Math.round(s)}s`
}

/** Dim gauge that fills while you chew and turns to the accent once the bite is long enough. */
function ChewRing({ elapsed, target, leadIn, leadInLeft }: { elapsed: number; target: number; leadIn: boolean; leadInLeft: number }) {
  const ratio = Math.min(1, elapsed / target)
  const reached = elapsed >= target
  return (
    <div className={`chew-ring${reached ? ' reached' : ''}${leadIn ? ' lead-in' : ''}`}>
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
        {leadIn ? (
          <span className="lead-in-count">{Math.ceil(leadInLeft)}</span>
        ) : (
          <Star size={reached ? 46 : 34} filled={reached} />
        )}
      </div>
    </div>
  )
}

/** Ring-less alternative: the same signal, reduced to a single glowing dot. */
function ChewOrb({ elapsed, target, leadIn, leadInLeft }: { elapsed: number; target: number; leadIn: boolean; leadInLeft: number }) {
  const reached = elapsed >= target
  return (
    <div className={`chew-orb${reached ? ' reached' : ''}${leadIn ? ' lead-in' : ''}`}>
      {leadIn ? <span className="lead-in-count">{Math.ceil(leadInLeft)}</span> : <Star size={reached ? 54 : 38} filled={reached} />}
    </div>
  )
}

export function StarMode(props: {
  targetSec: number
  goal: number
  leadInSec: number
  autoPause: boolean
  pauseSec: number
  showRing: boolean
  haptics: boolean
  hideNumbers: boolean
  onMealEnd: (summary: StarSummary) => void
  onOpenLeaderboard: () => void
  onOpenGallery: () => void
  onOpenSettings: () => void
  onSwitchToRhythm: () => void
}) {
  const { targetSec, goal, leadInSec, autoPause, pauseSec, showRing, haptics, hideNumbers, onMealEnd } = props
  const s = useStarSession({ targetSec, leadInSec, autoPause, pauseSec })
  const { phase, stars, last, chewElapsed, inLeadIn, leadInLeft, pauseLeft, bites } = s

  const [hud, setHud] = useState(false)
  const [popped, setPopped] = useState(false)
  const [tooEarly, setTooEarly] = useState(false)
  const resultTimer = useRef<number | undefined>(undefined)

  const buzz = useCallback(
    (pattern: number | number[]) => {
      if (haptics && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
    },
    [haptics],
  )

  // Auto-fade the bright result, then straight into the next pause when it runs itself.
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

  // The deferred tap must act on the live phase, not the one captured on touch.
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const hudRef = useRef(hud)
  hudRef.current = hud
  const { beginBite, endBite, dismissResult, skipPause } = s

  const handleSingleTap = useCallback(
    (atMs: number) => {
      if (hudRef.current) return
      switch (phaseRef.current) {
        case 'waiting':
          buzz(12)
          beginBite(atMs)
          break
        case 'pausing':
          buzz(12)
          skipPause(atMs)
          break
        case 'chewing':
          if (!endBite(atMs)) {
            // Still inside the lead-in — you are taking the bite, not finishing it.
            setTooEarly(true)
            window.setTimeout(() => setTooEarly(false), 700)
          }
          break
        case 'result':
          dismissResult()
          break
      }
    },
    [beginBite, endBite, dismissResult, skipPause, buzz],
  )

  const handleDoubleTap = useCallback(() => setHud((v) => !v), [])
  const { onPointerDown } = useTapGesture(handleSingleTap, handleDoubleTap)

  // A star landing deserves a different buzz than a short bite.
  const lastIndex = useRef(0)
  const [justEarned, setJustEarned] = useState(false)
  useEffect(() => {
    if (!last || last.index === lastIndex.current) return
    lastIndex.current = last.index
    buzz(last.star ? [18, 60, 26] : 14)
    if (last.star) {
      setJustEarned(true)
      window.setTimeout(() => setJustEarned(false), 900)
    }
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
  const Gauge = showRing ? ChewRing : ChewOrb

  return (
    <div
      className={`star-screen phase-${phase}${goalReached ? ' goal-reached' : ''}${tooEarly ? ' too-early' : ''}`}
      onPointerDown={onPointerDown}
    >
      {/* The score, always on screen while a meal runs. */}
      {running && <StarTrack earned={stars} goal={goal} justEarned={justEarned} />}

      {/* ---------- Idle ---------- */}
      {phase === 'idle' && (
        <div className="star-idle" onPointerDown={stopBubble}>
          <div className="star-idle-emblem">
            <Star size={62} filled glow />
          </div>
          <h1>Sterrenmodus</h1>
          <p className="star-idle-lead">
            Tik als je hap erop zit. De eerste <b>{leadInSec} sec</b> tellen niet mee — daarna kauw je naar{' '}
            <b>{targetSec} seconden</b> voor een ster.
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

      {/* ---------- Pause running itself ---------- */}
      {phase === 'pausing' && (
        <div className="star-pausing">
          <div className="pause-count">{Math.ceil(pauseLeft)}</div>
          <p className="waiting-hint">Neem rustig je volgende hap…</p>
          <p className="waiting-sub">Tik om nu al te beginnen</p>
        </div>
      )}

      {/* ---------- Waiting for you to start ---------- */}
      {phase === 'waiting' && (
        <div className="star-waiting">
          <div className="waiting-pulse" />
          <p className="waiting-hint">Tik zodra je een hap neemt</p>
        </div>
      )}

      {/* ---------- Chewing ---------- */}
      {phase === 'chewing' && (
        <div className="star-chewing">
          <Gauge elapsed={chewElapsed} target={targetSec} leadIn={inLeadIn} leadInLeft={leadInLeft} />
          <p className="chewing-hint">
            {inLeadIn
              ? 'Neem je hap…'
              : chewElapsed >= targetSec
              ? 'Lang genoeg — tik als je slikt'
              : 'Rustig kauwen…'}
          </p>
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
          <div className="result-verdict">{last.message}</div>
          {goalReached && last.star && <div className="result-goal">🎉 Je kaart is vol!</div>}
        </div>
      )}

      {/* ---------- HUD ---------- */}
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

      {running && !hud && phase !== 'result' && !hideNumbers && (
        <div className="star-corner">
          <span className="corner-dot" />{' '}
          {fmtClock(bites.reduce((a, b) => a + b.durationSec, 0) + (phase === 'chewing' ? chewElapsed : 0))} gekauwd
        </div>
      )}
    </div>
  )
}
