import { Sheet } from './Sheet'
import { ColorField, Note, Stepper, Toggle } from './ui'
import { ThemePicker } from './ThemePicker'
import { setState, updateSettings, useStore } from '../lib/store'

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const state = useStore()
  const s = state.settings

  return (
    <Sheet title="Instellingen" onClose={onClose}>
      <h3>Tempo</h3>
      <Stepper
        label="Kauwtijd per hap"
        value={s.chewSeconds}
        min={5}
        max={60}
        step={5}
        unit="sec"
        onChange={(v) => updateSettings({ chewSeconds: v })}
      />
      <Stepper
        label="Pauze tussen happen"
        value={s.pauseSeconds}
        min={0}
        max={30}
        step={1}
        unit="sec"
        onChange={(v) => updateSettings({ pauseSeconds: v })}
      />

      <h3>Sterrenmodus</h3>
      <Stepper
        label="Sterren per maaltijd"
        value={s.starGoal}
        min={5}
        max={50}
        step={5}
        unit="★"
        onChange={(v) => updateSettings({ starGoal: v })}
      />
      <Note>
        Een hap verdient een ster als je minstens <b>{s.chewSeconds} seconden</b> kauwt — dat is je kauwtijd
        hierboven. Zet je die hoger, dan wordt een ster ook zwaarder verdiend.
      </Note>

      <h3>Snelle modus</h3>
      <Stepper
        label="Kauwtijd (snel)"
        value={s.quickChewSeconds}
        min={3}
        max={30}
        step={1}
        unit="sec"
        onChange={(v) => updateSettings({ quickChewSeconds: v })}
      />
      <Stepper
        label="Pauze (snel)"
        value={s.quickPauseSeconds}
        min={0}
        max={15}
        step={1}
        unit="sec"
        onChange={(v) => updateSettings({ quickPauseSeconds: v })}
      />

      <h3>Kleurthema</h3>
      <ThemePicker />
      <ColorField label="Kauwkleur" value={s.chewColor} onChange={(v) => updateSettings({ chewColor: v })} />
      <ColorField label="Pauzekleur" value={s.pauseColor} onChange={(v) => updateSettings({ pauseColor: v })} />
      <ColorField
        label="Sterkleur"
        value={s.starColor}
        onChange={(v) => updateSettings({ starColor: v, starDeepColor: v })}
      />

      <h3>Weergave</h3>
      <Toggle
        label="Zachte pulsering"
        desc="Een rustige rand-pulsering tijdens het kauwen."
        checked={s.pulse}
        onChange={(v) => updateSettings({ pulse: v })}
      />
      <Toggle
        label="Trillen"
        desc="Korte trilling bij elke nieuwe hap."
        checked={s.haptics}
        onChange={(v) => updateSettings({ haptics: v })}
      />
      <Toggle
        label="Tips tijdens pauze"
        desc="Af en toe een rustige tip tijdens het pauzeren."
        checked={s.showTips}
        onChange={(v) => updateSettings({ showTips: v })}
      />
      <Toggle
        label="Getallen verbergen"
        desc="Verberg hapteller en score voor een nog rustiger scherm."
        checked={state.hideNumbers}
        onChange={(v) => setState({ hideNumbers: v })}
      />

      <button className="wide-btn" onClick={onClose}>
        Klaar
      </button>
    </Sheet>
  )
}
