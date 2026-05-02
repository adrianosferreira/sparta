import { useCallback } from 'react'
import { translate } from '@/i18n/catalog'
import type { AppLocale } from '@/i18n/types'
import { useAppStore } from '@/store/useAppStore'

export function useTranslation() {
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale],
  )
  return { t, locale, setLocale }
}

export type { AppLocale }
