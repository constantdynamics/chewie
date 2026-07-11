import type { Phase, Tile } from '../types'
import { ChewIcon, PauseIcon } from './Icons'
import { renderTileSVG } from '../lib/chewart'

export function MealScreen(props: {
  phase: Phase
  running: boolean
  bg: string
  fg: string
  quick: boolean
  bite: number
  progress: number
  pulse: boolean
  tip: string | null
  hideNumbers: boolean
  preview: Tile | null
  onTap: () => void
}) {
  const { phase, running, bg, fg, quick, bite, progress, pulse, tip, hideNumbers, preview, onTap } = props

  const label = phase === 'pause' ? 'Pauze' : phase === 'chew' ? 'Kauwen' : 'Chewie'
  const sub = !running
    ? 'Tik onderin op Start als je gaat eten'
    : quick
    ? 'Snelle modus'
    : null

  return (
    <div
      className={`meal-screen${phase === 'chew' && pulse && running ? ' pulsing' : ''}`}
      style={{ background: bg, color: fg }}
      onClick={onTap}
    >
      {running && preview && (
        <div
          className="tile-preview"
          aria-label="Je kunstwerk van deze maaltijd groeit"
          dangerouslySetInnerHTML={{ __html: renderTileSVG(preview, 48) }}
        />
      )}

      <div className="meal-center">
        <div className="meal-icon" style={{ color: fg }}>
          {phase === 'pause' ? <PauseIcon size={104} color={fg} /> : <ChewIcon size={104} color={fg} />}
        </div>
        <div className="meal-label">{label}</div>
        {sub && <div className="meal-sub">{sub}</div>}

        {running && (
          <>
            <div className="progress" aria-hidden>
              <div className="progress-fill" style={{ width: `${progress * 100}%`, background: fg }} />
            </div>
            {!hideNumbers && <div className="bite-counter">Hap {bite}</div>}
          </>
        )}
      </div>

      {running && tip && (
        <div className="tip" style={{ background: fg, color: bg }}>
          {tip}
        </div>
      )}
    </div>
  )
}
