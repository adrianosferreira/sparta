export type Tracking = 'reps' | 'time' | 'reps-per-side'

export type ExerciseCategory =
  | 'push'
  | 'pull'
  | 'legs'
  | 'core'
  | 'skill'
  | 'cardio'
  | 'mobility'

export interface ExerciseDef {
  id: string
  name: string
  category: ExerciseCategory
  tracking: Tracking
  /** Rest after logging another set of this exercise (seconds). Falls back to category default. */
  restBetweenSetsSec?: number
  /** Rest after logging this exercise when the previous set was a different exercise (seconds). */
  restAfterExerciseSec?: number
}

export type PrescriptionNoteKey =
  | 'afterMain'
  | 'skillAfterMain'
  | 'skillTraining'
  | 'skill'
  | 'repsPerSide'

export interface Prescription {
  sets: number
  reps?: [number, number]
  durationSec?: [number, number]
  /** @deprecated prefer notesKey for UI translation */
  notes?: string
  notesKey?: PrescriptionNoteKey
}

export interface WorkoutItem {
  exerciseId: string
  prescription: Prescription
}

export interface WorkoutDay {
  id: string
  name: string
  items: WorkoutItem[]
}

export interface ProgramWeek {
  weekNumber: number
  days: WorkoutDay[]
}

export interface Program {
  id: string
  name: string
  weeks: ProgramWeek[]
}

export type BiologicalSex = 'male' | 'female' | 'unspecified'

/** Saved on the user for BMI display and MET-based kcal (uses body weight). */
export interface BodyProfile {
  ageYears: number
  sex: BiologicalSex
  heightCm: number
  weightKg: number
}

export interface LoggedSet {
  setNumber: number
  reps?: number
  durationSec?: number
  perSide?: { left: number; right: number }
  /** Estimated kcal for this set (MET × weight × time), if profile had weight when logged. */
  kcal?: number
  completedAt: string
}

export interface ExerciseLog {
  exerciseId: string
  sets: LoggedSet[]
}

export interface WorkoutSession {
  id: string
  weekNumber: number
  dayId: string
  startedAt: string
  completedAt?: string
  logs: ExerciseLog[]
  xpEarned: number
  /** Sum of `LoggedSet.kcal` for this session, if any set had estimates. */
  kcalTotal?: number
}

export interface UserState {
  xp: number
  level: number
  streakDays: number
  lastWorkoutDate?: string
  unlockedBadges: string[]
  currentWeek: number
  currentDayIndex: number
  /** Age, sex, height, weight — used for BMI and kcal estimates (weight drives MET formula). */
  bodyProfile: BodyProfile | null
}
