import { useFormData } from './useFormData';
import { FormActions, SaveIndicator, Section, TextArea } from './FormWrapper';

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
};

export default function MarketingForm({ event }) {
  const { data, updateField, saveStatus, saveNow } = useFormData(event.id, 'marketing', defaultData);

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
      <div className="mb-4">
        <span className="text-sm text-ink-light">
          {completedCount} of {marketingChannels.length} channels completed
        </span>
      </div>

      <Section title="Marketing Checklist">
        <p className="text-sm text-ink-light mb-4">
          Check off each marketing channel as it is completed for this event.
        </p>

        <div className="space-y-3">
          {marketingChannels.map((channel) => {
            const channelData = (data.channels || {})[channel] || {};
            return (
              <div
                key={channel}
                className={`border rounded-lg p-3 transition-colors ${
                  channelData.done
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-sand-dark'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={channelData.done || false}
                    onChange={() => toggleChannel(channel)}
                    className="rounded border-sand-dark text-gold accent-gold h-4 w-4 cursor-pointer"
                  />
                  <span className={`text-sm font-medium flex-1 ${channelData.done ? 'text-green-800 line-through' : 'text-ink'}`}>
                    {channel}
                  </span>
                  <input
                    type="date"
                    value={channelData.date || ''}
                    onChange={(e) => updateChannelDate(channel, e.target.value)}
                    className="border border-sand-dark rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-gold bg-white"
                  />
                </div>
                <div className="mt-2 ml-7">
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

          <div className="border border-sand-dark rounded-lg p-3 bg-white">
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
        <FormActions saveStatus={saveStatus} onSave={saveNow} align="right" showStatus={false} />
      </Section>
    </div>
  );
}
