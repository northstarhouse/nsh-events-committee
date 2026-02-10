import { useFormData } from './useFormData';
import { SaveIndicator, Section, TextArea, TextInput, CheckboxGroup } from './FormWrapper';

const defaultData = {
  recognitionMethods: [],
  recognitionOther: '',
  recognitionVolunteer: '',
  potentialSponsors: '',
  outreachActions: [],
  outreachOther: '',
  outreachVolunteer: '',
  intentionalInvites: '',
  otherNotes: '',
  // Post-event
  sponsorsInvolved: '',
  recognitionDelivered: '',
  futureNotes: '',
  committeeThoughts: '',
  postOtherNotes: '',
};

export default function SponsorshipForm({ event }) {
  const { data, updateField, saveStatus } = useFormData(event.id, 'sponsorship', defaultData);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <SaveIndicator status={saveStatus} />
      </div>

      <Section title="Sponsorships & Partnerships - Planning">
        <CheckboxGroup
          label="How will sponsors be recognized at this event?"
          options={[
            'Signage on site',
            'Verbal recognition during program',
            'Program or printed materials',
            'Digital recognition (email/social)',
            'Invitation-only or VIP access',
          ]}
          values={data.recognitionMethods}
          onChange={(val) => updateField('recognitionMethods', val)}
        />

        <div className="flex gap-3 mb-4 ml-4">
          <TextInput
            label="Other recognition method"
            value={data.recognitionOther}
            onChange={(val) => updateField('recognitionOther', val)}
            placeholder="Describe other recognition..."
          />
          <TextInput
            label="Volunteer Name"
            value={data.recognitionVolunteer}
            onChange={(val) => updateField('recognitionVolunteer', val)}
          />
        </div>

        <TextArea
          label="Potential sponsors well-matched to this event theme or audience"
          value={data.potentialSponsors}
          onChange={(val) => updateField('potentialSponsors', val)}
          placeholder="List potential sponsors and why they're a good fit..."
          rows={4}
        />

        <CheckboxGroup
          label="Outreach actions needed for this event"
          options={[
            'Personal invitation to attend',
            'Event-specific pitch or conversation',
            'Follow-up after event',
          ]}
          values={data.outreachActions}
          onChange={(val) => updateField('outreachActions', val)}
        />

        <div className="flex gap-3 mb-4 ml-4">
          <TextInput
            label="Other outreach action"
            value={data.outreachOther}
            onChange={(val) => updateField('outreachOther', val)}
            placeholder="Describe other action..."
          />
          <TextInput
            label="Volunteer Name"
            value={data.outreachVolunteer}
            onChange={(val) => updateField('outreachVolunteer', val)}
          />
        </div>

        <TextArea
          label="If any sponsors or prospects are being intentionally invited to this event, who and why?"
          value={data.intentionalInvites}
          onChange={(val) => updateField('intentionalInvites', val)}
          rows={4}
        />

        <TextArea
          label="Other Notes"
          value={data.otherNotes}
          onChange={(val) => updateField('otherNotes', val)}
          rows={4}
        />
      </Section>

      <Section title="Post Event Notes">
        <TextArea
          label="Sponsors involved"
          value={data.sponsorsInvolved}
          onChange={(val) => updateField('sponsorsInvolved', val)}
        />

        <TextArea
          label="Recognition delivered as promised?"
          value={data.recognitionDelivered}
          onChange={(val) => updateField('recognitionDelivered', val)}
        />

        <TextArea
          label="Notes, opportunities, or ideas for future sponsorship growth for this kind of event"
          value={data.futureNotes}
          onChange={(val) => updateField('futureNotes', val)}
          rows={4}
        />

        <TextArea
          label="Committee thoughts"
          value={data.committeeThoughts}
          onChange={(val) => updateField('committeeThoughts', val)}
        />

        <TextArea
          label="Other notes"
          value={data.postOtherNotes}
          onChange={(val) => updateField('postOtherNotes', val)}
        />
      </Section>
    </div>
  );
}
