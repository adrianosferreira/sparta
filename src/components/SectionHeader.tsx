interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
      {subtitle ? (
        <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
      ) : null}
    </div>
  )
}
