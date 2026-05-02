import { EXERCISE_BY_ID } from '@/data/exercises'
import { useTranslation } from '@/i18n/useTranslation'
import { formatPrescription } from '@/lib/formatPrescription'
import type { ExerciseLog, Prescription } from '@/types'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

interface ExerciseCardProps {
  exerciseId: string
  prescription: Prescription
  log: ExerciseLog
  expanded: boolean
  onToggle: () => void
  children?: React.ReactNode
}

export function ExerciseCard({
  exerciseId,
  prescription,
  log,
  expanded,
  onToggle,
  children,
}: ExerciseCardProps) {
  const { t } = useTranslation()
  const ex = EXERCISE_BY_ID[exerciseId]
  if (!ex) return null
  const target = prescription.sets
  const done = log.sets.length
  const name = t(`exercise.${exerciseId}`)
  const summary = log.sets
    .map((s) => {
      if (s.reps != null) return `${s.reps}`
      if (s.durationSec != null) return `${s.durationSec}s`
      if (s.perSide) return `${s.perSide.left}/${s.perSide.right}`
      return '—'
    })
    .join(' · ')

  return (
    <div
      className={clsx(
        'rounded-2xl border transition-colors',
        expanded
          ? 'border-accent/40 bg-surface-elevated'
          : 'border-surface-border bg-surface',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-4 text-left active:bg-white/[0.03]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
              {t(`category.${ex.category}`)}
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              {done}/{target} {t('units.sets')}
            </span>
          </div>
          <h3 className="mt-1 font-bold text-white">{name}</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {formatPrescription(ex, prescription, t)}
          </p>
          {summary ? (
            <p className="mt-2 text-xs font-mono text-accent/90">{summary}</p>
          ) : null}
        </div>
        <ChevronDown
          className={clsx(
            'mt-1 h-5 w-5 shrink-0 text-zinc-500 transition-transform',
            expanded && 'rotate-180',
          )}
        />
      </button>
      {expanded ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  )
}
