import type {
  BodyProfile,
  ExerciseCategory,
  ExerciseDef,
  WorkoutSession,
} from '@/types'

/** MET (metabolic equivalent) by movement pattern — compendium-style ballpark for calisthenics. */
const MET_BY_CATEGORY: Record<ExerciseCategory, number> = {
  push: 5.4,
  pull: 6.8,
  legs: 5.8,
  core: 4.0,
  skill: 3.9,
  cardio: 4.5,
  mobility: 2.5,
}

/** Per-exercise overrides where intensity differs from category default. */
const MET_BY_EXERCISE_ID: Partial<Record<string, number>> = {
  'warmup-cardio': 4.6,
  'cooldown-stretch': 2.4,
  'pull-up-or-row': 7.8,
  dip: 6.6,
  'push-up': 5.2,
  plank: 3.6,
  'handstand-wall': 4.1,
  'handstand-free': 4.6,
  'lsit-tuck': 3.5,
  'lsit-hold': 3.9,
  'muscle-up-progression': 8.0,
  'pistol-squat-assisted': 6.2,
}

/** Estimated seconds per rep (or per counted rep on each side) for work time when only reps are logged. */
const SEC_PER_REP_BY_CATEGORY: Record<ExerciseCategory, number> = {
  push: 2.5,
  pull: 3.0,
  legs: 2.8,
  core: 2.0,
  skill: 2.5,
  cardio: 2.0,
  mobility: 2.0,
}

export function metForExercise(ex: ExerciseDef): number {
  return MET_BY_EXERCISE_ID[ex.id] ?? MET_BY_CATEGORY[ex.category]
}

export function activeWorkSeconds(
  ex: ExerciseDef,
  data: {
    reps?: number
    durationSec?: number
    perSide?: { left: number; right: number }
  },
): number | null {
  if (ex.tracking === 'time') {
    if (data.durationSec == null || data.durationSec <= 0) return null
    return data.durationSec
  }
  if (ex.tracking === 'reps') {
    if (data.reps == null || data.reps <= 0) return null
    return data.reps * SEC_PER_REP_BY_CATEGORY[ex.category]
  }
  if (!data.perSide) return null
  const total = data.perSide.left + data.perSide.right
  if (total <= 0) return null
  return total * SEC_PER_REP_BY_CATEGORY[ex.category]
}

/**
 * Energy from MET: kcal ≈ MET × 3.5 × weight(kg) / 200 × minutes (ACSM-style).
 */
export function kcalFromMetSeconds(
  met: number,
  weightKg: number,
  durationSec: number,
): number {
  if (weightKg <= 0 || durationSec <= 0 || met <= 0) return 0
  const minutes = durationSec / 60
  const raw = met * 3.5 * (weightKg / 200) * minutes
  return Math.round(raw * 10) / 10
}

export function estimateSetKcal(
  weightKg: number,
  ex: ExerciseDef,
  data: {
    reps?: number
    durationSec?: number
    perSide?: { left: number; right: number }
  },
): number {
  const sec = activeWorkSeconds(ex, data)
  if (sec == null) return 0
  return kcalFromMetSeconds(metForExercise(ex), weightKg, sec)
}

/** Weight is required for MET-based kcal; age/height/sex are for BMI and profile only. */
export function isProfileCompleteForKcal(p: BodyProfile | null | undefined): p is BodyProfile {
  if (!p) return false
  return p.weightKg >= 30 && p.weightKg <= 250 && Number.isFinite(p.weightKg)
}

export function computeBmi(heightCm: number, weightKg: number): number | null {
  if (heightCm < 80 || heightCm > 260 || weightKg < 25 || weightKg > 300) return null
  const h = heightCm / 100
  if (h <= 0) return null
  return Math.round((weightKg / (h * h)) * 10) / 10
}

export function sessionKcalTotal(
  logs: { sets: { kcal?: number }[] }[],
): number | undefined {
  let sum = 0
  let any = false
  for (const log of logs) {
    for (const st of log.sets) {
      if (st.kcal != null) {
        any = true
        sum += st.kcal
      }
    }
  }
  if (!any) return undefined
  return Math.round(sum * 10) / 10
}

/** Prefer stored `kcalTotal`; fall back to summing sets (older saves). */
export function sessionDisplayKcal(s: WorkoutSession): number | undefined {
  if (s.kcalTotal != null) return s.kcalTotal
  return sessionKcalTotal(s.logs)
}

export function totalKcalFromSessions(sessions: WorkoutSession[]): number {
  let sum = 0
  for (const s of sessions) {
    if (!s.completedAt) continue
    const v = sessionDisplayKcal(s)
    if (v != null) sum += v
  }
  return Math.round(sum * 10) / 10
}
