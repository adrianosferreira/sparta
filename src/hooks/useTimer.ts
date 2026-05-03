import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimer(
  initialSeconds: number,
  onFinish?: () => void,
) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const tickRef = useRef<number | null>(null)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  const reset = useCallback((sec?: number) => {
    setRemaining(sec ?? initialSeconds)
    setRunning(false)
    if (tickRef.current) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [initialSeconds])

  useEffect(() => {
    if (!running) return
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false)
          if (r === 1) {
            // Defer so callers can setState (e.g. close a modal) outside this updater.
            queueMicrotask(() => onFinishRef.current?.())
          }
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current)
    }
  }, [running])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])

  return { remaining, running, start, pause, reset, setRemaining }
}
