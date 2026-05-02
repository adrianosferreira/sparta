import { useTranslation } from '@/i18n/useTranslation'
import { useAppStore } from '@/store/useAppStore'
import { Trophy, X } from 'lucide-react'
import { useEffect } from 'react'

export function AchievementToast() {
  const { t } = useTranslation()
  const pending = useAppStore((s) => s.pendingBadgeIds)
  const dismiss = useAppStore((s) => s.dismissBadgeToast)

  useEffect(() => {
    if (pending.length === 0) return
    const timer = window.setTimeout(() => dismiss(), 6000)
    return () => window.clearTimeout(timer)
  }, [pending, dismiss])

  if (pending.length === 0) return null

  return (
    <div
      className="pointer-events-auto fixed left-1/2 top-4 z-50 w-[min(100%-1.5rem,28rem)] -translate-x-1/2"
      role="status"
    >
      <div className="rounded-2xl border border-accent/30 bg-surface-elevated p-4 shadow-xl shadow-black/40">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20">
            <Trophy className="h-5 w-5 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              {t('achievement.title')}
            </p>
            {pending.map((id) => (
              <p key={id} className="mt-1 font-bold text-white">
                {t(`badge.${id}.title`)}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => dismiss()}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
            aria-label={t('achievement.dismiss')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
