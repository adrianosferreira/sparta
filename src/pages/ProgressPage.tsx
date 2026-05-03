import { SectionHeader } from '@/components/SectionHeader'
import { EXERCISES } from '@/data/exercises'
import { allProgramExerciseIds } from '@/data/program'
import { useTranslation } from '@/i18n/useTranslation'
import { totalKcalFromSessions } from '@/lib/kcal'
import {
  chartPointsForExercise,
  sumMetricForExercise,
} from '@/lib/sessionStats'
import { useAppStore } from '@/store/useAppStore'
import { useMemo, useState } from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function ProgressPage() {
  const { t } = useTranslation()
  const sessions = useAppStore((s) => s.sessions)
  const completed = useMemo(
    () => sessions.filter((s) => s.completedAt),
    [sessions],
  )

  const ids = useMemo(() => {
    const set = new Set(allProgramExerciseIds())
    return EXERCISES.filter((e) => set.has(e.id))
  }, [])

  const [exerciseId, setExerciseId] = useState(ids[0]?.id ?? 'push-up')

  const chartData = useMemo(
    () => chartPointsForExercise(exerciseId, sessions),
    [exerciseId, sessions],
  )

  const totals = useMemo(
    () => sumMetricForExercise(exerciseId, sessions),
    [exerciseId, sessions],
  )

  const ex = EXERCISES.find((e) => e.id === exerciseId)

  const workoutDates = useMemo(() => {
    const dates = new Set<string>()
    for (const s of completed) {
      if (s.completedAt) dates.add(s.completedAt.slice(0, 10))
    }
    return [...dates].sort().reverse()
  }, [completed])

  const totalKcal = useMemo(() => totalKcalFromSessions(sessions), [sessions])

  const yLabel =
    ex?.tracking === 'time'
      ? t('progress.chartLabelTime')
      : ex?.tracking === 'reps-per-side'
        ? t('progress.chartLabelSide')
        : t('progress.chartLabelReps')

  return (
    <div className="space-y-6 px-4 pb-28 pt-6">
      <SectionHeader title={t('progress.title')} subtitle={t('progress.subtitle')} />

      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-500">
          {t('progress.exercise')}
        </span>
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-sm font-semibold text-white"
        >
          {ids.map((e) => (
            <option key={e.id} value={e.id}>
              {t(`exercise.${e.id}`)}
            </option>
          ))}
        </select>
      </label>

      <div className="rounded-2xl border border-surface-border bg-surface p-4">
        <p className="text-xs font-bold uppercase text-zinc-500">{yLabel}</p>
        <div className="mt-4 h-56 w-full">
          {chartData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-zinc-500">
              {t('progress.chartEmpty')}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10 }} width={32} />
                <Tooltip
                  contentStyle={{
                    background: '#1c1c1c',
                    border: '1px solid #2a2a2a',
                    borderRadius: 12,
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Line
                  type="monotone"
                  dataKey="best"
                  stroke="#a3e635"
                  strokeWidth={2}
                  dot={{ fill: '#a3e635', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-surface-border bg-surface-elevated p-4">
          <p className="text-xs font-bold uppercase text-zinc-500">
            {t('progress.sessions')}
          </p>
          <p className="mt-2 text-2xl font-black text-white">{completed.length}</p>
        </div>
        <div className="rounded-2xl border border-surface-border bg-surface-elevated p-4">
          <p className="text-xs font-bold uppercase text-zinc-500">
            {t('progress.thisExercise')}
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-300">
            {ex?.tracking === 'time' ? (
              <>
                <span className="text-2xl font-black text-white">
                  {totals.totalSeconds}
                </span>{' '}
                {t('progress.secLogged')}
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-white">
                  {totals.totalReps}
                </span>{' '}
                {t('progress.repsLogged')}
              </>
            )}
          </p>
        </div>
        <div className="col-span-2 rounded-2xl border border-surface-border bg-surface-elevated p-4">
          <p className="text-xs font-bold uppercase text-zinc-500">
            {t('progress.totalKcal')}
          </p>
          <p className="mt-2 text-2xl font-black text-accent">
            {totalKcal > 0 ? t('progress.totalKcalValue', { kcal: totalKcal }) : '—'}
          </p>
          <p className="mt-1 text-xs text-zinc-600">{t('progress.totalKcalHint')}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-white">
          {t('progress.workoutDays')}
        </h3>
        <ul className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-surface-border bg-surface p-2 text-sm text-zinc-400">
          {workoutDates.length === 0 ? (
            <li className="px-2 py-2 text-zinc-500">{t('progress.noSessions')}</li>
          ) : (
            workoutDates.map((d) => (
              <li
                key={d}
                className="rounded-lg px-2 py-2 font-mono text-xs text-accent/90"
              >
                {d}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
