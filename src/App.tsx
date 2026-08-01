import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MealScreen } from './components/MealScreen'
import { Controls } from './components/Controls'
import { SettingsSheet } from './components/SettingsSheet'
import { GallerySheet } from './components/GallerySheet'
import { NourishmentSheet } from './components/NourishmentSheet'
import { MealDoneSheet } from './components/MealDoneSheet'
import { LeaderboardSheet } from './components/LeaderboardSheet'
import { StarMode } from './components/StarMode'
import { useSession } from './hooks/useSession'
import type { StarSummary } from './hooks/useStarSession'
import { addTile, setState, useStore } from './lib/store'
import { makeTile } from './lib/chewart'
import { contrastColor } from './lib/contrast'
import { applyAccent } from './lib/color'
import { pickTip } from './lib/tips'
import type { Phase, Tile } from './types'

type SheetName = 'settings' | 'gallery' | 'nourishment' | 'leaderboard' | null

export default function App() {
  const state = useStore()
  const s = state.settings

  const [quick, setQuick] = useState(false)
  const [sheet, setSheet] = useState<SheetName>(null)
  const [justFinished, setJustFinished] = useState<Tile | null>(null)
  const [controlsVisible, setControlsVisible] = useState(true)
  const hideTimer = useRef<number | undefined>(undefined)
  const sessionIdRef = useRef(1)

  // The star-mode accent lives in CSS, so themes recolour it through custom properties.
  // The browser/PWA chrome follows the chew colour so the whole app reads as one theme.
  useEffect(() => {
    applyAccent(s.starColor, s.starDeepColor, document.documentElement.style)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', s.chewColor)
  }, [s.starColor, s.starDeepColor, s.chewColor])

  const onBite = useCallback(() => {
    if (state.settings.haptics && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15)
    }
  }, [state.settings.haptics])

  const onEnd = useCallback(
    (bites: number, durationSec: number) => {
      if (bites < 1) return
      const tile: Tile = { ...makeTile({ id: Date.now(), bites, durationSec, quick }), mode: 'rhythm' }
      addTile(tile)
      setJustFinished(tile)
    },
    [quick],
  )

  const session = useSession(s, quick, onBite, onEnd)
  const { running, phase, bite, progress } = session

  // Colours: whole screen changes with the phase; icon/text pick the best contrast.
  const bg = running && phase === 'pause' ? s.pauseColor : s.chewColor
  const fg = useMemo(() => contrastColor(bg), [bg])

  // Auto-hide controls during an active meal; a tap brings them back.
  const poke = useCallback(() => {
    setControlsVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (session.running) {
      hideTimer.current = window.setTimeout(() => setControlsVisible(false), 4000)
    }
  }, [session.running])

  useEffect(() => {
    if (!running) {
      setControlsVisible(true)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    } else {
      poke()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // Tips appear only during a pause, sometimes, briefly.
  const prevPhase = useRef<Phase>('idle')
  const tipIndex = useRef(-1)
  const tipTimer = useRef<number | undefined>(undefined)
  const [tip, setTip] = useState<string | null>(null)
  useEffect(() => {
    if (phase === 'pause' && prevPhase.current !== 'pause') {
      if (s.showTips && Math.random() < 0.5) {
        const t = pickTip(tipIndex.current)
        tipIndex.current = t.index
        setTip(t.text)
        if (tipTimer.current) clearTimeout(tipTimer.current)
        tipTimer.current = window.setTimeout(() => setTip(null), 4500)
      }
    }
    if (phase !== 'pause') setTip(null)
    prevPhase.current = phase
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // A live preview tile that grows as the meal goes; recomputed per bite, not per frame.
  const chewDur = quick ? s.quickChewSeconds : s.chewSeconds
  const preview: Tile | null = useMemo(() => {
    if (!running) return null
    return makeTile({ id: sessionIdRef.current, bites: Math.max(1, bite), durationSec: bite * chewDur, quick })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, bite, quick])

  const toggleRun = () => {
    if (session.running) {
      session.stop()
    } else {
      sessionIdRef.current = Date.now()
      session.start()
    }
  }

  // ---- Star mode ----------------------------------------------------------
  const onStarMealEnd = useCallback(
    (summary: StarSummary) => {
      const base = makeTile({
        id: Date.now(),
        bites: summary.bites,
        durationSec: summary.durationSec,
        quick: false,
      })
      // Let the artwork carry the result: more stars, richer colour.
      const tile: Tile = {
        ...base,
        hue: (base.hue + summary.stars * 7) % 360,
        sat: Math.min(92, base.sat + summary.stars),
        mode: 'stars',
        stars: summary.stars,
        starGoal: s.starGoal,
        targetSec: s.chewSeconds,
        avgBiteSec: summary.avgBiteSec,
        bestBiteSec: summary.bestBiteSec,
      }
      addTile(tile)
      setJustFinished(tile)
    },
    [s.starGoal, s.chewSeconds],
  )

  const sheets = (
    <>
      {sheet === 'settings' && <SettingsSheet onClose={() => setSheet(null)} />}
      {sheet === 'gallery' && (
        <GallerySheet onClose={() => setSheet(null)} onOpenLeaderboard={() => setSheet('leaderboard')} />
      )}
      {sheet === 'nourishment' && <NourishmentSheet onClose={() => setSheet(null)} />}
      {sheet === 'leaderboard' && (
        <LeaderboardSheet onClose={() => setSheet(null)} highlightId={justFinished?.id} />
      )}
      {justFinished && <MealDoneSheet tile={justFinished} onClose={() => setJustFinished(null)} />}
    </>
  )

  if (state.mode === 'stars') {
    return (
      <div className="app">
        <StarMode
          targetSec={s.chewSeconds}
          goal={s.starGoal}
          haptics={s.haptics}
          hideNumbers={state.hideNumbers}
          onMealEnd={onStarMealEnd}
          onOpenLeaderboard={() => setSheet('leaderboard')}
          onOpenGallery={() => setSheet('gallery')}
          onOpenSettings={() => setSheet('settings')}
          onSwitchToRhythm={() => setState({ mode: 'rhythm' })}
        />
        {sheets}
      </div>
    )
  }

  return (
    <div className="app">
      <MealScreen
        phase={running ? phase : 'idle'}
        running={running}
        bg={bg}
        fg={fg}
        quick={quick}
        bite={bite}
        progress={progress}
        pulse={s.pulse}
        tip={tip}
        hideNumbers={state.hideNumbers}
        preview={preview}
        onTap={poke}
      />

      <Controls
        visible={controlsVisible}
        running={running}
        quick={quick}
        fg={fg}
        bg={bg}
        onToggleRun={toggleRun}
        onQuick={() => setQuick((q) => !q)}
        onReset={() => session.reset()}
        onGallery={() => setSheet('gallery')}
        onNourishment={() => setSheet('nourishment')}
        onSettings={() => setSheet('settings')}
        onSwitchToStars={running ? undefined : () => setState({ mode: 'stars' })}
      />

      {sheets}
    </div>
  )
}
