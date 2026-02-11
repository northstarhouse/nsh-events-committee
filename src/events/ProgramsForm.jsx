import { useFormData } from './useFormData';
import { FormActions, Section, TextArea, TextInput, CheckboxGroup, RadioGroup } from './FormWrapper';
import { Plus, Trash2 } from 'lucide-react';

const defaultData = {
  purpose: [],
  performers: [{ name: '', contact: '' }],
  vendorFormsSent: '',
  vendorFormsReceived: '',
  activities: [{ activity: '', timeFrame: '', volunteers: '' }],
  transitions: '',
  actionItems: [{ item: '', dueDate: '', volunteer: '' }],
  otherNotes: '',
  // Post-event
  activityReview: [{ activity: '', whatWorked: '', whatDidnt: '', notes: '' }],
  flowTiming: '',
  pinchPoints: '',
  repeatFormat: '',
  committeeNotes: '',
  postOtherNotes: '',
};

export default function ProgramsForm({ event }) {
  const { data, updateField, updateNestedField, addToArray, removeFromArray, saveStatus, saveNow } = useFormData(event.id, 'programs', defaultData);

  return (
    <div>
      <Section title="Activities & Programs - Planning">
        <CheckboxGroup
          label="Primary purpose of the activities/programs at this event"
          options={['Educational', 'Entertainment', 'Community engagement', 'Fundraising support']}
          values={data.purpose}
          onChange={(val) => updateField('purpose', val)}
        />

        <div className="mb-4">
          <label className="block text-sm font-semibold text-ink mb-2">List performers, entertainers or outside vendors</label>
          {(data.performers || []).map((item, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                placeholder="Vendor / Performer Name"
                value={item.name || ''}
                onChange={(e) => updateNestedField('performers', i, 'name', e.target.value)}
                className="flex-1 border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
              />
              <input
                placeholder="NSH Contact"
                value={item.contact || ''}
                onChange={(e) => updateNestedField('performers', i, 'contact', e.target.value)}
                className="flex-1 border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
              />
              {(data.performers || []).length > 1 && (
                <button onClick={() => removeFromArray('performers', i)} className="text-red-400 hover:text-red-600 cursor-pointer">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addToArray('performers', { name: '', contact: '' })}
            className="flex items-center gap-1 text-sm text-gold hover:text-gold-dark mt-1 cursor-pointer"
          >
            <Plus size={14} /> Add performer/vendor
          </button>
        </div>

        <RadioGroup
          label="Vendor forms sent / received?"
          options={['Sent', 'Received', 'N/A']}
          value={data.vendorFormsSent}
          onChange={(val) => updateField('vendorFormsSent', val)}
        />

        <div className="mb-4">
          <label className="block text-sm font-semibold text-ink mb-2">General List of Activities</label>
          {(data.activities || []).map((item, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                placeholder="Activity"
                value={item.activity || ''}
                onChange={(e) => updateNestedField('activities', i, 'activity', e.target.value)}
                className="flex-1 border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
              />
              <input
                placeholder="Time Frame"
                value={item.timeFrame || ''}
                onChange={(e) => updateNestedField('activities', i, 'timeFrame', e.target.value)}
                className="w-32 border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
              />
              <input
                placeholder="Volunteers / Duties"
                value={item.volunteers || ''}
                onChange={(e) => updateNestedField('activities', i, 'volunteers', e.target.value)}
                className="flex-1 border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
              />
              {(data.activities || []).length > 1 && (
                <button onClick={() => removeFromArray('activities', i)} className="text-red-400 hover:text-red-600 cursor-pointer">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addToArray('activities', { activity: '', timeFrame: '', volunteers: '' })}
            className="flex items-center gap-1 text-sm text-gold hover:text-gold-dark mt-1 cursor-pointer"
          >
            <Plus size={14} /> Add activity
          </button>
        </div>

        <TextArea
          label="Any transitions that need special attention?"
          value={data.transitions}
          onChange={(val) => updateField('transitions', val)}
        />

        <div className="mb-4">
          <label className="block text-sm font-semibold text-ink mb-2">Action Items</label>
          {(data.actionItems || []).map((item, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                placeholder="Action Item"
                value={item.item || ''}
                onChange={(e) => updateNestedField('actionItems', i, 'item', e.target.value)}
                className="flex-1 border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
              />
              <input
                type="date"
                value={item.dueDate || ''}
                onChange={(e) => updateNestedField('actionItems', i, 'dueDate', e.target.value)}
                className="border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
              />
              <input
                placeholder="Volunteer / Duties"
                value={item.volunteer || ''}
                onChange={(e) => updateNestedField('actionItems', i, 'volunteer', e.target.value)}
                className="flex-1 border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
              />
              {(data.actionItems || []).length > 1 && (
                <button onClick={() => removeFromArray('actionItems', i)} className="text-red-400 hover:text-red-600 cursor-pointer">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addToArray('actionItems', { item: '', dueDate: '', volunteer: '' })}
            className="flex items-center gap-1 text-sm text-gold hover:text-gold-dark mt-1 cursor-pointer"
          >
            <Plus size={14} /> Add action item
          </button>
        </div>

        <TextArea
          label="Other Notes"
          value={data.otherNotes}
          onChange={(val) => updateField('otherNotes', val)}
          rows={4}
        />
        <FormActions saveStatus={saveStatus} onSave={saveNow} align="right" showStatus={false} />
      </Section>

      <Section title="Program & Activities Review (Post-Event)">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-ink mb-2">Activities / Program Elements Review</label>
          {(data.activityReview || []).map((item, i) => (
            <div key={i} className="border border-sand-dark rounded-lg p-3 mb-2 bg-sand-light/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <input
                  placeholder="Activity"
                  value={item.activity || ''}
                  onChange={(e) => updateNestedField('activityReview', i, 'activity', e.target.value)}
                  className="border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
                />
                <input
                  placeholder="Notes"
                  value={item.notes || ''}
                  onChange={(e) => updateNestedField('activityReview', i, 'notes', e.target.value)}
                  className="border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  placeholder="What Worked"
                  value={item.whatWorked || ''}
                  onChange={(e) => updateNestedField('activityReview', i, 'whatWorked', e.target.value)}
                  className="border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
                />
                <input
                  placeholder="What Didn't"
                  value={item.whatDidnt || ''}
                  onChange={(e) => updateNestedField('activityReview', i, 'whatDidnt', e.target.value)}
                  className="border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
                />
              </div>
              {(data.activityReview || []).length > 1 && (
                <button onClick={() => removeFromArray('activityReview', i)} className="text-red-400 hover:text-red-600 text-xs mt-2 cursor-pointer">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addToArray('activityReview', { activity: '', whatWorked: '', whatDidnt: '', notes: '' })}
            className="flex items-center gap-1 text-sm text-gold hover:text-gold-dark mt-1 cursor-pointer"
          >
            <Plus size={14} /> Add review item
          </button>
        </div>

        <RadioGroup
          label="Flow & Timing"
          options={['Smooth', 'Minor issues', 'Needs adjustment']}
          value={data.flowTiming}
          onChange={(val) => updateField('flowTiming', val)}
        />

        <TextArea
          label="Transitions or pinch points observed"
          value={data.pinchPoints}
          onChange={(val) => updateField('pinchPoints', val)}
        />

        <RadioGroup
          label="Would we repeat this program format?"
          options={['Yes', 'With adjustments', 'No']}
          value={data.repeatFormat}
          onChange={(val) => updateField('repeatFormat', val)}
        />

        <TextArea
          label="Committee Notes"
          value={data.committeeNotes}
          onChange={(val) => updateField('committeeNotes', val)}
        />

        <TextArea
          label="Other Notes"
          value={data.postOtherNotes}
          onChange={(val) => updateField('postOtherNotes', val)}
        />
        <FormActions saveStatus={saveStatus} onSave={saveNow} align="right" showStatus={false} />
      </Section>
    </div>
  );
}
