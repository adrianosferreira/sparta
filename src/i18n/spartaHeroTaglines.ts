import type { AppLocale } from './types'

/** Short hero lines — “Sparta voice”: discipline, bars, grit, no excuses. */
export const SPARTA_HERO_TAGLINES: Record<AppLocale, readonly string[]> = {
  en: [
    'The iron remembers every honest rep.',
    'No oracle grants strength—you forge it.',
    'Today you bend the bar, not the other way around.',
    'The mud of effort washes off; regret does not.',
    'Chalk your hands, clear your mind, own the set.',
    'Comfort is the enemy; motion is the oath.',
    'Your body is the arena—treat every set like a duel.',
    'Weakness is a visitor; consistency sends it home.',
    'Sparta was not built in comfort—and neither is your plank.',
    'Let dawn find you already hungry to train.',
    'Honor the program, crush the excuses.',
    'Pull yourself up—literally, then everywhere else.',
    'The only bad session is the one you skip.',
    'Grit before glory. Reps before rest.',
    'Show the bar who rules this body.',
    'Discipline is louder than motivation—listen to it.',
    'One more rep is how empires of muscle begin.',
    'The ladder is vertical; so is your will.',
  ],
  'pt-BR': [
    'O ferro lembra toda rep honesta.',
    'Ninguém te forja força no Olimpo — você forja.',
    'Hoje você domina a barra, não o contrário.',
    'O suor some; o arrependimento fica.',
    'Giz nas mãos, foco na mente, dono da série.',
    'O conforto é inimigo; o movimento é juramento.',
    'Teu corpo é a arena — cada série, um duelo.',
    'Fraqueza visita; consistência expulsa.',
    'Esparta não nasceu no sofá — teu core também não.',
    'Que o amanhã te encontre já de pé treinando.',
    'Honra o plano, esmaga a desculpa.',
    'Se puxa pra cima — primeiro na barra, depois na vida.',
    'A única sessão ruim é a que você pula.',
    'Grão antes do ouro. Série antes do descanso.',
    'Mostra pra barra quem manda nesse corpo.',
    'Disciplina fala mais alto que motivação — escuta.',
    'Mais uma série é assim que impérios de músculo nascem.',
    'A escada é vertical; tua vontade também.',
  ],
}

export function randomSpartaHeroTagline(locale: AppLocale): string {
  const list = SPARTA_HERO_TAGLINES[locale]
  const i = Math.floor(Math.random() * list.length)
  return list[i] ?? list[0]!
}
