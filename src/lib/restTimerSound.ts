/** Short two-tone chime when rest hits 0 (Web Audio — no network, works offline). */

let sharedCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AC) return null
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AC()
  }
  return sharedCtx
}

function beep(
  ctx: AudioContext,
  startTime: number,
  frequencyHz: number,
  durationSec: number,
  peakGain: number,
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(frequencyHz, startTime)
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + Math.max(0.05, durationSec - 0.02),
  )
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + durationSec)
}

/** Call when the rest UI appears (e.g. right after logging a set) to unlock audio on mobile. */
export function primeRestTimerAudio(): void {
  const ctx = getAudioContext()
  if (!ctx) return
  void ctx.resume().catch(() => {})
}

/**
 * Fire-and-forget. May no-op if AudioContext is blocked (no prior user gesture on strict profiles).
 */
export function playRestTimerComplete(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const run = (): void => {
    const t0 = ctx.currentTime
    beep(ctx, t0, 523.25, 0.22, 0.11)
    beep(ctx, t0 + 0.2, 659.25, 0.28, 0.1)
  }

  void (async () => {
    try {
      if (ctx.state === 'suspended') await ctx.resume()
    } catch {
      return
    }
    run()
  })()
}
