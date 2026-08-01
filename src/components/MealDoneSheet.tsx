import { useState } from 'react'
import { Sheet } from './Sheet'
import { NumberField, Note, SelectField } from './ui'
import { CameraIcon } from './Icons'
import { Star, StarGrid } from './StarGrid'
import { renderTileSVG } from '../lib/chewart'
import { FOODS, estimateKcal, foodByKey } from '../lib/foods'
import { perMealTarget, portionBalance } from '../lib/nourishment'
import { updateTile, useStore } from '../lib/store'
import { fileToDownscaledDataURL } from '../lib/image'
import type { Tile } from '../types'

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function fmtSec(s: number): string {
  return `${s.toFixed(1).replace('.', ',')}\u00A0s`
}

function scoreMessage(s: number): string {
  if (s >= 90) return 'Mooi in je bereik — precies goed.'
  if (s >= 70) return 'Dicht bij je ideale hoeveelheid.'
  if (s >= 40) return 'Wat verder van je bereik af.'
  return 'Flink onder of boven je bereik.'
}

export function MealDoneSheet({ tile, onClose }: { tile: Tile; onClose: () => void }) {
  const state = useStore()
  const canLog = state.nourishmentEnabled && state.profile != null
  const target = state.profile ? Math.round(perMealTarget(state.profile)) : 0

  const [grams, setGrams] = useState(300)
  const [foodKey, setFoodKey] = useState('mixed')
  const [photo, setPhoto] = useState<string | undefined>(undefined)
  const [logged, setLogged] = useState<{ kcal: number; score: number } | null>(null)

  const isStars = tile.mode === 'stars'
  const goal = tile.starGoal ?? state.settings.starGoal
  const stars = tile.stars ?? 0
  const starMeals = state.tiles
    .filter((t) => t.mode === 'stars')
    .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0) || (b.avgBiteSec ?? 0) - (a.avgBiteSec ?? 0) || b.id - a.id)
  const place = starMeals.findIndex((t) => t.id === tile.id) + 1

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      setPhoto(await fileToDownscaledDataURL(f))
    } catch {
      /* ignore unreadable image */
    }
  }

  function save() {
    const food = foodByKey(foodKey) ?? FOODS[0]
    const kcal = estimateKcal(grams, food.kcalPer100)
    const score = portionBalance(kcal, target)
    updateTile(tile.id, { intakeKcal: kcal, targetKcal: target, portionScore: score, foodLabel: food.label, photo })
    setLogged({ kcal, score })
  }

  return (
    <Sheet title="Maaltijd afgerond" onClose={onClose}>
      <div className="done-head">
        <span dangerouslySetInnerHTML={{ __html: renderTileSVG(tile, 108) }} />
        <div>
          <div className="done-title">{isStars && stars >= goal ? 'Kaart vol! 🎉' : 'Nieuwe tegel! 🎉'}</div>
          <div className="done-sub">
            {tile.bites} happen · {fmtDuration(tile.durationSec)}
            {tile.quick ? ' · snel' : ''}
          </div>
        </div>
      </div>

      {isStars && (
        <div className="done-stars">
          <div className="done-stars-score">
            <Star size={26} filled glow />
            <b>{stars}</b>
            <small>/ {goal} sterren</small>
          </div>
          <StarGrid earned={stars} goal={goal} />
          <div className="hud-stats">
            <div>
              <b>{fmtSec(tile.avgBiteSec ?? 0)}</b>
              <small>gemiddeld</small>
            </div>
            <div>
              <b>{fmtSec(tile.bestBiteSec ?? 0)}</b>
              <small>langste hap</small>
            </div>
            <div>
              <b>{tile.bites ? `${Math.round((stars / tile.bites) * 100)}%` : '—'}</b>
              <small>raak</small>
            </div>
          </div>
          {place === 1 && starMeals.length > 1 && <div className="done-record">🏆 Nieuw persoonlijk record!</div>}
          {place > 1 && <div className="done-place">#{place} op je ranglijst</div>}
        </div>
      )}

      {!canLog ? (
        <>
          <Note>Mooi gedaan — je tegel staat in de galerij.</Note>
          <button className="wide-btn" onClick={onClose}>
            Klaar
          </button>
        </>
      ) : logged ? (
        <>
          <div className="score-result">
            <div className="score-big">
              {logged.score}
              <small>/100</small>
            </div>
            <div className="score-msg">{scoreMessage(logged.score)}</div>
          </div>
          <Note>
            ~{logged.kcal} kcal van je streef ~{target} kcal (±20% = ideaal). Dit is een ruwe schatting, geen meting.
          </Note>
          <button className="wide-btn" onClick={onClose}>
            Klaar
          </button>
        </>
      ) : (
        <>
          <p className="note">
            Optioneel: leg vast hoeveel je at, dan zie je je tweezijdige portie-balans (streef ~{target} kcal per
            maaltijd).
          </p>
          <label className="photo-btn">
            <CameraIcon />
            <span>{photo ? 'Foto gemaakt ✓' : 'Foto van bord op weegschaal'}</span>
            <input type="file" accept="image/*" capture="environment" onChange={onPhoto} hidden />
          </label>
          {photo && <img className="photo-preview" src={photo} alt="Je maaltijd" />}
          <NumberField label="Gewicht op de weegschaal" unit="gram" value={grams} min={0} max={3000} onChange={setGrams} />
          <SelectField
            label="Soort eten"
            value={foodKey}
            options={FOODS.map((f) => ({ value: f.key, label: f.label }))}
            onChange={setFoodKey}
          />
          <button className="wide-btn" onClick={save}>
            Bereken portie-balans
          </button>
          <button className="ghost-btn wide" onClick={onClose}>
            Overslaan
          </button>
        </>
      )}
    </Sheet>
  )
}
