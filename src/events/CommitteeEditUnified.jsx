import { useState, useRef } from 'react';
import { ArrowLeft, Plus, X, CheckCircle2, Save, AlertCircle, Upload, ImageIcon } from 'lucide-react';
import { useFormData } from './useFormData';
import { supabase } from '../lib/supabase';

const PURPOSE_OPTIONS = ['Educational', 'Entertainment', 'Community engagement', 'Fundraising support'];
const HISTORIC_OPTIONS = [
  'All historically accurate items remain in place',
  'Most/all items will be temporarily removed',
  'Additional decor will be added',
];
const SERVING_OPTIONS = ['Self-serve', 'Served', 'Passed items', 'Combination'];
const VOLUNTEER_ROLES = [
  'Setup', 'Check-in booth', 'Hospitality / Food Support',
  'Cleanup / Breakdown', 'Program Support', 'Float / General Support',
  'Bartending', 'Parking', 'Other',
];
const RECOGNITION_METHODS = [
  'Signage on site', 'Verbal recognition during program',
  'Program or printed materials', 'Digital recognition (email/social)',
  'Invitation-only or VIP access', 'Other recognition method',
];
const OUTREACH_ACTIONS = [
  'Personal invitation to attend', 'Event-specific pitch or conversation',
  'Follow-up after event', 'Other outreach action',
];
const MARKETING_CHANNELS = [
  'Create Press Release', 'Send Email Blast', 'YubaNet (Press Release Only)',
  'Go Nevada County Calendar - Community Blast', 'Grass Valley Chamber Newsletter',
  'KVMR Calendar', 'Facebook Event Page', 'NSH Facebook Page', 'NSH Instagram Page',
  'Nevada County Peeps', 'Grass Valley Peeps', 'Lake Wildwood Page', 'Next Door',
  'Union Event Calendar', 'Union Advertisement ($270)',
];

const defaultPrograms = {
  flyerUrl: '',
  purpose: [], performers: [{ name: '', contact: '' }],
  activities: [{ activity: '', timeFrame: '', volunteers: '' }],
  transitions: '', actionItems: [{ item: '', dueDate: '', volunteer: '' }],
  otherNotes: '',
};
const defaultLogistics = {
  proposedAttendance: '', ticketPrice: '', eventLocations: '',
  setupPlan: '', equipmentNeeded: '', licensesPermits: '',
  safetyConsiderations: '', couldImpactSuccess: 'No', backupPlan: '', otherNotes: '',
  setupVsReality: '', adjustmentsMade: '', layoutSupportNeeds: '', committeeNotes: '',
};
const defaultInteriors = {
  historicApproach: '', moreInfo: '', decorAdded: '', decorCost: '',
  removalReasons: [], removalOther: '', otherNotes: '',
};
const defaultHospitality = {
  foodBevPlan: [{ item: '', volunteer: '' }],
  shoppingList: [{ item: '', volunteer: '' }],
  rentalEquipment: [{ item: '', volunteer: '' }],
  servingStyle: [], alcoholInvolved: '', cleanupPlan: '', volunteersAssisting: '', otherNotes: '',
};
const defaultSponsorship = {
  recognitionMethods: [], recognitionOther: '', recognitionVolunteer: '',
  potentialSponsors: '', outreachActions: [], outreachOther: '', outreachVolunteer: '',
  intentionalInvites: '', otherNotes: '',
};
const defaultVolunteers = {
  roles: {}, otherNotes: '',
};
const defaultFinance = {
  expenses: [
    { category: 'Food & Beverage', estimated: '', actual: '' },
    { category: 'Entertainment / Speakers', estimated: '', actual: '' },
    { category: 'Supplies / Decor', estimated: '', actual: '' },
    { category: 'Marketing / Printing', estimated: '', actual: '' },
    { category: 'Permits / Licenses / Insurance', estimated: '', actual: '' },
    { category: 'Cleaning / Security', estimated: '', actual: '' },
    { category: 'Other', estimated: '', actual: '' },
  ],
  income: [
    { source: 'Ticket Sales', estimated: '', actual: '' },
    { source: 'Alcohol or food sales', estimated: '', actual: '' },
    { source: 'House Merch', estimated: '', actual: '' },
    { source: 'Donations', estimated: '', actual: '' },
    { source: 'Other', estimated: '', actual: '' },
  ],
  financialNotes: '',
};
const defaultMarketing = {
  channels: {}, otherChannel: '', otherChannelDone: false, notes: '', committeeNotes: '',
};

