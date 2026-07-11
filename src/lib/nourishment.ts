import type { Profile } from '../types'

// All figures are derived at runtime and never stored as a "goal weight".
export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100
  if (m <= 0) return 0
  return weightKg / (m * m)
}

// WHO healthy weight RANGE for a height (BMI 18.5–24.9), in kg.
export function healthyWeightRange(heightCm: number): [number, number] {
  const m = heightCm / 100
  return [18.5 * m * m, 24.9 * m * m]
}

// Mifflin–St Jeor basal metabolic rate (kcal/day).
export function bmr(p: Profile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.ageYears
  if (p.sex === 'male') return base + 5
  if (p.sex === 'female') return base - 161
  return base - 78 // neutral midpoint when unspecified
}

const ACTIVITY_FACTOR: Record<Profile['activity'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryactive: 1.9,
}

export function tdee(p: Profile): number {
  return bmr(p) * ACTIVITY_FACTOR[p.activity]
}

export function perMealTarget(p: Profile): number {
  return tdee(p) / Math.max(1, p.mealsPerDay)
}

// Two-sided Portion Balance: 100 in the middle of the band, dropping on BOTH sides.
// Eating too little lowers it exactly like eating too much — "minimise" is impossible.
export function portionBalance(intakeKcal: number, targetKcal: number): number {
  if (targetKcal <= 0) return 0
  const rel = Math.abs(intakeKcal - targetKcal) / targetKcal
  const plateau = 0.2 // ±20% around the centre still scores 100
  if (rel <= plateau) return 100
  const beyond = rel - plateau
  const score = 100 * Math.exp(-Math.pow(beyond / 0.28, 2))
  return Math.max(0, Math.round(score))
}

export interface BmiCategory {
  label: string
  care: boolean // true => route to a gentle care message, never a "lose weight" nudge
}

export function bmiCategory(b: number): BmiCategory {
  if (b <= 0) return { label: '—', care: false }
  if (b < 18.5) return { label: 'ondergewicht', care: true }
  if (b < 25) return { label: 'gezond gewicht', care: false }
  if (b < 30) return { label: 'overgewicht', care: false }
  return { label: 'obesitas', care: false }
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}
