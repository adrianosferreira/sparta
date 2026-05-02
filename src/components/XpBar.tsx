import { useTranslation } from '@/i18n/useTranslation'
import { xpProgressInLevel } from '@/lib/gamification'

interface XpBarProps {
  xp: number
  className?: string
}

export function XpBar({ xp, className }: XpBarProps) {
  const { t } = useTranslation()
  const { level, inLevel, needed, pct } = xpProgressInLevel(xp)
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-zinc-400">
        <span>{t('xp.level', { n: level })}</span>
        <span>{t('xp.ratio', { cur: inLevel, need: needed })}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-border">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
