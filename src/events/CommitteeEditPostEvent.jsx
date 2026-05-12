import { useState, useRef } from 'react';
import { ArrowLeft, Plus, X, CheckCircle2, Save, AlertCircle, Upload, ImageIcon, Star } from 'lucide-react';
import { useFormData } from './useFormData';
import { supabase } from '../lib/supabase';

const RATING_OPTIONS = ['Exceeded expectations', 'Met expectations', 'Below expectations', 'Challenging'];
const QTY_OPTIONS = ['Too much / too many', 'Just right', 'Not enough'];
const MARKETING_CHANNELS = [
  'Press Release', 'Email Blast', 'YubaNet', 'Go Nevada County Calendar',
  'Grass Valley Chamber Newsletter', 'KVMR Calendar', 'Facebook Event Page',
  'NSH Facebook Page', 'NSH Instagram Page', 'Nevada County Peeps',
  'Grass Valley Peeps', 'Lake Wildwood Page', 'Next Door',
  'Union Event Calendar', 'Union Advertisement',
];

const defaultSummary = {
  actualAttendance: '', overallRating: '', highlights: '',
  whatWorkedWell: '', mainChallenges: '', unexpectedIssues: '',
};
const defaultProgram = {
  executionNotes: '', audienceReception: '', performerFeedback: '',
  programChanges: '', programRecommendations: '',
};
const defaultOps = {
  setupVsReality: '', adjustmentsDuringEvent: '', venueIssues: '',
  decorNotes: '', cleanupNotes: '',
  foodBevNotes: '', quantityAccuracy: '', foodBevChanges: '', vendorNotes: '',
  volunteerPerformance: '', staffingLessons: '',
  thankYous: [],
};
const defaultOutreach = {
  channelNotes: {}, bestChannel: '', marketingRecommendations: '',
  thankYousSent: false, sponsorFollowUp: '', sponsorFeedback: '',
  topLessons: [], doNextTime: '', changeNextTime: '', archiveNotes: '',
};

function SaveStatus({ statuses }) {
  const all = Object.values(statuses);
  if (all.some(s => s === 'error')) return <span className="flex items-center gap-1 text-xs text-red-600"><AlertCircle size={13} /> Error saving</span>;
  if (all.some(s => s === 'saving')) return <span className="flex items-center gap-1 text-xs text-amber-600"><Save size={13} /> Saving…</span>;
  if (all.some(s => s === 'unsaved')) return <span className="flex items-center gap-1 text-xs text-amber-700"><Save size={13} /> Unsaved changes</span>;
  if (all.some(s => s === 'loading')) return <span className="flex items-center gap-1 text-xs text-stone-400"><Save size={13} /> Loading…</span>;
  return <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={13} /> Saved</span>;
}

