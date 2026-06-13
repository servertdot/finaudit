import { useRef } from 'react'
import { Header } from './components/Header'
import { Toolbar } from './components/Toolbar'
import { PeriodBar } from './components/PeriodBar'
import { SummaryPanel } from './components/SummaryPanel'
import { HealthPanel } from './components/HealthPanel'
import { HistoryPanel } from './components/HistoryPanel'
import { ExpensesPanel } from './components/ExpensesPanel'
import { AssetsPanel } from './components/AssetsPanel'
import { SimpleListPanel } from './components/SimpleListPanel'
import { ChartsPanel } from './components/ChartsPanel'
import { ClockIcon } from './components/icons'
import {
  useActiveNote,
  useFinanceActions,
  useFinanceData,
  useFinanceHealth,
  useFinanceHistory,
  useFinanceState,
  useFinanceSummary,
} from './store/useFinanceStore'
import { formatMonth } from './lib/period'
import { useTheme } from './lib/theme'

function App() {
  const state = useFinanceState()
  const data = useFinanceData()
  const note = useActiveNote()
  const summary = useFinanceSummary()
  const health = useFinanceHealth()
  const history = useFinanceHistory()
  const actions = useFinanceActions()
  const { theme, toggleTheme } = useTheme()
  const captureRef = useRef<HTMLDivElement>(null)

  const handleClear = () => {
    if (
      window.confirm(
        `Очистить данные за «${formatMonth(data.activeMonth)}» (категории, доходы и активы)?`,
      )
    ) {
      actions.clearAll()
    }
  }

  return (
    <div className="min-h-full bg-paper px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <Header user={state.user} onUserChange={actions.setUser} />

        <Toolbar
          data={data}
          captureRef={captureRef}
          theme={theme}
          onToggleTheme={toggleTheme}
          onImport={actions.importData}
          onResetSample={actions.resetToSample}
          onClear={handleClear}
        />

        <PeriodBar
          months={data.months}
          activeMonth={data.activeMonth}
          note={note}
          onSelect={actions.setActiveMonth}
          onAddMonth={actions.addMonth}
          onRemoveMonth={actions.removeMonth}
          onNoteChange={actions.setMonthNote}
        />

        <div ref={captureRef} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SummaryPanel summary={summary} />

            <AssetsPanel
              items={state.assets}
              onAdd={actions.addAsset}
              onUpdate={actions.updateAsset}
              onRemove={actions.removeAsset}
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
            <HealthPanel health={health} />
            <HistoryPanel history={history} theme={theme} />
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
