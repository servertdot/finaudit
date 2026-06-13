import { useRef } from 'react'
import { Header } from './components/Header'
import { Toolbar } from './components/Toolbar'
import { SummaryPanel } from './components/SummaryPanel'
import { ExpensesPanel } from './components/ExpensesPanel'
import { SimpleListPanel } from './components/SimpleListPanel'
import { ChartsPanel } from './components/ChartsPanel'
import { ClockIcon, WalletIcon } from './components/icons'
import {
  useFinanceActions,
  useFinanceState,
  useFinanceSummary,
} from './store/useFinanceStore'
import { useTheme } from './lib/theme'

function App() {
  const state = useFinanceState()
  const summary = useFinanceSummary()
  const actions = useFinanceActions()
  const { theme, toggleTheme } = useTheme()
  const captureRef = useRef<HTMLDivElement>(null)

  const handleClear = () => {
    if (window.confirm('Очистить все категории, доходы и активы?')) {
      actions.clearAll()
    }
  }

  return (
    <div className="min-h-full bg-paper px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <Header user={state.user} onUserChange={actions.setUser} />

        <Toolbar
          state={state}
          captureRef={captureRef}
          theme={theme}
          onToggleTheme={toggleTheme}
          onImport={actions.replaceState}
          onResetSample={actions.resetToSample}
          onClear={handleClear}
        />

        <div ref={captureRef} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SummaryPanel summary={summary} />

            <SimpleListPanel
              title="Активы"
              accent="slate"
              icon={<WalletIcon size={18} className="text-ink-soft" />}
              items={state.assets}
              onAdd={actions.addAsset}
              onUpdate={actions.updateAsset}
              onRemove={actions.removeAsset}
              addTitle="Добавить актив"
            />

            <ExpensesPanel
              items={state.expenses}
              onAdd={actions.addExpense}
              onUpdate={actions.updateExpense}
              onRemove={actions.removeExpense}
            />

            <SimpleListPanel
              title="Доходы по категориям"
              accent="emerald"
              icon={<ClockIcon size={18} className="text-pos" />}
              items={state.incomes}
              showHeader
              onAdd={actions.addIncome}
              onUpdate={actions.updateIncome}
              onRemove={actions.removeIncome}
              addTitle="Добавить доход"
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <ChartsPanel state={state} summary={summary} theme={theme} />
          </div>
        </div>

        <footer className="border-t border-line pt-5 text-center text-[12px] text-muted">
          Данные хранятся локально в вашем браузере · Финансовый аудит · {state.user}
        </footer>
      </div>
    </div>
  )
}

export default App
