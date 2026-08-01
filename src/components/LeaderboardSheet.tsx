import { Sheet } from './Sheet'
import { Star } from './StarGrid'
import { useStore } from '../lib/store'
import type { Tile } from '../types'

const MEDALS = ['🥇', '🥈', '🥉']

function fmtSec(s: number): string {
  return `${s.toFixed(1).replace('.', ',')}\u00A0s`
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

/** Best-first ranking: stars, then how long the average bite lasted, then most recent. */
function rank(a: Tile, b: Tile): number {
  const sa = a.stars ?? 0
  const sb = b.stars ?? 0
  if (sb !== sa) return sb - sa
  const aa = a.avgBiteSec ?? 0
  const ab = b.avgBiteSec ?? 0
  if (ab !== aa) return ab - aa
  return b.id - a.id
}

export function LeaderboardSheet({ onClose, highlightId }: { onClose: () => void; highlightId?: number }) {
  const state = useStore()
  const meals = state.tiles.filter((t) => t.mode === 'stars').sort(rank)

  const best = meals[0]
  const filled = meals.filter((m) => (m.stars ?? 0) >= (m.starGoal ?? state.settings.starGoal)).length
  const totalStars = meals.reduce((a, m) => a + (m.stars ?? 0), 0)

  return (
    <Sheet title="Ranglijst" onClose={onClose}>
      {meals.length === 0 ? (
        <p className="note">
          Nog geen sterrenmaaltijden. Speel een maaltijd in de sterrenmodus en je zet meteen je eerste record neer.
        </p>
      ) : (
        <>
          <div className="lb-hero">
            <div className="lb-hero-star">
              <Star size={34} filled glow />
            </div>
            <div>
              <div className="lb-hero-value">
                {best?.stars ?? 0}
                <small>/ {best?.starGoal ?? state.settings.starGoal}</small>
              </div>
              <div className="lb-hero-label">jouw record</div>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat">
              <b>{meals.length}</b>
              <small>maaltijden</small>
            </div>
            <div className="stat">
              <b>{totalStars}</b>
              <small>sterren totaal</small>
            </div>
            <div className="stat">
              <b>{filled}</b>
              <small>kaart vol</small>
            </div>
          </div>

          <ol className="lb-list">
            {meals.slice(0, 25).map((m, i) => {
              const goal = m.starGoal ?? state.settings.starGoal
              const full = (m.stars ?? 0) >= goal
              return (
                <li key={m.id} className={`lb-row${m.id === highlightId ? ' is-new' : ''}${full ? ' is-full' : ''}`}>
                  <span className="lb-rank">{MEDALS[i] ?? i + 1}</span>
                  <span className="lb-main">
                    <span className="lb-date">{fmtDate(m.date)}</span>
                    <span className="lb-meta">
                      {m.bites} happen · gem. {fmtSec(m.avgBiteSec ?? 0)} · max {fmtSec(m.bestBiteSec ?? 0)}
                    </span>
                  </span>
                  <span className="lb-score">
                    <Star size={15} filled />
                    {m.stars ?? 0}
                    <small>/{goal}</small>
                  </span>
                </li>
              )
            })}
          </ol>

          <p className="note">
            Je speelt tegen jezelf — alle records staan alleen op dit toestel. Elke maaltijd waarin je je vorige
            gemiddelde verbetert, is er één.
          </p>
        </>
      )}
    </Sheet>
  )
}
