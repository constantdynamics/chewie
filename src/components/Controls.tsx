import { BoltIcon, GearIcon, GridIcon, HeartIcon, PlayIcon, ResetIcon, StopIcon } from './Icons'

export function Controls(props: {
  visible: boolean
  running: boolean
  quick: boolean
  fg: string
  bg: string
  onToggleRun: () => void
  onQuick: () => void
  onReset: () => void
  onGallery: () => void
  onNourishment: () => void
  onSettings: () => void
}) {
  const { visible, running, quick, fg, bg, onToggleRun, onQuick, onReset, onGallery, onNourishment, onSettings } = props

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div className={`controls${visible ? '' : ' hidden'}`} onClick={stop}>
      <button
        className="primary-btn"
        style={{ background: fg, color: bg }}
        onClick={onToggleRun}
        aria-label={running ? 'Stop maaltijd' : 'Start maaltijd'}
      >
        {running ? <StopIcon color={bg} /> : <PlayIcon color={bg} />}
        <span>{running ? 'Stop maaltijd' : 'Start maaltijd'}</span>
      </button>

      <div className="control-row">
        <button
          className={`icon-btn${quick ? ' active' : ''}`}
          style={{ background: fg, color: bg }}
          onClick={onQuick}
          aria-pressed={quick}
          aria-label="Snelle modus"
          title="Snelle modus"
        >
          <BoltIcon color={bg} />
        </button>
        <button className="icon-btn" style={{ background: fg, color: bg }} onClick={onReset} aria-label="Opnieuw" title="Opnieuw">
          <ResetIcon color={bg} />
        </button>
        <button className="icon-btn" style={{ background: fg, color: bg }} onClick={onGallery} aria-label="Galerij" title="Galerij">
          <GridIcon color={bg} />
        </button>
        <button
          className="icon-btn"
          style={{ background: fg, color: bg }}
          onClick={onNourishment}
          aria-label="Nourishment Mode"
          title="Ideale hoeveelheid"
        >
          <HeartIcon color={bg} />
        </button>
        <button className="icon-btn" style={{ background: fg, color: bg }} onClick={onSettings} aria-label="Instellingen" title="Instellingen">
          <GearIcon color={bg} />
        </button>
      </div>
    </div>
  )
}
