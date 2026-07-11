export type Phase = 'idle' | 'chew' | 'pause'

export interface Settings {
  chewSeconds: number
  pauseSeconds: number
  chewColor: string
  pauseColor: string
  pulse: boolean
  haptics: boolean
  showTips: boolean
  quickChewSeconds: number
  quickPauseSeconds: number
}

export type Sex = 'male' | 'female' | 'other'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryactive'

export interface Profile {
  heightCm: number
  weightKg: number
  ageYears: number
  sex: Sex
  activity: Activity
  mealsPerDay: number
}

export interface Tile {
  id: number
  date: string
  bites: number
  durationSec: number
  quick: boolean
  hue: number
  hue2: number
  sat: number
  light: number
  seed: number
  intakeKcal?: number
  targetKcal?: number
  portionScore?: number
  foodLabel?: string
  photo?: string
}

export interface Stats {
  totalSessions: number
  totalBites: number
  totalDurationSec: number
  bestSession: number
  lastDate: string | null
}

export interface AppState {
  settings: Settings
  tiles: Tile[]
  profile: Profile | null
  nourishmentEnabled: boolean
  hideNumbers: boolean
  stats: Stats
  onboarded: boolean
  version: number
}
