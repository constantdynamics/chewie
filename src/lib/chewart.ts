import type { Tile } from '../types'

// Small deterministic PRNG so a tile always renders identically from its seed.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A tile's look is seeded by HOW the meal went: bite count, duration, quick mode, time of day.
export function makeTile(opts: { id: number; bites: number; durationSec: number; quick: boolean }): Tile {
  const { id, bites, durationSec, quick } = opts
  const now = new Date()
  const seed = (id % 2147483647) || 1
  const hue = Math.floor((bites * 29 + durationSec * 0.6 + now.getHours() * 7) % 360)
  const hue2 = (hue + 40 + (bites % 3) * 15) % 360
  const sat = Math.min(85, 55 + bites * 2)
  const light = Math.min(66, 44 + durationSec / 40)
  return { id, date: now.toISOString(), bites, durationSec, quick, hue, hue2, sat, light, seed }
}

// Returns SVG markup (string) so tiles are cheap to store and render anywhere.
export function renderTileSVG(t: Tile, size = 120): string {
  const rnd = mulberry32(t.seed || 1)
  const c1 = `hsl(${t.hue} ${t.sat}% ${t.light}%)`
  const c2 = `hsl(${t.hue2} ${Math.max(30, t.sat - 18)}% ${Math.min(80, t.light + 12)}%)`
  const c3 = `hsl(${(t.hue + 180) % 360} ${Math.max(25, t.sat - 25)}% ${Math.max(22, t.light - 16)}%)`
  const cells = t.quick ? 3 : 4
  const step = size / cells
  let shapes = ''
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const r = rnd()
      const cx = x * step + step / 2
      const cy = y * step + step / 2
      const col = r < 0.5 ? c1 : r < 0.8 ? c2 : c3
      if (r < 0.4) {
        shapes += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(step * 0.36).toFixed(1)}" fill="${col}"/>`
      } else if (r < 0.7) {
        shapes += `<rect x="${(x * step + step * 0.16).toFixed(1)}" y="${(y * step + step * 0.16).toFixed(1)}" width="${(step * 0.68).toFixed(1)}" height="${(step * 0.68).toFixed(1)}" rx="${(step * 0.14).toFixed(1)}" fill="${col}"/>`
      } else {
        const h = step * 0.34
        shapes += `<path d="M ${cx.toFixed(1)} ${(cy - h).toFixed(1)} L ${(cx + h).toFixed(1)} ${(cy + step * 0.3).toFixed(1)} L ${(cx - h).toFixed(1)} ${(cy + step * 0.3).toFixed(1)} Z" fill="${col}"/>`
      }
    }
  }
  const gid = `g${t.id}`
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ChewArt tegel">
  <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="hsl(${t.hue} ${t.sat}% ${Math.max(16, t.light - 24)}%)"/>
    <stop offset="1" stop-color="hsl(${t.hue2} ${t.sat}% ${Math.max(12, t.light - 30)}%)"/>
  </linearGradient></defs>
  <rect width="${size}" height="${size}" rx="${(size * 0.12).toFixed(1)}" fill="url(#${gid})"/>
  ${shapes}
</svg>`
}
