import { useTranslation } from '@/i18n/useTranslation'
import { useTimer } from '@/hooks/useTimer'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface RestTimerProps {
  seconds: number
  onDismiss: () => void
}

export function RestTimer({ seconds, onDismiss }: RestTimerProps) {
  const { t } = useTranslation()
  const { remaining, running, start, pause, reset } = useTimer(seconds)
  const secRef = useRef(seconds)
  secRef.current = seconds

  useEffect(() => {
    reset(secRef.current)
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount via parent `key` for each rest
  }, [])

  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0

  return (
    <div className="animate-pulseSoft rounded-2xl border border-accent/25 bg-accent/10 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-accent">{t('rest.title')}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-semibold text-zinc-500 hover:text-white"
        >
          {t('rest.skip')}
        </button>
      </div>
      <p className="mb-3 text-center text-3xl font-black tabular-nums text-white">
        {remaining}s
      </p>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => (running ? pause() : start())}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-surface-elevated py-3 text-sm font-bold text-white active:scale-[0.98]"
        >
          {running ? (
            <>
              <Pause className="h-4 w-4" /> {t('rest.pause')}
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> {t('rest.resume')}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            reset(seconds)
            start()
          }}
          className="flex items-center justify-center rounded-xl bg-surface-elevated px-4 py-3 active:scale-[0.98]"
          aria-label={t('rest.resetAria')}
        >
          <RotateCcw className="h-4 w-4 text-zinc-300" />
        </button>
      </div>
    </div>
  )
}
