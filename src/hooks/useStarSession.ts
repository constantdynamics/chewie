import { useCallback, useEffect, useRef, useState } from 'react'
import { classifyBite, createFeedbackPicker, type FeedbackKind } from '../lib/feedback'

export type StarPhase = 'idle' | 'waiting' | 'pausing' | 'chewing' | 'result'

export interface BiteResult {
  index: number
  /** Chew time that counts — the lead-in has already been subtracted. */
  durationSec: number
  /** Everything between the two taps, lead-in included. */
  rawSec: number
  star: boolean
  kind: FeedbackKind
  message: string
}

export interface StarSummary {
  bites: number
  stars: number
  durationSec: number
  avgBiteSec: number
  bestBiteSec: number
}

export interface StarSessionOptions {
  targetSec: number
  /** Seconds after the tap that don't count — you're still getting the food in. */
  leadInSec: number
  /** Run the pause on a timer and start the next bite automatically. */
  autoPause: boolean
  pauseSec: number
}

/** Counted chew time below this is a stray tap rather than a bite. */
const MIN_CHEW_SEC = 0.4

/**
 * Manual bite scoring: you mark the end of every bite yourself.
 *
 * Each bite opens with a lead-in (default 2s) that is not scored, because you are
 * still putting the food in your mouth. Only the chew time after it counts, and a
 * bite reaching `targetSec` of counted chewing earns a star. With `autoPause` the
 * pause runs on a timer and the next bite starts on its own, so a meal needs one
 * tap per bite instead of two.
 *
 * All timing comes from monotonic timestamps captured at the moment of the tap, so
 * the double-tap detection delay in the UI never skews a measurement.
 */
export function useStarSession(opts: StarSessionOptions) {
  const { targetSec, leadInSec, autoPause, pauseSec } = opts

  const [phase, setPhase] = useState<StarPhase>('idle')
  const [bites, setBites] = useState<BiteResult[]>([])
  const [last, setLast] = useState<BiteResult | null>(null)
  const [rawElapsed, setRawElapsed] = useState(0)
  const [pauseLeft, setPauseLeft] = useState(0)

  const biteStart = useRef(0)
  const pauseEnd = useRef(0)
  const mealStart = useRef(0)
  const counter = useRef(0)
  const raf = useRef<number | undefined>(undefined)
  const pickMessage = useRef(createFeedbackPicker())

  // Options can change mid-meal (settings sheet), so read them from a ref in callbacks.
  const cfg = useRef(opts)
  cfg.current = opts

  const beginBite = useCallback((atMs: number) => {
    biteStart.current = atMs
    setRawElapsed(0)
    setPhase('chewing')
  }, [])

  const beginPause = useCallback(() => {
    pauseEnd.current = performance.now() + cfg.current.pauseSec * 1000
    setPauseLeft(cfg.current.pauseSec)
    setPhase('pausing')
  }, [])

  // One animation loop drives both the chew gauge and the pause countdown.
  useEffect(() => {
    if (phase !== 'chewing' && phase !== 'pausing') return
    const loop = () => {
      const now = performance.now()
      if (phase === 'chewing') {
        setRawElapsed((now - biteStart.current) / 1000)
      } else {
        const left = (pauseEnd.current - now) / 1000
        setPauseLeft(Math.max(0, left))
        if (left <= 0) {
          beginBite(now)
          return
        }
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [phase, beginBite])

  const startMeal = useCallback(() => {
    mealStart.current = performance.now()
    counter.current = 0
    pickMessage.current = createFeedbackPicker()
    setBites([])
    setLast(null)
    setRawElapsed(0)
    if (cfg.current.autoPause) beginPause()
    else setPhase('waiting')
  }, [beginPause])

  /** Ends the current bite. Returns false when the tap was too early to count. */
  const endBite = useCallback((atMs: number): boolean => {
    const { leadInSec: lead, targetSec: target } = cfg.current
    const rawSec = (atMs - biteStart.current) / 1000
    const durationSec = rawSec - lead
    // During the lead-in you are still taking the bite; that tap cannot end it.
    if (durationSec < MIN_CHEW_SEC) return false

    const kind = classifyBite(durationSec, target)
    counter.current += 1
    const result: BiteResult = {
      index: counter.current,
      durationSec,
      rawSec,
      star: durationSec >= target,
      kind,
      message: pickMessage.current(kind),
    }
    setBites((prev) => [...prev, result])
    setLast(result)
    setPhase('result')
    return true
  }, [])

  /** Leaves the result screen: straight into the next pause, or back to waiting. */
  const dismissResult = useCallback(() => {
    setPhase((p) => {
      if (p !== 'result') return p
      if (cfg.current.autoPause) {
        pauseEnd.current = performance.now() + cfg.current.pauseSec * 1000
        setPauseLeft(cfg.current.pauseSec)
        return 'pausing'
      }
      return 'waiting'
    })
  }, [])

  /** Skip the rest of the pause and start chewing now. */
  const skipPause = useCallback((atMs: number) => {
    beginBite(atMs)
  }, [beginBite])

  const summarise = useCallback((): StarSummary => {
    const durations = bites.map((b) => b.durationSec)
    const total = durations.reduce((a, b) => a + b, 0)
    return {
      bites: bites.length,
      stars: bites.filter((b) => b.star).length,
      durationSec: Math.max(1, Math.round((performance.now() - mealStart.current) / 1000)),
      avgBiteSec: bites.length ? total / bites.length : 0,
      bestBiteSec: durations.length ? Math.max(...durations) : 0,
    }
  }, [bites])

  const endMeal = useCallback((): StarSummary => {
    const summary = summarise()
    setPhase('idle')
    setRawElapsed(0)
    setPauseLeft(0)
    return summary
  }, [summarise])

  const reset = useCallback(() => {
    counter.current = 0
    setBites([])
    setLast(null)
    setRawElapsed(0)
    setPauseLeft(0)
    setPhase('idle')
  }, [])

  const stars = bites.filter((b) => b.star).length
  const inLeadIn = phase === 'chewing' && rawElapsed < leadInSec
  const chewElapsed = Math.max(0, rawElapsed - leadInSec)
  const leadInLeft = Math.max(0, leadInSec - rawElapsed)

  return {
    phase,
    bites,
    stars,
    last,
    /** Counted chew time of the bite in progress. */
    chewElapsed,
    inLeadIn,
    leadInLeft,
    pauseLeft,
    targetSec,
    startMeal,
    beginBite,
    endBite,
    dismissResult,
    skipPause,
    endMeal,
    summarise,
    reset,
  }
}
