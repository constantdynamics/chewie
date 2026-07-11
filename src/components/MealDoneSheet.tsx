import { useState } from 'react'
import { Sheet } from './Sheet'
import { NumberField, Note, SelectField } from './ui'
import { CameraIcon } from './Icons'
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
          <div className="done-title">Nieuwe tegel! 🎉</div>
          <div className="done-sub">
            {tile.bites} happen · {fmtDuration(tile.durationSec)}
            {tile.quick ? ' · snel' : ''}
          </div>
        </div>
      </div>

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
