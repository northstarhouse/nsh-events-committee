import { useFormData } from './useFormData';
import { SaveIndicator, Section, TextArea, RadioGroup } from './FormWrapper';

const defaultData = {
  statusUpdates: [
    { date: '', status: '', decisions: '', notes: '' },
    { date: '', status: '', decisions: '', notes: '' },
    { date: '', status: '', decisions: '', notes: '' },
    { date: '', status: '', decisions: '', notes: '' },
    { date: '', status: '', decisions: '', notes: '' },
  ],
  finalNotes: '',
};

export default function OverallStatusForm({ event }) {
  const { data, updateField, updateNestedField, saveStatus } = useFormData(event.id, 'overall', defaultData);

  const updateStatusEntry = (index, field, value) => {
    updateNestedField('statusUpdates', index, field, value);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <SaveIndicator status={saveStatus} />
      </div>

      <Section title="Event Status Updates">
        <p className="text-sm text-ink-light mb-4">
          Record the overall status of the event after each committee meeting.
        </p>

        {(data.statusUpdates || defaultData.statusUpdates).map((entry, index) => (
          <div key={index} className="border border-sand-dark rounded-lg p-4 mb-4 bg-sand-light/50">
            <h4 className="font-semibold text-sm text-gold mb-3">Status Update #{index + 1}</h4>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-ink mb-1">Date</label>
              <input
                type="date"
                value={entry.date || ''}
                onChange={(e) => updateStatusEntry(index, 'date', e.target.value)}
                className="border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 bg-white"
              />
            </div>

            <RadioGroup
              label="Overall status of the event"
              options={['On track', 'Minor issues', 'Needs attention at next meeting']}
              value={entry.status}
              onChange={(val) => updateStatusEntry(index, 'status', val)}
            />

            <div className="mb-3">
              <label className="block text-sm font-semibold text-ink mb-1">Decisions needed from leadership or board?</label>
              <textarea
                value={entry.decisions || ''}
                onChange={(e) => updateStatusEntry(index, 'decisions', e.target.value)}
                rows={3}
                placeholder="Any decisions that need to be escalated..."
                className="w-full border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 resize-y bg-white"
              />
            </div>

            <div className="mb-1">
              <label className="block text-sm font-semibold text-ink mb-1">Notes or concerns to follow up on</label>
              <textarea
                value={entry.notes || ''}
                onChange={(e) => updateStatusEntry(index, 'notes', e.target.value)}
                rows={3}
                placeholder="Follow-up items and concerns..."
                className="w-full border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 resize-y bg-white"
              />
            </div>
          </div>
        ))}
      </Section>

      <Section title="Final Notes">
        <TextArea
          value={data.finalNotes}
          onChange={(val) => updateField('finalNotes', val)}
          placeholder="Final notes and overall reflections on this event..."
          rows={6}
        />
      </Section>
    </div>
  );
}
