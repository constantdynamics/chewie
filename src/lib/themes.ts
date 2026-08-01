export interface Theme {
  id: string
  name: string
  /** Full-screen colour while chewing. */
  chew: string
  /** Full-screen colour during the pause. */
  pause: string
  /** Accent for star mode: stars, rings, the lit-up result. */
  star: string
  /** Slightly deeper shade of the accent, used for gradients. */
  starDeep: string
}

export const THEMES: Theme[] = [
  { id: 'blad', name: 'Blad', chew: '#4ade80', pause: '#f59e0b', star: '#fbbf24', starDeep: '#f59e0b' },
  { id: 'oceaan', name: 'Oceaan', chew: '#38bdf8', pause: '#818cf8', star: '#7dd3fc', starDeep: '#0ea5e9' },
  { id: 'zonsondergang', name: 'Zonsondergang', chew: '#fb7185', pause: '#fb923c', star: '#fda4af', starDeep: '#f43f5e' },
  { id: 'bos', name: 'Bos', chew: '#84cc16', pause: '#d97706', star: '#bef264', starDeep: '#65a30d' },
  { id: 'lavendel', name: 'Lavendel', chew: '#a78bfa', pause: '#f0abfc', star: '#d8b4fe', starDeep: '#a855f7' },
  { id: 'klei', name: 'Klei', chew: '#a3b18a', pause: '#d4a373', star: '#e9c46a', starDeep: '#ca8a04' },
  { id: 'framboos', name: 'Framboos', chew: '#f472b6', pause: '#fb7185', star: '#f9a8d4', starDeep: '#ec4899' },
  { id: 'avond', name: 'Avond', chew: '#1e293b', pause: '#475569', star: '#93c5fd', starDeep: '#60a5fa' },
]

export function themeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id)
}

/** Which theme (if any) the current colours correspond to — so the picker can show what's active. */
export function matchTheme(chew: string, pause: string, star: string): string | null {
  const lc = (s: string) => s.toLowerCase()
  const hit = THEMES.find((t) => lc(t.chew) === lc(chew) && lc(t.pause) === lc(pause) && lc(t.star) === lc(star))
  return hit ? hit.id : null
}
