import { useCallback, useEffect, useRef, useState } from 'react'

export type StarPhase = 'idle' | 'waiting' | 'chewing' | 'result'

export interface BiteResult {
  index: number
  durationSec: number
  star: boolean
}

export interface StarSummary {
  bites: number
  stars: number
  durationSec: number
  avgBiteSec: number
  bestBiteSec: number
}

/** Taps shorter than this are treated as a mis-tap and the bite is discarded. */
const MIN_BITE_SEC = 0.8

/**
 * Manual bite scoring: you mark the start and the end of every bite yourself.
 * A bite that lasts at least `targetSec` earns a star. Timing is taken from
 * monotonic timestamps captured at the moment of the tap, so the double-tap
 * detection delay in the UI never skews a measurement.
 */
export function useStarSession(targetSec: number) {
  const [phase, setPhase] = useState<StarPhase>('idle')
  const [bites, setBites] = useState<BiteResult[]>([])
  const [last, setLast] = useState<BiteResult | null>(null)
  const [elapsed, setElapsed] = useState(0)

  const biteStart = useRef(0)
  const mealStart = useRef(0)
  const counter = useRef(0)
  const raf = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (phase !== 'chewing') return
    const loop = () => {
      setElapsed((performance.now() - biteStart.current) / 1000)
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [phase])

  const startMeal = useCallback(() => {
    mealStart.current = performance.now()
    counter.current = 0
    setBites([])
    setLast(null)
    setElapsed(0)
    setPhase('waiting')
  }, [])

  const beginBite = useCallback((atMs: number) => {
    biteStart.current = atMs
    setElapsed(0)
    setPhase('chewing')
  }, [])

  const endBite = useCallback(
    (atMs: number) => {
      const durationSec = (atMs - biteStart.current) / 1000
      if (durationSec < MIN_BITE_SEC) {
        // Almost certainly a stray tap — drop it rather than logging a fake bite.
        setPhase('waiting')
        return
      }
      counter.current += 1
      const result: BiteResult = { index: counter.current, durationSec, star: durationSec >= targetSec }
      setBites((prev) => [...prev, result])
      setLast(result)
      setPhase('result')
    },
    [targetSec],
  )

  const dismissResult = useCallback(() => {
    setPhase((p) => (p === 'result' ? 'waiting' : p))
  }, [])

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
    setElapsed(0)
    return summary
  }, [summarise])

  const reset = useCallback(() => {
    counter.current = 0
    setBites([])
    setLast(null)
    setElapsed(0)
    setPhase('idle')
  }, [])

  const stars = bites.filter((b) => b.star).length

  return {
    phase,
    bites,
    stars,
    last,
    elapsed,
    startMeal,
    beginBite,
    endBite,
    dismissResult,
    endMeal,
    summarise,
    reset,
  }
}
