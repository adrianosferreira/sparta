import { EXERCISE_BY_ID } from '@/data/exercises'
import type { ExerciseCategory } from '@/types'
import type { WorkoutSession } from '@/types'

/**
 * Rest after logging a set:
 * - **Intra** (shorter): the previous logged set was the **same** exercise → `restBetweenSetsSec` on that exercise, else `INTRA_BY_CATEGORY`.
 * - **Inter** (longer): first set of the workout, or you just logged a **different** exercise before this one → `restAfterExerciseSec`, else `INTER_BY_CATEGORY`.
 *
 * Tune globally here, or per exercise in `src/data/exercises.ts` (`restBetweenSetsSec` / `restAfterExerciseSec`).
 */

/** Shorter rest when the last two logged sets are the same exercise (consecutive sets). */
const INTRA_BY_CATEGORY: Record<ExerciseCategory, number> = {
  push: 48,
  pull: 72,
  legs: 65,
  core: 38,
  skill: 52,
  cardio: 28,
  mobility: 22,
}

/** Longer rest when switching exercises (or first set of the session). */
const INTER_BY_CATEGORY: Record<ExerciseCategory, number> = {
  push: 85,
  pull: 120,
  legs: 100,
  core: 60,
  skill: 90,
  cardio: 40,
  mobility: 35,
}

function clampSec(n: number): number {
  return Math.min(300, Math.max(15, Math.round(n)))
}

/**
 * True if the two most recently completed sets (by `completedAt`) are the same exercise.
 * Used right after a new set is logged (store already includes it).
 */
export function lastTwoLoggedSetsSameExercise(session: WorkoutSession): boolean {
  const stamps: { exerciseId: string; t: number }[] = []
  for (const log of session.logs) {
    for (const set of log.sets) {
      stamps.push({
        exerciseId: log.exerciseId,
        t: new Date(set.completedAt).getTime(),
      })
    }
  }
  if (stamps.length < 2) return false
  stamps.sort((a, b) => {
    if (b.t !== a.t) return b.t - a.t
    return a.exerciseId.localeCompare(b.exerciseId)
  })
  return stamps[0]!.exerciseId === stamps[1]!.exerciseId
}

export function resolveRestSeconds(
  exerciseId: string,
  intraExercise: boolean,
): number {
  const ex = EXERCISE_BY_ID[exerciseId]
  if (!ex) return clampSec(75)
  const base = intraExercise
    ? (ex.restBetweenSetsSec ?? INTRA_BY_CATEGORY[ex.category])
    : (ex.restAfterExerciseSec ?? INTER_BY_CATEGORY[ex.category])
  return clampSec(base)
}
