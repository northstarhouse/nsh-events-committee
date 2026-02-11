import { useFormData } from './useFormData';
import { FormActions, Section, TextArea, TextInput, RadioGroup, CheckboxGroup } from './FormWrapper';

const defaultData = {
  historicApproach: '',
  moreInfo: '',
  decorAdded: '',
  decorCost: '',
  removalReasons: [],
  removalOther: '',
  otherNotes: '',
  // Post-event
  historicIssues: '',
  wearDamage: '',
  futureAdjustments: '',
  postOtherNotes: '',
};

export default function InteriorsForm({ event, onSubmitted }) {
  const { data, updateField, saveStatus, saveNow } = useFormData(event.id, 'interiors', defaultData);

  const handleSubmit = async () => {
    const ok = await saveNow();
    if (ok && onSubmitted) onSubmitted();
  };

  return (
    <div>
      <Section title="Interiors - Planning">
        <RadioGroup
          label="For this event, which applies?"
          options={[
            'All historically accurate items remain in place',
            'Most/all items will be temporarily removed',
            'Additional decor will be added',
          ]}
          value={data.historicApproach}
          onChange={(val) => updateField('historicApproach', val)}
        />

        <TextArea
          label="More info if applicable"
          value={data.moreInfo}
          onChange={(val) => updateField('moreInfo', val)}
        />

        <TextArea
          label="Decor or items being added for this event"
          value={data.decorAdded}
          onChange={(val) => updateField('decorAdded', val)}
          rows={3}
        />

        <TextInput
          label="Cost"
          value={data.decorCost}
          onChange={(val) => updateField('decorCost', val)}
          placeholder="$"
        />

        <CheckboxGroup
          label="Removal of items / reasoning"
          options={['Protection', 'Space needs']}
          values={data.removalReasons}
          onChange={(val) => updateField('removalReasons', val)}
        />

        <TextInput
          label="Other reason"
          value={data.removalOther}
          onChange={(val) => updateField('removalOther', val)}
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
        <RadioGroup
          label="Any issues with historic spaces or furnishings?"
          options={['None', 'Minor', 'Significant']}
          value={data.historicIssues}
          onChange={(val) => updateField('historicIssues', val)}
        />

        <TextArea
          label="Wear, damage, or maintenance needs identified"
          value={data.wearDamage}
          onChange={(val) => updateField('wearDamage', val)}
          rows={3}
        />

        <TextArea
          label="Interior adjustments to consider for future events"
          value={data.futureAdjustments}
          onChange={(val) => updateField('futureAdjustments', val)}
          rows={3}
        />

        <TextArea
          label="Other Notes"
          value={data.postOtherNotes}
          onChange={(val) => updateField('postOtherNotes', val)}
          rows={3}
        />
        <FormActions saveStatus={saveStatus} onSave={handleSubmit} align="right" showStatus={false} />
      </Section>
    </div>
  );
}