function SectionCard({ title, badge, children }) {
  return (
    <div className="bg-white border border-sand-dark rounded-xl p-5 mb-5">
      {title && (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-sand-dark">
          <h3 className="text-base font-bold text-gold">{title}</h3>
          {badge && <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
      )}
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

function TagList({ items = [], onAdd, onRemove, placeholder }) {
  const [input, setInput] = useState('');
  function submit() {
    const v = input.trim();
    if (!v) return;
    onAdd(v);
    setInput('');
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-sand-light border border-sand-dark rounded-full px-3 py-1 text-sm">
            {item}
            <button onClick={() => onRemove(i)} className="text-stone-400 hover:text-red-500 ml-0.5"><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className={inputCls}
          placeholder={placeholder || 'Add item…'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
        />
        <button onClick={submit} className="flex items-center gap-1 text-xs bg-sand border border-sand-dark rounded-lg px-3 py-2 hover:border-gold hover:text-gold transition-colors">
          <Plus size={13} /> Add
        </button>
      </div>
    </div>
  );
}

function MoneyTable({ rows, onChange }) {
  const update = (i, field, val) => {
    const next = [...rows];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const totalEst = rows.reduce((s, r) => s + (parseFloat(r.estimated) || 0), 0);
  const totalAct = rows.reduce((s, r) => s + (parseFloat(r.actual) || 0), 0);
  const labelKey = rows[0]?.category !== undefined ? 'category' : 'source';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-sand-light/60">
            <th className="text-left px-3 py-2 text-xs font-semibold text-ink-light uppercase tracking-wider">{labelKey === 'category' ? 'Expense' : 'Income'}</th>
            <th className="text-right px-3 py-2 text-xs font-semibold text-ink-light uppercase tracking-wider w-32">Estimated $</th>
            <th className="text-right px-3 py-2 text-xs font-semibold text-amber-700 uppercase tracking-wider w-32">Actual $</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-sand-dark/40">
              <td className="px-3 py-2 text-ink">{row[labelKey]}</td>
              <td className="px-2 py-1.5">
                <input className="w-full border border-sand-dark rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-gold bg-sand-light/40 text-ink-light" value={row.estimated || ''} onChange={e => update(i, 'estimated', e.target.value)} placeholder="0" />
              </td>
              <td className="px-2 py-1.5">
                <input className="w-full border border-amber-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-amber-500 bg-amber-50" value={row.actual || ''} onChange={e => update(i, 'actual', e.target.value)} placeholder="0" />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-sand-light/80">
            <td className="px-3 py-2 text-sm font-bold text-ink">Total</td>
            <td className="px-3 py-2 text-sm font-bold text-right text-ink-light">${totalEst.toFixed(2)}</td>
            <td className="px-3 py-2 text-sm font-bold text-right text-amber-700">${totalAct.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function CommitteeEditPostEvent({ event, onBack }) {
  const sum  = useFormData(event.id, 'post-summary', defaultSummary);
  const prog = useFormData(event.id, 'post-program', defaultProgram);
  const ops  = useFormData(event.id, 'post-ops', defaultOps);
  const fin  = useFormData(event.id, 'finance', {
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
  });
  const out  = useFormData(event.id, 'post-outreach', defaultOutreach);

  // Flyer (shared with pre-event programs form)
  const [flyerUploading, setFlyerUploading] = useState(false);
  const flyerInputRef = useRef(null);
  const prePrograms  = useFormData(event.id, 'programs', { flyerUrl: '' });
  const flyerUrl = prePrograms.data.flyerUrl || '';

  const statuses = {
    sum: sum.saveStatus, prog: prog.saveStatus, ops: ops.saveStatus,
    fin: fin.saveStatus, out: out.saveStatus,
  };

  async function handleFlyerUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFlyerUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${event.id}/flyer.${ext}`;
    const { error } = await supabase.storage.from('event-flyers').upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setFlyerUploading(false); return; }
    const { data: urlData } = supabase.storage.from('event-flyers').getPublicUrl(path);
    const newUrl = urlData.publicUrl + '?t=' + Date.now();
    prePrograms.updateField('flyerUrl', newUrl);
    await supabase.from('event_forms').upsert({
      event_id: event.id, form_type: 'programs',
      data: { ...prePrograms.data, flyerUrl: newUrl }, updated_at: new Date().toISOString(),
    });
    setFlyerUploading(false);
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
              <p className="text-xs uppercase tracking-[0.3em] text-amber-600 leading-none mb-0.5">After-Event Review</p>
              <h1 className="text-base font-bold text-gold leading-none">{event.name}</h1>
            </div>
          </div>
          <SaveStatus statuses={statuses} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-1">

        {/* ── Event Flyer ── */}
        <SectionCard title="Event Flyer">
          <input ref={flyerInputRef} type="file" accept="image/*" className="hidden" onChange={handleFlyerUpload} />
          {flyerUrl ? (
            <div className="relative group">
              <img src={flyerUrl} alt="Event flyer" className="w-full max-h-72 object-contain rounded-lg border border-sand-dark bg-sand-light" />
              <button
                onClick={() => flyerInputRef.current?.click()}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 bg-white border border-sand-dark rounded-lg px-3 py-1.5 text-xs font-medium text-ink hover:border-gold hover:text-gold shadow-sm transition-all"
              >
                <Upload size={12} /> Replace
              </button>
            </div>
          ) : (
            <button
              onClick={() => flyerInputRef.current?.click()}
              disabled={flyerUploading}
              className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-sand-dark rounded-xl py-6 text-ink-light hover:border-gold hover:text-gold hover:bg-sand-light/60 transition-colors cursor-pointer disabled:opacity-50"
            >
              {flyerUploading ? <span className="text-sm">Uploading…</span> : <><ImageIcon size={24} /><span className="text-sm font-medium">Upload event flyer</span></>}
            </button>
          )}
        </SectionCard>

        {/* ── Event Summary ── */}
        <SectionCard title="Event Summary" badge="Post-Event">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-ink-light uppercase tracking-wider mb-1">Event</p>
              <p className="text-sm font-medium text-ink">{event.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-light uppercase tracking-wider mb-1">Date & Time</p>
              <p className="text-sm font-medium text-ink">{[event.date, event.dayTime].filter(Boolean).join(' · ') || 'TBD'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Actual attendance">
              <input className={inputCls} value={sum.data.actualAttendance || ''} onChange={e => sum.updateField('actualAttendance', e.target.value)} placeholder="e.g. 52 guests" />
            </Field>
            <Field label="Overall rating">
              <RadioList options={RATING_OPTIONS} value={sum.data.overallRating || ''} onChange={v => sum.updateField('overallRating', v)} />
            </Field>
          </div>
          <Field label="Highlights / memorable moments">
            <textarea className={taCls} rows={3} value={sum.data.highlights || ''} onChange={e => sum.updateField('highlights', e.target.value)} placeholder="What stood out? What will people remember?" />
          </Field>
          <Field label="What worked well">
            <textarea className={taCls} rows={3} value={sum.data.whatWorkedWell || ''} onChange={e => sum.updateField('whatWorkedWell', e.target.value)} placeholder="Specific things that went smoothly…" />
          </Field>
          <Field label="Main challenges">
            <textarea className={taCls} rows={3} value={sum.data.mainChallenges || ''} onChange={e => sum.updateField('mainChallenges', e.target.value)} placeholder="What made this event difficult?" />
          </Field>
          <Field label="Unexpected issues">
            <textarea className={taCls} rows={2} value={sum.data.unexpectedIssues || ''} onChange={e => sum.updateField('unexpectedIssues', e.target.value)} placeholder="Anything that came up that we didn't anticipate?" />
          </Field>
        </SectionCard>

        {/* ── Program Review ── */}
        <SectionCard title="Program & Activities Review">
          <Field label="How did the program execute?">
            <textarea className={taCls} rows={3} value={prog.data.executionNotes || ''} onChange={e => prog.updateField('executionNotes', e.target.value)} placeholder="Did it run as planned? Timing, flow, transitions…" />
          </Field>
          <Field label="Audience reception">
            <textarea className={taCls} rows={2} value={prog.data.audienceReception || ''} onChange={e => prog.updateField('audienceReception', e.target.value)} placeholder="How did guests respond? Engagement level?" />
          </Field>
          <Field label="Performer / speaker feedback">
            <textarea className={taCls} rows={2} value={prog.data.performerFeedback || ''} onChange={e => prog.updateField('performerFeedback', e.target.value)} placeholder="Notes on specific performers or speakers…" />
          </Field>
          <Field label="Changes made on the day">
            <textarea className={taCls} rows={2} value={prog.data.programChanges || ''} onChange={e => prog.updateField('programChanges', e.target.value)} placeholder="What had to be adjusted during the event?" />
          </Field>
          <Field label="Recommendations for next time">
            <textarea className={taCls} rows={3} value={prog.data.programRecommendations || ''} onChange={e => prog.updateField('programRecommendations', e.target.value)} placeholder="What would you do differently with programming?" />
          </Field>
        </SectionCard>

        {/* ── Venue & Setup Review ── */}
        <SectionCard title="Venue & Setup Review">
          <Field label="Setup vs. reality">
            <textarea className={taCls} rows={3} value={ops.data.setupVsReality || ''} onChange={e => ops.updateField('setupVsReality', e.target.value)} placeholder="How did the actual setup compare to the plan?" />
          </Field>
          <Field label="Adjustments made during the event">
            <textarea className={taCls} rows={2} value={ops.data.adjustmentsDuringEvent || ''} onChange={e => ops.updateField('adjustmentsDuringEvent', e.target.value)} placeholder="Layout changes, equipment moves, etc." />
          </Field>
          <Field label="Venue issues to note">
            <textarea className={taCls} rows={2} value={ops.data.venueIssues || ''} onChange={e => ops.updateField('venueIssues', e.target.value)} placeholder="Maintenance, access, parking, sound, lighting…" />
          </Field>
          <Field label="Decor notes">
            <textarea className={taCls} rows={2} value={ops.data.decorNotes || ''} onChange={e => ops.updateField('decorNotes', e.target.value)} placeholder="What worked visually? What to change?" />
          </Field>
          <Field label="Cleanup notes">
            <textarea className={taCls} rows={2} value={ops.data.cleanupNotes || ''} onChange={e => ops.updateField('cleanupNotes', e.target.value)} placeholder="How did breakdown go? Anything left behind?" />
          </Field>
        </SectionCard>

        {/* ── Hospitality Review ── */}
        <SectionCard title="Food & Beverage Review">
          <Field label="How did food & beverage go?">
            <textarea className={taCls} rows={3} value={ops.data.foodBevNotes || ''} onChange={e => ops.updateField('foodBevNotes', e.target.value)} placeholder="Overall hospitality experience…" />
          </Field>
          <Field label="Quantity accuracy">
            <RadioList options={QTY_OPTIONS} value={ops.data.quantityAccuracy || ''} onChange={v => ops.updateField('quantityAccuracy', v)} />
          </Field>
          <Field label="What to change next time">
            <textarea className={taCls} rows={2} value={ops.data.foodBevChanges || ''} onChange={e => ops.updateField('foodBevChanges', e.target.value)} placeholder="Menu changes, quantities, serving approach…" />
          </Field>
          <Field label="Vendor / supplier notes">
            <textarea className={taCls} rows={2} value={ops.data.vendorNotes || ''} onChange={e => ops.updateField('vendorNotes', e.target.value)} placeholder="Would you use them again? Issues?" />
          </Field>
        </SectionCard>

        {/* ── Volunteer Review ── */}
        <SectionCard title="Volunteer & Team Review">
          <Field label="Volunteer performance notes">
            <textarea className={taCls} rows={3} value={ops.data.volunteerPerformance || ''} onChange={e => ops.updateField('volunteerPerformance', e.target.value)} placeholder="How did the team do? Standouts? Gaps?" />
          </Field>
          <Field label="Staffing lessons">
            <textarea className={taCls} rows={2} value={ops.data.staffingLessons || ''} onChange={e => ops.updateField('staffingLessons', e.target.value)} placeholder="Were there enough volunteers? Right roles?" />
          </Field>
          <Field label="Thank you notes needed">
            <TagList
              items={ops.data.thankYous || []}
              onAdd={v => ops.updateField('thankYous', [...(ops.data.thankYous || []), v])}
              onRemove={i => ops.updateField('thankYous', (ops.data.thankYous || []).filter((_, idx) => idx !== i))}
              placeholder="Name or group to thank…"
            />
          </Field>
        </SectionCard>

        {/* ── Finance Actuals ── */}
        <SectionCard title="Finance Actuals" badge="Shared with planning">
          <p className="text-xs text-ink-light mb-4">Actual figures entered here also update the pre-event finance form.</p>
          <Field label="Expenses">
            <MoneyTable rows={fin.data.expenses || []} onChange={v => fin.updateField('expenses', v)} />
          </Field>
          <Field label="Income">
            <MoneyTable rows={fin.data.income || []} onChange={v => fin.updateField('income', v)} />
          </Field>
          {(() => {
            const totalExp = (fin.data.expenses || []).reduce((s, r) => s + (parseFloat(r.actual) || 0), 0);
            const totalInc = (fin.data.income || []).reduce((s, r) => s + (parseFloat(r.actual) || 0), 0);
            const net = totalInc - totalExp;
            return (
              <div className="mt-3 flex justify-end">
                <div className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold border ${net >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  Net: {net >= 0 ? '+' : ''}{net.toFixed(2)}
                </div>
              </div>
            );
          })()}
          <Field label="Financial notes">
            <textarea className={taCls} rows={2} value={fin.data.financialNotes || ''} onChange={e => fin.updateField('financialNotes', e.target.value)} placeholder="Budget notes, discrepancies, follow-ups…" />
          </Field>
        </SectionCard>

        {/* ── Marketing Review ── */}
        <SectionCard title="Marketing Review">
          <Field label="Channel performance notes">
            <div className="space-y-2">
              {MARKETING_CHANNELS.map(ch => (
                <div key={ch} className="flex items-center gap-3">
                  <span className="text-sm text-ink w-52 flex-shrink-0">{ch}</span>
                  <input
                    className={inputCls}
                    placeholder="Notes on reach, response, effectiveness…"
                    value={(out.data.channelNotes || {})[ch] || ''}
                    onChange={e => out.updateField('channelNotes', { ...(out.data.channelNotes || {}), [ch]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </Field>
          <Field label="Best-performing channel">
            <input className={inputCls} value={out.data.bestChannel || ''} onChange={e => out.updateField('bestChannel', e.target.value)} placeholder="Which channel drove the most engagement or attendance?" />
          </Field>
          <Field label="Marketing recommendations">
            <textarea className={taCls} rows={2} value={out.data.marketingRecommendations || ''} onChange={e => out.updateField('marketingRecommendations', e.target.value)} placeholder="What to do differently next time?" />
          </Field>
        </SectionCard>

        {/* ── Sponsorship Follow-Up ── */}
        <SectionCard title="Sponsorship Follow-Up">
          <Field label="">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={out.data.thankYousSent || false} onChange={e => out.updateField('thankYousSent', e.target.checked)} className="accent-gold" />
              <span className="font-medium text-ink">Thank-you notes sent to sponsors</span>
            </label>
          </Field>
          <Field label="Follow-up needed">
            <textarea className={taCls} rows={2} value={out.data.sponsorFollowUp || ''} onChange={e => out.updateField('sponsorFollowUp', e.target.value)} placeholder="Sponsors to contact, commitments to confirm…" />
          </Field>
          <Field label="Sponsor feedback">
            <textarea className={taCls} rows={2} value={out.data.sponsorFeedback || ''} onChange={e => out.updateField('sponsorFeedback', e.target.value)} placeholder="Any feedback received from sponsors?" />
          </Field>
        </SectionCard>

        {/* ── Lessons Learned ── */}
        <SectionCard title="Lessons Learned">
          <Field label="Top lessons from this event">
            <TagList
              items={out.data.topLessons || []}
              onAdd={v => out.updateField('topLessons', [...(out.data.topLessons || []), v])}
              onRemove={i => out.updateField('topLessons', (out.data.topLessons || []).filter((_, idx) => idx !== i))}
              placeholder="Add a lesson…"
            />
          </Field>
          <Field label="Do next time">
            <textarea className={taCls} rows={3} value={out.data.doNextTime || ''} onChange={e => out.updateField('doNextTime', e.target.value)} placeholder="Things to keep or add for the next time we run this event…" />
          </Field>
          <Field label="Change next time">
            <textarea className={taCls} rows={3} value={out.data.changeNextTime || ''} onChange={e => out.updateField('changeNextTime', e.target.value)} placeholder="Things to do differently…" />
          </Field>
          <Field label="Archive notes">
            <textarea className={taCls} rows={3} value={out.data.archiveNotes || ''} onChange={e => out.updateField('archiveNotes', e.target.value)} placeholder="Context for future committees — history, contacts, venue notes, etc." />
          </Field>
        </SectionCard>

      </div>
    </div>
  );
}
