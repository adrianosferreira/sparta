import clsx from 'clsx'
import { useTranslation } from '@/i18n/useTranslation'
import { CalendarDays, Dumbbell, Info, LineChart, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', labelKey: 'nav.today', icon: Dumbbell },
  { to: '/program', labelKey: 'nav.program', icon: CalendarDays },
  { to: '/progress', labelKey: 'nav.progress', icon: LineChart },
  { to: '/about', labelKey: 'nav.about', icon: Info },
  { to: '/profile', labelKey: 'nav.profile', icon: User },
] as const

export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-border bg-[#0a0a0a]/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
      <div className="mx-auto flex max-w-md justify-around px-1">
        {links.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors',
                isActive ? 'text-accent' : 'text-zinc-500 hover:text-zinc-300',
              )
            }
          >
            <Icon className="h-5 w-5" aria-hidden />
            {t(labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
