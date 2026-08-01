import { Star } from './StarGrid'

/**
 * The always-visible score: outlined stars laid out left to right, wrapping into
 * rows, each one filling in as it is earned. Dim enough to sit on the dark screen
 * between bites without pulling attention.
 */
export function StarTrack({ earned, goal, justEarned }: { earned: number; goal: number; justEarned?: boolean }) {
  return (
    <div className="star-track" role="img" aria-label={`${earned} van ${goal} sterren verdiend`}>
      {Array.from({ length: goal }, (_, i) => {
        const filled = i < earned
        return (
          <span
            key={i}
            className={`track-star${filled ? ' on' : ''}${justEarned && i === earned - 1 ? ' pop' : ''}`}
          >
            <Star size={17} filled={filled} />
          </span>
        )
      })}
    </div>
  )
}
