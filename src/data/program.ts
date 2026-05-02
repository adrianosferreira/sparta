import type {
  Prescription,
  PrescriptionNoteKey,
  Program,
  ProgramWeek,
  WorkoutDay,
  WorkoutItem,
} from '@/types'

const p = (
  exerciseId: string,
  sets: number,
  reps?: [number, number],
  durationSec?: [number, number],
  notesKey?: PrescriptionNoteKey,
): WorkoutItem => ({
  exerciseId,
  prescription: { sets, reps, durationSec, notesKey },
})

const month1FullBody = (): WorkoutItem[] => [
  p('warmup-cardio', 1, undefined, [300, 600]),
  p('push-up', 3, [8, 12]),
  p('pull-up-or-row', 3, [5, 8]),
  p('dip', 3, [8, 12]),
  p('squat', 3, [15, 20]),
  p('lunge', 3, [10, 15]),
  p('plank', 3, undefined, [30, 60]),
  p('cooldown-stretch', 1, undefined, [300, 600]),
]

const month2Upper = (withSkill: boolean): WorkoutItem[] => {
  const core: WorkoutItem[] = [
    p('warmup-cardio', 1, undefined, [300, 600]),
    p('push-up', 4, [10, 15]),
    p('pull-up-or-row', 4, [6, 10]),
    p('dip', 4, [10, 15]),
    p('pike-push-up', 3, [8, 12]),
    p('plank-to-push-up', 3, [10, 15]),
    p('cooldown-stretch', 1, undefined, [300, 600]),
  ]
  if (withSkill) {
    core.push(
      p('handstand-wall', 3, undefined, [20, 30], 'afterMain'),
      p('lsit-tuck', 3, undefined, [10, 15], 'afterMain'),
    )
  }
  return core
}

const month2Lower = (): WorkoutItem[] => [
  p('warmup-cardio', 1, undefined, [300, 600]),
  p('squat', 4, [20, 25]),
  p('lunge', 4, [15, 20]),
  p('glute-bridge', 3, [20, 25]),
  p('calf-raise', 3, [20, 25]),
  p('hanging-leg-raise', 3, [8, 12]),
  p('russian-twist', 3, [20, 20], undefined, 'repsPerSide'),
  p('cooldown-stretch', 1, undefined, [300, 600]),
]

const month3Upper = (withSkill: boolean): WorkoutItem[] => {
  const core: WorkoutItem[] = [
    p('warmup-cardio', 1, undefined, [300, 600]),
    p('decline-push-up', 4, [10, 15]),
    p('pull-up-or-row', 4, [8, 12]),
    p('dip', 4, [10, 15]),
    p('archer-push-up', 3, [6, 10]),
    p('plank-to-push-up', 3, [15, 20]),
    p('cooldown-stretch', 1, undefined, [300, 600]),
  ]
  if (withSkill) {
    core.push(
      p('handstand-free', 3, undefined, [20, 30], 'skillTraining'),
      p('lsit-hold', 3, undefined, [10, 20], 'skillTraining'),
      p('muscle-up-progression', 3, [3, 5], undefined, 'skillTraining'),
    )
  }
  return core
}

const month3Lower = (): WorkoutItem[] => [
  p('warmup-cardio', 1, undefined, [300, 600]),
  p('pistol-squat-assisted', 4, [6, 10]),
  p('bulgarian-split-squat', 4, [10, 15]),
  p('single-leg-glute-bridge', 3, [15, 20]),
  p('calf-raise', 3, [25, 30]),
  p('hanging-leg-raise', 3, [10, 15]),
  p('windshield-wiper', 3, [10, 15]),
  p('cooldown-stretch', 1, undefined, [300, 600]),
]

function day(id: string, name: string, items: WorkoutItem[]): WorkoutDay {
  return { id, name, items }
}

function buildWeeks1to4(): ProgramWeek[] {
  const body = month1FullBody()
  return [1, 2, 3, 4].map((weekNumber) => ({
    weekNumber,
    days: [
      day(`w${weekNumber}-mon`, 'Monday — full body', body),
      day(`w${weekNumber}-wed`, 'Wednesday — full body', body),
      day(`w${weekNumber}-fri`, 'Friday — full body', body),
    ],
  }))
}

function buildWeeks5to8(): ProgramWeek[] {
  return [5, 6, 7, 8].map((weekNumber) => ({
    weekNumber,
    days: [
      day(
        `w${weekNumber}-d1`,
        'Day 1 — upper body + skill',
        month2Upper(true),
      ),
      day(`w${weekNumber}-d2`, 'Day 2 — lower + core + skill', [
        ...month2Lower(),
        p('handstand-wall', 3, undefined, [20, 30], 'skillAfterMain'),
        p('lsit-tuck', 3, undefined, [10, 15], 'skillAfterMain'),
      ]),
      day(`w${weekNumber}-d3`, 'Day 3 — lower + core', month2Lower()),
      day(
        `w${weekNumber}-d4`,
        'Day 4 — upper body + skill',
        month2Upper(true),
      ),
    ],
  }))
}

function buildWeeks9to12(): ProgramWeek[] {
  return [9, 10, 11, 12].map((weekNumber) => ({
    weekNumber,
    days: [
      day(
        `w${weekNumber}-d1`,
        'Day 1 — upper + skill',
        month3Upper(true),
      ),
      day(`w${weekNumber}-d2`, 'Day 2 — lower + core + skill', [
        ...month3Lower(),
        p('handstand-free', 3, undefined, [20, 30], 'skill'),
        p('lsit-hold', 3, undefined, [10, 20], 'skill'),
        p('muscle-up-progression', 3, [3, 5], undefined, 'skill'),
      ]),
      day(`w${weekNumber}-d3`, 'Day 3 — lower + core + skill', [
        ...month3Lower(),
        p('handstand-free', 3, undefined, [20, 30], 'skill'),
        p('lsit-hold', 3, undefined, [10, 20], 'skill'),
      ]),
      day(
        `w${weekNumber}-d4`,
        'Day 4 — upper + skill',
        month3Upper(true),
      ),
    ],
  }))
}

export const PROGRAM: Program = {
  id: 'beginner-12w',
  name: 'Beginner 3-month foundation',
  weeks: [...buildWeeks1to4(), ...buildWeeks5to8(), ...buildWeeks9to12()],
}

export function getWeek(weekNumber: number): ProgramWeek | undefined {
  return PROGRAM.weeks.find((w) => w.weekNumber === weekNumber)
}

export function getDay(
  weekNumber: number,
  dayId: string,
): WorkoutDay | undefined {
  const w = getWeek(weekNumber)
  return w?.days.find((d) => d.id === dayId)
}

export function getPrescriptionForExercise(
  day: WorkoutDay,
  exerciseId: string,
): Prescription | undefined {
  return day.items.find((i) => i.exerciseId === exerciseId)?.prescription
}

export function allProgramExerciseIds(): string[] {
  const ids = new Set<string>()
  for (const w of PROGRAM.weeks) {
    for (const d of w.days) {
      for (const item of d.items) ids.add(item.exerciseId)
    }
  }
  return [...ids]
}
