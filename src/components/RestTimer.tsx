import { useTranslation } from '@/i18n/useTranslation'
import { useTimer } from '@/hooks/useTimer'
import { playRestTimerComplete, primeRestTimerAudio } from '@/lib/restTimerSound'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

interface RestTimerProps {
  seconds: number
  /** Same exercise = shorter rest; switched exercise = longer rest. */
  variant?: 'intra' | 'inter'
  onDismiss: () => void
}

export function RestTimer({ seconds, variant, onDismiss }: RestTimerProps) {
  const { t } = useTranslation()
  const onFinish = useCallback(() => {
    playRestTimerComplete()
    onDismiss()
  }, [onDismiss])
  const { remaining, running, start, pause, reset } = useTimer(seconds, onFinish)
  const secRef = useRef(seconds)
  secRef.current = seconds

  useEffect(() => {
    reset(secRef.current)
    start()
    primeRestTimerAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount via parent `key` for each rest
  }, [])

  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0

  return (
    <div className="animate-pulseSoft rounded-2xl border border-accent/25 bg-accent/10 p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-accent">{t('rest.title')}</p>
          {variant ? (
            <p className="mt-0.5 text-xs text-zinc-500">
              {variant === 'intra' ? t('rest.hintIntra') : t('rest.hintInter')}
            </p>
          ) : null}
        </div>
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
          onClick={() => {
            primeRestTimerAudio()
            running ? pause() : start()
          }}
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
            primeRestTimerAudio()
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
