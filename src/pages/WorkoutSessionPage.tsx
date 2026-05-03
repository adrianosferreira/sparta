import { ExerciseCard } from '@/components/ExerciseCard'
import { RestTimer } from '@/components/RestTimer'
import { ShareWorkoutImageButton } from '@/components/ShareWorkoutImageButton'
import { SetLogger } from '@/components/SetLogger'
import { getDay } from '@/data/program'
import { workoutDayLabel } from '@/i18n/workoutDays'
import { useTranslation } from '@/i18n/useTranslation'
import { computeSessionXp } from '@/lib/gamification'
import { isProfileCompleteForKcal, sessionKcalTotal } from '@/lib/kcal'
import { buildWorkoutShareSnapshot } from '@/lib/workoutSharePayload'
import {
  lastTwoLoggedSetsSameExercise,
  resolveRestSeconds,
} from '@/lib/restTimes'
import { useAppStore } from '@/store/useAppStore'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Flame } from 'lucide-react'

export function WorkoutSessionPage() {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const activeSession = useAppStore((s) => s.activeSession)
  const bodyProfile = useAppStore((s) => s.user.bodyProfile)
  const logSet = useAppStore((s) => s.logSet)
  const undoLastSet = useAppStore((s) => s.undoLastSet)
  const completeSession = useAppStore((s) => s.completeSession)
  const abandonActiveSession = useAppStore((s) => s.abandonActiveSession)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [restKey, setRestKey] = useState(0)
  const [showRest, setShowRest] = useState(false)
  const [restSeconds, setRestSeconds] = useState(60)
  const [restVariant, setRestVariant] = useState<'intra' | 'inter' | undefined>(
    undefined,
  )

  const day = useMemo(() => {
    if (!activeSession) return null
    return getDay(activeSession.weekNumber, activeSession.dayId)
  }, [activeSession])

  const previewXp = useMemo(() => {
    if (!activeSession) return 0
    return computeSessionXp({
      ...activeSession,
      completedAt: new Date().toISOString(),
    })
  }, [activeSession])

  const previewKcal = useMemo(() => {
    if (!activeSession) return undefined
    return sessionKcalTotal(activeSession.logs)
  }, [activeSession])

  const kcalEnabled = isProfileCompleteForKcal(bodyProfile)

  const shareSnapshot = useMemo(() => {
    if (!activeSession || !day) return null
    const endTime = new Date()
    return buildWorkoutShareSnapshot({
      session: activeSession,
      day,
      dayTitle: workoutDayLabel(day.id, locale),
      weekLabel: t('workout.week', { n: activeSession.weekNumber }),
      locale,
      getExerciseName: (id) => t(`exercise.${id}`),
      xp: previewXp,
      kcal:
        kcalEnabled && previewKcal != null && previewKcal > 0
          ? previewKcal
          : undefined,
      endTime,
      labels: {
        activity: t('workout.shareCardActivity'),
        duration: t('workout.shareCardDuration'),
        volume: t('workout.shareCardVolume'),
        xp: t('workout.shareCardXp'),
        sets: t('workout.shareCardSets'),
        moves: t('workout.shareCardMoves'),
        kcal: t('workout.shareCardKcal'),
      },
    })
  }, [activeSession, day, locale, previewXp, previewKcal, kcalEnabled, t])

  if (!activeSession || !day) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-zinc-500">{t('workout.noActive')}</p>
        <Link
          to="/"
          className="rounded-xl bg-accent px-6 py-3 font-bold text-black"
        >
          {t('workout.backToday')}
        </Link>
      </div>
    )
  }

  const dayTitle = workoutDayLabel(day.id, locale)

  const handleLog = (exerciseId: string) => {
    return (data: Parameters<typeof logSet>[1]) => {
      logSet(exerciseId, data)
      const session = useAppStore.getState().activeSession
      if (session) {
        const intra = lastTwoLoggedSetsSameExercise(session)
        setRestSeconds(resolveRestSeconds(exerciseId, intra))
        setRestVariant(intra ? 'intra' : 'inter')
      }
      setRestKey((k) => k + 1)
      setShowRest(true)
    }
  }

  const finish = () => {
    completeSession()
    setShowSummary(false)
    navigate('/')
  }

  useEffect(() => {
    document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en'
  }, [locale])

  return (
    <div className="relative min-h-dvh pb-36">
      <header className="sticky top-0 z-10 border-b border-surface-border bg-[#0a0a0a]/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase text-accent">
              {t('workout.week', { n: activeSession.weekNumber })}
            </p>
            <h1 className="truncate text-lg font-black text-white">{dayTitle}</h1>
          </div>
          {kcalEnabled && previewKcal != null && previewKcal > 0 ? (
            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-surface-border bg-surface-elevated px-2.5 py-1.5 text-xs font-bold text-accent">
              <Flame className="h-3.5 w-3.5" aria-hidden />
              <span>{t('workout.sessionKcal', { kcal: previewKcal })}</span>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-3 px-4 pt-4">
        {day.items.map((item) => {
          const log =
            activeSession.logs.find((l) => l.exerciseId === item.exerciseId) ?? {
              exerciseId: item.exerciseId,
              sets: [],
            }
          const expanded = expandedId === item.exerciseId
          return (
            <ExerciseCard
              key={item.exerciseId}
              exerciseId={item.exerciseId}
              prescription={item.prescription}
              log={log}
              expanded={expanded}
              onToggle={() =>
                setExpandedId(expanded ? null : item.exerciseId)
              }
            >
              <SetLogger
                exerciseId={item.exerciseId}
                prescription={item.prescription}
                loggedCount={log.sets.length}
                targetSets={item.prescription.sets}
                onLog={handleLog(item.exerciseId)}
                onUndo={() => undoLastSet(item.exerciseId)}
              />
            </ExerciseCard>
          )
        })}
      </div>

      {showRest ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rest-dialog-title"
        >
          <div className="w-full max-w-md">
            <p id="rest-dialog-title" className="sr-only">
              {t('rest.title')}
            </p>
            <RestTimer
              key={restKey}
              seconds={restSeconds}
              variant={restVariant}
              onDismiss={() => setShowRest(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 border-t border-surface-border bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t('workout.discardConfirm'))) {
                abandonActiveSession()
                navigate('/')
              }
            }}
            className="rounded-xl border border-surface-border px-4 py-3.5 text-sm font-bold text-zinc-400 hover:text-white"
          >
            {t('workout.discard')}
          </button>
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className="flex-1 rounded-xl bg-accent py-3.5 text-sm font-black text-black active:scale-[0.99]"
          >
            {t('workout.finishWorkout')}
          </button>
        </div>
      </div>

      {showSummary ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-surface-border bg-surface-elevated p-6 shadow-2xl">
            <h2 id="summary-title" className="text-xl font-black text-white">
              {t('workout.summaryTitle')}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {t('workout.summaryBody', { xp: previewXp })}
            </p>
            {kcalEnabled && previewKcal != null && previewKcal > 0 ? (
              <p className="mt-2 text-sm font-bold text-accent">
                {t('workout.summaryKcal', { kcal: previewKcal })}
              </p>
            ) : !kcalEnabled ? (
              <p className="mt-2 text-xs text-zinc-500">
                {t('workout.summaryKcalHint')}{' '}
                <Link to="/profile" className="font-bold text-accent underline">
                  {t('workout.summaryKcalProfileLink')}
                </Link>
              </p>
            ) : null}
            {shareSnapshot ? (
              <div className="mt-5 space-y-2">
                <ShareWorkoutImageButton snapshot={shareSnapshot} />
                <p className="text-center text-xs text-zinc-600">{t('workout.shareImageHint')}</p>
              </div>
            ) : null}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="flex-1 rounded-xl border border-surface-border py-3.5 text-sm font-bold text-zinc-300"
              >
                {t('workout.keepTraining')}
              </button>
              <button
                type="button"
                onClick={finish}
                className="flex-1 rounded-xl bg-accent py-3.5 text-sm font-black text-black"
              >
                {t('workout.saveExit')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
