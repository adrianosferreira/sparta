import { EXERCISE_BY_ID } from '@/data/exercises'
import { getDay, getWeek, PROGRAM } from '@/data/program'
import {
  computeSessionXp,
  evaluateNewBadges,
  levelFromXp,
  nextStreak,
  todayLocal,
} from '@/lib/gamification'
import type { TrainingPayload } from '@/lib/api'
import type { AppLocale } from '@/i18n/types'
import { DEFAULT_LOCALE } from '@/i18n/types'
import {
  estimateSetKcal,
  isProfileCompleteForKcal,
  sessionKcalTotal,
} from '@/lib/kcal'
import type {
  BodyProfile,
  ExerciseLog,
  LoggedSet,
  UserState,
  WorkoutSession,
} from '@/types'
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

const STORAGE_KEY = 'sparta:v1'
const LEGACY_STORAGE_KEY = 'calisthenic:v1'

/** Reads legacy `calisthenic:v1` once and copies into `sparta:v1` so renames do not lose data. */
function createSpartaPersistStorage(): StateStorage {
  return {
    getItem: (name) => {
      if (typeof localStorage === 'undefined') return null
      const v = localStorage.getItem(name)
      if (v != null) return v
      if (name === STORAGE_KEY) {
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
        if (legacy != null) {
          try {
            localStorage.setItem(STORAGE_KEY, legacy)
            localStorage.removeItem(LEGACY_STORAGE_KEY)
          } catch {
            /* ignore quota / private mode */
          }
          return legacy
        }
      }
      return null
    },
    setItem: (name, value) => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(name, value)
    },
    removeItem: (name) => {
      if (typeof localStorage === 'undefined') return
      localStorage.removeItem(name)
      if (name === STORAGE_KEY) localStorage.removeItem(LEGACY_STORAGE_KEY)
    },
  }
}

function initialUser(): UserState {
  return {
    xp: 0,
    level: 1,
    streakDays: 0,
    unlockedBadges: [],
    currentWeek: 1,
    currentDayIndex: 0,
    bodyProfile: null,
  }
}

function newSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function emptyLogsForDay(weekNumber: number, dayId: string): ExerciseLog[] {
  const day = getDay(weekNumber, dayId)
  if (!day) return []
  return day.items.map(({ exerciseId }) => ({ exerciseId, sets: [] }))
}

function advanceSchedule(
  week: number,
  dayIndex: number,
): { currentWeek: number; currentDayIndex: number } {
  const w = getWeek(week)
  const len = w?.days.length ?? 1
  let nextIdx = dayIndex + 1
  let nextWeek = week
  if (nextIdx >= len) {
    nextIdx = 0
    nextWeek = Math.min(12, week + 1)
  }
  return { currentWeek: nextWeek, currentDayIndex: nextIdx }
}

interface AppStore {
  locale: AppLocale
  user: UserState
  sessions: WorkoutSession[]
  activeSession: WorkoutSession | null
  pendingBadgeIds: string[]
  setLocale: (locale: AppLocale) => void
  startSession: (weekNumber: number, dayId: string) => void
  logSet: (
    exerciseId: string,
    data: Pick<LoggedSet, 'reps' | 'durationSec' | 'perSide'>,
  ) => void
  undoLastSet: (exerciseId: string) => void
  completeSession: () => string[]
  dismissBadgeToast: () => void
  resetProgress: () => void
  setBodyProfile: (profile: BodyProfile | null) => void
  setSchedule: (week: number, dayIndex: number) => void
  abandonActiveSession: () => void
  hydrateFromServer: (data: TrainingPayload) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      user: initialUser(),
      sessions: [],
      activeSession: null,
      pendingBadgeIds: [],

      setLocale: (locale) => set({ locale }),

      startSession: (weekNumber, dayId) => {
        const day = getDay(weekNumber, dayId)
        if (!day) return
        const session: WorkoutSession = {
          id: newSessionId(),
          weekNumber,
          dayId,
          startedAt: new Date().toISOString(),
          logs: emptyLogsForDay(weekNumber, dayId),
          xpEarned: 0,
        }
        set({ activeSession: session })
      },

      logSet: (exerciseId, data) => {
        const s = get().activeSession
        if (!s) return
        const profile = get().user.bodyProfile
        const ex = EXERCISE_BY_ID[exerciseId]
        const kcal =
          ex &&
          isProfileCompleteForKcal(profile)
            ? estimateSetKcal(profile.weightKg, ex, data)
            : undefined
        const logs = s.logs.map((log) => {
          if (log.exerciseId !== exerciseId) return log
          const setNumber = log.sets.length + 1
          const next: LoggedSet = {
            setNumber,
            reps: data.reps,
            durationSec: data.durationSec,
            perSide: data.perSide,
            completedAt: new Date().toISOString(),
            ...(kcal != null && kcal > 0 ? { kcal } : {}),
          }
          return { ...log, sets: [...log.sets, next] }
        })
        set({ activeSession: { ...s, logs } })
      },

