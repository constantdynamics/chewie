import { useState } from 'react'
import { Sheet } from './Sheet'
import { deleteTile, useStore } from '../lib/store'
import { renderTileSVG } from '../lib/chewart'
import type { Tile } from '../types'

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export function GallerySheet({ onClose, onOpenLeaderboard }: { onClose: () => void; onOpenLeaderboard?: () => void }) {
  const state = useStore()
  const [selected, setSelected] = useState<Tile | null>(null)
  const tiles = [...state.tiles].reverse()
  const st = state.stats

  return (
    <Sheet title="Jouw ChewArt" onClose={onClose}>
      <div className="stat-row">
        <div className="stat">
          <b>{st.totalSessions}</b>
          <small>maaltijden</small>
        </div>
        <div className="stat">
          <b>{st.totalBites}</b>
          <small>happen totaal</small>
        </div>
        <div className="stat">
          <b>{st.bestSession}</b>
          <small>meeste happen</small>
        </div>
      </div>

      {onOpenLeaderboard && (
        <button className="ghost-btn wide" onClick={onOpenLeaderboard}>
          ★ Bekijk je ranglijst
        </button>
      )}

      {tiles.length === 0 ? (
        <p className="note">
          Nog geen tegels. Rond een maaltijd af en je eerste kunstwerk verschijnt hier — elke maaltijd wordt een
          unieke tegel.
        </p>
      ) : (
        <div className="tile-grid">
          {tiles.map((t) => (
            <button key={t.id} className="tile-cell" onClick={() => setSelected(t)} aria-label={`Tegel van ${t.date.slice(0, 10)}`}>
              <span dangerouslySetInnerHTML={{ __html: renderTileSVG(t, 96) }} />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="tile-detail">
          <div className="tile-detail-art" dangerouslySetInnerHTML={{ __html: renderTileSVG(selected, 140) }} />
          <div className="tile-detail-meta">
            <div>{new Date(selected.date).toLocaleString('nl-NL')}</div>
            <div>
              {selected.bites} happen · {fmtDuration(selected.durationSec)}
              {selected.quick ? ' · snel' : ''}
            </div>
            {selected.mode === 'stars' && (
              <div>
                ★ <b>{selected.stars ?? 0}</b>/{selected.starGoal ?? 25} sterren · gem.{' '}
                {(selected.avgBiteSec ?? 0).toFixed(1).replace('.', ',')} s per hap
              </div>
            )}
            {selected.portionScore != null && (
              <div>
                Portie-balans: <b>{selected.portionScore}</b>/100
                {selected.foodLabel ? ` · ${selected.foodLabel}` : ''}
                {selected.intakeKcal != null && selected.targetKcal != null
                  ? ` · ~${selected.intakeKcal} van ~${selected.targetKcal} kcal`
                  : ''}
              </div>
            )}
            <div className="tile-detail-actions">
              <button
                className="danger-btn"
                onClick={() => {
                  deleteTile(selected.id)
                  setSelected(null)
                }}
              >
                Verwijderen
              </button>
              <button className="ghost-btn" onClick={() => setSelected(null)}>
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  )
}
