import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimer(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const tickRef = useRef<number | null>(null)

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
