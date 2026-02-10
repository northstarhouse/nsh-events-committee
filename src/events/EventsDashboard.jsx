import { useState, useCallback } from 'react';
import {
  ArrowLeft, Calendar, ChevronRight, ClipboardList, Music2, Users,
  MapPin, Megaphone, Coffee, DollarSign, Handshake, Paintbrush, Save, CheckCircle2
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
  marketing: Megaphone,
  hospitality: Coffee,
  finance: DollarSign,
  sponsorship: Handshake,
  interiors: Paintbrush,
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

export default function EventsDashboard() {
  const [view, setView] = useState('overview');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);

  const eventsByMonth = getEventsByMonth();
  const selectedEvent = selectedEventId ? getEventById(selectedEventId) : null;

  const navigateToEvent = useCallback((eventId) => {
    setSelectedEventId(eventId);
    setView('detail');
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
            <h1 className="text-3xl font-bold text-gold">{area.label}</h1>
            <p className="text-ink-light mt-1">{area.role}: {area.person}</p>
            <p className="text-gold font-medium mt-1">
              {selectedEvent.name} {selectedEvent.dayTime && `- ${selectedEvent.dayTime}`}{selectedEvent.date && `, ${selectedEvent.date}`}
            </p>
          </div>

          <FormComponent event={selectedEvent} />
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedEvent) {
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

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gold">{selectedEvent.name}</h1>
            {(selectedEvent.date || selectedEvent.dayTime) && (
              <p className="text-lg text-ink-light mt-2">
                {selectedEvent.dayTime && selectedEvent.dayTime}
                {selectedEvent.date && selectedEvent.dayTime && ', '}
                {selectedEvent.date && selectedEvent.date}
              </p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gold text-center mb-6">Update Event Area Notes</h2>
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
                        <CheckCircle2 size={16} className="text-green-500" />
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
        </div>
      </div>
    );
  }

  // Overview
  return (
    <div className="min-h-screen bg-sand-light">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gold">North Star House Events Committee Dashboard</h1>
          <p className="text-lg text-ink-light mt-3">2026 Events Overview</p>
        </div>

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
                        {(event.date || event.dayTime) && (
                          <p className="text-xs text-ink-light mt-1">
                            {event.dayTime && event.dayTime}
                            {event.date && event.dayTime && ' - '}
                            {event.date && event.date}
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
