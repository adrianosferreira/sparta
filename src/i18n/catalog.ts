import { en } from './en'
import { ptBR } from './pt-BR'
import type { AppLocale } from './types'

function fillMissing(
  base: Record<string, string>,
  partial: Record<string, string>,
): Record<string, string> {
  const out = { ...partial }
  for (const key of Object.keys(base)) {
    if (out[key] === undefined) out[key] = base[key]!
  }
  return out
}

export const catalogs: Record<AppLocale, Record<string, string>> = {
  en,
  'pt-BR': fillMissing(en, ptBR),
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template
  let s = template
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{{${k}}}`, String(v))
  }
  return s
}

export function translate(
  locale: AppLocale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const raw =
    catalogs[locale][key] ?? catalogs.en[key] ?? key
  return interpolate(raw, vars)
}