function fmtMoney(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function SaveStatus({ statuses }) {
  const all = Object.values(statuses);
  if (all.some(s => s === 'error')) return <span className="flex items-center gap-1 text-xs text-red-600"><AlertCircle size={13} /> Error saving</span>;
  if (all.some(s => s === 'saving')) return <span className="flex items-center gap-1 text-xs text-amber-600"><Save size={13} /> Saving…</span>;
  if (all.some(s => s === 'unsaved')) return <span className="flex items-center gap-1 text-xs text-amber-700"><Save size={13} /> Unsaved changes</span>;
  if (all.some(s => s === 'loading')) return <span className="flex items-center gap-1 text-xs text-stone-400"><Save size={13} /> Loading…</span>;
  return <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={13} /> Saved</span>;
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-sand-dark rounded-xl p-5 mb-5">
      {title && <h3 className="text-base font-bold text-gold mb-4 pb-2 border-b border-sand-dark">{title}</h3>}
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold text-ink mb-1">{label}</label>}
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 bg-white';
const taCls = inputCls + ' resize-y';

function CheckList({ options, values = [], onChange }) {
  const toggle = (opt) => onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]);
  return (
    <div className="flex flex-wrap gap-3">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={values.includes(opt)} onChange={() => toggle(opt)} className="accent-gold" />
          {opt}
        </label>
      ))}
    </div>
  );
}

function RadioList({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="radio" checked={value === opt} onChange={() => onChange(opt)} className="accent-gold" />
          {opt}
        </label>
      ))}
    </div>
  );
}

