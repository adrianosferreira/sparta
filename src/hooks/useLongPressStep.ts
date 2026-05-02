import { useCallback, useEffect, useRef } from 'react'

/** While held after delay, call onBurst every interval (e.g. +5 steps). */
export function useLongPressStep(
  onBurst: () => void,
  options?: { delayMs?: number; intervalMs?: number },
) {
  const delayMs = options?.delayMs ?? 450
  const intervalMs = options?.intervalMs ?? 120
  const timeoutRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)

  const clear = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    timeoutRef.current = null
    intervalRef.current = null
  }, [])

  useEffect(() => () => clear(), [clear])

  const onPointerDown = useCallback(() => {
    clear()
    timeoutRef.current = window.setTimeout(() => {
      onBurst()
      intervalRef.current = window.setInterval(onBurst, intervalMs)
    }, delayMs)
  }, [clear, intervalMs, delayMs, onBurst])

  const onPointerUp = useCallback(() => {
    clear()
  }, [clear])

  return { onPointerDown, onPointerUp, onPointerLeave: onPointerUp }
}
