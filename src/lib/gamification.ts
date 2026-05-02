import { EXERCISE_BY_ID } from '@/data/exercises'
import { getDay, getPrescriptionForExercise, PROGRAM } from '@/data/program'
import type { LoggedSet, Prescription, WorkoutSession } from '@/types'

export const XP_PER_SET = 10
export const XP_SESSION_BONUS = 25
export const XP_TOP_RANGE_BONUS = 5

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function xpFloorForLevel(level: number): number {
  if (level <= 1) return 0
  return (level - 1) ** 2 * 100
}

export function xpCeilForLevel(level: number): number {
  return level ** 2 * 100
}

export function xpProgressInLevel(xp: number): {
  level: number
  inLevel: number
  needed: number
  pct: number
} {
  const level = levelFromXp(xp)
  const low = xpFloorForLevel(level)
  const high = xpCeilForLevel(level)
  const inLevel = xp - low
  const needed = high - low
  const pct = needed > 0 ? Math.min(100, (inLevel / needed) * 100) : 100
  return { level, inLevel, needed, pct }
}

function isTopOfRange(
  prescription: Prescription | undefined,
  set: LoggedSet,
  tracking: 'reps' | 'time' | 'reps-per-side',
): boolean {
  if (!prescription) return false
  if (tracking === 'reps' && prescription.reps && set.reps != null) {
    return set.reps >= prescription.reps[1]
  }
  if (
    tracking === 'time' &&
    prescription.durationSec &&
    set.durationSec != null
  ) {
    return set.durationSec >= prescription.durationSec[1]
  }
  if (tracking === 'reps-per-side' && prescription.reps && set.perSide) {
    return (
      set.perSide.left >= prescription.reps[1] &&
      set.perSide.right >= prescription.reps[1]
    )
  }
  return false
}

export function computeSessionXp(session: WorkoutSession): number {
  const day = getDay(session.weekNumber, session.dayId)
  if (!day) return 0

  let xp = XP_SESSION_BONUS
  for (const log of session.logs) {
    const def = EXERCISE_BY_ID[log.exerciseId]
    const prescription = getPrescriptionForExercise(day, log.exerciseId)
    for (const set of log.sets) {
      xp += XP_PER_SET
      if (def && isTopOfRange(prescription, set, def.tracking)) {
        xp += XP_TOP_RANGE_BONUS
      }
    }
  }
  return xp
}

function todayLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysBetween(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number)
  const [yb, mb, db] = b.split('-').map(Number)
  const t1 = new Date(ya!, ma! - 1, da!).getTime()
  const t2 = new Date(yb!, mb! - 1, db!).getTime()
  return Math.round((t2 - t1) / 86400000)
}

export function nextStreak(
  currentStreak: number,
  lastWorkoutDate: string | undefined,
  completionDate: string,
): number {
  if (!lastWorkoutDate) return 1
  if (lastWorkoutDate === completionDate) return currentStreak
  const diff = daysBetween(lastWorkoutDate, completionDate)
  if (diff === 1) return currentStreak + 1
  if (diff === 0) return currentStreak
  return 1
}

export { todayLocal }

export interface BadgeContext {
  sessions: WorkoutSession[]
  streakDays: number
}

function completedSessions(sessions: WorkoutSession[]): WorkoutSession[] {
  return sessions.filter((s) => s.completedAt)
}

function weekFullyLogged(weekNumber: number, sessions: WorkoutSession[]): boolean {
  const week = PROGRAM.weeks.find((w) => w.weekNumber === weekNumber)
  if (!week) return false
  const done = new Set(
    completedSessions(sessions)
      .filter((s) => s.weekNumber === weekNumber)
      .map((s) => s.dayId),
  )
  return week.days.every((d) => done.has(d.id))
}

function monthWeeksFullyLogged(
  sessions: WorkoutSession[],
  startWeek: number,
  endWeek: number,
): boolean {
  for (let w = startWeek; w <= endWeek; w++) {
    if (!weekFullyLogged(w, sessions)) return false
  }
  return true
}

function hasExerciseMax(
  sessions: WorkoutSession[],
  exerciseId: string,
  predicate: (set: LoggedSet) => boolean,
): boolean {
  for (const s of completedSessions(sessions)) {
    const log = s.logs.find((l) => l.exerciseId === exerciseId)
    if (!log) continue
    for (const st of log.sets) {
      if (predicate(st)) return true
    }
  }
  return false
}

export interface BadgeRule {
  id: string
  unlocked: (ctx: BadgeContext) => boolean
}

export const BADGE_RULES: BadgeRule[] = [
  {
    id: 'first_step',
    unlocked: ({ sessions }) => completedSessions(sessions).length >= 1,
  },
  {
    id: 'week_warrior',
    unlocked: ({ sessions }) =>
      PROGRAM.weeks.some((w) => weekFullyLogged(w.weekNumber, sessions)),
  },
  {
    id: 'month_1',
    unlocked: ({ sessions }) => monthWeeksFullyLogged(sessions, 1, 4),
  },
  {
    id: 'month_2',
    unlocked: ({ sessions }) => monthWeeksFullyLogged(sessions, 5, 8),
  },
  {
    id: 'month_3',
    unlocked: ({ sessions }) => monthWeeksFullyLogged(sessions, 9, 12),
  },
  {
    id: 'streak_7',
    unlocked: ({ streakDays }) => streakDays >= 7,
  },
  {
    id: 'streak_30',
    unlocked: ({ streakDays }) => streakDays >= 30,
  },
  {
    id: 'iron_plank',
    unlocked: ({ sessions }) =>
      hasExerciseMax(sessions, 'plank', (st) => (st.durationSec ?? 0) >= 60),
  },
  {
    id: 'pushup_50',
    unlocked: ({ sessions }) =>
      hasExerciseMax(sessions, 'push-up', (st) => (st.reps ?? 0) >= 50),
  },
  {
    id: 'pullup_10',
    unlocked: ({ sessions }) =>
      hasExerciseMax(
        sessions,
        'pull-up-or-row',
        (st) => (st.reps ?? 0) >= 10,
      ),
  },
  {
    id: 'handstand_30s',
    unlocked: ({ sessions }) => {
      const wall = hasExerciseMax(
        sessions,
        'handstand-wall',
        (st) => (st.durationSec ?? 0) >= 30,
      )
      const free = hasExerciseMax(
        sessions,
        'handstand-free',
        (st) => (st.durationSec ?? 0) >= 30,
      )
      return wall || free
    },
  },
  {
    id: 'lsit_20s',
    unlocked: ({ sessions }) => {
      const tuck = hasExerciseMax(
        sessions,
        'lsit-tuck',
        (st) => (st.durationSec ?? 0) >= 20,
      )
      const hold = hasExerciseMax(
        sessions,
        'lsit-hold',
        (st) => (st.durationSec ?? 0) >= 20,
      )
      return tuck || hold
    },
  },
]

export function evaluateNewBadges(
  sessions: WorkoutSession[],
  streakDays: number,
  already: string[],
): string[] {
  const ctx: BadgeContext = { sessions, streakDays }
  const next: string[] = []
  for (const b of BADGE_RULES) {
    if (already.includes(b.id)) continue
    if (b.unlocked(ctx)) next.push(b.id)
  }
  return next
}

export const BADGE_DEFINITIONS = BADGE_RULES
