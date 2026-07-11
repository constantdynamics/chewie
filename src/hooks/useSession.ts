import { useCallback, useEffect, useRef, useState } from 'react'
import type { Phase, Settings } from '../types'

export interface SessionApi {
  running: boolean
  phase: Phase
  bite: number
  remaining: number // seconds left in current phase
  total: number // seconds of current phase
  progress: number // 0..1, fraction of phase remaining
  elapsedSec: number
  start: () => void
  stop: () => void
  reset: () => void
}

/**
 * Drift-free chew/pause engine. Time is computed from monotonic timestamps
 * (performance.now), never accumulated from tick deltas, so it stays accurate
 * across screen dimming and re-renders. A new bite starts on each pause→chew turn.
 */
export function useSession(
  settings: Settings,
  quick: boolean,
  onBite: () => void,
  onEnd: (bites: number, durationSec: number) => void,
): SessionApi {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [bite, setBite] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [total, setTotal] = useState(0)
  const [elapsedSec, setElapsedSec] = useState(0)

  const phaseEndRef = useRef(0)
  const sessionStartRef = useRef(0)
  const rafRef = useRef<number | undefined>(undefined)

  const chewDur = quick ? settings.quickChewSeconds : settings.chewSeconds
  const pauseDur = quick ? settings.quickPauseSeconds : settings.pauseSeconds

  const durRef = useRef({ chewDur, pauseDur })
  durRef.current = { chewDur, pauseDur }
  const phaseRef = useRef<Phase>(phase)
  phaseRef.current = phase
  const biteRef = useRef(bite)
  biteRef.current = bite
  const onBiteRef = useRef(onBite)
  onBiteRef.current = onBite
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  const tick = useCallback(() => {
    const now = performance.now()
    const remMs = phaseEndRef.current - now
    setRemaining(Math.max(0, remMs / 1000))
    setElapsedSec((now - sessionStartRef.current) / 1000)

    if (remMs <= 0) {
      if (phaseRef.current === 'chew') {
        setPhase('pause')
        setTotal(durRef.current.pauseDur)
        phaseEndRef.current = now + durRef.current.pauseDur * 1000
      } else {
        const next = biteRef.current + 1
        setBite(next)
        onBiteRef.current()
        setPhase('chew')
        setTotal(durRef.current.chewDur)
        phaseEndRef.current = now + durRef.current.chewDur * 1000
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    const now = performance.now()
    sessionStartRef.current = now
    setBite(1)
    setPhase('chew')
    setTotal(durRef.current.chewDur)
    setRemaining(durRef.current.chewDur)
    phaseEndRef.current = now + durRef.current.chewDur * 1000
    setRunning(true)
  }, [])

  useEffect(() => {
    if (!running) return
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [running, tick])

  const stop = useCallback(() => {
    setRunning((wasRunning) => {
      if (wasRunning) {
        const dur = Math.round((performance.now() - sessionStartRef.current) / 1000)
        onEndRef.current(biteRef.current, dur)
      }
      return false
    })
    setPhase('idle')
    setRemaining(0)
    setTotal(0)
    setElapsedSec(0)
    setBite(0)
  }, [])

  const reset = useCallback(() => {
    setRunning(false)
    setPhase('idle')
    setBite(0)
    setRemaining(0)
    setTotal(0)
    setElapsedSec(0)
  }, [])

  const progress = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0
  return { running, phase, bite, remaining, total, progress, elapsedSec, start, stop, reset }
}
