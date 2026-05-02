import type { AppLocale } from './types'

const labels: Record<string, Record<AppLocale, string>> = {}

function add(id: string, en: string, ptBR: string) {
  labels[id] = { en, 'pt-BR': ptBR }
}

for (let w = 1; w <= 4; w++) {
  add(
    `w${w}-mon`,
    'Monday — full body',
    'Segunda-feira — corpo inteiro',
  )
  add(
    `w${w}-wed`,
    'Wednesday — full body',
    'Quarta-feira — corpo inteiro',
  )
  add(`w${w}-fri`, 'Friday — full body', 'Sexta-feira — corpo inteiro')
}

const m2 = {
  d1: {
    en: 'Day 1 — upper body + skill',
    'pt-BR': 'Dia 1 — superior + habilidade',
  },
  d2: {
    en: 'Day 2 — lower + core + skill',
    'pt-BR': 'Dia 2 — inferior + core + habilidade',
  },
  d3: {
    en: 'Day 3 — lower + core',
    'pt-BR': 'Dia 3 — inferior + core',
  },
  d4: {
    en: 'Day 4 — upper body + skill',
    'pt-BR': 'Dia 4 — superior + habilidade',
  },
} as const

for (let w = 5; w <= 8; w++) {
  add(`w${w}-d1`, m2.d1.en, m2.d1['pt-BR'])
  add(`w${w}-d2`, m2.d2.en, m2.d2['pt-BR'])
  add(`w${w}-d3`, m2.d3.en, m2.d3['pt-BR'])
  add(`w${w}-d4`, m2.d4.en, m2.d4['pt-BR'])
}

const m3 = {
  d1: {
    en: 'Day 1 — upper + skill',
    'pt-BR': 'Dia 1 — superior + habilidade',
  },
  d2: {
    en: 'Day 2 — lower + core + skill',
    'pt-BR': 'Dia 2 — inferior + core + habilidade',
  },
  d3: {
    en: 'Day 3 — lower + core + skill',
    'pt-BR': 'Dia 3 — inferior + core + habilidade',
  },
  d4: {
    en: 'Day 4 — upper + skill',
    'pt-BR': 'Dia 4 — superior + habilidade',
  },
} as const

for (let w = 9; w <= 12; w++) {
  add(`w${w}-d1`, m3.d1.en, m3.d1['pt-BR'])
  add(`w${w}-d2`, m3.d2.en, m3.d2['pt-BR'])
  add(`w${w}-d3`, m3.d3.en, m3.d3['pt-BR'])
  add(`w${w}-d4`, m3.d4.en, m3.d4['pt-BR'])
}

export function workoutDayLabel(dayId: string, locale: AppLocale): string {
  return labels[dayId]?.[locale] ?? labels[dayId]?.en ?? dayId
}
