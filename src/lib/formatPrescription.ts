import type { ExerciseDef } from '@/types'
import type { Prescription } from '@/types'

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string

export function formatPrescription(
  ex: ExerciseDef,
  pr: Prescription,
  t: TranslateFn,
): string {
  const parts: string[] = []
  if (pr.sets) parts.push(`${pr.sets} ${t('units.sets')}`)
  if (ex.tracking === 'time' && pr.durationSec) {
    const [a, b] = pr.durationSec
    parts.push(t('units.secondsRange', { a, b }))
  }
  if (ex.tracking === 'reps' && pr.reps) {
    const [a, b] = pr.reps
    parts.push(`${a}–${b} ${t('units.reps')}`)
  }
  if (ex.tracking === 'reps-per-side' && pr.reps) {
    const [a, b] = pr.reps
    parts.push(`${a}–${b} ${t('units.perSide')}`)
  }
  if (pr.notesKey) parts.push(t(`prescriptionNotes.${pr.notesKey}`))
  else if (pr.notes) parts.push(pr.notes)
  return parts.join(' · ')
}
