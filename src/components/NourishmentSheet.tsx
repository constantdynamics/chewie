import { useState } from 'react'
import { Sheet } from './Sheet'
import { NumberField, Note, SelectField, Stepper, Toggle } from './ui'
import { setState, useStore } from '../lib/store'
import { bmi, bmiCategory, healthyWeightRange, perMealTarget, round1, tdee } from '../lib/nourishment'
import type { Profile } from '../types'

const emptyProfile: Profile = {
  heightCm: 175,
  weightKg: 75,
  ageYears: 35,
  sex: 'other',
  activity: 'moderate',
  mealsPerDay: 3,
}

export function NourishmentSheet({ onClose }: { onClose: () => void }) {
  const state = useStore()
  const [form, setForm] = useState<Profile>(state.profile ?? emptyProfile)
  const [saved, setSaved] = useState(false)
  const enabled = state.nourishmentEnabled

  const b = bmi(form.weightKg, form.heightCm)
  const cat = bmiCategory(b)
  const [lo, hi] = healthyWeightRange(form.heightCm)
  const meal = Math.round(perMealTarget(form))
  const day = Math.round(tdee(form))

  const patch = (p: Partial<Profile>) => {
    setForm({ ...form, ...p })
    setSaved(false)
  }

  return (
    <Sheet title="Ideale hoeveelheid" onClose={onClose}>
      <Toggle
        label="Nourishment Mode"
        desc="Optioneel. Helpt je je ideale hoeveelheid te raken — een tweezijdig streefbereik, dus te weinig telt net zo goed als te veel."
        checked={enabled}
        onChange={(v) => setState({ nourishmentEnabled: v })}
      />

      {!enabled ? (
        <Note>
          Zet dit aan als je je maaltijden op hoeveelheid wilt afstemmen. Je rustige kern-app werkt gewoon zonder.
          Dit is bedoeld voor volwassenen en is <b>geen medisch advies</b>.
        </Note>
      ) : (
        <>
          <h3>Jouw gegevens</h3>
          <NumberField label="Lengte" unit="cm" value={form.heightCm} min={120} max={230} onChange={(v) => patch({ heightCm: v })} />
          <NumberField label="Gewicht" unit="kg" value={form.weightKg} min={30} max={250} onChange={(v) => patch({ weightKg: v })} />
          <NumberField label="Leeftijd" unit="jaar" value={form.ageYears} min={16} max={100} onChange={(v) => patch({ ageYears: v })} />
          <SelectField
            label="Geslacht (voor energiebehoefte)"
            value={form.sex}
            options={[
              { value: 'female', label: 'Vrouw' },
              { value: 'male', label: 'Man' },
              { value: 'other', label: 'Anders / zeg ik liever niet' },
            ]}
            onChange={(v) => patch({ sex: v as Profile['sex'] })}
          />
          <SelectField
            label="Beweging"
            value={form.activity}
            options={[
              { value: 'sedentary', label: 'Weinig (zittend)' },
              { value: 'light', label: 'Licht actief' },
              { value: 'moderate', label: 'Gemiddeld actief' },
              { value: 'active', label: 'Actief' },
              { value: 'veryactive', label: 'Zeer actief' },
            ]}
            onChange={(v) => patch({ activity: v as Profile['activity'] })}
          />
          <Stepper label="Maaltijden per dag" value={form.mealsPerDay} min={1} max={6} step={1} onChange={(v) => patch({ mealsPerDay: v })} />

          <button
            className="wide-btn"
            onClick={() => {
              setState({ profile: form })
              setSaved(true)
            }}
          >
            {saved ? 'Opgeslagen ✓' : 'Opslaan'}
          </button>

          <div className="derived">
            <div className="derived-row">
              <span>BMI</span>
              <b>
                {round1(b)} · {cat.label}
              </b>
            </div>
            <div className="derived-row">
              <span>Gezond gewicht (deze lengte)</span>
              <b>
                {Math.round(lo)}–{Math.round(hi)} kg
              </b>
            </div>
            <div className="derived-row">
              <span>Energiebehoefte per dag</span>
              <b>~{day} kcal</b>
            </div>
            <div className="derived-row highlight">
              <span>Streefbereik per maaltijd</span>
              <b>
                ~{Math.round(meal * 0.8)}–{Math.round(meal * 1.2)} kcal
              </b>
            </div>
          </div>

          {cat.care && (
            <div className="care">
              Je ingevoerde gegevens wijzen op ondergewicht. Chewie stuurt <b>nooit</b> aan op minder eten of afvallen —
              het doel is juist genoeg en gevarieerd eten. Twijfel je over je gewicht of eetpatroon? Bespreek het met je
              huisarts of een diëtist.
            </div>
          )}

          <Note>
            Na een maaltijd kun je (optioneel) een foto van je bord op de weegschaal maken en het gewicht + soort eten
            invullen. Chewie rekent dan je <b>portie-balans</b> uit: 100 in het midden van je bereik, en lager als je
            eronder <i>of</i> erboven zit. Schattingen zijn altijd bij benadering, geen medische meting.
          </Note>
        </>
      )}
    </Sheet>
  )
}
