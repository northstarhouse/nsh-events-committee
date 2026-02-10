import { useFormData } from './useFormData';
import { SaveIndicator, Section, TextArea, TextInput, RadioGroup, CheckboxGroup } from './FormWrapper';

const expenseCategories = [
  'Food & Beverage',
  'Entertainment / Speakers',
  'Supplies / Decor',
  'Marketing / Printing',
  'Permits / Licenses / Insurance',
  'Cleaning / Security',
  'Other',
];

const incomeCategories = [
  'Ticket Sales',
  'Alcohol or food sales',
  'House Merch',
  'Donations',
  'Other',
];

const defaultData = {
  expenses: expenseCategories.map(cat => ({ category: cat, estimated: '', actual: '' })),
  income: incomeCategories.map(cat => ({ source: cat, estimated: '', actual: '' })),
  financialNotes: '',
  // Post-event
  receiptsCollected: '',
  receiptsDate1: '',
  receiptsDate2: '',
  receiptsDate3: '',
  reimbursementsNeeded: '',
  reimbursementAmount: '',
  reimbursementSubmittedBy: '',
  finalExpenses: '',
  finalIncome: '',
  finalNet: '',
  eventType: '',
  netReportedToBoard: false,
  thankYousSent: false,
  lessonsDocumented: false,
  postNotes: '',
};

