import {
  formatDurationHMS,
  type WorkoutShareSnapshot,
} from '@/lib/workoutSharePayload'
import { forwardRef } from 'react'

/** Matches Tailwind `accent` / app UI (lime on near-black). */
const ACCENT = '#a3e635'
const BG = '#0a0a0a'
const SURFACE = '#141414'
const BORDER = '#2a2a2a'
const MUTED = '#a1a1aa'
const WHITE = '#fafafa'

/** Fixed 1080×1350 (4:5) for Instagram; same palette as the Sparta UI. */
export const WorkoutShareCard = forwardRef<
  HTMLDivElement,
  { snapshot: WorkoutShareSnapshot }
>(function WorkoutShareCard({ snapshot }, ref) {
  const maxBar = Math.max(1, ...snapshot.setBars.map((b) => b.sets))

  return (
    <div
      ref={ref}
      className="relative flex flex-col overflow-hidden text-left"
      style={{
        width: 1080,
        height: 1350,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        background: `linear-gradient(165deg, ${SURFACE} 0%, ${BG} 45%, #0f0f0f 100%)`,
        color: WHITE,
      }}
    >
      <div
        className="absolute right-0 top-0 h-[520px] w-[520px] rounded-full opacity-[0.14]"
        style={{
          background: `radial-gradient(circle at center, ${ACCENT}, transparent 68%)`,
          transform: 'translate(28%, -42%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col px-14 pb-12 pt-14">
        <div className="flex items-start justify-between gap-6">
          <p
            className="text-[34px] font-black uppercase tracking-[0.35em]"
            style={{ color: ACCENT }}
          >
            Sparta
          </p>
          <p
            className="max-w-[520px] text-right text-[26px] font-medium capitalize leading-snug"
            style={{ color: MUTED }}
          >
            {snapshot.dateLine}
          </p>
        </div>

        <p className="mt-10 text-[30px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>
          {snapshot.labels.activity}
        </p>
        <p className="mt-3 text-[52px] font-black leading-tight text-white">{snapshot.dayTitle}</p>
        <p className="mt-2 text-[28px] font-semibold" style={{ color: MUTED }}>
          {snapshot.weekLabel}
        </p>

        <div className="mt-14">
          <p className="text-[30px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
            {snapshot.labels.duration}
          </p>
          <p
            className="mt-2 font-black tabular-nums leading-none"
            style={{
              fontSize: snapshot.durationSec >= 3600 ? 118 : 152,
              color: ACCENT,
              letterSpacing: '-0.02em',
            }}
          >
            {formatDurationHMS(snapshot.durationSec)}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-4 gap-4">
          <StatBox label={snapshot.labels.xp} value={String(snapshot.xp)} accent />
          <StatBox label={snapshot.labels.sets} value={String(snapshot.totalSets)} />
          <StatBox label={snapshot.labels.moves} value={String(snapshot.movesCount)} />
          <StatBox
            label={snapshot.labels.kcal}
            value={snapshot.kcal != null ? String(snapshot.kcal) : '—'}
          />
        </div>

        {snapshot.setBars.length > 0 ? (
          <div className="mt-10 flex flex-1 flex-col">
            <p className="mb-4 text-[24px] font-bold uppercase tracking-wider" style={{ color: MUTED }}>
              {snapshot.labels.volume}
            </p>
            <div className="flex flex-1 items-end gap-2.5" style={{ minHeight: 220, maxHeight: 320 }}>
              {snapshot.setBars.map((b) => (
                <div
                  key={b.name}
                  className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className="w-full max-w-[72px] rounded-t-md"
                    style={{
                      height: `${Math.max(8, (b.sets / maxBar) * 100)}%`,
                      minHeight: 10,
                      backgroundColor: ACCENT,
                      opacity: 0.9,
                    }}
                  />
                  <p
                    className="w-full truncate text-center text-[18px] font-semibold leading-tight text-white/90"
                    title={b.name}
                  >
                    {b.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-auto" />
        )}

        <div
          className="mt-auto h-2 w-full rounded-full opacity-90"
          style={{ backgroundColor: ACCENT }}
          aria-hidden
        />
      </div>
    </div>
  )
})

WorkoutShareCard.displayName = 'WorkoutShareCard'

function StatBox({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      className="rounded-2xl border px-4 py-5"
      style={{
        borderColor: accent ? ACCENT : BORDER,
        backgroundColor: accent ? 'rgba(163, 230, 53, 0.1)' : 'rgba(255,255,255,0.03)',
      }}
    >
      <p className="text-[22px] font-bold uppercase tracking-wide" style={{ color: MUTED }}>
        {label}
      </p>
      <p
        className="mt-2 truncate text-[44px] font-black tabular-nums"
        style={{ color: accent ? ACCENT : WHITE }}
      >
        {value}
      </p>
    </div>
  )
}
