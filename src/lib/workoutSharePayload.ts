import type { AppLocale } from '@/i18n/types'
import type { WorkoutDay, WorkoutSession } from '@/types'

export interface WorkoutShareSnapshot {
  dayTitle: string
  weekNumber: number
  durationSec: number
  totalSets: number
  movesCount: number
  xp: number
  kcal?: number
  dateLine: string
  weekLabel: string
  /** Bars for exercises with ≥1 set, sorted by sets desc, capped */
  setBars: { name: string; sets: number }[]
  /** Localized UI strings for the card */
  labels: {
    activity: string
    duration: string
    volume: string
    xp: string
    sets: string
    moves: string
    kcal: string
  }
}

export function formatDurationHMS(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  }
  return `${m}:${String(r).padStart(2, '0')}`
}

export function sessionDurationSec(
  session: WorkoutSession,
  endTime: Date,
): number {
  const start = new Date(session.startedAt).getTime()
  return Math.max(0, Math.floor((endTime.getTime() - start) / 1000))
}

export function buildWorkoutShareSnapshot(input: {
  session: WorkoutSession
  day: WorkoutDay
  dayTitle: string
  weekLabel: string
  locale: AppLocale
  getExerciseName: (id: string) => string
  xp: number
  kcal?: number
  endTime: Date
  labels: WorkoutShareSnapshot['labels']
}): WorkoutShareSnapshot {
  const { session, day, dayTitle, weekLabel, locale, getExerciseName, xp, kcal, endTime, labels } =
    input

  let totalSets = 0
  const bars: { name: string; sets: number }[] = []
  for (const item of day.items) {
    const log = session.logs.find((l) => l.exerciseId === item.exerciseId)
    const n = log?.sets.length ?? 0
    totalSets += n
    if (n > 0) {
      bars.push({ name: getExerciseName(item.exerciseId), sets: n })
    }
  }
  bars.sort((a, b) => b.sets - a.sets)
  const setBars = bars.slice(0, 12)
  const movesCount = bars.length

  const dateLine = endTime.toLocaleDateString(
    locale === 'pt-BR' ? 'pt-BR' : 'en-US',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )

  const durationSec = sessionDurationSec(session, endTime)

  return {
    dayTitle,
    weekNumber: session.weekNumber,
    durationSec,
    totalSets,
    movesCount,
    xp,
    ...(kcal != null && kcal > 0 ? { kcal } : {}),
    dateLine,
    weekLabel,
    setBars,
    labels,
  }
}
