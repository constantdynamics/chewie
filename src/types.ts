export type Phase = 'idle' | 'chew' | 'pause'

/** Which experience the app is showing: the calm auto rhythm, or manual star-scored bites. */
export type Mode = 'rhythm' | 'stars'

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
  /** How many stars fill one meal in star mode. */
  starGoal: number
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
  /** Star-mode fields — present only on meals recorded in star mode. */
  mode?: Mode
  stars?: number
  starGoal?: number
  targetSec?: number
  avgBiteSec?: number
  bestBiteSec?: number
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
  mode: Mode
  version: number
}
