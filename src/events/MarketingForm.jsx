import { useFormData } from './useFormData';
import { FormActions, Section, TextArea, TextInput, CheckboxGroup } from './FormWrapper';

const marketingChannels = [
  'Create Press Release',
  'Send Email Blast',
  'YubaNet (Press Release Only)',
  'Go Nevada County Calendar - Community Blast',
  'Arts Council Calendar',
  'Grass Valley Chamber Newsletter',
  'KVMR Calendar',
  'Facebook Event Page',
  'NSH Facebook Page',
  'NSH Instagram Page',
  'Nevada County Peeps',
  'Grass Valley Peeps',
  'Lake Wildwood Page',
  'Next Door',
  'Union Event Calendar',
  'Union Advertisement ($270)',
];

const defaultData = {
  channels: {},
  otherChannel: '',
  otherChannelDone: false,
  notes: '',
  committeeNotes: '',
  ticketSalesPattern: [],
  photosTaken: false,
  uploadedToSharedDrive: false,
  emailsCollected: '',
  donationsRelatedToEvent: '',
  formsGrabbed: '',
};

export default function MarketingForm({ event, onSubmitted, section, showSaveStatus = false }) {
  const { data, updateField, saveStatus, saveNow } = useFormData(event.id, 'marketing', defaultData);

  const handleSubmit = async () => {
    const ok = await saveNow();
    if (ok && onSubmitted) onSubmitted();
  };

  const toggleChannel = (channel) => {
    const channels = { ...(data.channels || {}) };
    channels[channel] = { ...channels[channel], done: !channels[channel]?.done };
    updateField('channels', channels);
  };

  const updateChannelDate = (channel, date) => {
    const channels = { ...(data.channels || {}) };
    channels[channel] = { ...channels[channel], date };
    updateField('channels', channels);
  };

  const updateChannelNotes = (channel, notes) => {
    const channels = { ...(data.channels || {}) };
    channels[channel] = { ...channels[channel], notes };
    updateField('channels', channels);
  };

  const completedCount = marketingChannels.filter(ch => (data.channels || {})[ch]?.done).length;

  return (
    <div>
      {(!section || section === 'pre') && <div className="mb-4">
        <span className="text-sm text-ink-light">
          {completedCount} of {marketingChannels.length} channels completed
        </span>
      </div>}

      {(!section || section === 'pre') && <Section title="Marketing Checklist">
        <p className="text-sm text-ink-light mb-4">
          Check off each marketing channel as it is completed for this event.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {marketingChannels.map((channel) => {
            const channelData = (data.channels || {})[channel] || {};
            return (
              <div
                key={channel}
                className={`border rounded-lg p-2.5 transition-colors ${
                  channelData.done
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-sand-dark'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={channelData.done || false}
                    onChange={() => toggleChannel(channel)}
                    className="rounded border-sand-dark text-gold accent-gold h-4 w-4 cursor-pointer"
                  />
                  <span className={`text-sm font-medium flex-1 leading-tight ${channelData.done ? 'text-green-800 line-through' : 'text-ink'}`}>
                    {channel}
                  </span>
                  <input
                    type="date"
                    value={channelData.date || ''}
                    onChange={(e) => updateChannelDate(channel, e.target.value)}
                    className="border border-sand-dark rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-gold bg-white"
                  />
                </div>
                <div className="mt-2 ml-6">
                  <input
                    placeholder="Notes..."
                    value={channelData.notes || ''}
                    onChange={(e) => updateChannelNotes(channel, e.target.value)}
                    className="w-full border border-sand-dark rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-gold bg-white"
                  />
                </div>
              </div>
            );
          })}

          <div className="border border-sand-dark rounded-lg p-3 bg-white md:col-span-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={data.otherChannelDone || false}
                onChange={(e) => updateField('otherChannelDone', e.target.checked)}
                className="rounded border-sand-dark text-gold accent-gold h-4 w-4 cursor-pointer"
              />
              <input
                placeholder="Other channel..."
                value={data.otherChannel || ''}
                onChange={(e) => updateField('otherChannel', e.target.value)}
                className="flex-1 border border-sand-dark rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <TextArea
            label="Additional Marketing Notes"
            value={data.notes}
            onChange={(val) => updateField('notes', val)}
            placeholder="Any additional marketing notes, ideas, or follow-up items..."
            rows={4}
          />
        </div>
        <FormActions saveStatus={saveStatus} onSave={handleSubmit} align="right" showStatus={showSaveStatus} />
      </Section>}

      {(!section || section === 'post') && <Section title="Post Event Notes">
        <CheckboxGroup
          label="Tickets sold"
          options={['Early majority', 'Steady flow', 'Mostly last week', 'Mostly last 48 hours']}
          values={data.ticketSalesPattern}
          onChange={(val) => updateField('ticketSalesPattern', val)}
        />

        <div className="mb-4 pb-4 border-b border-gold/30 space-y-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={data.photosTaken || false}
              onChange={(e) => updateField('photosTaken', e.target.checked)}
              className="rounded border-sand-dark text-gold focus:ring-gold/30 accent-gold"
            />
            Photos taken
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={data.uploadedToSharedDrive || false}
              onChange={(e) => updateField('uploadedToSharedDrive', e.target.checked)}
              className="rounded border-sand-dark text-gold focus:ring-gold/30 accent-gold"
            />
            Uploaded to Shared Drive
          </label>
        </div>

        <TextInput
          label="Emails collected"
          value={data.emailsCollected}
          onChange={(val) => updateField('emailsCollected', val)}
        />

        <TextInput
          label="Donations related to event"
          value={data.donationsRelatedToEvent}
          onChange={(val) => updateField('donationsRelatedToEvent', val)}
        />

        <TextInput
          label="Forms grabbed"
          value={data.formsGrabbed}
          onChange={(val) => updateField('formsGrabbed', val)}
        />

        <TextArea
          label="Committee Notes"
          value={data.committeeNotes}
          onChange={(val) => updateField('committeeNotes', val)}
          rows={4}
        />
        <FormActions saveStatus={saveStatus} onSave={handleSubmit} align="right" showStatus={showSaveStatus} />
      </Section>}
    </div>
  );
}
