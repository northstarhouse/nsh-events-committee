import { useState, useCallback } from 'react';
import {
  ArrowLeft, Calendar, ChevronRight, ClipboardList, Music2, Users,
  MapPin, Megaphone, Coffee, DollarSign, Handshake, Paintbrush, Save, Star
} from 'lucide-react';
import { events2026, months, committeeAreas, getEventsByMonth, getEventById, getEventDisplayName, getDaysUntil } from './eventsData';
import OverallStatusForm from './OverallStatusForm';
import ProgramsForm from './ProgramsForm';
import VolunteerForm from './VolunteerForm';
import LogisticsForm from './LogisticsForm';
import HospitalityForm from './HospitalityForm';
import FinanceForm from './FinanceForm';
import SponsorshipForm from './SponsorshipForm';
import InteriorsForm from './InteriorsForm';
import MarketingForm from './MarketingForm';

const areaIcons = {
  overall: ClipboardList,
  programs: Music2,
  volunteers: Users,
  logistics: MapPin,
  hospitality: Coffee,
  finance: DollarSign,
  sponsorship: Handshake,
  interiors: Paintbrush,
  marketing: Megaphone,
};

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

const volunteerRoles = [
  'Setup', 'Check-in booth', 'Hospitality / Food Support',
  'Cleanup / Breakdown', 'Program Support', 'Float / General Support',
  'Bartending', 'Parking', 'Other',
];

const defaultFormData = {
  overall: {
    statusUpdates: [
      { date: '', status: '', decisions: '', notes: '' },
      { date: '', status: '', decisions: '', notes: '' },
      { date: '', status: '', decisions: '', notes: '' },
      { date: '', status: '', decisions: '', notes: '' },
      { date: '', status: '', decisions: '', notes: '' },
    ],
    finalNotes: '',
  },
  programs: {
    purpose: [],
    performers: [{ name: '', contact: '' }],
    vendorFormsSent: '',
    vendorFormsReceived: '',
    activities: [{ activity: '', timeFrame: '', volunteers: '' }],
    transitions: '',
    actionItems: [{ item: '', dueDate: '', volunteer: '' }],
    otherNotes: '',
    activityReview: [{ activity: '', whatWorked: '', whatDidnt: '', notes: '' }],
    flowTiming: '',
    pinchPoints: '',
    repeatFormat: '',
    committeeNotes: '',
    postOtherNotes: '',
  },
  volunteers: {
    roles: {},
    volunteersAssigned: '',
    boardContacted: '',
    boardContactedDate: '',
    eventSupportContacted: '',
    eventSupportDate: '',
    volunteerBriefingSent: '',
    volunteerBriefingDate: '',
    otherNotes: '',
    avgHoursOnSite: '',
    totalVolunteerHours: '',
    whatWeLearned: '',
  },
  logistics: {
    proposedAttendance: '',
    eventLocations: '',
    setupPlan: '',
    volunteersAssisting: '',
    equipmentNeeded: '',
    safetyConsiderations: '',
    couldImpactSuccess: 'No',
    backupPlan: '',
    otherNotes: '',
    setupVsReality: '',
    adjustmentsMade: '',
    layoutSupportNeeds: '',
  },
  hospitality: {
    foodBevPlan: [{ item: '', volunteer: '' }],
    shoppingList: [{ item: '', volunteer: '' }],
    rentalEquipment: [{ item: '', volunteer: '' }],
    servingStyle: [],
    alcoholInvolved: '',
    cleanupPlan: '',
    volunteersAssisting: '',
    otherNotes: '',
    fbOutcome: '',
    fbOutcomeRanOut: '',
    guestFlow: '',
    guestComments: '',
    committeeThoughts: '',
    postOtherNotes: '',
  },
  finance: {
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
    receiptsCollected: '',
    receiptsDate1: '',
    receiptsDate2: '',
    receiptsDate3: '',
    reimbursementsNeeded: '',
    reimbursementAmount: '',
    reimbursementSubmittedBy: '',
    finalExpenses: '',
    finalIncome: '',
    finalNet: '',
    eventType: '',
    netReportedToBoard: false,
    thankYousSent: false,
    lessonsDocumented: false,
    postNotes: '',
  },
  sponsorship: {
    recognitionMethods: [],
    recognitionOther: '',
    recognitionVolunteer: '',
    potentialSponsors: '',
    outreachActions: [],
    outreachOther: '',
    outreachVolunteer: '',
    intentionalInvites: '',
    otherNotes: '',
    sponsorsInvolved: '',
    recognitionDelivered: '',
    futureNotes: '',
    committeeThoughts: '',
    postOtherNotes: '',
  },
  interiors: {
    historicApproach: '',
    moreInfo: '',
    decorAdded: '',
    decorCost: '',
    removalReasons: [],
    removalOther: '',
    otherNotes: '',
    historicIssues: '',
    wearDamage: '',
    futureAdjustments: '',
    postOtherNotes: '',
  },
  marketing: {
    channels: {},
    otherChannel: '',
    otherChannelDone: false,
    notes: '',
  },
};

