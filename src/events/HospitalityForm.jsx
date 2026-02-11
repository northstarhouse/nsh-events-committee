import { useFormData } from './useFormData';
import { FormActions, Section, TextArea, RadioGroup, CheckboxGroup } from './FormWrapper';
import { Plus, Trash2 } from 'lucide-react';

const defaultData = {
  foodBevPlan: [{ item: '', volunteer: '' }],
  shoppingList: [{ item: '', volunteer: '' }],
  rentalEquipment: [{ item: '', volunteer: '' }],
  servingStyle: [],
  alcoholInvolved: '',
  cleanupPlan: '',
  volunteersAssisting: '',
  otherNotes: '',
  // Post-event
  fbOutcome: '',
  fbOutcomeRanOut: '',
  guestFlow: '',
  guestComments: '',
  committeeThoughts: '',
  postOtherNotes: '',
};

function DynamicTable({ label, items, onUpdate, onAdd, onRemove, col1Label, col2Label }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-ink mb-2">{label}</label>
      {(items || []).map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            placeholder={col1Label}
            value={item.item || ''}
            onChange={(e) => onUpdate(i, 'item', e.target.value)}
            className="flex-1 border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
          />
          <input
            placeholder={col2Label}
            value={item.volunteer || ''}
            onChange={(e) => onUpdate(i, 'volunteer', e.target.value)}
            className="flex-1 border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
          />
          {(items || []).length > 1 && (
            <button onClick={() => onRemove(i)} className="text-red-400 hover:text-red-600 cursor-pointer">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => onAdd()}
        className="flex items-center gap-1 text-sm text-gold hover:text-gold-dark mt-1 cursor-pointer"
      >
        <Plus size={14} /> Add item
      </button>
    </div>
  );
}

export default function HospitalityForm({ event, onSubmitted }) {
  const { data, updateField, updateNestedField, addToArray, removeFromArray, saveStatus, saveNow } = useFormData(event.id, 'hospitality', defaultData);

  const handleSubmit = async () => {
    const ok = await saveNow();
    if (ok && onSubmitted) onSubmitted();
  };

  return (
    <div>
      <Section title="Hospitality - Planning">
        <DynamicTable
          label="Food & Beverage Plan"
          items={data.foodBevPlan}
          onUpdate={(i, field, val) => updateNestedField('foodBevPlan', i, field, val)}
          onAdd={() => addToArray('foodBevPlan', { item: '', volunteer: '' })}
          onRemove={(i) => removeFromArray('foodBevPlan', i)}
          col1Label="Item / Description"
          col2Label="Volunteers Responsible / Duties"
        />

        <DynamicTable
          label="Shopping List"
          items={data.shoppingList}
          onUpdate={(i, field, val) => updateNestedField('shoppingList', i, field, val)}
          onAdd={() => addToArray('shoppingList', { item: '', volunteer: '' })}
          onRemove={(i) => removeFromArray('shoppingList', i)}
          col1Label="Item"
          col2Label="Volunteers Responsible / Duties"
        />

        <DynamicTable
          label="Rental Equipment Needed"
          items={data.rentalEquipment}
          onUpdate={(i, field, val) => updateNestedField('rentalEquipment', i, field, val)}
          onAdd={() => addToArray('rentalEquipment', { item: '', volunteer: '' })}
          onRemove={(i) => removeFromArray('rentalEquipment', i)}
          col1Label="Equipment"
          col2Label="Volunteers Responsible"
        />

        <CheckboxGroup
          label="Serving Style"
          options={['Self-serve', 'Served', 'Passed items', 'Combination']}
          values={data.servingStyle}
          onChange={(val) => updateField('servingStyle', val)}
        />

        <RadioGroup
          label="Alcohol or specialty beverages involved?"
          options={['No', 'Yes']}
          value={data.alcoholInvolved}
          onChange={(val) => updateField('alcoholInvolved', val)}
        />

        <TextArea
          label="Cleanup plan after service"
          value={data.cleanupPlan}
          onChange={(val) => updateField('cleanupPlan', val)}
          rows={3}
        />

        <TextArea
          label="Volunteers Assisting"
          value={data.volunteersAssisting}
          onChange={(val) => updateField('volunteersAssisting', val)}
        />

        <TextArea
          label="Other Notes"
          value={data.otherNotes}
          onChange={(val) => updateField('otherNotes', val)}
          rows={4}
        />
        <FormActions saveStatus={saveStatus} onSave={handleSubmit} align="right" showStatus={false} />
      </Section>

      <Section title="Post Event Notes">
        <div className="mb-4">
          <RadioGroup
            label="Food & Beverage Outcome"
            options={['More than enough', 'Adequate', 'Ran out']}
            value={data.fbOutcome}
            onChange={(val) => updateField('fbOutcome', val)}
          />
          {data.fbOutcome === 'Ran out' && (
            <input
              placeholder="Ran out of..."
              value={data.fbOutcomeRanOut || ''}
              onChange={(e) => updateField('fbOutcomeRanOut', e.target.value)}
              className="w-full border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white mt-2"
            />
          )}
        </div>

        <RadioGroup
          label="Guest flow & comfort"
          options={['Excellent', 'Good', 'Issues noted']}
          value={data.guestFlow}
          onChange={(val) => updateField('guestFlow', val)}
        />

        <TextArea
          label="Common guest comments or feedback"
          value={data.guestComments}
          onChange={(val) => updateField('guestComments', val)}
          rows={4}
        />

        <TextArea
          label="Committee Thoughts"
          value={data.committeeThoughts}
          onChange={(val) => updateField('committeeThoughts', val)}
          rows={4}
        />

        <TextArea
          label="Other Notes"
          value={data.postOtherNotes}
          onChange={(val) => updateField('postOtherNotes', val)}
          rows={4}
        />
        <FormActions saveStatus={saveStatus} onSave={handleSubmit} align="right" showStatus={false} />
      </Section>
    </div>
  );
}
