import { useSyncExternalStore } from 'react'
import type { AppState, Settings, Tile } from '../types'

const KEY = 'chewie_v1'

export const defaultSettings: Settings = {
  chewSeconds: 20,
  pauseSeconds: 5,
  chewColor: '#4ade80',
  pauseColor: '#f59e0b',
  starColor: '#fbbf24',
  starDeepColor: '#f59e0b',
  pulse: true,
  haptics: true,
  showTips: true,
  quickChewSeconds: 10,
  quickPauseSeconds: 3,
  starGoal: 25,
  autoPause: true,
  biteLeadInSec: 2,
  showRing: true,
  uiStyle: 'calm',
}

const defaultState: AppState = {
  settings: defaultSettings,
  tiles: [],
  profile: null,
  nourishmentEnabled: false,
  hideNumbers: false,
  stats: { totalSessions: 0, totalBites: 0, totalDurationSec: 0, bestSession: 0, lastDate: null },
  onboarded: false,
  mode: 'rhythm',
  version: 1,
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      ...defaultState,
      ...parsed,
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
      stats: { ...defaultState.stats, ...(parsed.stats ?? {}) },
    }
  } catch {
    return defaultState
  }
}

let state: AppState = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable — run in-memory */
  }
}

export function getState(): AppState {
  return state
}

export function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch }
  persist()
  listeners.forEach((l) => l())
}

export function updateSettings(patch: Partial<Settings>) {
  setState({ settings: { ...state.settings, ...patch } })
}

export function addTile(tile: Tile) {
  const stats = state.stats
  setState({
    tiles: [...state.tiles, tile],
    stats: {
      totalSessions: stats.totalSessions + 1,
      totalBites: stats.totalBites + tile.bites,
      totalDurationSec: stats.totalDurationSec + tile.durationSec,
      bestSession: Math.max(stats.bestSession, tile.bites),
      lastDate: tile.date.slice(0, 10),
    },
  })
}

export function updateTile(id: number, patch: Partial<Tile>) {
  setState({ tiles: state.tiles.map((t) => (t.id === id ? { ...t, ...patch } : t)) })
}

export function deleteTile(id: number) {
  setState({ tiles: state.tiles.filter((t) => t.id !== id) })
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useStore(): AppState {
  return useSyncExternalStore(subscribe, getState, getState)
}