const formComponents = {
  overall: OverallStatusForm,
  programs: ProgramsForm,
  volunteers: VolunteerForm,
  logistics: LogisticsForm,
  marketing: MarketingForm,
  hospitality: HospitalityForm,
  finance: FinanceForm,
  sponsorship: SponsorshipForm,
  interiors: InteriorsForm,
};

function DaysUntilBadge({ isoDate }) {
  const days = getDaysUntil(isoDate);
  if (days === null) return <span className="text-xs text-ink-light italic">Date TBD</span>;
  if (days < 0) return <span className="text-xs text-ink-light">Event passed</span>;
  if (days === 0) return <span className="text-xs font-semibold text-gold">Today!</span>;
  if (days === 1) return <span className="text-xs font-semibold text-gold">Tomorrow</span>;
  if (days <= 30) return <span className="text-xs font-semibold text-gold">{days} days away</span>;
  return <span className="text-xs text-ink-light">{days} days away</span>;
}

function hasFormData(eventId, areaKey) {
  try {
    const key = `nsh-events-${eventId}-${areaKey}`;
    const saved = localStorage.getItem(key);
    if (!saved) return false;
    const parsed = JSON.parse(saved);
    return Object.values(parsed).some(v =>
      v !== '' && v !== false && v !== null && v !== undefined &&
      !(Array.isArray(v) && v.length === 0)
    );
  } catch {
    return false;
  }
}

