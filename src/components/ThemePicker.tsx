import { THEMES, matchTheme } from '../lib/themes'
import { updateSettings, useStore } from '../lib/store'

export function ThemePicker() {
  const { settings } = useStore()
  const active = matchTheme(settings.chewColor, settings.pauseColor, settings.starColor)

  return (
    <div className="theme-grid" role="radiogroup" aria-label="Kleurthema">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={active === t.id}
          className={`theme-card${active === t.id ? ' on' : ''}${t.style === 'neon' ? ' neon' : ''}`}
          onClick={() =>
            // A palette carries its treatment: neon palettes switch the app to neon,
            // calm ones switch it back. The style toggle can still override afterwards.
            updateSettings({
              chewColor: t.chew,
              pauseColor: t.pause,
              starColor: t.star,
              starDeepColor: t.starDeep,
              uiStyle: t.style,
            })
          }
        >
          <span className="theme-swatch" aria-hidden>
            <span style={{ background: t.chew }} />
            <span style={{ background: t.pause }} />
            <span style={{ background: t.star }} />
          </span>
          <span className="theme-name">{t.name}</span>
        </button>
      ))}
    </div>
  )
}
