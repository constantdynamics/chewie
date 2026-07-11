// Pick a foreground colour with the best WCAG contrast against a hex background.

function channelToLinear(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b)
}

const DARK = '#0b0f14'
const LIGHT = '#ffffff'

export function contrastColor(hex: string): string {
  try {
    const L = relativeLuminance(hex)
    const contrastWithWhite = 1.05 / (L + 0.05)
    const contrastWithDark = (L + 0.05) / (relativeLuminance(DARK) + 0.05)
    return contrastWithDark >= contrastWithWhite ? DARK : LIGHT
  } catch {
    return DARK
  }
}
