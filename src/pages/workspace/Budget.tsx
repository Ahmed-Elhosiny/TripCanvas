import { useMemo, useState } from 'react';
import type { Expense, ExpenseCategory, Trip } from '../../types';
import { EXPENSE_META } from '../../types';
import { useToast, useTripStore } from '../../store/store';
import { tripPlanned, tripSpent } from '../../store/store';
import { fmtDate, money } from '../../lib/format';
import { BarRow, Donut } from '../../components/charts';
import { ExpenseModal } from '../../components/modals';
import { Button, EmptyState, IconBtn, ProgressBar, Tip } from '../../components/ui';
import { CheckIcon, PencilIcon, PlusIcon, RouteIcon, TrashIcon, WalletIcon, XIcon } from '../../components/icons';

const ALLOC: Record<ExpenseCategory, number> = {
  stays: 0.38,
  food: 0.22,
  activities: 0.16,
  transport: 0.12,
  shopping: 0.07,
  other: 0.05,
};

export default function Budget({ trip }: { trip: Trip }) {
  const { state, addExpense, updateExpense, deleteExpense, setBudget } = useTripStore();
  const { push } = useToast();
  const currency = state.settings.currency;

  const spent = tripSpent(trip);
  const planned = tripPlanned(trip);
  const remaining = trip.budget - spent - planned;

  const byCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    trip.expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return map;
  }, [trip.expenses]);

  const donutData = useMemo(
    () =>
      (Object.keys(EXPENSE_META) as ExpenseCategory[])
        .map((c) => ({ label: EXPENSE_META[c].label, value: byCategory.get(c) ?? 0, color: EXPENSE_META[c].color }))
        .filter((d) => d.value > 0),
    [byCategory],
  );

  const sortedExpenses = useMemo(() => [...trip.expenses].sort((a, b) => (a.date < b.date ? 1 : -1)), [trip.expenses]);

  const [modal, setModal] = useState<{ open: boolean; expense?: Expense }>({ open: false });
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState(String(trip.budget));

  const saveBudget = () => {
    const v = Number(budgetDraft);
    if (!v || v <= 0) return push('error', 'Invalid budget', 'Enter an amount above zero.');
    setBudget(trip.id, v);
    setEditingBudget(false);
    push('success', 'Budget updated', `Planning against ${money(v, currency)} now.`);
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.24em] text-persimmon">
            <span className="h-px w-8 bg-persimmon" /> THE LEDGER
          </p>
          <h2 className="mt-2.5 font-display text-[32px] font-semibold leading-none tracking-tight text-ink sm:text-[38px]">Budget</h2>
        </div>
        <Button onClick={() => setModal({ open: true })}><PlusIcon size={15} /> Log expense</Button>
      </div>

      {/* headline numbers */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-pine p-5 text-chalk shadow-card">
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-fern">TOTAL BUDGET</p>
          {editingBudget ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                autoFocus
                type="number"
                value={budgetDraft}
                onChange={(e) => setBudgetDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
                className="tnum w-32 rounded-lg border border-chalk/30 bg-deep/40 px-2.5 py-1 font-display text-[26px] font-semibold text-chalk outline-none"
                aria-label="Total budget"
              />
              <button onClick={saveBudget} aria-label="Save budget" className="text-fern hover:text-chalk"><CheckIcon size={18} /></button>
              <button onClick={() => setEditingBudget(false)} aria-label="Cancel" className="text-fern/70 hover:text-chalk"><XIcon size={15} /></button>
            </div>
          ) : (
            <button onClick={() => { setBudgetDraft(String(trip.budget)); setEditingBudget(true); }} className="group mt-2 flex items-baseline gap-2.5 text-left">
              <span className="tnum font-display text-[32px] font-semibold leading-none">{money(trip.budget, currency)}</span>
              <PencilIcon size={14} className="text-fern opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
        </div>
        <div className="rounded-xl border border-line bg-bone p-5 shadow-card">
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-fog">SPENT</p>
          <p className="tnum mt-2 font-display text-[32px] font-semibold leading-none text-ink">{money(spent, currency)}</p>
          <ProgressBar value={trip.budget > 0 ? (spent / trip.budget) * 100 : 0} color="var(--color-teal)" className="mt-3" />
        </div>
        <div className="rounded-xl border border-line bg-bone p-5 shadow-card">
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-fog">PLANNED · ITINERARY</p>
          <p className="tnum mt-2 font-display text-[32px] font-semibold leading-none text-ink">{money(planned, currency)}</p>
          <ProgressBar value={trip.budget > 0 ? (planned / trip.budget) * 100 : 0} color="var(--color-saffron)" className="mt-3" />
        </div>
        <div className={`rounded-xl border p-5 shadow-card ${remaining < 0 ? 'border-persimmon/50 bg-persimmon/5' : 'border-line bg-bone'}`}>
          <p className={`font-mono text-[10px] font-bold tracking-[0.2em] ${remaining < 0 ? 'text-persimmon' : 'text-fog'}`}>
            {remaining < 0 ? 'OVER BY' : 'REMAINING'}
          </p>
          <p className={`tnum mt-2 font-display text-[32px] font-semibold leading-none ${remaining < 0 ? 'text-persimmon' : 'text-pine'}`}>
            {money(Math.abs(remaining), currency)}
          </p>
          <p className="mt-2 text-[11.5px] font-semibold text-fog">after spend + planned</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* chart + categories */}
        <section className="rounded-xl border border-line bg-bone p-6 shadow-card sm:p-7">
          <h3 className="font-display text-[20px] font-semibold text-ink">Where it goes</h3>
          <div className="mt-5 flex justify-center">
            {donutData.length > 0 ? (
              <Donut data={donutData} centerTop={money(spent, currency)} centerBottom="logged so far" />
            ) : (
              <div className="flex h-[190px] w-[190px] items-center justify-center rounded-full border-8 border-mist">
                <p className="max-w-[16ch] text-center font-mono text-[10px] font-bold tracking-wider text-fog">NO SPENDING LOGGED YET</p>
              </div>
            )}
          </div>
          <div className="mt-7 space-y-4">
            {(Object.keys(EXPENSE_META) as ExpenseCategory[]).map((c) => {
              const amt = byCategory.get(c) ?? 0;
              const alloc = trip.budget * ALLOC[c];
              return (
                <BarRow
                  key={c}
                  label={EXPENSE_META[c].label}
                  valueLabel={`${money(amt, currency)} / ${money(alloc, currency)}`}
                  pct={alloc > 0 ? (amt / alloc) * 100 : 0}
                  color={EXPENSE_META[c].color}
                  over={amt > alloc}
                />
              );
            })}
          </div>
          <p className="mt-5 border-t border-dashed border-line pt-4 text-[11.5px] leading-relaxed text-fog">
            Bars compare each category to its suggested slice of the budget. Red means that slice is gone.
          </p>
        </section>

        {/* expense list */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-line bg-bone shadow-card">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-display text-[20px] font-semibold text-ink">Expenses</h3>
              <span className="tnum font-mono text-[11px] font-bold tracking-wider text-fog">{trip.expenses.length} LOGGED</span>
            </div>
            {sortedExpenses.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<WalletIcon size={22} />}
                  title="Nothing in the ledger"
                  desc="Log the first espresso, ticket or train and the charts spring to life."
                  action={<Button onClick={() => setModal({ open: true })}><PlusIcon size={14} /> Log expense</Button>}
                />
              </div>
            ) : (
              <ul className="divide-y divide-line/70">
                {sortedExpenses.map((e) => (
                  <li key={e.id} className="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-mist/40">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${EXPENSE_META[e.category].color}1f`, color: EXPENSE_META[e.category].color }}>
                      <WalletIcon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2.5 truncate text-[14px] font-bold text-ink">
                        {e.label}
                        <span className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.14em]" style={{ background: `${EXPENSE_META[e.category].color}1f`, color: EXPENSE_META[e.category].color }}>
                          {EXPENSE_META[e.category].label.toUpperCase()}
                        </span>
                      </p>
                      <p className="mt-0.5 font-mono text-[10.5px] font-bold tracking-wider text-fog">
                        {fmtDate(e.date, 'EEE · MMM d').toUpperCase()}{e.note ? ` — ${e.note}` : ''}
                      </p>
                    </div>
                    <span className="tnum shrink-0 font-display text-[17px] font-semibold text-ink">{money(e.amount, currency)}</span>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <Tip label="Edit">
                        <IconBtn label="Edit expense" className="h-8 w-8" onClick={() => setModal({ open: true, expense: e })}>
                          <PencilIcon size={14} />
                        </IconBtn>
                      </Tip>
                      <Tip label="Delete">
                        <IconBtn
                          label="Delete expense"
                          className="h-8 w-8 hover:text-persimmon"
                          onClick={() => {
                            deleteExpense(trip.id, e.id);
                            push('info', 'Expense deleted', `"${e.label}" removed — ${money(e.amount, currency)} back in the purse.`);
                          }}
                        >
                          <TrashIcon size={14} />
                        </IconBtn>
                      </Tip>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-line bg-mist/30 px-5 py-4">
            <RouteIcon size={18} className="shrink-0 text-saffron" />
            <p className="text-[12.5px] font-semibold leading-relaxed text-moss">
              Activity estimates on the itinerary add <strong className="tnum text-ink">{money(planned, currency)}</strong> of planned spend — the remaining figure already accounts for them.
            </p>
          </div>
        </section>
      </div>

      <ExpenseModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        currency={currency}
        expense={modal.expense}
        defaultDate={trip.start}
        onSave={(exp) => {
          if (modal.expense) {
            updateExpense(trip.id, exp);
            push('success', 'Expense updated', `"${exp.label}" — ${money(exp.amount, currency)}.`);
          } else {
            addExpense(trip.id, exp);
            push('success', 'Logged to the ledger', `"${exp.label}" — ${money(exp.amount, currency)}.`);
          }
          setModal({ open: false });
        }}
      />
    </div>
  );
}
