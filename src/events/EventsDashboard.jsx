import { useState, useCallback, useEffect } from 'react';
import {
  ArrowLeft, Calendar, ChevronRight, ClipboardList, Music2, Users,
  MapPin, Megaphone, Coffee, DollarSign, Handshake, Paintbrush, Save, Star,
  Plus, X, Send, Printer
} from 'lucide-react';
import { events2026, months, committeeAreas, getEventsByMonth, getEventById, getEventDisplayName, getDaysUntil } from './eventsData';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
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
    committeeNotes: '',
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
    committeeNotes: '',
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
    committeeNotes: '',
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
    committeeNotes: '',
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
    committeeNotes: '',
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
    committeeNotes: '',
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
    committeeNotes: '',
    postOtherNotes: '',
  },
  marketing: {
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

const committeeContacts = [
  { name: 'Barbara Kusha', role: 'Event Chair + Hospitality', phone: '925-200-0705', email: 'barbarakusha@gmail.com' },
  { name: 'Derek Cheeseman', role: 'Sponsorship & Partnership', phone: '650-339-21073', email: 'derekcheeseman@comcast.net' },
  { name: 'Gerrie Kopec', role: 'Programs', phone: '530-913-5568', email: 'gkopec333@gmail.com' },
  { name: 'Ken Underwood', role: 'Finance and Budget', phone: '530-537-5051', email: 'underwood.kenneth@gmail.com' },
  { name: 'Rebekah Freeman', role: 'Interiors', phone: '209-401-6986', email: 'onediva2b7580@gmail.com' },
  { name: 'Vince LoFranco', role: 'Logistics & Operations', phone: '831-216-4399', email: 'felton95018@gmail.com' },
  { name: 'Haley Wright', role: 'Volunteers + Marketing', phone: '530-913-6348', email: 'media@thenorthstarhouse.org' },
];

const eventSupportContacts = [
  { name: 'Jen McGuire', role: 'Event Support', phone: '530-575-2451', email: 'jen@thenorthstarhouse.org' },
  { name: 'Diana Cushway', role: 'Event Support', phone: '415-516-9549', email: 'dgcushway@icloud.com' },
];

const sponsorList = [
  {
    organization: 'Acton Arboriculture',
    contact: 'Zeno & Erin Acton',
    value: 'TBD',
    category: 'Grounds',
    phone: '--',
    email: 'ActonArboriculture@mail.singleops.com',
    address: 'PO Box 17 Grass Valley, CA 95945',
    date: 'January 25, 2026',
    status: 'Pending',
    notes: '--',
    lead: 'Paula Campbell',
  },
  {
    organization: 'New Wave Green',
    contact: 'Molly Breen',
    value: '5000',
    category: 'Garden & Grounds',
    phone: '5309130295',
    email: 'gardens.newwave@gmail.com',
    address: '16318 Indian Flat Rd Nevada City, CA 95959',
    date: 'December 31, 2025',
    status: 'Pending',
    notes: '--',
    lead: 'Paula Campbell',
  },
  {
    organization: 'Timeless Arches - Event Rentals',
    contact: 'Heather Dodd',
    value: '$1200-2500',
    category: 'Venue & Events',
    phone: '777-800-6190',
    email: 'heather@timelessarches.com',
    address: '--',
    date: 'January 23, 2025',
    status: 'Pending',
    notes: 'This is an offer - need to take them up on it - Sierra at the Wedding Fair',
    lead: 'Sierra Gionnoni',
  },
  {
    organization: 'Russell Davidson Architecture & Design',
    contact: 'Russell Davidson',
    value: '$170/hr',
    category: 'Restoration',
    phone: '530-913-2370',
    email: 'russ@davidsonarch.com',
    address: '149 Crown Point Ct. Grass Valley, CA 95945',
    date: '--',
    status: 'Pending',
    notes: '--',
    lead: 'Gary Emanuel',
  },
  {
    organization: 'The History Mill',
    contact: 'Derek Cheeseman',
    value: 'Booklets, research, publications, etc',
    category: 'General',
    phone: '650-339-21073',
    email: '--',
    address: '--',
    date: '--',
    status: 'Pending',
    notes: '--',
    lead: '--',
  },
];

const resourceForms = [
  {
    label: 'Reimbursement Form',
    href: 'https://drive.google.com/file/d/1Vkfh6Z5eM1RPUtw6j8mQjqKM71-YFPrW/view?usp=drive_link',
  },
  {
    label: 'In-Kind Sponsorship Documentation',
    href: 'https://drive.google.com/file/d/1xny-gHGea_Fy3UKXi_M_heYVwz9gso5L/view?usp=drive_link',
  },
  {
    label: 'Incident and Injury Report Form',
    href: 'https://drive.google.com/file/d/1UNzWO6b_-YbKd_rYUxC5GkA2dRQVfcg-/view?usp=drive_link',
  },
  {
    label: 'Board Submission Form',
    href: 'https://drive.google.com/file/d/1_-AcaquXeK-O1x9AOubbQNCwoLWzu3f_/view?usp=drive_link',
  },
];

const inventoryItems = [
  { quantity: '200', item: 'White Chairs' },
  { quantity: '45', item: 'Black meeting chairs (indoor use only)' },
  { quantity: '25', item: '60 inch round tables' },
  { quantity: '4', item: '8ft rectangle tables' },
  { quantity: '2', item: '6ft rectangle tables' },
  { quantity: '1', item: 'Card table' },
  { quantity: '1', item: 'Cocktail table' },
  { quantity: 'Unknown', item: 'Outdoor glass tables' },
  { quantity: 'Unknown', item: 'Black table cloths' },
  { quantity: 'Unknown', item: 'White table cloths' },
  { quantity: 'Unknown', item: 'Green table cloths' },
  { quantity: 'Unknown', item: 'Floral outdoor table cloths' },
  { quantity: 'Unknown', item: 'Umbrellas' },
];

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

function formatMessageTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
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
    <div className="text-sm text-ink pb-2 mb-2 border-b border-gold/30">
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
  const [selectedResource, setSelectedResource] = useState(null);
  const [customEvents, setCustomEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('nsh-custom-events');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Load custom events from Google Sheets on mount
  useEffect(() => {
    if (!GOOGLE_SCRIPT_URL) return;
    const params = new URLSearchParams({ action: 'getFormData', eventId: 'nsh-dashboard', formType: 'custom-events' });
    fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`)
      .then(r => r.json())
      .then(result => {
        if (result.success && result.data && Array.isArray(result.data.events) && result.data.events.length > 0) {
          setCustomEvents(result.data.events);
          localStorage.setItem('nsh-custom-events', JSON.stringify(result.data.events));
        }
      })
      .catch(() => {});
  }, []);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [addEventForm, setAddEventForm] = useState({
    name: '', month: 'January', date: '', dayTime: '', isoDate: '',
  });
  const [showGeneralNotes, setShowGeneralNotes] = useState(false);
  const [generalMessages, setGeneralMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [detailDataVersion, setDetailDataVersion] = useState(0);

  const loadGeneralMessages = (raw) => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.messages)) return parsed.messages;
      // Migrate old { notes: string } format
      if (parsed.notes && typeof parsed.notes === 'string' && parsed.notes.trim()) {
        return [{ text: parsed.notes, ts: new Date().toISOString() }];
      }
      return [];
    } catch {
      // Very old format: raw plain string
      return raw.trim() ? [{ text: raw.trim(), ts: new Date().toISOString() }] : [];
    }
  };

  useEffect(() => {
    setShowGeneralNotes(false);
    setNewMessageText('');
    if (!selectedEventId) { setGeneralMessages([]); return; }
    const raw = localStorage.getItem(`nsh-events-${selectedEventId}-general-notes`);
    setGeneralMessages(loadGeneralMessages(raw));
    if (GOOGLE_SCRIPT_URL) {
      const params = new URLSearchParams({ action: 'getFormData', eventId: selectedEventId, formType: 'general-notes' });
      fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`)
        .then(r => r.json())
        .then(result => {
          if (result.success && result.data) {
            const msgs = Array.isArray(result.data.messages) ? result.data.messages : loadGeneralMessages(result.data.notes || '');
            setGeneralMessages(msgs);
            localStorage.setItem(`nsh-events-${selectedEventId}-general-notes`, JSON.stringify({ messages: msgs }));
          }
        })
        .catch(() => {});
    }
  }, [selectedEventId]);

  // Sync all committee area form data from Google Sheets when entering detail view
  useEffect(() => {
    if (view !== 'detail' || !selectedEventId || !GOOGLE_SCRIPT_URL) return;
    let cancelled = false;
    committeeAreas.forEach(({ key: formType }) => {
      const params = new URLSearchParams({ action: 'getFormData', eventId: selectedEventId, formType });
      fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`)
        .then(r => r.json())
        .then(result => {
          if (cancelled) return;
          if (result.success && result.data && Object.keys(result.data).length > 0) {
            localStorage.setItem(`nsh-events-${selectedEventId}-${formType}`, JSON.stringify(result.data));
            setDetailDataVersion(v => v + 1);
          }
        })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, [selectedEventId, view]);

  const generalRef = { id: selectedEventId, messages: generalMessages, newText: newMessageText };
  const handleSendMessage = () => {
    const { id, messages, newText } = generalRef;
    if (!id || !newText.trim()) return;
    const updated = [...messages, { text: newText.trim(), ts: new Date().toISOString() }];
    setGeneralMessages(updated);
    setNewMessageText('');
    try {
      const payload = JSON.stringify({ messages: updated });
      localStorage.setItem(`nsh-events-${id}-general-notes`, payload);
      if (GOOGLE_SCRIPT_URL) {
        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'saveFormData', eventId: id, formType: 'general-notes', data: { messages: updated } }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to save general notes:', err);
    }
  };

  const allEvents = [...events2026, ...customEvents];
  const eventsByMonth = months.reduce((acc, month) => {
    acc[month] = allEvents.filter(e => e.month === month);
    return acc;
  }, {});
  const selectedEvent = selectedEventId ? allEvents.find(e => e.id === selectedEventId) : null;

  const handleAddEvent = useCallback(() => {
    if (!addEventForm.name.trim()) return;
    const newEvent = {
      ...addEventForm,
      id: `custom-${Date.now()}`,
      isoDate: addEventForm.isoDate || null,
    };
    const updated = [...customEvents, newEvent];
    setCustomEvents(updated);
    localStorage.setItem('nsh-custom-events', JSON.stringify(updated));
    if (GOOGLE_SCRIPT_URL) {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'saveFormData', eventId: 'nsh-dashboard', formType: 'custom-events', data: { events: updated } }),
      }).catch(() => {});
    }
    setShowAddEvent(false);
    setAddEventForm({ name: '', month: 'January', date: '', dayTime: '', isoDate: '' });
  }, [addEventForm, customEvents]);

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

  const handlePrint = () => {
    if (!selectedEvent) return;
    const D = (key) => getStoredFormData(selectedEvent.id, key) || {};
    const v = (val) => {
      if (val === null || val === undefined || val === '' || val === false) return '';
      if (val === true) return 'Yes';
      if (Array.isArray(val)) return val.filter(Boolean).join(', ');
      return String(val);
    };
    const css = `
      @page { margin: 0.75in; size: letter; }
      * { box-sizing: border-box; }
      body { font-family: Georgia, serif; font-size: 13px; color: #2b251a; margin: 0; line-height: 1.5; }
      .area { page-break-before: always; }
      .area:first-child { page-break-before: avoid; }
      .ev-hdr { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2.5px solid #886c44; margin-bottom: 22px; padding-bottom: 12px; }
      .ev-name { font-size: 22px; font-weight: bold; color: #886c44; }
      .ev-sub { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: #4a4235; margin-bottom: 4px; }
      .ev-dt { font-size: 12px; color: #4a4235; text-align: right; }
      .area-title { margin-bottom: 18px; border-left: 4px solid #886c44; padding-left: 10px; }
      .area-title h2 { font-size: 17px; font-weight: bold; color: #886c44; margin: 0 0 2px 0; }
      .area-title p { font-size: 11px; color: #4a4235; margin: 0; }
      .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 28px; }
      .fld { margin-bottom: 18px; }
      .fld-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #886c44; margin-bottom: 5px; }
      .fld-val { font-size: 13px; min-height: 48px; color: #2b251a; padding: 6px 8px; border: 1px solid #ccc; border-radius: 3px; background: #fafaf8; line-height: 1.6; }
      .fld-val.empty { color: #aaa; }
      table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin-bottom: 20px; }
      th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #886c44; text-align: left; padding: 6px 10px; border-bottom: 2px solid #886c44; background: #faf7f2; }
      td { padding: 10px 10px; border-bottom: 1px solid #d8d0c5; color: #2b251a; min-height: 44px; vertical-align: top; }
      .sec-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #4a4235; margin: 20px 0 8px 0; border-bottom: 1px solid #e8dfd2; padding-bottom: 4px; }
      .chk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 28px; margin-bottom: 18px; }
      .chk-item { display: flex; align-items: center; gap: 9px; font-size: 13px; padding: 4px 0; }
      .chk-box { width: 18px; height: 18px; border: 1.5px solid #886c44; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; color: #886c44; font-weight: bold; border-radius: 2px; }
    `;
    const hdr = `<div class="ev-hdr"><div><div class="ev-sub">North Star House Events Committee</div><div class="ev-name">${selectedEvent.name}</div></div><div class="ev-dt">${[selectedEvent.dayTime, selectedEvent.date].filter(Boolean).join(' · ')}</div></div>`;
    const fld = (label, val) => `<div class="fld"><div class="fld-label">${label}</div><div class="fld-val${!val ? ' empty' : ''}">${val || '&nbsp;'}</div></div>`;
    const fld2 = (l1, v1, l2, v2) => `<div class="row2"><div class="fld"><div class="fld-label">${l1}</div><div class="fld-val${!v1?' empty':''}">${v1||'&nbsp;'}</div></div><div class="fld"><div class="fld-label">${l2}</div><div class="fld-val${!v2?' empty':''}">${v2||'&nbsp;'}</div></div></div>`;
    const chk = (label, checked) => `<div class="chk-item"><div class="chk-box">${checked ? '✓' : ''}</div>${label}</div>`;
    const tblRows = (cols, rows) => `<table><thead><tr>${cols.map(([l,,w])=>`<th${w?` style="width:${w}"`:''}>${l}</th>`).join('')}</tr></thead><tbody>${(rows.length?rows:[{}]).map(r=>`<tr>${cols.map(([,k])=>`<td>${v(r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

    const O = D('overall'), PR = D('programs'), VL = D('volunteers'), LG = D('logistics');
    const HO = D('hospitality'), FI = D('finance'), SP = D('sponsorship'), IN = D('interiors'), MK = D('marketing');

    const areas = [
      `${hdr}<div class="area-title"><h2>Overall Event Status</h2><p>Event Chair · Barb Kusha</p></div>
       <table><thead><tr><th style="width:14%">Date</th><th style="width:20%">Status</th><th style="width:33%">Decisions Needed</th><th>Notes</th></tr></thead><tbody>
       ${(O.statusUpdates||[]).map(r=>`<tr><td>${v(r.date)}</td><td>${v(r.status)}</td><td>${v(r.decisions)}</td><td>${v(r.notes)}</td></tr>`).join('')}</tbody></table>
       ${fld('Committee Notes',v(O.committeeNotes))}${fld('Final Notes',v(O.finalNotes))}`,

      `${hdr}<div class="area-title"><h2>Activities & Programs</h2><p>Programs · Gerrie Kopec</p></div>
       ${fld('Purpose',(PR.purpose||[]).join(', '))}
       <div class="sec-label">Performers / Vendors</div>${tblRows([['Name','name','50%'],['Contact','contact']],PR.performers||[])}
       <div class="sec-label">Activities</div>${tblRows([['Activity','activity','45%'],['Time Frame','timeFrame','20%'],['Volunteers','volunteers']],PR.activities||[])}
       ${fld('Transitions',v(PR.transitions))}
       <div class="sec-label">Action Items</div>${tblRows([['Item','item','50%'],['Due Date','dueDate','20%'],['Volunteer','volunteer']],PR.actionItems||[])}
       ${fld('Other Notes',v(PR.otherNotes))}`,

      `${hdr}<div class="area-title"><h2>Volunteer Coordination</h2><p>Volunteers · Haley Wright</p></div>
       <div class="sec-label">Volunteer Roles Needed</div>
       <div class="chk-grid">${volunteerRoles.map(r=>{const rd=(VL.roles||{})[r]||{};return chk(`${r}${rd.count?' ('+rd.count+')':''}`,rd.needed);}).join('')}</div>
       ${fld('Volunteers Assigned',v(VL.volunteersAssigned))}
       ${fld2('Board Contacted',v(VL.boardContacted)+(v(VL.boardContactedDate)?' — '+v(VL.boardContactedDate):''),'Event Support Contacted',v(VL.eventSupportContacted)+(v(VL.eventSupportDate)?' — '+v(VL.eventSupportDate):''))}
       ${fld('Volunteer Briefing Sent',v(VL.volunteerBriefingSent)+(v(VL.volunteerBriefingDate)?' — '+v(VL.volunteerBriefingDate):''))}
       ${fld('Other Notes',v(VL.otherNotes))}`,

      `${hdr}<div class="area-title"><h2>Event Logistics</h2><p>Logistics & Operations · Vince LoFranco</p></div>
       ${fld2('Proposed Attendance',v(LG.proposedAttendance),'Could Impact Success?',v(LG.couldImpactSuccess))}
       ${fld('Event Locations',v(LG.eventLocations))}
       ${fld('Setup Plan',v(LG.setupPlan))}
       ${fld('Volunteers Assisting',v(LG.volunteersAssisting))}
       ${fld('Equipment Needed',v(LG.equipmentNeeded))}
       ${fld('Safety Considerations',v(LG.safetyConsiderations))}
       ${fld('Backup Plan',v(LG.backupPlan))}
       ${fld('Other Notes',v(LG.otherNotes))}`,

      `${hdr}<div class="area-title"><h2>Hospitality</h2><p>Hospitality · Barb Kusha</p></div>
       ${fld2('Serving Style',(HO.servingStyle||[]).join(', '),'Alcohol Involved',v(HO.alcoholInvolved))}
       ${fld('Cleanup Plan',v(HO.cleanupPlan))}
       ${fld('Volunteers Assisting',v(HO.volunteersAssisting))}
       <div class="sec-label">Food & Beverage Plan</div>${tblRows([['Item','item','65%'],['Volunteer','volunteer']],HO.foodBevPlan||[])}
       <div class="sec-label">Shopping List</div>${tblRows([['Item','item','65%'],['Volunteer','volunteer']],HO.shoppingList||[])}
       <div class="sec-label">Rental Equipment</div>${tblRows([['Equipment','item','65%'],['Volunteer','volunteer']],HO.rentalEquipment||[])}
       ${fld('Other Notes',v(HO.otherNotes))}`,

      `${hdr}<div class="area-title"><h2>Finance & Budget</h2><p>Finance and Budget · Ken Underwood</p></div>
       <div class="sec-label">Expenses</div>
       <table><thead><tr><th>Category</th><th style="width:25%">Estimated</th><th style="width:25%">Actual</th></tr></thead><tbody>
       ${(FI.expenses||[]).map(r=>`<tr><td>${v(r.category)}</td><td>${v(r.estimated)?'$'+v(r.estimated):''}</td><td>${v(r.actual)?'$'+v(r.actual):''}</td></tr>`).join('')}</tbody></table>
       <div class="sec-label">Income</div>
       <table><thead><tr><th>Source</th><th style="width:25%">Estimated</th><th style="width:25%">Actual</th></tr></thead><tbody>
       ${(FI.income||[]).map(r=>`<tr><td>${v(r.source)}</td><td>${v(r.estimated)?'$'+v(r.estimated):''}</td><td>${v(r.actual)?'$'+v(r.actual):''}</td></tr>`).join('')}</tbody></table>
       ${fld('Financial Notes',v(FI.financialNotes))}`,

      `${hdr}<div class="area-title"><h2>Sponsorships & Partnerships</h2><p>Sponsorship & Partnership · Derek Cheeseman</p></div>
       ${fld('Recognition Methods',(SP.recognitionMethods||[]).join(', '))}
       ${fld('Recognition Volunteer',v(SP.recognitionVolunteer))}
       ${fld('Potential Sponsors',v(SP.potentialSponsors))}
       ${fld('Outreach Actions',(SP.outreachActions||[]).join(', '))}
       ${fld2('Outreach Volunteer',v(SP.outreachVolunteer),'Intentional Invites',v(SP.intentionalInvites))}
       ${fld('Other Notes',v(SP.otherNotes))}`,

      `${hdr}<div class="area-title"><h2>Interiors</h2><p>Interiors · Rebekah Freeman</p></div>
       ${fld('Historic Approach',v(IN.historicApproach))}
       ${fld('More Info / Needs',v(IN.moreInfo))}
       ${fld2('Decor Added',v(IN.decorAdded),'Decor Cost',v(IN.decorCost))}
       ${fld('Removal Reasons',(IN.removalReasons||[]).join(', ')+(IN.removalOther?' / '+v(IN.removalOther):''))}
       ${fld('Other Notes',v(IN.otherNotes))}`,

      `${hdr}<div class="area-title"><h2>Marketing</h2><p>Marketing · Haley Wright</p></div>
       <div class="sec-label">Channels</div>
       <div class="chk-grid">
         ${marketingChannels.map(ch=>{const cd=(MK.channels||{})[ch]||{};return chk(ch+(cd.date?' ('+cd.date+')':''),cd.done);}).join('')}
         ${chk('Other: '+(MK.otherChannel||'___________'),MK.otherChannelDone)}
       </div>
       <div class="g2">${fld('Notes',v(MK.notes),'span2')}</div>`,
    ];

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>NSH – ${selectedEvent.name}</title><style>${css}</style></head><body>
      ${areas.map((a, i) => `<div class="area">${a}</div>`).join('')}
    </body></html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  const handlePrintPost = () => {
    if (!selectedEvent) return;
    const D = (key) => getStoredFormData(selectedEvent.id, key) || {};
    const v = (val) => {
      if (val === null || val === undefined || val === '' || val === false) return '';
      if (val === true) return 'Yes';
      if (Array.isArray(val)) return val.filter(Boolean).join(', ');
      return String(val);
    };
    const css = `
      @page { margin: 0.75in; size: letter; }
      * { box-sizing: border-box; }
      body { font-family: Georgia, serif; font-size: 13px; color: #2b251a; margin: 0; line-height: 1.5; }
      .area { page-break-before: always; display: flex; flex-direction: column; height: 9.5in; }
      .area:first-child { page-break-before: avoid; }
      .area-body { display: flex; flex-direction: column; flex: 1; min-height: 0; }
      .ev-hdr { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2.5px solid #886c44; margin-bottom: 22px; padding-bottom: 12px; flex-shrink: 0; }
      .ev-name { font-size: 22px; font-weight: bold; color: #886c44; }
      .ev-sub { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: #4a4235; margin-bottom: 4px; }
      .ev-badge { display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #fff; background: #886c44; padding: 2px 8px; border-radius: 10px; margin-left: 10px; vertical-align: middle; }
      .ev-dt { font-size: 12px; color: #4a4235; text-align: right; }
      .area-title { margin-bottom: 18px; border-left: 4px solid #886c44; padding-left: 10px; flex-shrink: 0; }
      .area-title h2 { font-size: 17px; font-weight: bold; color: #886c44; margin: 0 0 2px 0; }
      .area-title p { font-size: 11px; color: #4a4235; margin: 0; }
      .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 28px; flex-shrink: 0; }
      .fld { display: flex; flex-direction: column; margin-bottom: 14px; flex: 1; min-height: 0; }
      .fld.fixed { flex: 0 0 auto; }
      .fld-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #886c44; margin-bottom: 5px; flex-shrink: 0; }
      .fld-val { font-size: 13px; flex: 1; min-height: 60px; color: #2b251a; padding: 6px 8px; border: 1px solid #ccc; border-radius: 3px; background: #fafaf8; line-height: 1.6; }
      .fld-val.empty { color: #aaa; }
      .yn { display: inline-flex; align-items: center; gap: 16px; font-size: 13px; padding: 6px 0; flex-shrink: 0; }
      .yn-opt { display: flex; align-items: center; gap: 7px; }
      .yn-box { width: 18px; height: 18px; border: 1.5px solid #886c44; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; color: #886c44; font-weight: bold; border-radius: 2px; }
      table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin-bottom: 16px; flex-shrink: 0; }
      th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #886c44; text-align: left; padding: 6px 10px; border-bottom: 2px solid #886c44; background: #faf7f2; }
      td { padding: 10px 10px; border-bottom: 1px solid #d8d0c5; color: #2b251a; vertical-align: top; }
      .sec-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #4a4235; margin: 14px 0 6px 0; border-bottom: 1px solid #e8dfd2; padding-bottom: 4px; flex-shrink: 0; }
    `;
    const hdr = `<div class="ev-hdr"><div><div class="ev-sub">North Star House Events Committee <span class="ev-badge">Post-Event</span></div><div class="ev-name">${selectedEvent.name}</div></div><div class="ev-dt">${[selectedEvent.dayTime, selectedEvent.date].filter(Boolean).join(' · ')}</div></div>`;
    const fld = (label, val) => `<div class="fld"><div class="fld-label">${label}</div><div class="fld-val${!val ? ' empty' : ''}">${val || '&nbsp;'}</div></div>`;
    const fld2 = (l1, v1, l2, v2) => `<div class="row2 fixed"><div class="fld fixed"><div class="fld-label">${l1}</div><div class="fld-val${!v1?' empty':''}">${v1||'&nbsp;'}</div></div><div class="fld fixed"><div class="fld-label">${l2}</div><div class="fld-val${!v2?' empty':''}">${v2||'&nbsp;'}</div></div></div>`;
    const yn = (label, val) => `<div class="fld fixed"><div class="fld-label">${label}</div><div class="yn"><div class="yn-opt"><div class="yn-box">${val===true||val==='Yes'?'✓':''}</div> Yes</div><div class="yn-opt"><div class="yn-box">${val==='No'?'✓':''}</div> No</div></div></div>`;
    const tblRows = (cols, rows) => `<table><thead><tr>${cols.map(([l,,w])=>`<th${w?` style="width:${w}"`:''}>${l}</th>`).join('')}</tr></thead><tbody>${(rows.length?rows:[{}]).map(r=>`<tr>${cols.map(([,k])=>`<td>${v(r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

    const O = D('overall'), PR = D('programs'), VL = D('volunteers'), LG = D('logistics');
    const HO = D('hospitality'), FI = D('finance'), SP = D('sponsorship'), IN = D('interiors'), MK = D('marketing');

    const w = (content) => `<div class="area-body">${content}</div>`;
    const areas = [
      `${hdr}<div class="area-title"><h2>Overall Event Status</h2><p>Event Chair · Barb Kusha</p></div>
       ${w(fld('Committee Notes',v(O.committeeNotes))+fld('Final Notes',v(O.finalNotes)))}`,

      `${hdr}<div class="area-title"><h2>Activities & Programs — Post-Event</h2><p>Programs · Gerrie Kopec</p></div>
       ${w(`<div class="sec-label">Activity Review</div>${tblRows([['Activity','activity','40%'],['What Worked','whatWorked'],['What Didn\'t','whatDidnt'],['Notes','notes']],PR.activityReview||[])}
       ${fld('Flow & Timing',v(PR.flowTiming))}${fld('Pinch Points',v(PR.pinchPoints))}${fld('Repeat Format?',v(PR.repeatFormat))}${fld('Committee Notes',v(PR.committeeNotes))}${fld('Other Notes',v(PR.postOtherNotes))}`)}`,

      `${hdr}<div class="area-title"><h2>Volunteer Coordination — Post-Event</h2><p>Volunteers · Haley Wright</p></div>
       ${w(fld2('Average Hours On Site',v(VL.avgHoursOnSite),'Total Volunteer Hours',v(VL.totalVolunteerHours))+fld('What We Learned',v(VL.whatWeLearned))+fld('Committee Notes',v(VL.committeeNotes)))}`,

      `${hdr}<div class="area-title"><h2>Event Logistics — Post-Event</h2><p>Logistics & Operations · Vince LoFranco</p></div>
       ${w(fld('Setup vs Reality',v(LG.setupVsReality))+fld('Adjustments Made',v(LG.adjustmentsMade))+fld('Layout Support Needs for Next Time',v(LG.layoutSupportNeeds))+fld('Committee Notes',v(LG.committeeNotes)))}`,

      `${hdr}<div class="area-title"><h2>Hospitality — Post-Event</h2><p>Hospitality · Barb Kusha</p></div>
       ${w(fld('Food & Beverage Outcome',v(HO.fbOutcome))+fld('Ran Out Of',v(HO.fbOutcomeRanOut))+fld('Guest Flow',v(HO.guestFlow))+fld('Guest Comments',v(HO.guestComments))+fld('Committee Notes',v(HO.committeeNotes||HO.committeeThoughts))+fld('Other Notes',v(HO.postOtherNotes)))}`,

      `${hdr}<div class="area-title"><h2>Finance & Budget — Post-Event</h2><p>Finance and Budget · Ken Underwood</p></div>
       ${w(fld2('Receipts Collected',v(FI.receiptsCollected),'Receipt Dates',[v(FI.receiptsDate1),v(FI.receiptsDate2),v(FI.receiptsDate3)].filter(Boolean).join(', '))+fld2('Reimbursement Amount',v(FI.reimbursementAmount),'Submitted By',v(FI.reimbursementSubmittedBy))+fld2('Final Expenses',v(FI.finalExpenses)?'$'+v(FI.finalExpenses):'','Final Income',v(FI.finalIncome)?'$'+v(FI.finalIncome):'')+fld2('Final Net',v(FI.finalNet)?'$'+v(FI.finalNet):'','Event Type',v(FI.eventType))+`<div class="row2 fixed" style="margin-bottom:14px;"><div class="fld fixed">${yn('Reimbursements Needed?',FI.reimbursementsNeeded)}</div><div class="fld fixed">${yn('Net Reported to Board?',FI.netReportedToBoard)}</div></div><div class="row2 fixed" style="margin-bottom:14px;"><div class="fld fixed">${yn('Thank Yous Sent?',FI.thankYousSent)}</div><div class="fld fixed">${yn('Lessons Documented?',FI.lessonsDocumented)}</div></div>`+fld('Committee Notes',v(FI.committeeNotes))+fld('Other Notes',v(FI.postNotes)))}`,

      `${hdr}<div class="area-title"><h2>Sponsorships & Partnerships — Post-Event</h2><p>Sponsorship & Partnership · Derek Cheeseman</p></div>
       ${w(fld('Sponsors Involved',v(SP.sponsorsInvolved))+fld('Recognition Delivered',v(SP.recognitionDelivered))+fld('Future Notes',v(SP.futureNotes))+fld('Committee Notes',v(SP.committeeNotes||SP.committeeThoughts))+fld('Other Notes',v(SP.postOtherNotes)))}`,

      `${hdr}<div class="area-title"><h2>Interiors — Post-Event</h2><p>Interiors · Rebekah Freeman</p></div>
       ${w(fld('Historic Issues',v(IN.historicIssues))+fld('Wear / Damage',v(IN.wearDamage))+fld('Future Adjustments',v(IN.futureAdjustments))+fld('Committee Notes',v(IN.committeeNotes))+fld('Other Notes',v(IN.postOtherNotes)))}`,

      `${hdr}<div class="area-title"><h2>Marketing — Post-Event</h2><p>Marketing · Haley Wright</p></div>
       ${w(fld('Ticket Sales Pattern',(MK.ticketSalesPattern||[]).join(', '))+yn('Photos Taken?',MK.photosTaken)+yn('Uploaded to Shared Drive?',MK.uploadedToSharedDrive)+fld('Emails Collected',v(MK.emailsCollected))+fld('Donations Related to Event',v(MK.donationsRelatedToEvent))+fld('Forms Grabbed',v(MK.formsGrabbed))+fld('Committee Notes',v(MK.committeeNotes)))}`,
    ];

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>NSH Post-Event – ${selectedEvent.name}</title><style>${css}</style></head><body>
      ${areas.map(a => `<div class="area">${a}</div>`).join('')}
    </body></html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

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
    void detailDataVersion; // causes re-render when remote data arrives
    const completedAreasCount = committeeAreas.filter(area => hasFormData(selectedEvent.id, area.key)).length;
    const totalAreas = committeeAreas.length;
    return (
      <div className="min-h-screen bg-sand-light">
        <div className="fixed top-4 right-4 z-40 flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full bg-white border border-sand-dark px-4 py-2 text-sm font-semibold text-ink-light shadow-md transition hover:border-gold hover:text-gold cursor-pointer"
          >
            <Printer size={14} />
            Pre-Event Forms
          </button>
          <button
            onClick={handlePrintPost}
            className="inline-flex items-center gap-2 rounded-full bg-white border border-sand-dark px-4 py-2 text-sm font-semibold text-ink-light shadow-md transition hover:border-gold hover:text-gold cursor-pointer"
          >
            <Printer size={14} />
            Post-Event Forms
          </button>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={navigateBack}
            className="flex items-center gap-2 text-gold hover:text-gold-dark mb-6 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Events Overview
          </button>

          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAreas((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white px-5 py-2 text-sm font-semibold text-gold shadow-sm transition hover:border-gold hover:shadow-md"
              >
                Update Event Area Notes
                <ChevronRight size={16} className={`transition-transform ${showAreas ? 'rotate-90' : ''}`} />
              </button>
              <button
                onClick={() => setShowGeneralNotes((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white px-5 py-2 text-sm font-semibold text-gold shadow-sm transition hover:border-gold hover:shadow-md"
              >
                General Notes
                <ChevronRight size={16} className={`transition-transform ${showGeneralNotes ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {showGeneralNotes && (
              <div className="mt-6">
                <div className="bg-white border border-sand-dark rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-sand-dark/40 bg-sand-light/40">
                    <p className="text-sm font-semibold text-ink">Team General Notes</p>
                    <p className="text-xs text-ink-light">Visible to all committee members</p>
                  </div>
                  <div className="px-5 py-4 space-y-3 min-h-[80px] max-h-[320px] overflow-y-auto">
                    {generalMessages.length === 0 ? (
                      <p className="text-sm text-ink-light italic text-center py-6">No notes yet. Add the first one below.</p>
                    ) : (
                      generalMessages.map((msg, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <div className="inline-block max-w-[90%] bg-sand-light border border-sand-dark/30 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                            <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          </div>
                          <p className="text-xs text-ink-light pl-1">{formatMessageTime(msg.ts)}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-5 py-4 border-t border-sand-dark/40 flex gap-3 items-end">
                    <textarea
                      value={newMessageText}
                      onChange={e => setNewMessageText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      placeholder="Type a note... (Enter to post, Shift+Enter for new line)"
                      rows={2}
                      className="flex-1 border border-sand-dark rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold resize-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessageText.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Send size={14} />
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                <h3 className="text-lg font-semibold text-gold mb-4">Event Planning Overview</h3>
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
                            <div className="mb-3">
                              <p className="text-xs uppercase tracking-[0.2em] text-ink-light mb-2">Volunteer Roles</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {volunteerRoles.map((role) => {
                                  const roleData = (data.roles || {})[role] || {};
                                  return (
                                    <div key={role} className="border border-sand-dark/50 rounded-lg p-2 bg-sand-light/40">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <input
                                            type="checkbox"
                                            checked={roleData.needed || false}
                                            readOnly
                                            className="rounded border-sand-dark text-gold accent-gold h-3.5 w-3.5 pointer-events-none"
                                          />
                                          <p className="text-sm font-semibold text-ink truncate">{role}</p>
                                        </div>
                                        <span className="text-xs text-ink-light whitespace-nowrap">{displayValue(roleData.count)}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <Field label="Volunteers Assigned" value={data.volunteersAssigned} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Field
                                label="Board Contacted"
                                value={`${displayValue(data.boardContacted)} - Date: ${displayValue(data.boardContactedDate)}`}
                              />
                              <Field
                                label="Event Support Contacted"
                                value={`${displayValue(data.eventSupportContacted)} - Date: ${displayValue(data.eventSupportDate)}`}
                              />
                              <Field
                                label="Volunteer Briefing Sent"
                                value={`${displayValue(data.volunteerBriefingSent)} - Date: ${displayValue(data.volunteerBriefingDate)}`}
                              />
                              <Field label="Other Notes" value={data.otherNotes} />
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

                        {area.key === 'finance' && (() => {
                          const calcTotal = (items, field) =>
                            (items || []).reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0).toFixed(2);
                          const renderAmount = (v) => {
                            const hasValue = v !== '' && v !== null && v !== undefined;
                            return (
                              <span className="inline-block min-w-[84px] tabular-nums">
                                {hasValue ? `$${v}` : '$'}
                              </span>
                            );
                          };
                          return (
                            <div className="space-y-6">
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-ink-light mb-2">Projected Expenses</p>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm table-fixed">
                                    <colgroup>
                                      <col />
                                      <col className="w-[220px]" />
                                      <col className="w-[220px]" />
                                    </colgroup>
                                    <thead>
                                      <tr className="border-b border-sand-dark">
                                        <th className="text-left py-2 pr-4 font-semibold text-ink">Category</th>
                                        <th className="text-left py-2 pr-4 font-semibold text-ink">Estimated Amount</th>
                                        <th className="text-left py-2 font-semibold text-ink">Actual Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(data.expenses || []).map((row, idx) => (
                                        <tr key={idx} className="border-b border-sand-dark/50">
                                          <td className="py-2 pr-4 text-ink">{displayValue(row.category)}</td>
                                          <td className="py-2 pr-4 text-ink">{renderAmount(row.estimated)}</td>
                                          <td className="py-2 text-ink">{renderAmount(row.actual)}</td>
                                        </tr>
                                      ))}
                                      <tr className="font-semibold">
                                        <td className="py-2 pr-4 text-ink">Total Projected Expenses</td>
                                        <td className="py-2 pr-4 text-ink">${calcTotal(data.expenses, 'estimated')}</td>
                                        <td className="py-2 text-ink">${calcTotal(data.expenses, 'actual')}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-ink-light mb-2">Projected Income</p>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm table-fixed">
                                    <colgroup>
                                      <col />
                                      <col className="w-[220px]" />
                                      <col className="w-[220px]" />
                                    </colgroup>
                                    <thead>
                                      <tr className="border-b border-sand-dark">
                                        <th className="text-left py-2 pr-4 font-semibold text-ink">Source</th>
                                        <th className="text-left py-2 pr-4 font-semibold text-ink">Estimated Amount</th>
                                        <th className="text-left py-2 font-semibold text-ink">Actual Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(data.income || []).map((row, idx) => (
                                        <tr key={idx} className="border-b border-sand-dark/50">
                                          <td className="py-2 pr-4 text-ink">{displayValue(row.source)}</td>
                                          <td className="py-2 pr-4 text-ink">{renderAmount(row.estimated)}</td>
                                          <td className="py-2 text-ink">{renderAmount(row.actual)}</td>
                                        </tr>
                                      ))}
                                      <tr className="font-semibold">
                                        <td className="py-2 pr-4 text-ink">Total Projected Income</td>
                                        <td className="py-2 pr-4 text-ink">${calcTotal(data.income, 'estimated')}</td>
                                        <td className="py-2 text-ink">${calcTotal(data.income, 'actual')}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <Field label="Financial Notes" value={data.financialNotes} />
                            </div>
                          );
                        })()}

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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {marketingChannels.map((channel) => {
                                const channelData = (data.channels || {})[channel] || {};
                                return (
                                  <div key={channel} className="border border-sand-dark/50 rounded-lg p-2 bg-sand-light/40">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-sm font-semibold text-ink">{channel}</p>
                                      <input
                                        type="checkbox"
                                        checked={channelData.done || false}
                                        readOnly
                                        className="rounded border-sand-dark text-gold accent-gold h-3.5 w-3.5 pointer-events-none"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="border border-sand-dark/50 rounded-lg p-2 bg-sand-light/40 md:col-span-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-ink">
                                    Other Channel: {displayValue(data.otherChannel)}
                                  </p>
                                  <input
                                    type="checkbox"
                                    checked={data.otherChannelDone || false}
                                    readOnly
                                    className="rounded border-sand-dark text-gold accent-gold h-3.5 w-3.5 pointer-events-none"
                                  />
                                </div>
                              </div>
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
                          <div className="space-y-2">
                            <Field label="Committee Notes" value={data.committeeNotes} />
                            <Field label="Final Notes" value={data.finalNotes} />
                          </div>
                        )}
                        {area.key === 'programs' && (
                          <div className="space-y-2">
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
                            <Field label="Flow & Timing" value={data.flowTiming} />
                            <Field label="Pinch Points" value={data.pinchPoints} />
                            <Field label="Repeat Format" value={data.repeatFormat} />
                            <Field label="Committee Notes" value={data.committeeNotes} />
                            <Field label="Other Notes" value={data.postOtherNotes} />
                          </div>
                        )}
                        {area.key === 'volunteers' && (
                          <div className="space-y-2">
                            <Field label="Average Hours On Site" value={data.avgHoursOnSite} />
                            <Field label="Total Volunteer Hours" value={data.totalVolunteerHours} />
                            <Field label="What We Learned" value={data.whatWeLearned} />
                            <Field label="Committee Notes" value={data.committeeNotes} />
                          </div>
                        )}
                        {area.key === 'logistics' && (
                          <div className="space-y-2">
                            <Field label="Setup vs Reality" value={data.setupVsReality} />
                            <Field label="Adjustments Made" value={data.adjustmentsMade} />
                            <Field label="Layout Support Needs" value={data.layoutSupportNeeds} />
                            <Field label="Committee Notes" value={data.committeeNotes} />
                          </div>
                        )}
                        {area.key === 'hospitality' && (
                          <div className="space-y-2">
                            <Field label="Food & Beverage Outcome" value={data.fbOutcome} />
                            <Field label="Ran Out Of" value={data.fbOutcomeRanOut} />
                            <Field label="Guest Flow" value={data.guestFlow} />
                            <Field label="Guest Comments" value={data.guestComments} />
                            <Field label="Committee Notes" value={data.committeeNotes || data.committeeThoughts} />
                            <Field label="Other Notes" value={data.postOtherNotes} />
                          </div>
                        )}
                        {area.key === 'finance' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Field label="Receipts Collected" value={data.receiptsCollected} />
                            <Field label="Receipts Dates" value={[data.receiptsDate1, data.receiptsDate2, data.receiptsDate3].filter(Boolean).join(', ')} />
                            <div className="text-sm text-ink pb-2 mb-2 border-b border-gold/30">
                              <span className="font-semibold">Reimbursements Needed:</span>
                              <span className="ml-2 inline-flex items-center gap-2">
                                {['Yes', 'No'].map((opt) => (
                                  <span
                                    key={opt}
                                    className={`inline-flex items-center justify-center min-w-10 px-2 py-0.5 rounded-full text-xs border ${
                                      data.reimbursementsNeeded === opt
                                        ? 'bg-gold text-white border-gold'
                                        : 'bg-white text-ink-light border-sand-dark'
                                    }`}
                                  >
                                    {opt}
                                  </span>
                                ))}
                              </span>
                            </div>
                            <Field label="Reimbursement Amount" value={data.reimbursementAmount} />
                            <Field label="Submitted By" value={data.reimbursementSubmittedBy} />
                            <Field label="Final Expenses" value={data.finalExpenses} />
                            <Field label="Final Income" value={data.finalIncome} />
                            <Field label="Final Net" value={data.finalNet} />
                            <Field label="Net Reported To Board" value={data.netReportedToBoard} />
                            <div className="text-sm text-ink pb-2 mb-2 border-b border-gold/30">
                              <span className="font-semibold">Thank Yous Sent:</span>
                              <span className="ml-2 inline-flex items-center gap-2">
                                {['Yes', 'No'].map((opt) => (
                                  <span
                                    key={opt}
                                    className={`inline-flex items-center justify-center min-w-10 px-2 py-0.5 rounded-full text-xs border ${
                                      (data.thankYousSent ? 'Yes' : 'No') === opt
                                        ? 'bg-gold text-white border-gold'
                                        : 'bg-white text-ink-light border-sand-dark'
                                    }`}
                                  >
                                    {opt}
                                  </span>
                                ))}
                              </span>
                            </div>
                            <div className="text-sm text-ink pb-2 mb-2 border-b border-gold/30">
                              <span className="font-semibold">Lessons Documented:</span>
                              <span className="ml-2 inline-flex items-center gap-2">
                                {['Yes', 'No'].map((opt) => (
                                  <span
                                    key={opt}
                                    className={`inline-flex items-center justify-center min-w-10 px-2 py-0.5 rounded-full text-xs border ${
                                      (data.lessonsDocumented ? 'Yes' : 'No') === opt
                                        ? 'bg-gold text-white border-gold'
                                        : 'bg-white text-ink-light border-sand-dark'
                                    }`}
                                  >
                                    {opt}
                                  </span>
                                ))}
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <Field label="Committee Notes" value={data.committeeNotes} />
                            </div>
                            <div className="md:col-span-2">
                              <Field label="Other Notes" value={data.postNotes} />
                            </div>
                          </div>
                        )}
                        {area.key === 'sponsorship' && (
                          <div className="space-y-2">
                            <Field label="Sponsors Involved" value={data.sponsorsInvolved} />
                            <Field label="Recognition Delivered" value={data.recognitionDelivered} />
                            <Field label="Future Notes" value={data.futureNotes} />
                            <Field label="Committee Notes" value={data.committeeNotes || data.committeeThoughts} />
                            <Field label="Other Notes" value={data.postOtherNotes} />
                          </div>
                        )}
                        {area.key === 'interiors' && (
                          <div className="space-y-2">
                            <Field label="Historic Issues" value={data.historicIssues} />
                            <Field label="Wear / Damage" value={data.wearDamage} />
                            <Field label="Future Adjustments" value={data.futureAdjustments} />
                            <Field label="Committee Notes" value={data.committeeNotes} />
                            <Field label="Other Notes" value={data.postOtherNotes} />
                          </div>
                        )}
                        {area.key === 'marketing' && (
                          <div className="space-y-2">
                            <Field label="Tickets Sold" value={(data.ticketSalesPattern || []).join(', ')} />
                            <Field label="Photos Taken" value={data.photosTaken} />
                            <Field label="Uploaded to Shared Drive" value={data.uploadedToSharedDrive} />
                            <Field label="Emails Collected" value={data.emailsCollected} />
                            <Field label="Donations Related to Event" value={data.donationsRelatedToEvent} />
                            <Field label="Forms Grabbed" value={data.formsGrabbed} />
                            <Field label="Committee Notes" value={data.committeeNotes} />
                          </div>
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
      <div className="bg-white border-b border-sand-dark py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gold">North Star House Events Committee Dashboard</h1>
          <div className="flex justify-center gap-6 mt-4">
            {['Events', 'Resources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab === 'Events' ? 'overview' : 'resources')}
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors cursor-pointer ${
                  (tab === 'Events' && view === 'overview') || (tab === 'Resources' && view === 'resources')
                    ? 'border-gold text-gold'
                    : 'border-transparent text-ink-light hover:text-gold'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'resources' && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white border border-sand-dark rounded-xl p-6 space-y-5">
            <h2 className="text-2xl font-bold text-gold mb-4">Resources</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedResource('committee')}
                className={`w-full text-left border rounded-lg px-4 py-3 transition-colors ${
                  selectedResource === 'committee'
                    ? 'border-gold bg-white'
                    : 'border-sand-dark bg-sand-light/40 hover:border-gold hover:bg-white'
                }`}
              >
                <p className="text-sm font-semibold text-ink">Committee Members and Contact Info</p>
              </button>
              <button
                onClick={() => setSelectedResource('sponsors')}
                className={`w-full text-left border rounded-lg px-4 py-3 transition-colors ${
                  selectedResource === 'sponsors'
                    ? 'border-gold bg-white'
                    : 'border-sand-dark bg-sand-light/40 hover:border-gold hover:bg-white'
                }`}
              >
                <p className="text-sm font-semibold text-ink">Sponsor List</p>
              </button>
              <button
                onClick={() => setSelectedResource('inventory')}
                className={`w-full text-left border rounded-lg px-4 py-3 transition-colors ${
                  selectedResource === 'inventory'
                    ? 'border-gold bg-white'
                    : 'border-sand-dark bg-sand-light/40 hover:border-gold hover:bg-white'
                }`}
              >
                <p className="text-sm font-semibold text-ink">Current Inventory List</p>
              </button>
            </div>

            <div className="border border-sand-dark rounded-xl p-4 bg-sand-light/30">
              <div className="flex flex-wrap gap-2">
                {resourceForms.map((form) => (
                  <a
                    key={form.label}
                    href={form.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sand-dark/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-gold/50 hover:bg-white"
                  >
                    <svg
                      className="w-3 h-3 text-gold/80 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {form.label}
                  </a>
                ))}
              </div>
            </div>

            {selectedResource === 'committee' && (
              <div className="border border-sand-dark rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-sand-light/50 border-b border-sand-dark">
                  <p className="text-sm font-semibold text-ink">Committee Members and Contact Info</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-sand-dark bg-white">
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Name</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Role</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Phone Number</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...committeeContacts, ...eventSupportContacts].map((contact) => (
                        <tr key={`resource-committee-${contact.email}`} className="border-b border-sand-dark/40 last:border-b-0">
                          <td className="py-2.5 px-4 text-ink">{contact.name}</td>
                          <td className="py-2.5 px-4 text-ink">{contact.role}</td>
                          <td className="py-2.5 px-4 text-ink-light">{contact.phone}</td>
                          <td className="py-2.5 px-4 text-ink">{contact.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedResource === 'sponsors' && (
              <div className="border border-sand-dark rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-sand-light/50 border-b border-sand-dark">
                  <p className="text-sm font-semibold text-ink">Sponsor List</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-sand-dark bg-white">
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Organization</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Contact</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Value</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Category</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Phone</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Email</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Address</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Date</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Status</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Notes</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Lead</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sponsorList.map((sponsor) => (
                        <tr key={`resource-sponsor-${sponsor.organization}`} className="border-b border-sand-dark/40 last:border-b-0">
                          <td className="py-2.5 px-4 text-ink">{sponsor.organization}</td>
                          <td className="py-2.5 px-4 text-ink">{sponsor.contact}</td>
                          <td className="py-2.5 px-4 text-ink">{sponsor.value}</td>
                          <td className="py-2.5 px-4 text-ink">{sponsor.category}</td>
                          <td className="py-2.5 px-4 text-ink-light">{sponsor.phone}</td>
                          <td className="py-2.5 px-4 text-ink">{sponsor.email}</td>
                          <td className="py-2.5 px-4 text-ink-light">{sponsor.address}</td>
                          <td className="py-2.5 px-4 text-ink-light">{sponsor.date}</td>
                          <td className="py-2.5 px-4 text-ink">{sponsor.status}</td>
                          <td className="py-2.5 px-4 text-ink-light">{sponsor.notes}</td>
                          <td className="py-2.5 px-4 text-ink-light">{sponsor.lead}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedResource === 'inventory' && (
              <div className="border border-sand-dark rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-sand-light/50 border-b border-sand-dark">
                  <p className="text-sm font-semibold text-ink">Current Inventory List</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-sand-dark bg-white">
                        <th className="text-left py-2.5 px-4 font-semibold text-ink w-32">Quantity</th>
                        <th className="text-left py-2.5 px-4 font-semibold text-ink">Item</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryItems.map((entry, idx) => (
                        <tr key={`resource-inventory-${idx}`} className="border-b border-sand-dark/40 last:border-b-0">
                          <td className="py-2.5 px-4 text-ink">{entry.quantity}</td>
                          <td className="py-2.5 px-4 text-ink">{entry.item}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'overview' && (
      <div className="max-w-6xl mx-auto px-4 py-6">

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowAddEvent(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gold-dark transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Event
          </button>
        </div>

        {showAddEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gold">Add New Event</h2>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="text-ink-light hover:text-ink transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Event Name <span className="text-gold">*</span></label>
                  <input
                    type="text"
                    value={addEventForm.name}
                    onChange={e => setAddEventForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Spring Fundraiser"
                    className="w-full border border-sand-dark rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Month</label>
                  <select
                    value={addEventForm.month}
                    onChange={e => setAddEventForm(f => ({ ...f, month: e.target.value }))}
                    className="w-full border border-sand-dark rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold bg-white"
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Date</label>
                  <input
                    type="text"
                    value={addEventForm.date}
                    onChange={e => setAddEventForm(f => ({ ...f, date: e.target.value }))}
                    placeholder="e.g. March 15th or TBD"
                    className="w-full border border-sand-dark rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Day &amp; Time</label>
                  <input
                    type="text"
                    value={addEventForm.dayTime}
                    onChange={e => setAddEventForm(f => ({ ...f, dayTime: e.target.value }))}
                    placeholder="e.g. Sunday 1-4pm"
                    className="w-full border border-sand-dark rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">ISO Date <span className="text-ink-light font-normal">(optional — for countdown)</span></label>
                  <input
                    type="date"
                    value={addEventForm.isoDate}
                    onChange={e => setAddEventForm(f => ({ ...f, isoDate: e.target.value }))}
                    className="w-full border border-sand-dark rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="flex-1 rounded-lg border border-sand-dark px-4 py-2 text-sm font-semibold text-ink hover:border-gold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={!addEventForm.name.trim()}
                  className="flex-1 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((month, monthIdx) => {
            const monthEvents = eventsByMonth[month];
            const now = new Date();
            const isPast = new Date(now.getFullYear(), monthIdx + 1, 0) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return (
              <div
                key={month}
                className={`border border-sand-dark rounded-xl p-4 flex flex-col relative transition-opacity ${isPast ? 'bg-sand-light/50 opacity-50' : 'bg-white'}`}
              >
                {isPast && (
                  <div className="absolute top-3 right-3">
                    <Star size={14} className="text-gold fill-gold" />
                  </div>
                )}
                <h3 className={`font-bold text-lg mb-3 flex items-center gap-2 ${isPast ? 'text-ink-light' : 'text-ink'}`}>
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
      )}
    </div>
  );
}
