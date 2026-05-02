import { useTranslation } from '@/i18n/useTranslation'
import { Lock, Trophy } from 'lucide-react'
import clsx from 'clsx'

interface BadgeTileProps {
  badgeId: string
  unlocked: boolean
}

export function BadgeTile({ badgeId, unlocked }: BadgeTileProps) {
  const { t } = useTranslation()
  const title = t(`badge.${badgeId}.title`)
  const desc = t(`badge.${badgeId}.description`)
  return (
    <div
      className={clsx(
        'flex flex-col rounded-2xl border p-3 text-left transition-colors',
        unlocked
          ? 'border-accent/40 bg-accent/10'
          : 'border-surface-border bg-surface/80 opacity-60',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        {unlocked ? (
          <Trophy className="h-5 w-5 text-accent" aria-hidden />
        ) : (
          <Lock className="h-5 w-5 text-zinc-600" aria-hidden />
        )}
      </div>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mt-1 text-xs leading-snug text-zinc-500">{desc}</p>
    </div>
  )
}