function getStoredFormData(eventId, areaKey) {
  try {
    const key = `nsh-events-${eventId}-${areaKey}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function mergeWithDefaults(defaultData, savedData) {
  if (Array.isArray(defaultData)) {
    if (Array.isArray(savedData) && savedData.length > 0) return savedData;
    return defaultData;
  }
  if (typeof defaultData === 'object' && defaultData !== null) {
    const result = { ...defaultData };
    if (savedData && typeof savedData === 'object') {
      Object.keys(savedData).forEach((key) => {
        result[key] = mergeWithDefaults(defaultData[key], savedData[key]);
      });
    }
    return result;
  }
  return savedData !== undefined ? savedData : defaultData;
}

function formatLabel(label) {
  return label
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function isEmptyValue(value) {
  if (value === null || value === undefined) return true;
  if (value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

const dayExpand = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };

function expandDay(d) {
  return d.replace(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/g, (m) => dayExpand[m] || m);
}

function formatCardDate(event) {
  const { date, dayTime } = event;
  if (!date && !dayTime) return null;
  if (!dayTime) return date;
  if (!date || date === 'TBD') return expandDay(dayTime) + (date === 'TBD' ? ', TBD' : '');
  const timeMatch = dayTime.match(/^(.+?)\s+(\d.+)$/);
  if (!timeMatch) return `${expandDay(dayTime)}, ${date}`;
  const [, days, time] = timeMatch;
  const fullDays = expandDay(days);
  // Clean double dates: "April 17th & April 18th" → "April 17th & 18th"
  const parts = date.split(/\s*&\s*/);
  let dateStr;
  if (parts.length === 2) {
    const m1 = parts[0].match(/^(\w+)\s+(.+)$/);
    const m2 = parts[1].match(/^(\w+)\s+(.+)$/);
    if (m1 && m2 && m1[1] === m2[1]) {
      dateStr = `${m1[1]} ${m1[2]} & ${m2[2]}`;
    } else {
      dateStr = date;
    }
  } else {
    dateStr = date;
  }
  return `${fullDays}, ${dateStr} from ${time}`;
}

function displayValue(value) {
  if (isEmptyValue(value)) return '--';
  if (Array.isArray(value)) return value.filter(v => v !== '').join(', ') || '--';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function Field({ label, value }) {
  return (
    <div className="text-sm text-ink">
      <span className="font-semibold">{label}:</span> {displayValue(value)}
    </div>
  );
}

function AreaHeader({ Icon, area }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-sand flex items-center justify-center">
          <Icon size={18} className="text-gold" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-ink">{area.label}</h3>
        <p className="text-xs text-ink-light">{area.role}  -  {area.person}</p>
      </div>
    </div>
  );
}

export default function EventsDashboard() {
  const [view, setView] = useState('overview');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showAreas, setShowAreas] = useState(false);

  const eventsByMonth = getEventsByMonth();
  const selectedEvent = selectedEventId ? getEventById(selectedEventId) : null;

  const navigateToEvent = useCallback((eventId) => {
    setSelectedEventId(eventId);
    setView('detail');
    setShowAreas(false);
    window.scrollTo(0, 0);
  }, []);

  const navigateToForm = useCallback((areaKey) => {
    setSelectedArea(areaKey);
    setView('form');
    window.scrollTo(0, 0);
  }, []);

  const navigateBack = useCallback(() => {
    if (view === 'form') {
      setView('detail');
      setSelectedArea(null);
    } else if (view === 'detail') {
      setView('overview');
      setSelectedEventId(null);
    }
    window.scrollTo(0, 0);
  }, [view]);

  if (view === 'form' && selectedEvent && selectedArea) {
    const FormComponent = formComponents[selectedArea];
    const area = committeeAreas.find(a => a.key === selectedArea);
    const AreaIcon = areaIcons[selectedArea];
    return (
      <div className="min-h-screen bg-sand-light">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={navigateBack}
            className="flex items-center gap-2 text-gold hover:text-gold-dark mb-6 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to {selectedEvent.name}
          </button>

          <div className="mb-6">
            <div className="flex items-center gap-3">
              {AreaIcon && (
                <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center">
                  <AreaIcon size={22} className="text-gold" />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gold">{area.label}</h1>
            </div>
            <p className="text-ink-light mt-1">{area.role}: {area.person}</p>
            <p className="text-gold font-medium mt-1">
              {selectedEvent.name} {selectedEvent.dayTime && `- ${selectedEvent.dayTime}`}{selectedEvent.date && `, ${selectedEvent.date}`}
            </p>
          </div>

          <FormComponent event={selectedEvent} onSubmitted={navigateBack} />
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedEvent) {
    const completedAreasCount = committeeAreas.filter(area => hasFormData(selectedEvent.id, area.key)).length;
    const totalAreas = committeeAreas.length;
    return (
      <div className="min-h-screen bg-sand-light">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={navigateBack}
            className="flex items-center gap-2 text-gold hover:text-gold-dark mb-6 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Events Overview
          </button>

          <div className="mb-6">
            <button
              onClick={() => setShowAreas((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white px-5 py-2 text-sm font-semibold text-gold shadow-sm transition hover:border-gold hover:shadow-md"
            >
              Update Event Area Notes
              <ChevronRight size={16} className={`transition-transform ${showAreas ? 'rotate-90' : ''}`} />
            </button>

            {showAreas && (
              <div className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {committeeAreas.map((area) => {
                    const Icon = areaIcons[area.key];
                    const hasData = hasFormData(selectedEvent.id, area.key);
                    return (
                      <button
                        key={area.key}
                        onClick={() => navigateToForm(area.key)}
                        className="bg-white border border-sand-dark rounded-xl p-5 text-left hover:border-gold hover:shadow-md transition-all group cursor-pointer relative"
                      >
                        {hasData && (
                          <div className="absolute top-3 right-3">
                            <Star size={16} className="text-gold fill-gold" />
                          </div>
                        )}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                            <Icon size={20} className="text-gold" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-ink text-sm">{area.label}</h3>
                            <p className="text-xs text-ink-light">{area.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gold font-medium">{area.person}</span>
                          <ChevronRight size={14} className="text-ink-light group-hover:text-gold transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-sand-dark rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-light">Event Overview</p>
                <h2 className="text-2xl font-bold text-gold mt-1">{selectedEvent.name}</h2>
              </div>
              <div className="text-sm text-ink-light">
                {selectedEvent.dayTime && <span>{selectedEvent.dayTime}</span>}
                {selectedEvent.date && selectedEvent.dayTime && <span> - </span>}
                {selectedEvent.date && <span>{selectedEvent.date}</span>}
              </div>
            </div>
            <div className="space-y-8">
              <div className="border border-sand-dark/60 rounded-2xl p-5 bg-sand-light/30">
                <h3 className="text-lg font-semibold text-gold mb-4">Pre-Event</h3>
                <div className="space-y-6">
                  {committeeAreas.map((area) => {
                    const stored = getStoredFormData(selectedEvent.id, area.key) || {};
                    const data = mergeWithDefaults(defaultFormData[area.key] || {}, stored);
                    const Icon = areaIcons[area.key];
                    return (
                      <div key={`pre-${area.key}`} className="border border-sand-dark/60 rounded-xl p-4 bg-white">
                        <AreaHeader Icon={Icon} area={area} />
                        {area.key === 'overall' && (() => {
                          const updates = data.statusUpdates || [];
                          const latest = [...updates].reverse().find((entry) =>
                            entry && Object.values(entry).some((v) => !isEmptyValue(v))
                          );
                          const entry = latest || updates[updates.length - 1] || {};
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Field label="Date" value={entry.date} />
                              <Field label="Status" value={entry.status} />
                              <Field label="Decisions Needed" value={entry.decisions} />
                              <Field label="Notes" value={entry.notes} />
                            </div>
                          );
                        })()}

                        {area.key === 'programs' && (
                          <div className="space-y-2">
                            <Field label="Purpose" value={(data.purpose || []).join(', ')} />
                            <Field label="Vendor Forms" value={data.vendorFormsSent} />
                            <Field label="Transitions" value={data.transitions} />
                            <Field label="Other Notes" value={data.otherNotes} />
                            <div className="mt-3 space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-ink-light">Performers / Vendors</p>
                              {(data.performers || []).map((item, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <Field label="Name" value={item.name} />
                                  <Field label="Contact" value={item.contact} />
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-ink-light">Activities</p>
                              {(data.activities || []).map((item, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <Field label="Activity" value={item.activity} />
                                  <Field label="Time Frame" value={item.timeFrame} />
                                  <Field label="Volunteers" value={item.volunteers} />
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-ink-light">Action Items</p>
                              {(data.actionItems || []).map((item, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <Field label="Item" value={item.item} />
                                  <Field label="Due Date" value={item.dueDate} />
                                  <Field label="Volunteer" value={item.volunteer} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {area.key === 'volunteers' && (
                          <div className="space-y-2">
                            <Field label="Volunteers Assigned" value={data.volunteersAssigned} />
                            <Field label="Board Contacted" value={data.boardContacted} />
                            <Field label="Board Contacted Date" value={data.boardContactedDate} />
                            <Field label="Event Support Contacted" value={data.eventSupportContacted} />
                            <Field label="Event Support Date" value={data.eventSupportDate} />
                            <Field label="Volunteer Briefing Sent" value={data.volunteerBriefingSent} />
                            <Field label="Volunteer Briefing Date" value={data.volunteerBriefingDate} />
                            <Field label="Other Notes" value={data.otherNotes} />
                            <div className="mt-3">
                              <p className="text-xs uppercase tracking-[0.2em] text-ink-light mb-2">Volunteer Roles</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {volunteerRoles.map((role) => {
                                  const roleData = (data.roles || {})[role] || {};
                                  return (
                                    <div key={role} className="border border-sand-dark/50 rounded-lg p-2 bg-sand-light/40">
                                      <p className="text-sm font-semibold text-ink">{role}</p>
                                      <p className="text-xs text-ink-light">
                                        Needed: {roleData.needed ? 'Yes' : 'No'} - Count: {displayValue(roleData.count)}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {area.key === 'logistics' && (
                          <div className="space-y-2">
                            <Field label="Proposed Attendance" value={data.proposedAttendance} />
                            <Field label="Event Locations" value={data.eventLocations} />
                            <Field label="Setup Plan" value={data.setupPlan} />
                            <Field label="Volunteers Assisting" value={data.volunteersAssisting} />
                            <Field label="Equipment Needed" value={data.equipmentNeeded} />
                            <Field label="Safety Considerations" value={data.safetyConsiderations} />
                            <Field label="Could Impact Success" value={data.couldImpactSuccess} />
                            <Field label="Backup Plan" value={data.backupPlan} />
                            <Field label="Other Notes" value={data.otherNotes} />
                          </div>
                        )}

                        {area.key === 'hospitality' && (
                          <div className="space-y-2">
                            <Field label="Serving Style" value={(data.servingStyle || []).join(', ')} />
                            <Field label="Alcohol Involved" value={data.alcoholInvolved} />
                            <Field label="Cleanup Plan" value={data.cleanupPlan} />
                            <Field label="Volunteers Assisting" value={data.volunteersAssisting} />
                            <Field label="Other Notes" value={data.otherNotes} />
                            <div className="mt-3 space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-ink-light">Food & Beverage Plan</p>
                              {(data.foodBevPlan || []).map((item, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <Field label="Item" value={item.item} />
                                  <Field label="Volunteer" value={item.volunteer} />
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-ink-light">Shopping List</p>
                              {(data.shoppingList || []).map((item, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <Field label="Item" value={item.item} />
                                  <Field label="Volunteer" value={item.volunteer} />
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-ink-light">Rental Equipment</p>
                              {(data.rentalEquipment || []).map((item, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <Field label="Equipment" value={item.item} />
                                  <Field label="Volunteer" value={item.volunteer} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {area.key === 'finance' && (
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-ink-light">Projected Expenses</p>
                            {(data.expenses || []).map((row, idx) => (
                              <p key={idx} className="text-sm text-ink">
                                {displayValue(row.category)} <span className="text-ink-light">-- Est: {displayValue(row.estimated)} / Actual: {displayValue(row.actual)}</span>
                              </p>
                            ))}
                            <p className="text-xs uppercase tracking-[0.2em] text-ink-light mt-3">Projected Income</p>
                            {(data.income || []).map((row, idx) => (
                              <p key={idx} className="text-sm text-ink">
                                {displayValue(row.source)} <span className="text-ink-light">-- Est: {displayValue(row.estimated)} / Actual: {displayValue(row.actual)}</span>
                              </p>
                            ))}
                            <div className="mt-3">
                              <Field label="Financial Notes" value={data.financialNotes} />
                            </div>
                          </div>
                        )}

                        {area.key === 'sponsorship' && (
                          <div className="space-y-2">
                            <Field label="Recognition Methods" value={(data.recognitionMethods || []).join(', ')} />
                            <Field label="Other Recognition" value={data.recognitionOther} />
                            <Field label="Recognition Volunteer" value={data.recognitionVolunteer} />
                            <Field label="Potential Sponsors" value={data.potentialSponsors} />
                            <Field label="Outreach Actions" value={(data.outreachActions || []).join(', ')} />
                            <Field label="Other Outreach" value={data.outreachOther} />
                            <Field label="Outreach Volunteer" value={data.outreachVolunteer} />
                            <Field label="Intentional Invites" value={data.intentionalInvites} />
                            <Field label="Other Notes" value={data.otherNotes} />
                          </div>
                        )}

                        {area.key === 'interiors' && (
                          <div className="space-y-2">
                            <Field label="Historic Approach" value={data.historicApproach} />
                            <Field label="More Info" value={data.moreInfo} />
                            <Field label="Decor Added" value={data.decorAdded} />
                            <Field label="Decor Cost" value={data.decorCost} />
                            <Field label="Removal Reasons" value={(data.removalReasons || []).join(', ')} />
                            <Field label="Removal Other" value={data.removalOther} />
                            <Field label="Other Notes" value={data.otherNotes} />
                          </div>
                        )}

                        {area.key === 'marketing' && (
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-ink-light">Marketing Channels</p>
                            {marketingChannels.map((channel) => {
                              const channelData = (data.channels || {})[channel] || {};
                              return (
                                <div key={channel} className="border border-sand-dark/50 rounded-lg p-2 bg-sand-light/40">
                                  <p className="text-sm font-semibold text-ink">{channel}</p>
                                  <p className="text-xs text-ink-light">
                                    Status: {channelData.done ? 'Done' : 'Not done'} - Date: {displayValue(channelData.date)} - Notes: {displayValue(channelData.notes)}
                                  </p>
                                </div>
                              );
                            })}
                            <div className="border border-sand-dark/50 rounded-lg p-2 bg-sand-light/40">
                              <p className="text-sm font-semibold text-ink">Other Channel</p>
                              <p className="text-xs text-ink-light">
                                Name: {displayValue(data.otherChannel)} - Done: {data.otherChannelDone ? 'Yes' : 'No'}
                              </p>
                            </div>
                            <div className="mt-3">
                              <Field label="Notes" value={data.notes} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-sand-dark/60 rounded-2xl p-5 bg-sand-light/30">
                <h3 className="text-lg font-semibold text-gold mb-4">Post-Event</h3>
                <div className="space-y-6">
                  {committeeAreas.map((area) => {
                    const stored = getStoredFormData(selectedEvent.id, area.key) || {};
                    const data = mergeWithDefaults(defaultFormData[area.key] || {}, stored);
                    const Icon = areaIcons[area.key];
                    return (
                      <div key={`post-${area.key}`} className="border border-sand-dark/60 rounded-xl p-4 bg-white">
                        <AreaHeader Icon={Icon} area={area} />
                        {area.key === 'overall' && (
                          <Field label="Final Notes" value={data.finalNotes} />
                        )}
                        {area.key === 'programs' && (
                          <div className="space-y-2">
                            <Field label="Flow & Timing" value={data.flowTiming} />
                            <Field label="Pinch Points" value={data.pinchPoints} />
                            <Field label="Repeat Format" value={data.repeatFormat} />
                            <Field label="Committee Notes" value={data.committeeNotes} />
                            <Field label="Other Notes" value={data.postOtherNotes} />
                            <div className="mt-3 space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-ink-light">Activity Review</p>
                              {(data.activityReview || []).map((item, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <Field label="Activity" value={item.activity} />
                                  <Field label="Notes" value={item.notes} />
                                  <Field label="What Worked" value={item.whatWorked} />
                                  <Field label="What Didn't" value={item.whatDidnt} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {area.key === 'volunteers' && (
                          <div className="space-y-2">
                            <Field label="Average Hours On Site" value={data.avgHoursOnSite} />
                            <Field label="Total Volunteer Hours" value={data.totalVolunteerHours} />
                            <Field label="What We Learned" value={data.whatWeLearned} />
                          </div>
                        )}
                        {area.key === 'logistics' && (
                          <div className="space-y-2">
                            <Field label="Setup vs Reality" value={data.setupVsReality} />
                            <Field label="Adjustments Made" value={data.adjustmentsMade} />
                            <Field label="Layout Support Needs" value={data.layoutSupportNeeds} />
                          </div>
                        )}
                        {area.key === 'hospitality' && (
                          <div className="space-y-2">
                            <Field label="Food & Beverage Outcome" value={data.fbOutcome} />
                            <Field label="Ran Out Of" value={data.fbOutcomeRanOut} />
                            <Field label="Guest Flow" value={data.guestFlow} />
                            <Field label="Guest Comments" value={data.guestComments} />
                            <Field label="Committee Thoughts" value={data.committeeThoughts} />
                            <Field label="Other Notes" value={data.postOtherNotes} />
                          </div>
                        )}
                        {area.key === 'finance' && (
                          <div className="space-y-2">
                            <Field label="Receipts Collected" value={data.receiptsCollected} />
                            <Field label="Receipts Dates" value={[data.receiptsDate1, data.receiptsDate2, data.receiptsDate3].filter(Boolean).join(', ')} />
                            <Field label="Reimbursements Needed" value={data.reimbursementsNeeded} />
                            <Field label="Reimbursement Amount" value={data.reimbursementAmount} />
                            <Field label="Submitted By" value={data.reimbursementSubmittedBy} />
                            <Field label="Final Expenses" value={data.finalExpenses} />
                            <Field label="Final Income" value={data.finalIncome} />
                            <Field label="Final Net" value={data.finalNet} />
                            <Field label="Event Type" value={data.eventType} />
                            <Field label="Net Reported To Board" value={data.netReportedToBoard} />
                            <Field label="Thank Yous Sent" value={data.thankYousSent} />
                            <Field label="Lessons Documented" value={data.lessonsDocumented} />
                            <Field label="Post Notes" value={data.postNotes} />
                          </div>
                        )}
                        {area.key === 'sponsorship' && (
                          <div className="space-y-2">
                            <Field label="Sponsors Involved" value={data.sponsorsInvolved} />
                            <Field label="Recognition Delivered" value={data.recognitionDelivered} />
                            <Field label="Future Notes" value={data.futureNotes} />
                            <Field label="Committee Thoughts" value={data.committeeThoughts} />
                            <Field label="Other Notes" value={data.postOtherNotes} />
                          </div>
                        )}
                        {area.key === 'interiors' && (
                          <div className="space-y-2">
                            <Field label="Historic Issues" value={data.historicIssues} />
                            <Field label="Wear / Damage" value={data.wearDamage} />
                            <Field label="Future Adjustments" value={data.futureAdjustments} />
                            <Field label="Other Notes" value={data.postOtherNotes} />
                          </div>
                        )}
                        {area.key === 'marketing' && (
                          <p className="text-sm text-ink-light italic">No post-event fields for Marketing.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overview
  return (
    <div className="min-h-screen bg-sand-light">
      <div className="bg-white border-b border-sand-dark py-6 mb-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gold">North Star House Events Committee Dashboard</h1>
          <p className="text-lg text-ink-light mt-3">2026 Events Overview</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((month) => {
            const monthEvents = eventsByMonth[month];
            return (
              <div
                key={month}
                className="bg-white border border-sand-dark rounded-xl p-4 flex flex-col"
              >
                <h3 className="font-bold text-ink text-lg mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-gold" />
                  {month}
                </h3>
                {monthEvents.length === 0 ? (
                  <p className="text-sm text-ink-light italic">No events scheduled</p>
                ) : (
                  <div className="space-y-2 flex-1">
                    {monthEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => navigateToEvent(event.id)}
                        className="w-full text-left bg-white hover:bg-sand-light rounded-lg p-3 transition-all group cursor-pointer border border-transparent hover:border-gold/30 hover:shadow-sm"
                      >
                        <p className="font-medium text-sm text-ink group-hover:text-gold transition-colors leading-tight">
                          {event.name}
                        </p>
                        {formatCardDate(event) && (
                          <p className="text-xs text-ink-light mt-1">
                            {formatCardDate(event)}
                          </p>
                        )}
                        <div className="mt-1.5">
                          <DaysUntilBadge isoDate={event.isoDate} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
