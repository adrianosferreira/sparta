import { useTranslation } from '@/i18n/useTranslation'
import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  days: number
}

export function StreakBadge({ days }: StreakBadgeProps) {
  const { t } = useTranslation()
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-elevated px-3 py-1.5 text-sm font-bold text-accent">
      <Flame className="h-4 w-4 shrink-0" aria-hidden />
      <span>{t('streak.days', { n: days })}</span>
    </div>
  )
}
