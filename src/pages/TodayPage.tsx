import { SectionHeader } from '@/components/SectionHeader'
import { StreakBadge } from '@/components/StreakBadge'
import { XpBar } from '@/components/XpBar'
import { workoutDayLabel } from '@/i18n/workoutDays'
import { useTranslation } from '@/i18n/useTranslation'
import { isProfileCompleteForKcal } from '@/lib/kcal'
import { getSuggestedDay, useAppStore } from '@/store/useAppStore'
import { ArrowRight, Play } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export function TodayPage() {
  const { t, locale } = useTranslation()
  const user = useAppStore((s) => s.user)
  const showKcalHint = !isProfileCompleteForKcal(user.bodyProfile)
  const activeSession = useAppStore((s) => s.activeSession)
  const startSession = useAppStore((s) => s.startSession)
  const navigate = useNavigate()

  const suggested = getSuggestedDay()

  const onStart = () => {
    if (!suggested) return
    startSession(suggested.weekNumber, suggested.day.id)
    navigate('/workout')
  }

  const onResume = () => {
    navigate('/workout')
  }

  const nextSessionSubtitle = suggested
    ? workoutDayLabel(suggested.day.id, locale)
    : t('today.nextSessionFallback')

  return (
    <div className="space-y-6 px-4 pb-28 pt-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
          {t('today.brand')}
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
          {t('today.heroTitle')}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">{t('today.heroBody')}</p>
      </header>

      <XpBar xp={user.xp} />

      <div className="flex flex-wrap items-center gap-3">
        <StreakBadge days={user.streakDays} />
        <span className="text-sm text-zinc-500">
          {t('today.weekOf', { n: user.currentWeek })}
        </span>
      </div>

      <section className="rounded-3xl border border-surface-border bg-gradient-to-br from-surface to-surface-elevated p-5 shadow-lg shadow-black/30">
        <SectionHeader
          title={t('today.nextSession')}
          subtitle={nextSessionSubtitle}
        />
        {suggested ? (
          <p className="mb-4 text-sm text-zinc-400">
            {t('today.exerciseCount', { n: suggested.day.items.length })}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {activeSession ? (
            <button
              type="button"
              onClick={onResume}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-base font-black text-black active:scale-[0.99]"
            >
              <Play className="h-5 w-5" fill="currentColor" />
              {t('today.resumeWorkout')}
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              disabled={!suggested}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-base font-black text-black disabled:opacity-40 active:scale-[0.99]"
            >
              <Play className="h-5 w-5" fill="currentColor" />
              {t('today.startWorkout')}
            </button>
          )}
          <Link
            to="/program"
            className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-zinc-400 hover:text-white"
          >
            {t('today.browseProgram')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {showKcalHint ? (
            <p className="rounded-xl border border-surface-border bg-black/20 px-3 py-2 text-center text-xs text-zinc-500">
              {t('today.kcalProfileHint')}{' '}
              <Link to="/profile" className="font-bold text-accent underline">
                {t('today.kcalProfileLink')}
              </Link>
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
