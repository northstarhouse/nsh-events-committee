import { useFormData } from './useFormData';
import { SaveIndicator, Section, TextArea, TextInput, YesNoNA } from './FormWrapper';

const volunteerRoles = [
  'Setup', 'Check-in booth', 'Hospitality / Food Support',
  'Cleanup / Breakdown', 'Program Support', 'Float / General Support',
  'Bartending', 'Parking', 'Other',
];

const defaultData = {
  roles: {},
  volunteersAssigned: '',
  boardContacted: '',
  boardContactedDate: '',
  eventSupportContacted: '',
  eventSupportDate: '',
  volunteerBriefingSent: '',
  volunteerBriefingDate: '',
  otherNotes: '',
  // Post-event
  avgHoursOnSite: '',
  totalVolunteerHours: '',
  whatWeLearned: '',
};

export default function VolunteerForm({ event }) {
  const { data, updateField, saveStatus } = useFormData(event.id, 'volunteers', defaultData);

  const updateRole = (role, field, value) => {
    const roles = { ...(data.roles || {}) };
    roles[role] = { ...(roles[role] || {}), [field]: value };
    updateField('roles', roles);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <SaveIndicator status={saveStatus} />
      </div>

      <Section title="Volunteer Coordination - Planning">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-ink mb-3">Volunteer roles & amount needed</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {volunteerRoles.map((role) => {
              const roleData = (data.roles || {})[role] || {};
              return (
                <div key={role} className="flex items-center gap-3 bg-sand-light/50 rounded-lg p-3 border border-sand-dark">
                  <label className="flex items-center gap-2 text-sm cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={roleData.needed || false}
                      onChange={(e) => updateRole(role, 'needed', e.target.checked)}
                      className="rounded border-sand-dark text-gold accent-gold"
                    />
                    {role}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roleData.count || ''}
                    onChange={(e) => updateRole(role, 'count', e.target.value)}
                    placeholder="#"
                    className="w-16 border border-sand-dark rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-gold bg-white"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <TextArea
          label="Volunteers Currently Assigned Day-Of Event"
          value={data.volunteersAssigned}
          onChange={(val) => updateField('volunteersAssigned', val)}
          placeholder="List volunteers and their assigned roles for the day of the event..."
          rows={6}
        />

        <div className="space-y-3 mt-4">
          <YesNoNA
            label="Board Contacted:"
            value={data.boardContacted}
            onChange={(val) => updateField('boardContacted', val)}
            dateValue={data.boardContactedDate}
            onDateChange={(val) => updateField('boardContactedDate', val)}
          />

          <YesNoNA
            label="Event Support List Contacted:"
            value={data.eventSupportContacted}
            onChange={(val) => updateField('eventSupportContacted', val)}
            dateValue={data.eventSupportDate}
            onDateChange={(val) => updateField('eventSupportDate', val)}
          />

          <YesNoNA
            label="Volunteer Briefing Sent:"
            value={data.volunteerBriefingSent}
            onChange={(val) => updateField('volunteerBriefingSent', val)}
            dateValue={data.volunteerBriefingDate}
            onDateChange={(val) => updateField('volunteerBriefingDate', val)}
          />
        </div>

        <TextArea
          label="Other Notes"
          value={data.otherNotes}
          onChange={(val) => updateField('otherNotes', val)}
          rows={4}
        />
      </Section>

      <Section title="Post Event Notes">
        <TextInput
          label="Average hours on site"
          value={data.avgHoursOnSite}
          onChange={(val) => updateField('avgHoursOnSite', val)}
          placeholder="e.g., 4 hours"
        />

        <TextInput
          label="Total Volunteer Hours"
          value={data.totalVolunteerHours}
          onChange={(val) => updateField('totalVolunteerHours', val)}
          placeholder="e.g., 32 hours"
        />

        <TextArea
          label="What we learned"
          value={data.whatWeLearned}
          onChange={(val) => updateField('whatWeLearned', val)}
          placeholder="Key takeaways about volunteer coordination for this event..."
          rows={4}
        />
      </Section>
    </div>
  );
}
