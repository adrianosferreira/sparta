import { WorkoutShareCard } from '@/components/WorkoutShareCard'
import type { WorkoutShareSnapshot } from '@/lib/workoutSharePayload'
import { useTranslation } from '@/i18n/useTranslation'
import { toBlob } from 'html-to-image'
import { Camera, Loader2 } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

interface ShareWorkoutImageButtonProps {
  snapshot: WorkoutShareSnapshot
  disabled?: boolean
}

export function ShareWorkoutImageButton({
  snapshot,
  disabled,
}: ShareWorkoutImageButtonProps) {
  const { t } = useTranslation()
  const captureRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  const exportPng = useCallback(async () => {
    const node = captureRef.current
    if (!node) return
    setBusy(true)
    try {
      const blob = await toBlob(node, {
        width: 1080,
        height: 1350,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: '#0a0a0a',
      })
      if (!blob) {
        window.alert(t('workout.shareImageError'))
        return
      }
      const file = new File([blob], 'sparta-workout.png', {
        type: 'image/png',
      })

      const canFiles =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })

      if (canFiles) {
        try {
          await navigator.share({
            files: [file],
            title: t('workout.shareImageTitle'),
            text: t('workout.shareImageText'),
          })
          return
        } catch (e) {
          if ((e as Error).name === 'AbortError') return
        }
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sparta-workout.png'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.alert(t('workout.shareImageError'))
    } finally {
      setBusy(false)
    }
  }, [t])

  return (
    <>
      <div
        className="pointer-events-none fixed left-[-12000px] top-0 z-0 overflow-hidden"
        aria-hidden
      >
        <WorkoutShareCard ref={captureRef} snapshot={snapshot} />
      </div>
      <button
        type="button"
        disabled={disabled || busy || snapshot.totalSets < 1}
        onClick={() => void exportPng()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/50 bg-accent/10 py-3.5 text-sm font-bold text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Camera className="h-4 w-4" aria-hidden />
        )}
        {busy ? t('workout.shareImageWorking') : t('workout.shareImageInstagram')}
      </button>
    </>
  )
}
