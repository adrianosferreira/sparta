import { SectionHeader } from '@/components/SectionHeader'
import { useTranslation } from '@/i18n/useTranslation'
import { PAYPAL_DONATE_URL } from '@/lib/paypalDonateUrl'
import { ArrowLeft, Coffee } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 px-4 pb-28 pt-6">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('about.back')}
      </Link>

      <SectionHeader title={t('about.title')} subtitle={t('about.subtitle')} />

      <div className="space-y-4 rounded-2xl border border-surface-border bg-surface p-5 text-sm leading-relaxed text-zinc-300">
        <p>{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
        <p>{t('about.p3')}</p>
        <p className="font-semibold text-zinc-200">{t('about.free')}</p>
      </div>

      <a
        href={PAYPAL_DONATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl border border-amber-500/35 bg-amber-500/10 py-4 text-sm font-bold text-amber-200/90 transition-colors hover:border-amber-400/50 hover:bg-amber-500/15 active:scale-[0.99]"
      >
        <Coffee className="h-4 w-4 shrink-0" aria-hidden />
        {t('profile.buyCoffee')}
      </a>
    </div>
  )
}