export default function FinanceForm({ event }) {
  const { data, updateField, updateNestedField, saveStatus } = useFormData(event.id, 'finance', defaultData);

  const calcTotal = (items, field) => {
    return (items || []).reduce((sum, item) => {
      const val = parseFloat(item[field]) || 0;
      return sum + val;
    }, 0).toFixed(2);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <SaveIndicator status={saveStatus} />
      </div>

      <Section title="Projected Expenses">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand-dark">
                <th className="text-left py-2 pr-4 font-semibold text-ink">Category</th>
                <th className="text-left py-2 pr-4 font-semibold text-ink">Estimated Amount</th>
                <th className="text-left py-2 font-semibold text-ink">Actual Amount</th>
              </tr>
            </thead>
            <tbody>
              {(data.expenses || defaultData.expenses).map((row, i) => (
                <tr key={i} className="border-b border-sand-dark/50">
                  <td className="py-2 pr-4 text-ink">{row.category}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center">
                      <span className="text-ink-light mr-1">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={row.estimated || ''}
                        onChange={(e) => updateNestedField('expenses', i, 'estimated', e.target.value)}
                        className="w-28 border border-sand-dark rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white"
                      />
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center">
                      <span className="text-ink-light mr-1">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={row.actual || ''}
                        onChange={(e) => updateNestedField('expenses', i, 'actual', e.target.value)}
                        className="w-28 border border-sand-dark rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2 pr-4 text-ink">Total Projected Expenses</td>
                <td className="py-2 pr-4 text-ink">${calcTotal(data.expenses, 'estimated')}</td>
                <td className="py-2 text-ink">${calcTotal(data.expenses, 'actual')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Projected Income">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand-dark">
                <th className="text-left py-2 pr-4 font-semibold text-ink">Source</th>
                <th className="text-left py-2 pr-4 font-semibold text-ink">Estimated Amount</th>
                <th className="text-left py-2 font-semibold text-ink">Actual Amount</th>
              </tr>
            </thead>
            <tbody>
              {(data.income || defaultData.income).map((row, i) => (
                <tr key={i} className="border-b border-sand-dark/50">
                  <td className="py-2 pr-4 text-ink">{row.source}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center">
                      <span className="text-ink-light mr-1">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={row.estimated || ''}
                        onChange={(e) => updateNestedField('income', i, 'estimated', e.target.value)}
                        className="w-28 border border-sand-dark rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white"
                      />
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center">
                      <span className="text-ink-light mr-1">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={row.actual || ''}
                        onChange={(e) => updateNestedField('income', i, 'actual', e.target.value)}
                        className="w-28 border border-sand-dark rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2 pr-4 text-ink">Total Projected Income</td>
                <td className="py-2 pr-4 text-ink">${calcTotal(data.income, 'estimated')}</td>
                <td className="py-2 text-ink">${calcTotal(data.income, 'actual')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Financial Notes / Risks / Approvals Needed">
        <TextArea
          value={data.financialNotes}
          onChange={(val) => updateField('financialNotes', val)}
          placeholder="Include budget overruns, pending sponsorships, ticket pacing concerns, or approval requests..."
          rows={4}
        />
      </Section>

      <Section title="After Event Data">
        <RadioGroup
          label="Receipts Collected"
          options={['Yes', 'Partial', 'Pending']}
          value={data.receiptsCollected}
          onChange={(val) => updateField('receiptsCollected', val)}
        />

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-ink-light">Dates:</span>
          <input type="date" value={data.receiptsDate1 || ''} onChange={(e) => updateField('receiptsDate1', e.target.value)}
            className="border border-sand-dark rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white" />
          <input type="date" value={data.receiptsDate2 || ''} onChange={(e) => updateField('receiptsDate2', e.target.value)}
            className="border border-sand-dark rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white" />
          <input type="date" value={data.receiptsDate3 || ''} onChange={(e) => updateField('receiptsDate3', e.target.value)}
            className="border border-sand-dark rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white" />
        </div>

        <RadioGroup
          label="Reimbursements Needed?"
          options={['No', 'Yes']}
          value={data.reimbursementsNeeded}
          onChange={(val) => updateField('reimbursementsNeeded', val)}
        />

        {data.reimbursementsNeeded === 'Yes' && (
          <div className="flex gap-3 mb-4 ml-4">
            <div>
              <label className="block text-xs text-ink-light mb-1">Amount</label>
              <input
                type="text"
                value={data.reimbursementAmount || ''}
                onChange={(e) => updateField('reimbursementAmount', e.target.value)}
                placeholder="$"
                className="w-32 border border-sand-dark rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-light mb-1">Submitted by</label>
              <input
                type="text"
                value={data.reimbursementSubmittedBy || ''}
                onChange={(e) => updateField('reimbursementSubmittedBy', e.target.value)}
                className="w-48 border border-sand-dark rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white"
              />
            </div>
          </div>
        )}

        <h4 className="font-semibold text-sm text-ink mt-6 mb-3">Final Totals</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <TextInput label="Expenses" value={data.finalExpenses} onChange={(val) => updateField('finalExpenses', val)} placeholder="$" />
          <TextInput label="Income" value={data.finalIncome} onChange={(val) => updateField('finalIncome', val)} placeholder="$" />
          <TextInput label="Net Outcome (Income - Expenses)" value={data.finalNet} onChange={(val) => updateField('finalNet', val)} placeholder="$" />
        </div>

        <RadioGroup
          label="Event classification"
          options={['Revenue-generating event', 'Break-even event', 'Mission-support event (approved loss)']}
          value={data.eventType}
          onChange={(val) => updateField('eventType', val)}
        />

        <h4 className="font-semibold text-sm text-ink mt-6 mb-3">Post-Event Financial Follow-Up</h4>
        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={data.netReportedToBoard || false}
              onChange={(e) => updateField('netReportedToBoard', e.target.checked)}
              className="rounded border-sand-dark text-gold accent-gold" />
            Net outcome reported to board
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={data.thankYousSent || false}
              onChange={(e) => updateField('thankYousSent', e.target.checked)}
              className="rounded border-sand-dark text-gold accent-gold" />
            Thank-yous sent (sponsors/donors)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={data.lessonsDocumented || false}
              onChange={(e) => updateField('lessonsDocumented', e.target.checked)}
              className="rounded border-sand-dark text-gold accent-gold" />
            Lessons learned documented
          </label>
        </div>

        <TextArea
          label="Notes"
          value={data.postNotes}
          onChange={(val) => updateField('postNotes', val)}
          rows={4}
        />
      </Section>
    </div>
  );
}
