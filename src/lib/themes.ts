import type { UiStyle } from '../types'

export interface Theme {
  id: string
  name: string
  /** The visual treatment this palette is designed for. */
  style: UiStyle
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
  // Soft, full-colour palettes.
  { id: 'blad', name: 'Blad', style: 'calm', chew: '#4ade80', pause: '#f59e0b', star: '#fbbf24', starDeep: '#f59e0b' },
  { id: 'oceaan', name: 'Oceaan', style: 'calm', chew: '#38bdf8', pause: '#818cf8', star: '#7dd3fc', starDeep: '#0ea5e9' },
  { id: 'zonsondergang', name: 'Zonsondergang', style: 'calm', chew: '#fb7185', pause: '#fb923c', star: '#fda4af', starDeep: '#f43f5e' },
  { id: 'bos', name: 'Bos', style: 'calm', chew: '#84cc16', pause: '#d97706', star: '#bef264', starDeep: '#65a30d' },
  { id: 'lavendel', name: 'Lavendel', style: 'calm', chew: '#a78bfa', pause: '#f0abfc', star: '#d8b4fe', starDeep: '#a855f7' },
  { id: 'klei', name: 'Klei', style: 'calm', chew: '#a3b18a', pause: '#d4a373', star: '#e9c46a', starDeep: '#ca8a04' },
  { id: 'framboos', name: 'Framboos', style: 'calm', chew: '#f472b6', pause: '#fb7185', star: '#f9a8d4', starDeep: '#ec4899' },
  { id: 'avond', name: 'Avond', style: 'calm', chew: '#1e293b', pause: '#475569', star: '#93c5fd', starDeep: '#60a5fa' },

  // Neon: near-black screens with glowing accents.
  { id: 'neon-cyaan', name: 'Neon Cyaan', style: 'neon', chew: '#22d3ee', pause: '#a855f7', star: '#67e8f9', starDeep: '#06b6d4' },
  { id: 'neon-magenta', name: 'Neon Magenta', style: 'neon', chew: '#f0f', pause: '#7c3aed', star: '#f0abfc', starDeep: '#d946ef' },
  { id: 'neon-lime', name: 'Neon Lime', style: 'neon', chew: '#adff2f', pause: '#22d3ee', star: '#d9f99d', starDeep: '#84cc16' },
  { id: 'neon-vuur', name: 'Neon Vuur', style: 'neon', chew: '#ff7a00', pause: '#ff2d55', star: '#ffb347', starDeep: '#f97316' },
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
