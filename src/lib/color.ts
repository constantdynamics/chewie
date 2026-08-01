export interface Rgb {
  r: number
  g: number
  b: number
}

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return {
    r: parseInt(full.slice(0, 2), 16) || 0,
    g: parseInt(full.slice(2, 4), 16) || 0,
    b: parseInt(full.slice(4, 6), 16) || 0,
  }
}

export function rgba({ r, g, b }: Rgb, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Alpha steps the star-mode styling needs, as percentages. */
export const ACCENT_ALPHAS = [5, 7, 8, 10, 14, 16, 18, 22, 26, 28, 45, 50, 55, 60] as const
export const ACCENT_DEEP_ALPHAS = [5, 14, 32] as const

/**
 * Publishes the star accent as CSS custom properties so every tint, glow and
 * gradient in star mode follows the chosen theme instead of a hardcoded gold.
 */
export function applyAccent(starColor: string, starDeepColor: string, root: CSSStyleDeclaration) {
  const base = hexToRgb(starColor)
  const deep = hexToRgb(starDeepColor)
  root.setProperty('--gold', starColor)
  root.setProperty('--gold-deep', starDeepColor)
  // Names are zero-padded to match the CSS (--gold-a08, not --gold-a8).
  const pad = (a: number) => String(a).padStart(2, '0')
  ACCENT_ALPHAS.forEach((a) => root.setProperty(`--gold-a${pad(a)}`, rgba(base, a / 100)))
  ACCENT_DEEP_ALPHAS.forEach((a) => root.setProperty(`--gold-deep-a${pad(a)}`, rgba(deep, a / 100)))
}
