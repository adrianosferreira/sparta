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

export interface LoggedSet {
  setNumber: number
  reps?: number
  durationSec?: number
  perSide?: { left: number; right: number }
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
}

export interface UserState {
  xp: number
  level: number
  streakDays: number
  lastWorkoutDate?: string
  unlockedBadges: string[]
  currentWeek: number
  currentDayIndex: number
}
