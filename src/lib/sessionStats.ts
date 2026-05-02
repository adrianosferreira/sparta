import { EXERCISE_BY_ID } from '@/data/exercises'
import type { ExerciseLog, WorkoutSession } from '@/types'

export function bestValueForExercise(
  exerciseId: string,
  log: ExerciseLog,
): number | null {
  const ex = EXERCISE_BY_ID[exerciseId]
  if (!ex) return null
  let best = 0
  let any = false
  for (const s of log.sets) {
    if (ex.tracking === 'reps' && s.reps != null) {
      any = true
      best = Math.max(best, s.reps)
    } else if (ex.tracking === 'time' && s.durationSec != null) {
      any = true
      best = Math.max(best, s.durationSec)
    } else if (ex.tracking === 'reps-per-side' && s.perSide) {
      any = true
      const v = Math.min(s.perSide.left, s.perSide.right)
      best = Math.max(best, v)
    }
  }
  return any ? best : null
}

export function sumMetricForExercise(
  exerciseId: string,
  sessions: WorkoutSession[],
): { totalReps: number; totalSeconds: number } {
  const ex = EXERCISE_BY_ID[exerciseId]
  let totalReps = 0
  let totalSeconds = 0
  if (!ex) return { totalReps, totalSeconds }
  for (const session of sessions) {
    if (!session.completedAt) continue
    const log = session.logs.find((l) => l.exerciseId === exerciseId)
    if (!log) continue
    for (const s of log.sets) {
      if (ex.tracking === 'reps' && s.reps != null) totalReps += s.reps
      else if (ex.tracking === 'time' && s.durationSec != null)
        totalSeconds += s.durationSec
      else if (ex.tracking === 'reps-per-side' && s.perSide) {
        totalReps += s.perSide.left + s.perSide.right
      }
    }
  }
  return { totalReps, totalSeconds }
}

export function chartPointsForExercise(
  exerciseId: string,
  sessions: WorkoutSession[],
): { date: string; best: number; sessionId: string }[] {
  const completed = sessions
    .filter((s) => s.completedAt)
    .sort(
      (a, b) =>
        new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime(),
    )
  const points: { date: string; best: number; sessionId: string }[] = []
  for (const s of completed) {
    const log = s.logs.find((l) => l.exerciseId === exerciseId)
    if (!log) continue
    const best = bestValueForExercise(exerciseId, log)
    if (best == null) continue
    const d = s.completedAt!.slice(0, 10)
    points.push({ date: d, best, sessionId: s.id })
  }
  return points
}
