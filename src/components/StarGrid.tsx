export function Star({ size = 24, filled = false, glow = false }: { size?: number; filled?: boolean; glow?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`star${filled ? ' filled' : ''}${glow ? ' glow' : ''}`}
      aria-hidden
    >
      <path
        d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.44 6.19 20.5 7.3 14.03 2.6 9.45l6.5-.95z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StarGrid({ earned, goal, justEarned }: { earned: number; goal: number; justEarned?: boolean }) {
  const slots = Array.from({ length: goal }, (_, i) => i < earned)
  return (
    <div className="star-grid" role="img" aria-label={`${earned} van ${goal} sterren`}>
      {slots.map((filled, i) => (
        <span key={i} className={`star-slot${filled ? ' on' : ''}${justEarned && i === earned - 1 ? ' pop' : ''}`}>
          <Star size={26} filled={filled} />
        </span>
      ))}
    </div>
  )
}