      undoLastSet: (exerciseId) => {
        const s = get().activeSession
        if (!s) return
        const logs = s.logs.map((log) => {
          if (log.exerciseId !== exerciseId || log.sets.length === 0)
            return log
          return { ...log, sets: log.sets.slice(0, -1) }
        })
        set({ activeSession: { ...s, logs } })
      },

      completeSession: () => {
        const s = get().activeSession
        if (!s) return []
        const completedAt = new Date().toISOString()
        const finished: WorkoutSession = {
          ...s,
          completedAt,
          xpEarned: computeSessionXp({ ...s, completedAt }),
          kcalTotal: sessionKcalTotal(s.logs),
        }
        const xpEarned = finished.xpEarned
        const sessions = [...get().sessions, finished]
        const u = get().user
        const date = todayLocal()
        const newStreak = nextStreak(u.streakDays, u.lastWorkoutDate, date)
        const newXp = u.xp + xpEarned
        const newLevel = levelFromXp(newXp)
        const newBadges = evaluateNewBadges(
          sessions,
          newStreak,
          u.unlockedBadges,
        )
        const unlockedBadges = [...new Set([...u.unlockedBadges, ...newBadges])]
        const weekObj = getWeek(s.weekNumber)
        const completedDayIdx =
          weekObj?.days.findIndex((d) => d.id === s.dayId) ?? 0
        const adv = advanceSchedule(s.weekNumber, completedDayIdx)
        set({
          sessions,
          activeSession: null,
          pendingBadgeIds: newBadges,
          user: {
            ...u,
            xp: newXp,
            level: newLevel,
            streakDays: newStreak,
            lastWorkoutDate: date,
            unlockedBadges,
            currentWeek: adv.currentWeek,
            currentDayIndex: adv.currentDayIndex,
          },
        })
        return newBadges
      },

      dismissBadgeToast: () => set({ pendingBadgeIds: [] }),

      resetProgress: () =>
        set((s) => ({
          user: { ...initialUser(), bodyProfile: s.user.bodyProfile },
          sessions: [],
          activeSession: null,
          pendingBadgeIds: [],
          locale: s.locale,
        })),

      setBodyProfile: (profile) =>
        set((state) => ({
          user: { ...state.user, bodyProfile: profile },
        })),

      setSchedule: (week, dayIndex) => {
        const w = getWeek(week)
        if (!w || dayIndex < 0 || dayIndex >= w.days.length) return
        set((state) => ({
          user: {
            ...state.user,
            currentWeek: week,
            currentDayIndex: dayIndex,
          },
        }))
      },

      abandonActiveSession: () => set({ activeSession: null }),

      hydrateFromServer: (data: TrainingPayload) =>
        set({
          user: {
            ...initialUser(),
            ...data.user,
            bodyProfile: data.user.bodyProfile ?? null,
          },
          sessions: Array.isArray(data.sessions) ? data.sessions : [],
          locale:
            data.locale === 'pt-BR' || data.locale === 'en'
              ? data.locale
              : DEFAULT_LOCALE,
          activeSession: null,
          pendingBadgeIds: [],
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => createSpartaPersistStorage()),
      partialize: (s) => ({
        user: s.user,
        sessions: s.sessions,
        locale: s.locale,
      }),
      merge: (persisted, current) => {
        const p = persisted as {
          user?: Partial<UserState>
          sessions?: WorkoutSession[]
          locale?: AppLocale
        }
        return {
          ...current,
          ...p,
          locale: p.locale ?? current.locale,
          sessions: p.sessions ?? current.sessions,
          user: {
            ...initialUser(),
            ...current.user,
            ...(p.user ?? {}),
            bodyProfile:
              p.user?.bodyProfile ?? current.user.bodyProfile ?? null,
          },
        }
      },
    },
  ),
)

export function getSuggestedDay(): {
  weekNumber: number
  day: import('@/types').WorkoutDay
} | null {
  const { user } = useAppStore.getState()
  const w = getWeek(user.currentWeek)
  if (!w) return null
  const day = w.days[user.currentDayIndex]
  if (!day) return null
  return { weekNumber: user.currentWeek, day }
}

export { PROGRAM }
