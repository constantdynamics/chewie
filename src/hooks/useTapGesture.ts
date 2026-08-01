import { useCallback, useEffect, useRef } from 'react'

const DOUBLE_TAP_MS = 240

/**
 * Distinguishes a single tap from a double tap on the same surface.
 *
 * The single-tap action is held back for one double-tap window, but the
 * timestamp handed to it is the one captured the instant the finger landed —
 * so a bite is measured exactly, even though the screen reacts a moment later.
 */
export function useTapGesture(onSingle: (atMs: number) => void, onDouble: () => void) {
  const pending = useRef<{ at: number; timer: number } | null>(null)

  const clear = useCallback(() => {
    if (pending.current) {
      clearTimeout(pending.current.timer)
      pending.current = null
    }
  }, [])

  useEffect(() => clear, [clear])

  const onPointerDown = useCallback(() => {
    const at = performance.now()

    if (pending.current) {
      clear()
      onDouble()
      return
    }

    const timer = window.setTimeout(() => {
      const captured = pending.current?.at ?? at
      pending.current = null
      onSingle(captured)
    }, DOUBLE_TAP_MS)

    pending.current = { at, timer }
  }, [clear, onDouble, onSingle])

  return { onPointerDown, cancel: clear }
}
