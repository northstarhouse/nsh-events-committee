import { useFormData } from './useFormData';
import { FormActions, Section, TextArea, TextInput, RadioGroup } from './FormWrapper';

const defaultData = {
  proposedAttendance: '',
  eventLocations: '',
  setupPlan: '',
  volunteersAssisting: '',
  equipmentNeeded: '',
  safetyConsiderations: '',
  couldImpactSuccess: 'No',
  backupPlan: '',
  otherNotes: '',
  // Post-event
  setupVsReality: '',
  adjustmentsMade: '',
  layoutSupportNeeds: '',
};

export default function LogisticsForm({ event, onSubmitted }) {
  const { data, updateField, saveStatus, saveNow } = useFormData(event.id, 'logistics', defaultData);

  const handleSubmit = async () => {
    const ok = await saveNow();
    if (ok && onSubmitted) onSubmitted();
  };

  return (
    <div>
      <Section title="Event Logistics - Planning">
        <TextInput
          label="Proposed attendance"
          value={data.proposedAttendance}
          onChange={(val) => updateField('proposedAttendance', val)}
          placeholder="Expected number of attendees"
        />

        <TextArea
          label="Event locations being used (rooms / grounds)"
          value={data.eventLocations}
          onChange={(val) => updateField('eventLocations', val)}
          placeholder="List all rooms and areas that will be used..."
          rows={4}
        />

        <TextArea
          label="Setup plan overview (tables, chairs, layout)"
          value={data.setupPlan}
          onChange={(val) => updateField('setupPlan', val)}
          placeholder="Describe the setup plan including furniture arrangement and layout..."
          rows={5}
        />

        <TextArea
          label="Volunteers assisting"
          value={data.volunteersAssisting}
          onChange={(val) => updateField('volunteersAssisting', val)}
          placeholder="List volunteers helping with logistics..."
        />

        <TextArea
          label="Equipment or licenses needed"
          value={data.equipmentNeeded}
          onChange={(val) => updateField('equipmentNeeded', val)}
          placeholder="Equipment or licenses needed and who is responsible..."
          rows={4}
        />

        <TextArea
          label="Safety considerations (guest flow, accessibility, risks)"
          value={data.safetyConsiderations}
          onChange={(val) => updateField('safetyConsiderations', val)}
          rows={3}
        />

        <RadioGroup
          label="Anything that could impact program success?"
          options={['No', 'Yes']}
          value={data.couldImpactSuccess}
          onChange={(val) => updateField('couldImpactSuccess', val)}
        />

        {data.couldImpactSuccess === 'Yes' && (
          <TextArea
            label="If yes, what is the backup or adjustment plan?"
            value={data.backupPlan}
            onChange={(val) => updateField('backupPlan', val)}
            rows={3}
          />
        )}

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
          label="Setup plan vs. reality"
          options={['Matched plan exactly', 'Minor adjustments needed', 'Significant changes made']}
          value={data.setupVsReality}
          onChange={(val) => updateField('setupVsReality', val)}
        />

        <TextArea
          label="What adjustments were made and why?"
          value={data.adjustmentsMade}
          onChange={(val) => updateField('adjustmentsMade', val)}
          rows={3}
        />

        <RadioGroup
          label="Did the layout support guest flow and program needs?"
          options={['Yes', 'Mostly', 'No']}
          value={data.layoutSupportNeeds}
          onChange={(val) => updateField('layoutSupportNeeds', val)}
        />
        <FormActions saveStatus={saveStatus} onSave={handleSubmit} align="right" showStatus={false} />
      </Section>
    </div>
  );
}
