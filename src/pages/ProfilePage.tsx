import { SectionHeader } from '@/components/SectionHeader'
import { BadgeTile } from '@/components/BadgeTile'
import { XpBar } from '@/components/XpBar'
import type { AppLocale } from '@/i18n/types'
import { useTranslation } from '@/i18n/useTranslation'
import { BADGE_RULES } from '@/lib/gamification'
import { computeBmi, isProfileCompleteForKcal } from '@/lib/kcal'
import type { BiologicalSex, BodyProfile } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { Download, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

const AGE_MIN = 14
const AGE_MAX = 100
const HEIGHT_MIN = 80
const HEIGHT_MAX = 260
const WEIGHT_MIN = 30
const WEIGHT_MAX = 250

function parseIntSafe(s: string, fallback: number): number {
  const n = Number.parseInt(s.replaceAll(',', '.').split('.')[0] ?? '', 10)
  return Number.isFinite(n) ? n : fallback
}

export function ProfilePage() {
  const { t, locale, setLocale } = useTranslation()
  const user = useAppStore((s) => s.user)
  const sessions = useAppStore((s) => s.sessions)
  const resetProgress = useAppStore((s) => s.resetProgress)
  const setBodyProfile = useAppStore((s) => s.setBodyProfile)

  const bp = user.bodyProfile
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [sex, setSex] = useState<BiologicalSex>('unspecified')
  const [savedHint, setSavedHint] = useState(false)

  useEffect(() => {
    if (bp) {
      setAge(String(bp.ageYears))
      setHeight(String(bp.heightCm))
      setWeight(String(bp.weightKg))
      setSex(bp.sex)
    } else {
      setAge('')
      setHeight('')
      setWeight('')
      setSex('unspecified')
    }
  }, [bp])

  const ageN = parseIntSafe(age, 0)
  const heightN = parseIntSafe(height, 0)
  const weightN = Number.parseFloat(weight.replace(',', '.')) || 0
  const bmi = computeBmi(heightN, weightN)

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ user, sessions, locale }, null, 2)],
      { type: 'application/json' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sparta-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onReset = () => {
    if (window.confirm(t('profile.resetConfirm'))) {
      resetProgress()
    }
  }

  const onSaveBody = () => {
    if (
      ageN < AGE_MIN ||
      ageN > AGE_MAX ||
      heightN < HEIGHT_MIN ||
      heightN > HEIGHT_MAX ||
      weightN < WEIGHT_MIN ||
      weightN > WEIGHT_MAX
    ) {
      window.alert(t('profile.bodyValidation'))
      return
    }
    const next: BodyProfile = {
      ageYears: ageN,
      sex,
      heightCm: heightN,
      weightKg: Math.round(weightN * 10) / 10,
    }
    setBodyProfile(next)
    setSavedHint(true)
    window.setTimeout(() => setSavedHint(false), 2500)
  }

  const onClearBody = () => {
    if (window.confirm(t('profile.bodyClearConfirm'))) {
      setBodyProfile(null)
      setAge('')
      setHeight('')
      setWeight('')
      setSex('unspecified')
    }
  }

  const langBtn = (value: AppLocale, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setLocale(value)}
      className={clsx(
        'flex-1 rounded-xl border py-3 text-sm font-bold transition-colors',
        locale === value
          ? 'border-accent bg-accent/15 text-accent'
          : 'border-surface-border text-zinc-400 hover:text-white',
      )}
    >
      {label}
    </button>
  )

  const kcalReady = isProfileCompleteForKcal(bp)

  return (
    <div className="space-y-6 px-4 pb-28 pt-6">
      <SectionHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
          {t('profile.language')}
        </p>
        <div className="flex gap-2">
          {langBtn('en', t('profile.langEn'))}
          {langBtn('pt-BR', t('profile.langPtBr'))}
        </div>
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface p-5">
        <h3 className="text-sm font-bold text-white">{t('profile.bodyTitle')}</h3>
        <p className="mt-1 text-xs text-zinc-500">{t('profile.bodySubtitle')}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-zinc-500">
              {t('profile.bodyAge')}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={AGE_MIN}
              max={AGE_MAX}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-elevated px-3 py-2.5 text-sm font-semibold text-white"
              placeholder="28"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-zinc-500">
              {t('profile.bodySex')}
            </span>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as BiologicalSex)}
              className="w-full rounded-xl border border-surface-border bg-surface-elevated px-3 py-2.5 text-sm font-semibold text-white"
            >
              <option value="unspecified">{t('profile.bodySexUnspecified')}</option>
              <option value="male">{t('profile.bodySexMale')}</option>
              <option value="female">{t('profile.bodySexFemale')}</option>
            </select>
          </label>
          <label className="col-span-2 block sm:col-span-1">
            <span className="mb-1 block text-xs font-bold text-zinc-500">
              {t('profile.bodyHeight')}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={HEIGHT_MIN}
              max={HEIGHT_MAX}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-elevated px-3 py-2.5 text-sm font-semibold text-white"
              placeholder="175"
            />
          </label>
          <label className="col-span-2 block sm:col-span-1">
            <span className="mb-1 block text-xs font-bold text-zinc-500">
              {t('profile.bodyWeight')}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={WEIGHT_MIN}
              max={WEIGHT_MAX}
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-elevated px-3 py-2.5 text-sm font-semibold text-white"
              placeholder="72"
            />
          </label>
        </div>

        {bmi != null ? (
          <p className="mt-3 text-sm text-zinc-300">
            {t('profile.bodyBmi', { bmi })}
          </p>
        ) : (
          <p className="mt-3 text-xs text-zinc-600">{t('profile.bodyBmiHint')}</p>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onSaveBody}
            className="flex-1 rounded-xl bg-accent py-3 text-sm font-black text-black active:scale-[0.99]"
          >
            {t('profile.bodySave')}
          </button>
          {bp ? (
            <button
              type="button"
              onClick={onClearBody}
              className="rounded-xl border border-surface-border px-4 py-3 text-sm font-bold text-zinc-400 hover:text-white"
            >
              {t('profile.bodyClear')}
            </button>
          ) : null}
        </div>
        {savedHint ? (
          <p className="mt-2 text-xs font-semibold text-accent">{t('profile.bodySaved')}</p>
        ) : null}
        {kcalReady ? (
          <p className="mt-2 text-xs text-zinc-500">{t('profile.kcalReady')}</p>
        ) : (
          <p className="mt-2 text-xs text-zinc-600">{t('profile.kcalNeedWeight')}</p>
        )}
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface p-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-zinc-400">
            {t('profile.levelLine', { n: user.level })}
          </p>
          <p className="text-xs text-zinc-600">
            {t('profile.totalXp', { xp: user.xp })}
          </p>
        </div>
        <XpBar xp={user.xp} className="mt-4" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-white">{t('profile.badges')}</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BADGE_RULES.map((b) => (
            <BadgeTile
              key={b.id}
              badgeId={b.id}
              unlocked={user.unlockedBadges.includes(b.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={exportJson}
          className="flex items-center justify-center gap-2 rounded-2xl border border-surface-border bg-surface-elevated py-4 text-sm font-bold text-white active:scale-[0.99]"
        >
          <Download className="h-4 w-4" />
          {t('profile.export')}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 py-4 text-sm font-bold text-red-400 active:scale-[0.99]"
        >
          <Trash2 className="h-4 w-4" />
          {t('profile.reset')}
        </button>
      </div>
    </div>
  )
}