function ItemList({ items = [], onChange, fields, addLabel }) {
  const addRow = () => onChange([...items, Object.fromEntries(fields.map(f => [f, '']))]);
  const removeRow = (i) => onChange(items.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  return (
    <div>
      {items.map((row, i) => (
        <div key={i} className="flex gap-2 mb-2 items-start">
          {fields.map(f => (
            <input key={f} className={inputCls + ' flex-1'} placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
              value={row[f] || ''} onChange={e => updateRow(i, f, e.target.value)} />
          ))}
          <button onClick={() => removeRow(i)} className="mt-1 text-stone-400 hover:text-red-500 flex-shrink-0"><X size={15} /></button>
        </div>
      ))}
      <button onClick={addRow} className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark font-medium mt-1">
        <Plus size={13} /> {addLabel || 'Add item'}
      </button>
    </div>
  );
}

function MoneyTable({ rows, onChange, totalLabel }) {
  const update = (i, field, val) => {
    const next = [...rows];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const totalEst = rows.reduce((s, r) => s + fmtMoney(r.estimated), 0);
  const totalAct = rows.reduce((s, r) => s + fmtMoney(r.actual), 0);
  const labelKey = rows[0]?.category !== undefined ? 'category' : 'source';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-sand-light/60">
            <th className="text-left px-3 py-2 text-xs font-semibold text-ink-light uppercase tracking-wider">{totalLabel}</th>
            <th className="text-right px-3 py-2 text-xs font-semibold text-ink-light uppercase tracking-wider w-32">Estimated $</th>
            <th className="text-right px-3 py-2 text-xs font-semibold text-ink-light uppercase tracking-wider w-32">Actual $</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-sand-dark/40">
              <td className="px-3 py-2 text-ink">{row[labelKey]}</td>
              <td className="px-2 py-1.5">
                <input className="w-full border border-sand-dark rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-gold bg-white"
                  value={row.estimated} onChange={e => update(i, 'estimated', e.target.value)} placeholder="0" />
              </td>
              <td className="px-2 py-1.5">
                <input className="w-full border border-sand-dark rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-gold bg-white"
                  value={row.actual} onChange={e => update(i, 'actual', e.target.value)} placeholder="0" />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-sand-light/80">
            <td className="px-3 py-2 text-sm font-bold text-ink">Total</td>
            <td className="px-3 py-2 text-sm font-bold text-right text-gold">${totalEst.toFixed(2)}</td>
            <td className="px-3 py-2 text-sm font-bold text-right text-gold">${totalAct.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function CommitteeEditUnified({ event, onBack }) {
  const prog = useFormData(event.id, 'programs', defaultPrograms);
  const log  = useFormData(event.id, 'logistics', defaultLogistics);
  const int  = useFormData(event.id, 'interiors', defaultInteriors);
  const hosp = useFormData(event.id, 'hospitality', defaultHospitality);
  const spon = useFormData(event.id, 'sponsorship', defaultSponsorship);
  const vols = useFormData(event.id, 'volunteers', defaultVolunteers);
  const fin  = useFormData(event.id, 'finance', defaultFinance);
  const mkt  = useFormData(event.id, 'marketing', defaultMarketing);

  const [newVolName, setNewVolName] = useState({});
  const [flyerUploading, setFlyerUploading] = useState(false);
  const [flyerError, setFlyerError] = useState('');
  const flyerInputRef = useRef(null);

  async function handleFlyerUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFlyerUploading(true);
    setFlyerError('');
    const ext = file.name.split('.').pop();
    const path = `${event.id}/flyer.${ext}`;
    const { error } = await supabase.storage
      .from('event-flyers')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      setFlyerError(error.message);
      setFlyerUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('event-flyers').getPublicUrl(path);
    const newUrl = urlData.publicUrl + '?t=' + Date.now();
    const newData = { ...prog.data, flyerUrl: newUrl };
    prog.updateField('flyerUrl', newUrl);
    await supabase.from('event_forms').upsert({
      event_id: event.id, form_type: 'programs',
      data: newData, updated_at: new Date().toISOString(),
    });
    setFlyerUploading(false);
  }

  async function handleRemoveFlyer() {
    const newData = { ...prog.data, flyerUrl: '' };
    prog.updateField('flyerUrl', '');
    await supabase.from('event_forms').upsert({
      event_id: event.id, form_type: 'programs',
      data: newData, updated_at: new Date().toISOString(),
    });
  }

  const statuses = {
    prog: prog.saveStatus, log: log.saveStatus, int: int.saveStatus,
    hosp: hosp.saveStatus, spon: spon.saveStatus, vols: vols.saveStatus,
    fin: fin.saveStatus, mkt: mkt.saveStatus,
  };

  // ── Volunteer helpers ─────────────────────────────────────────────
  const roles = vols.data.roles || {};
  function setRole(roleName, field, val) {
    vols.updateField('roles', { ...roles, [roleName]: { ...roles[roleName], [field]: val } });
  }
  function addVolName(roleName) {
    const name = (newVolName[roleName] || '').trim();
    if (!name) return;
    const existing = roles[roleName]?.volunteerNames || [];
    setRole(roleName, 'volunteerNames', [...existing, name]);
    setNewVolName(prev => ({ ...prev, [roleName]: '' }));
  }
  function removeVolName(roleName, idx) {
    const existing = roles[roleName]?.volunteerNames || [];
    setRole(roleName, 'volunteerNames', existing.filter((_, i) => i !== idx));
  }

  // ── Marketing helpers ─────────────────────────────────────────────
  const channels = mkt.data.channels || {};
  function toggleChannel(ch) {
    mkt.updateField('channels', { ...channels, [ch]: { ...channels[ch], done: !channels[ch]?.done } });
  }

  return (
    <div className="min-h-screen bg-sand-light">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-sand-dark shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center gap-2 text-gold hover:text-gold-dark font-medium transition-colors cursor-pointer">
              <ArrowLeft size={18} /> Back
            </button>
            <div className="border-l border-sand-dark pl-3">
              <p className="text-xs uppercase tracking-[0.3em] text-ink-light leading-none mb-0.5">Committee Planning</p>
              <h1 className="text-base font-bold text-gold leading-none">{event.name}</h1>
            </div>
          </div>
          <SaveStatus statuses={statuses} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-1">

        {/* ── Event Overview ── */}
        <SectionCard title="Event Overview">
          {/* Flyer */}
          <div className="mb-5">
            <input ref={flyerInputRef} type="file" accept="image/*" className="hidden" onChange={handleFlyerUpload} />
            {prog.data.flyerUrl ? (
              <div className="relative group">
                <img
                  src={prog.data.flyerUrl}
                  alt="Event flyer"
                  className="w-full max-h-96 object-contain rounded-lg border border-sand-dark bg-sand-light"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => flyerInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-white border border-sand-dark rounded-lg px-3 py-1.5 text-xs font-medium text-ink hover:border-gold hover:text-gold shadow-sm transition-colors"
                  >
                    <Upload size={12} /> Replace
                  </button>
                  <button
                    onClick={handleRemoveFlyer}
                    className="flex items-center gap-1.5 bg-white border border-sand-dark rounded-lg px-3 py-1.5 text-xs font-medium text-ink hover:border-red-400 hover:text-red-500 shadow-sm transition-colors"
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => flyerInputRef.current?.click()}
                disabled={flyerUploading}
                className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-sand-dark rounded-xl py-8 text-ink-light hover:border-gold hover:text-gold hover:bg-sand-light/60 transition-colors cursor-pointer disabled:opacity-50"
              >
                {flyerUploading ? (
                  <span className="text-sm">Uploading…</span>
                ) : (
                  <>
                    <ImageIcon size={28} />
                    <span className="text-sm font-medium">Upload event flyer</span>
                    <span className="text-xs">PNG, JPG, or PDF</span>
                  </>
                )}
              </button>
            )}
            {flyerError && <p className="mt-1.5 text-xs text-red-500">{flyerError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-ink-light uppercase tracking-wider mb-1">Event Name</p>
              <p className="text-sm font-medium text-ink">{event.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-light uppercase tracking-wider mb-1">Date & Time</p>
              <p className="text-sm font-medium text-ink">{[event.date, event.dayTime].filter(Boolean).join(' · ') || 'TBD'}</p>
            </div>
          </div>
          <Field label="Main purpose of this event">
            <CheckList options={PURPOSE_OPTIONS} values={prog.data.purpose || []} onChange={v => prog.updateField('purpose', v)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Expected attendance">
              <input className={inputCls} value={log.data.proposedAttendance || ''} onChange={e => log.updateField('proposedAttendance', e.target.value)} placeholder="e.g. 40–60 guests" />
            </Field>
            <Field label="Ticket price / free / donation-based">
              <input className={inputCls} value={log.data.ticketPrice || ''} onChange={e => log.updateField('ticketPrice', e.target.value)} placeholder="e.g. $25, Free, Donation" />
            </Field>
          </div>
        </SectionCard>

        {/* ── Activities & Program ── */}
        <SectionCard title="Activities, Performers & Speakers">
          <Field label="Performers / speakers">
            <ItemList items={prog.data.performers || []} onChange={v => prog.updateField('performers', v)} fields={['name', 'contact']} addLabel="Add performer" />
          </Field>
          <Field label="Activities">
            <ItemList items={prog.data.activities || []} onChange={v => prog.updateField('activities', v)} fields={['activity', 'timeFrame', 'volunteers']} addLabel="Add activity" />
          </Field>
          <Field label="Timing or transition concerns">
            <textarea className={taCls} rows={2} value={prog.data.transitions || ''} onChange={e => prog.updateField('transitions', e.target.value)} placeholder="Notes on timing, transitions between activities..." />
          </Field>
          <Field label="Action items">
            <ItemList items={prog.data.actionItems || []} onChange={v => prog.updateField('actionItems', v)} fields={['item', 'dueDate', 'volunteer']} addLabel="Add action item" />
          </Field>
        </SectionCard>

        {/* ── Venue & Setup ── */}
        <SectionCard title="Venue & Setup">
          <Field label="Room / grounds use">
            <textarea className={taCls} rows={2} value={log.data.eventLocations || ''} onChange={e => log.updateField('eventLocations', e.target.value)} placeholder="Which rooms and outdoor spaces will be used?" />
          </Field>
          <Field label="Equipment needed">
            <textarea className={taCls} rows={2} value={log.data.equipmentNeeded || ''} onChange={e => log.updateField('equipmentNeeded', e.target.value)} placeholder="Chairs, tables, AV, sound system..." />
          </Field>
          <Field label="Licenses / permits needed">
            <textarea className={taCls} rows={2} value={log.data.licensesPermits || ''} onChange={e => log.updateField('licensesPermits', e.target.value)} placeholder="ABC permit, food handler, noise permit..." />
          </Field>
        </SectionCard>

        {/* ── Decor & Interiors ── */}
        <SectionCard title="Decor & Interiors">
          <Field label="For this event, which applies?">
            <RadioList options={HISTORIC_OPTIONS} value={int.data.historicApproach || ''} onChange={v => int.updateField('historicApproach', v)} />
          </Field>
          <Field label="More info if applicable">
            <textarea className={taCls} rows={2} value={int.data.moreInfo || ''} onChange={e => int.updateField('moreInfo', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Decor or items being added">
              <textarea className={taCls} rows={2} value={int.data.decorAdded || ''} onChange={e => int.updateField('decorAdded', e.target.value)} placeholder="Flowers, signage, etc." />
            </Field>
            <Field label="Estimated decor cost">
              <input className={inputCls} value={int.data.decorCost || ''} onChange={e => int.updateField('decorCost', e.target.value)} placeholder="$0" />
            </Field>
          </div>
        </SectionCard>

        {/* ── Food & Beverage ── */}
        <SectionCard title="Food & Beverage">
          <Field label="Food & beverage plan">
            <ItemList items={hosp.data.foodBevPlan || []} onChange={v => hosp.updateField('foodBevPlan', v)} fields={['item', 'volunteer']} addLabel="Add item" />
          </Field>
          <Field label="Shopping list">
            <ItemList items={hosp.data.shoppingList || []} onChange={v => hosp.updateField('shoppingList', v)} fields={['item', 'volunteer']} addLabel="Add item" />
          </Field>
          <Field label="Rental equipment needed">
            <ItemList items={hosp.data.rentalEquipment || []} onChange={v => hosp.updateField('rentalEquipment', v)} fields={['item', 'volunteer']} addLabel="Add item" />
          </Field>
          <Field label="Serving style">
            <CheckList options={SERVING_OPTIONS} values={hosp.data.servingStyle || []} onChange={v => hosp.updateField('servingStyle', v)} />
          </Field>
          <Field label="Alcohol or specialty beverages involved?">
            <RadioList options={['No', 'Yes']} value={hosp.data.alcoholInvolved || ''} onChange={v => hosp.updateField('alcoholInvolved', v)} />
          </Field>
        </SectionCard>

        {/* ── Sponsorships ── */}
        <SectionCard title="Sponsorships & Partnerships">
          <Field label="How will sponsors be recognized at this event?">
            <CheckList options={RECOGNITION_METHODS} values={spon.data.recognitionMethods || []} onChange={v => spon.updateField('recognitionMethods', v)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Other recognition method">
              <input className={inputCls} value={spon.data.recognitionOther || ''} onChange={e => spon.updateField('recognitionOther', e.target.value)} />
            </Field>
            <Field label="Volunteer name (recognition lead)">
              <input className={inputCls} value={spon.data.recognitionVolunteer || ''} onChange={e => spon.updateField('recognitionVolunteer', e.target.value)} />
            </Field>
          </div>
          <Field label="Potential sponsors well-matched to this event theme or audience">
            <textarea className={taCls} rows={2} value={spon.data.potentialSponsors || ''} onChange={e => spon.updateField('potentialSponsors', e.target.value)} />
          </Field>
          <Field label="Outreach actions needed for this event">
            <CheckList options={OUTREACH_ACTIONS} values={spon.data.outreachActions || []} onChange={v => spon.updateField('outreachActions', v)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Other outreach action">
              <input className={inputCls} value={spon.data.outreachOther || ''} onChange={e => spon.updateField('outreachOther', e.target.value)} />
            </Field>
            <Field label="Volunteer name (outreach lead)">
              <input className={inputCls} value={spon.data.outreachVolunteer || ''} onChange={e => spon.updateField('outreachVolunteer', e.target.value)} />
            </Field>
          </div>
          <Field label="If any sponsors or prospects are being intentionally invited, who and why?">
            <textarea className={taCls} rows={2} value={spon.data.intentionalInvites || ''} onChange={e => spon.updateField('intentionalInvites', e.target.value)} />
          </Field>
          <Field label="Other notes">
            <textarea className={taCls} rows={2} value={spon.data.otherNotes || ''} onChange={e => spon.updateField('otherNotes', e.target.value)} />
          </Field>
        </SectionCard>

        {/* ── Volunteers ── */}
        <SectionCard title="Volunteer Roles">
          <div className="space-y-4">
            {VOLUNTEER_ROLES.map(roleName => {
              const role = roles[roleName] || {};
              const names = role.volunteerNames || [];
              return (
                <div key={roleName} className="border border-sand-dark rounded-lg p-3 bg-sand-light/30">
                  <div className="flex items-center gap-3 mb-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-ink cursor-pointer">
                      <input type="checkbox" checked={!!role.needed} onChange={e => setRole(roleName, 'needed', e.target.checked)} className="accent-gold" />
                      {roleName}
                    </label>
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-ink-light"># needed:</span>
                      <input
                        className="border border-sand-dark rounded px-2 py-0.5 text-sm w-16 text-center focus:outline-none focus:border-gold bg-white"
                        value={role.count || ''}
                        onChange={e => setRole(roleName, 'count', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  {names.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {names.map((name, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-white border border-sand-dark rounded-full px-2.5 py-0.5 text-xs text-ink">
                          {name}
                          <button onClick={() => removeVolName(roleName, idx)} className="text-stone-400 hover:text-red-500 ml-0.5"><X size={11} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      className="border border-sand-dark rounded-lg px-2.5 py-1 text-sm flex-1 focus:outline-none focus:border-gold bg-white"
                      placeholder="Add volunteer name…"
                      value={newVolName[roleName] || ''}
                      onChange={e => setNewVolName(prev => ({ ...prev, [roleName]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVolName(roleName); } }}
                    />
                    <button onClick={() => addVolName(roleName)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gold border border-gold rounded-lg hover:bg-gold hover:text-white transition-colors">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <Field label="Other volunteer notes">
            <textarea className={taCls + ' mt-4'} rows={2} value={vols.data.otherNotes || ''} onChange={e => vols.updateField('otherNotes', e.target.value)} />
          </Field>
        </SectionCard>

        {/* ── Finance ── */}
        <SectionCard title="Finance & Budget">
          <p className="text-xs font-semibold text-ink-light uppercase tracking-wider mb-3">Projected Expenses</p>
          <MoneyTable rows={fin.data.expenses || defaultFinance.expenses} onChange={v => fin.updateField('expenses', v)} totalLabel="Expense Category" />
          <p className="text-xs font-semibold text-ink-light uppercase tracking-wider mt-5 mb-3">Projected Income</p>
          <MoneyTable rows={fin.data.income || defaultFinance.income} onChange={v => fin.updateField('income', v)} totalLabel="Source" />
          <Field label="Financial notes">
            <textarea className={taCls + ' mt-3'} rows={2} value={fin.data.financialNotes || ''} onChange={e => fin.updateField('financialNotes', e.target.value)} />
          </Field>
        </SectionCard>

        {/* ── Marketing ── */}
        <SectionCard title="Marketing Checklist">
          <p className="text-xs text-ink-light mb-3">Check off each marketing channel as it is completed for this event.</p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
            {MARKETING_CHANNELS.map(ch => (
              <label key={ch} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!channels[ch]?.done} onChange={() => toggleChannel(ch)} className="accent-gold" />
                <span className={channels[ch]?.done ? 'line-through text-ink-light' : 'text-ink'}>{ch}</span>
              </label>
            ))}
          </div>
          <Field label="Other channel">
            <div className="flex items-center gap-3">
              <input className={inputCls + ' flex-1'} value={mkt.data.otherChannel || ''} onChange={e => mkt.updateField('otherChannel', e.target.value)} placeholder="Other channel name…" />
              <label className="flex items-center gap-2 text-sm cursor-pointer flex-shrink-0">
                <input type="checkbox" checked={!!mkt.data.otherChannelDone} onChange={e => mkt.updateField('otherChannelDone', e.target.checked)} className="accent-gold" />
                Done
              </label>
            </div>
          </Field>
          <Field label="Additional marketing notes">
            <textarea className={taCls} rows={3} value={mkt.data.notes || ''} onChange={e => mkt.updateField('notes', e.target.value)} />
          </Field>
        </SectionCard>

      </div>
    </div>
  );
}
