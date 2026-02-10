export const events2026 = [
  {
    id: 'jan-gameday-1',
    month: 'January',
    name: 'Game Day at North Star House #1',
    date: 'January 18th',
    dayTime: 'Sunday 1-4pm',
    isoDate: '2026-01-18',
  },
  {
    id: 'feb-gameday-2',
    month: 'February',
    name: 'Game Day at North Star House #2',
    date: 'February 21st',
    dayTime: 'Saturday 1-4pm',
    isoDate: '2026-02-21',
  },
  {
    id: 'mar-reformers',
    month: 'March',
    name: 'Reluctant Reformers: Mary Hallock Foote and Julia Morgan in the Progressive Era',
    date: 'March 15th',
    dayTime: 'Sunday 1-3pm',
    isoDate: '2026-03-15',
  },
  {
    id: 'apr-magic',
    month: 'April',
    name: 'April Fools Magic Show',
    date: 'April 17th & April 18th',
    dayTime: 'Fri & Sat 7-9pm',
    isoDate: '2026-04-17',
  },
  {
    id: 'may-tea',
    month: 'May',
    name: "Mother's Day Tea",
    date: 'May 11th',
    dayTime: 'Sun 12-2pm',
    isoDate: '2026-05-11',
  },
  {
    id: 'jun-mixer',
    month: 'June',
    name: 'Chamber Mixer',
    date: 'TBD',
    dayTime: 'Thursday Evening',
    isoDate: null,
  },
  {
    id: 'jul-open',
    month: 'July',
    name: 'Open',
    date: '',
    dayTime: '',
    isoDate: null,
  },
  {
    id: 'aug-volunteer',
    month: 'August',
    name: 'Volunteer Appreciation Party',
    date: 'August 30th',
    dayTime: 'Sun 5-8pm',
    isoDate: '2026-08-30',
  },
  {
    id: 'sep-creatives',
    month: 'September',
    name: 'Creatives Meetup Mixer',
    date: 'TBD',
    dayTime: '',
    isoDate: null,
  },
  {
    id: 'oct-magic',
    month: 'October',
    name: 'Fall Magic Show',
    date: 'TBD',
    dayTime: '',
    isoDate: null,
  },
  {
    id: 'oct-gilded',
    month: 'October',
    name: 'A Gilded Evening at North Star House',
    date: 'October 17th',
    dayTime: 'Sat 4-7pm',
    isoDate: '2026-10-17',
  },
  {
    id: 'nov-state',
    month: 'November',
    name: 'State of the Star',
    date: 'November 13th',
    dayTime: 'Fri 4-6pm',
    isoDate: '2026-11-13',
  },
  {
    id: 'dec-christmas',
    month: 'December',
    name: 'Christmas at North Star House',
    date: 'December 12th',
    dayTime: 'Sat 3-5:30pm',
    isoDate: '2026-12-12',
  },
  {
    id: 'dec-rossman',
    month: 'December',
    name: 'Bob Rossman',
    date: 'TBD',
    dayTime: 'To be confirmed',
    isoDate: null,
  },
];

export const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const committeeAreas = [
  { key: 'overall', label: 'Overall Event Status', role: 'Event Chair', person: 'Barb Kusha' },
  { key: 'programs', label: 'Activities & Programs', role: 'Programs', person: 'Gerrie Kopec' },
  { key: 'volunteers', label: 'Volunteer Coordination', role: 'Volunteers', person: 'Haley Wright' },
  { key: 'logistics', label: 'Event Logistics', role: 'Logistics & Operations', person: 'Vince LoFranco' },
  { key: 'marketing', label: 'Marketing', role: 'Marketing', person: 'Haley Wright' },
  { key: 'hospitality', label: 'Hospitality', role: 'Hospitality', person: 'Barb Kusha' },
  { key: 'finance', label: 'Finance & Budget', role: 'Finance and Budget', person: 'Ken Underwood' },
  { key: 'sponsorship', label: 'Sponsorships & Partnerships', role: 'Sponsorship & Partnership', person: 'Derek Cheeseman' },
  { key: 'interiors', label: 'Interiors', role: 'Interiors', person: 'Rebekah Freeman' },
];

export function getEventsByMonth() {
  const grouped = {};
  for (const month of months) {
    grouped[month] = events2026.filter(e => e.month === month);
  }
  return grouped;
}

export function getEventById(id) {
  return events2026.find(e => e.id === id);
}

export function getDaysUntil(isoDate) {
  if (!isoDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(isoDate + 'T00:00:00');
  const diff = eventDate - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getEventDisplayName(event) {
  if (!event) return '';
  const parts = [event.name];
  if (event.date && event.dayTime) {
    parts.push(`(${event.dayTime}, ${event.date})`);
  } else if (event.date) {
    parts.push(`(${event.date})`);
  } else if (event.dayTime) {
    parts.push(`(${event.dayTime})`);
  }
  return parts.join(' - ');
}
