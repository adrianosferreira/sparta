import { SectionHeader } from '@/components/SectionHeader'
import { PROGRAM, getWeek } from '@/data/program'
import { useTranslation } from '@/i18n/useTranslation'
import { workoutDayLabel } from '@/i18n/workoutDays'
import type { WorkoutDay } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { ChevronDown, Play } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const MONTH_KEYS = [
  'program.month1',
  'program.month2',
  'program.month3',
] as const

const MONTH_WEEKS = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
] as const

export function ProgramPage() {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const startSession = useAppStore((s) => s.startSession)
  const setSchedule = useAppStore((s) => s.setSchedule)
  const [openMonth, setOpenMonth] = useState<number | null>(0)
  const [openWeek, setOpenWeek] = useState<number | null>(null)
  const [preview, setPreview] = useState<{
    weekNumber: number
    day: WorkoutDay
  } | null>(null)

  const startDay = (weekNumber: number, day: WorkoutDay, dayIndex: number) => {
    const w = getWeek(weekNumber)
    const idx = w?.days.findIndex((d) => d.id === day.id) ?? dayIndex
    setSchedule(weekNumber, idx)
    startSession(weekNumber, day.id)
    navigate('/workout')
    setPreview(null)
  }

  return (
    <div className="space-y-4 px-4 pb-28 pt-6">
      <SectionHeader title={t('program.title')} subtitle={t('program.subtitle')} />

      {MONTH_KEYS.map((monthKey, mi) => {
        const monthOpen = openMonth === mi
        return (
          <div
            key={monthKey}
            className="overflow-hidden rounded-2xl border border-surface-border bg-surface"
          >
            <button
              type="button"
              onClick={() => setOpenMonth(monthOpen ? null : mi)}
              className="flex w-full items-center justify-between p-4 text-left active:bg-white/[0.03]"
            >
              <span className="font-bold text-white">{t(monthKey)}</span>
              <ChevronDown
                className={clsx(
                  'h-5 w-5 text-zinc-500 transition-transform',
                  monthOpen && 'rotate-180',
                )}
              />
            </button>
            {monthOpen ? (
              <div className="border-t border-surface-border px-2 pb-2">
                {MONTH_WEEKS[mi]!.map((wn) => {
                  const week = PROGRAM.weeks.find((w) => w.weekNumber === wn)
                  if (!week) return null
                  const wkOpen = openWeek === wn
                  return (
                    <div key={wn} className="mt-2 rounded-xl bg-black/20">
                      <button
                        type="button"
                        onClick={() => setOpenWeek(wkOpen ? null : wn)}
                        className="flex w-full items-center justify-between px-3 py-3 text-left"
                      >
                        <span className="text-sm font-bold text-zinc-300">
                          {t('program.week', { n: wn })}
                        </span>
                        <ChevronDown
                          className={clsx(
                            'h-4 w-4 text-zinc-600 transition-transform',
                            wkOpen && 'rotate-180',
                          )}
                        />
                      </button>
                      {wkOpen ? (
                        <ul className="space-y-1 px-2 pb-2">
                          {week.days.map((d) => (
                            <li key={d.id}>
                              <button
                                type="button"
                                onClick={() => setPreview({ weekNumber: wn, day: d })}
                                className="flex w-full items-center justify-between rounded-xl bg-surface-elevated px-3 py-3 text-left active:scale-[0.99]"
                              >
                                <span className="text-sm font-semibold text-white">
                                  {workoutDayLabel(d.id, locale)}
                                </span>
                                <span className="text-xs text-zinc-500">
                                  {t('program.blocks', { n: d.items.length })}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        )
      })}

      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-surface-border bg-surface-elevated p-6 shadow-2xl">
            <h2 className="text-lg font-black text-white">
              {workoutDayLabel(preview.day.id, locale)}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {t('program.week', { n: preview.weekNumber })}
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
              {preview.day.items.map((it) => (
                <li key={it.exerciseId} className="pl-1">
                  <span className="font-semibold text-white">
                    {t(`exercise.${it.exerciseId}`)}
                  </span>
                  <span className="text-zinc-500">
                    {' '}
                    — {it.prescription.sets} {t('units.sets')}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-zinc-600">{t('program.previewHint')}</p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex-1 rounded-xl border border-surface-border py-3.5 text-sm font-bold text-zinc-300"
              >
                {t('program.close')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const w = getWeek(preview.weekNumber)
                  const idx =
                    w?.days.findIndex((d) => d.id === preview.day.id) ?? 0
                  startDay(preview.weekNumber, preview.day, idx)
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-black text-black"
              >
                <Play className="h-4 w-4" fill="currentColor" />
                {t('program.start')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
