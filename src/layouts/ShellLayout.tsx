import { AchievementToast } from '@/components/AchievementToast'
import { BottomNav } from '@/components/BottomNav'
import { useTranslation } from '@/i18n/useTranslation'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

export function ShellLayout() {
  const { locale, t } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en'
    document.title = t('today.brand')
  }, [locale, t])

  return (
    <div className="relative min-h-dvh">
      <AchievementToast />
      <main className="mx-auto min-h-dvh max-w-md pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
