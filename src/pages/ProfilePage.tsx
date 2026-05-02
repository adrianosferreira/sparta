import { SectionHeader } from '@/components/SectionHeader'
import { BadgeTile } from '@/components/BadgeTile'
import { XpBar } from '@/components/XpBar'
import type { AppLocale } from '@/i18n/types'
import { useTranslation } from '@/i18n/useTranslation'
import { BADGE_RULES } from '@/lib/gamification'
import { useAppStore } from '@/store/useAppStore'
import { Download, Trash2 } from 'lucide-react'
import clsx from 'clsx'

export function ProfilePage() {
  const { t, locale, setLocale } = useTranslation()
  const user = useAppStore((s) => s.user)
  const sessions = useAppStore((s) => s.sessions)
  const resetProgress = useAppStore((s) => s.resetProgress)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ user, sessions, locale }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calisthenic-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onReset = () => {
    if (window.confirm(t('profile.resetConfirm'))) {
      resetProgress()
    }
  }

  const langBtn = (value: AppLocale, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setLocale(value)}
      className={clsx(
        'flex-1 rounded-xl border py-3 text-sm font-bold transition-colors',
        locale === value
          ? 'border-accent bg-accent/15 text-accent'
          : 'border-surface-border text-zinc-400 hover:text-white',
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-6 px-4 pb-28 pt-6">
      <SectionHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
          {t('profile.language')}
        </p>
        <div className="flex gap-2">
          {langBtn('en', t('profile.langEn'))}
          {langBtn('pt-BR', t('profile.langPtBr'))}
        </div>
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface p-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-zinc-400">
            {t('profile.levelLine', { n: user.level })}
          </p>
          <p className="text-xs text-zinc-600">
            {t('profile.totalXp', { xp: user.xp })}
          </p>
        </div>
        <XpBar xp={user.xp} className="mt-4" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-white">{t('profile.badges')}</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BADGE_RULES.map((b) => (
            <BadgeTile
              key={b.id}
              badgeId={b.id}
              unlocked={user.unlockedBadges.includes(b.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={exportJson}
          className="flex items-center justify-center gap-2 rounded-2xl border border-surface-border bg-surface-elevated py-4 text-sm font-bold text-white active:scale-[0.99]"
        >
          <Download className="h-4 w-4" />
          {t('profile.export')}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 py-4 text-sm font-bold text-red-400 active:scale-[0.99]"
        >
          <Trash2 className="h-4 w-4" />
          {t('profile.reset')}
        </button>
      </div>
    </div>
  )
}
