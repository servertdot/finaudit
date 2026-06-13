interface HeaderProps {
  user: string
  onUserChange: (value: string) => void
}

export function Header({ user, onUserChange }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line-strong pb-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
          Личные финансы
        </span>
        <h1 className="font-display text-4xl leading-none text-accent sm:text-5xl">
          Финансовый аудит
        </h1>
      </div>

      <label className="group flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          Пользователь
        </span>
        <input
          value={user}
          onChange={(e) => onUserChange(e.target.value)}
          placeholder="Имя"
          className="w-44 border-b border-line-strong bg-transparent pb-1 text-lg text-ink outline-none transition-colors placeholder:text-muted focus:border-ink"
        />
      </label>
    </header>
  )
}
