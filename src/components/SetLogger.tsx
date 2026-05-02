import { EXERCISE_BY_ID } from '@/data/exercises'
import { useTranslation } from '@/i18n/useTranslation'
import { useLongPressStep } from '@/hooks/useLongPressStep'
import type { LoggedSet, Prescription } from '@/types'
import { Check, Minus, Plus, Undo2 } from 'lucide-react'
import { useMemo, useState } from 'react'

interface SetLoggerProps {
  exerciseId: string
  prescription: Prescription
  loggedCount: number
  targetSets: number
  onLog: (data: Pick<LoggedSet, 'reps' | 'durationSec' | 'perSide'>) => void
  onUndo: () => void
}

export function SetLogger({
  exerciseId,
  prescription,
  loggedCount,
  targetSets,
  onLog,
  onUndo,
}: SetLoggerProps) {
  const { t } = useTranslation()
  const ex = EXERCISE_BY_ID[exerciseId]
  if (!ex) return null

  const defaultReps = prescription.reps?.[0] ?? 8
  const defaultSec = prescription.durationSec?.[0] ?? 30
  const [reps, setReps] = useState(defaultReps)
  const [sec, setSec] = useState(defaultSec)
  const [left, setLeft] = useState(prescription.reps?.[0] ?? 8)
  const [right, setRight] = useState(prescription.reps?.[0] ?? 8)

  const repPlusBurst = useMemo(
    () => () => setReps((r) => r + 5),
    [],
  )
  const repMinusBurst = useMemo(
    () => () => setReps((r) => Math.max(0, r - 5)),
    [],
  )
  const lpPlus = useLongPressStep(repPlusBurst)
  const lpMinus = useLongPressStep(repMinusBurst)

  const sidePlusL = useLongPressStep(() => setLeft((v) => v + 5))
  const sideMinusL = useLongPressStep(() => setLeft((v) => Math.max(0, v - 5)))
  const sidePlusR = useLongPressStep(() => setRight((v) => v + 5))
  const sideMinusR = useLongPressStep(() => setRight((v) => Math.max(0, v - 5)))

  const timePlusBurst = useLongPressStep(() => setSec((s) => s + 15))
  const timeMinusBurst = useLongPressStep(() =>
    setSec((s) => Math.max(0, s - 15)),
  )

  const done = () => {
    if (ex.tracking === 'reps') onLog({ reps })
    else if (ex.tracking === 'time') onLog({ durationSec: sec })
    else onLog({ perSide: { left, right } })
  }

  const atTarget = loggedCount >= targetSets

  const leftLabel = t('setLogger.sideLeft')
  const rightLabel = t('setLogger.sideRight')

  return (
    <div className="mt-3 space-y-4 border-t border-surface-border pt-3">
      {ex.tracking === 'reps' && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated text-white active:scale-95"
            onClick={() => setReps((r) => Math.max(0, r - 1))}
            onPointerDown={lpMinus.onPointerDown}
            onPointerUp={lpMinus.onPointerUp}
            onPointerLeave={lpMinus.onPointerLeave}
            aria-label="Decrease reps"
          >
            <Minus className="h-6 w-6" />
          </button>
          <span className="min-w-[4rem] text-center text-3xl font-black tabular-nums text-white">
            {reps}
          </span>
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated text-white active:scale-95"
            onClick={() => setReps((r) => r + 1)}
            onPointerDown={lpPlus.onPointerDown}
            onPointerUp={lpPlus.onPointerUp}
            onPointerLeave={lpPlus.onPointerLeave}
            aria-label="Increase reps"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      )}

      {ex.tracking === 'time' && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated active:scale-95"
            onClick={() => setSec((s) => Math.max(0, s - 5))}
            onPointerDown={timeMinusBurst.onPointerDown}
            onPointerUp={timeMinusBurst.onPointerUp}
            onPointerLeave={timeMinusBurst.onPointerLeave}
            aria-label="Decrease seconds"
          >
            <Minus className="h-6 w-6" />
          </button>
          <span className="min-w-[5rem] text-center text-3xl font-black tabular-nums text-white">
            {sec}s
          </span>
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated active:scale-95"
            onClick={() => setSec((s) => s + 5)}
            onPointerDown={timePlusBurst.onPointerDown}
            onPointerUp={timePlusBurst.onPointerUp}
            onPointerLeave={timePlusBurst.onPointerLeave}
            aria-label="Increase seconds"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      )}

      {ex.tracking === 'reps-per-side' && (
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              [leftLabel, left, setLeft, sidePlusL, sideMinusL] as const,
              [rightLabel, right, setRight, sidePlusR, sideMinusR] as const,
            ] as const
          ).map(([label, val, setV, lpP, lpM]) => (
            <div key={label} className="rounded-2xl bg-surface-elevated p-3">
              <p className="mb-2 text-center text-xs font-bold uppercase text-zinc-500">
                {label}
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/30 active:scale-95"
                  onClick={() => setV((v: number) => Math.max(0, v - 1))}
                  onPointerDown={lpM.onPointerDown}
                  onPointerUp={lpM.onPointerUp}
                  onPointerLeave={lpM.onPointerLeave}
                  aria-label={`${label} minus`}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="min-w-[2.5rem] text-center text-xl font-black text-white">
                  {val}
                </span>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/30 active:scale-95"
                  onClick={() => setV((v: number) => v + 1)}
                  onPointerDown={lpP.onPointerDown}
                  onPointerUp={lpP.onPointerUp}
                  onPointerLeave={lpP.onPointerLeave}
                  aria-label={`${label} plus`}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-zinc-500">{t('setLogger.holdHint')}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={loggedCount === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-border py-3.5 text-sm font-bold text-zinc-300 disabled:opacity-40 active:scale-[0.98]"
        >
          <Undo2 className="h-4 w-4" />
          {t('setLogger.undoSet')}
        </button>
        <button
          type="button"
          onClick={done}
          disabled={atTarget}
          className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-black text-black disabled:opacity-40 active:scale-[0.98]"
        >
          <Check className="h-4 w-4" />
          {t('setLogger.logSet', { done: loggedCount, target: targetSets })}
        </button>
      </div>
    </div>
  )
}
