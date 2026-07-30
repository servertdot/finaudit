interface HeaderProps {
  user: string
  onUserChange: (value: string) => void
}

export function Header({ user, onUserChange }: HeaderProps) {
  return (
    <header className="masthead flex flex-wrap items-end justify-between gap-5">
      <div className="flex flex-col gap-2">
        <span className="eyebrow">Личные финансы</span>
        <h1 className="display-title text-ink">
          Финансовый аудит
        </h1>
        <span className="device-status">Все изменения сохранены на устройстве</span>
      </div>

      <label className="group flex min-w-48 flex-col gap-1.5">
        <span className="px-1 text-[12px] font-medium text-muted">Профиль</span>
        <input
          value={user}
          onChange={(e) => onUserChange(e.target.value)}
          placeholder="Имя"
          aria-label="Пользователь"
          className="field w-full px-3 py-2 text-[15px] font-medium placeholder:text-muted"
        />
      </label>
    </header>
  )
}
