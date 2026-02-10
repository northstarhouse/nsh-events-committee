export const events2026 = [
  {
    id: 'jan-gameday-1',
    month: 'January',
    name: 'Game Day at North Star House #1',
    date: 'January 18th',
    dayTime: 'Sunday 1-4pm',
  },
  {
    id: 'feb-gameday-2',
    month: 'February',
    name: 'Game Day at North Star House #2',
    date: 'February 21st',
    dayTime: 'Saturday 1-4pm',
  },
  {
    id: 'mar-reformers',
    month: 'March',
    name: 'Reluctant Reformers: Mary Hallock Foote and Julia Morgan in the Progressive Era',
    date: 'March 15th',
    dayTime: 'Sunday 1-3pm',
  },
  {
    id: 'apr-magic',
    month: 'April',
    name: 'April Fools Magic Show',
    date: 'April 17th & April 18th',
    dayTime: 'Fri & Sat 7-9pm',
  },
  {
    id: 'may-tea',
    month: 'May',
    name: "Mother's Day Tea",
    date: 'May 11th',
    dayTime: 'Sun 12-2pm',
  },
  {
    id: 'jun-mixer',
    month: 'June',
    name: 'Chamber Mixer',
    date: 'TBD',
    dayTime: 'Thursday Evening',
  },
  {
    id: 'jul-open',
    month: 'July',
    name: 'Open',
    date: '',
    dayTime: '',
  },
  {
    id: 'aug-volunteer',
    month: 'August',
    name: 'Volunteer Appreciation Party',
    date: 'August 30th',
    dayTime: 'Sun 5-8pm',
  },
  {
    id: 'sep-creatives',
    month: 'September',
    name: 'Creatives Meetup Mixer',
    date: 'TBD',
    dayTime: '',
  },
  {
    id: 'oct-magic',
    month: 'October',
    name: 'Fall Magic Show',
    date: 'TBD',
    dayTime: '',
  },
  {
    id: 'oct-gilded',
    month: 'October',
    name: 'A Gilded Evening at North Star House',
    date: 'October 17th',
    dayTime: 'Sat 4-7pm',
  },
  {
    id: 'nov-state',
    month: 'November',
    name: 'State of the Star',
    date: 'November 13th',
    dayTime: 'Fri 4-6pm',
  },
  {
    id: 'dec-christmas',
    month: 'December',
    name: 'Christmas at North Star House',
    date: 'December 12th',
    dayTime: 'Sat 3-5:30pm',
  },
  {
    id: 'dec-rossman',
    month: 'December',
    name: 'Bob Rossman',
    date: 'TBD',
    dayTime: 'To be confirmed',
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
