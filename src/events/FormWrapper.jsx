import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

export function SaveIndicator({ status }) {
  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <CheckCircle2 size={14} /> Saved
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs text-red-600">
        <AlertCircle size={14} /> Error saving
      </span>
    );
  }
  if (status === 'unsaved') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-700">
        <Save size={14} /> Not saved
      </span>
    );
  }
  if (status === 'loading') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-700">
        <Save size={14} /> Loading...
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-amber-600">
      <Save size={14} /> Saving...
    </span>
  );
}

export function FormActions({ saveStatus, onSave, align = 'between', showStatus = true }) {
  const alignment = align === 'right' ? 'justify-end' : 'justify-between';
  return (
    <div className={`flex items-center ${alignment} mb-4`}>
      {showStatus && <SaveIndicator status={saveStatus} />}
      <button
        onClick={onSave}
        className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-medium text-sm px-5 py-2 rounded-lg transition-colors cursor-pointer"
      >
        <Save size={16} />
        Submit
      </button>
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <div className="bg-white border border-sand-dark rounded-xl p-5 mb-4">
      {title && <h3 className="text-xl font-bold text-ink mb-4 border-b border-sand-dark pb-2">{title}</h3>}
      {children}
    </div>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold text-ink mb-1">{label}</label>}
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ''}
        rows={rows}
        className="w-full border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 resize-y bg-white"
      />
    </div>
  );
}

export function TextInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold text-ink mb-1">{label}</label>}
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ''}
        className="w-full border border-sand-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 bg-white"
      />
    </div>
  );
}

export function CheckboxGroup({ label, options, values, onChange }) {
  const toggleOption = (option) => {
    const current = values || [];
    if (current.includes(option)) {
      onChange(current.filter(v => v !== option));
    } else {
      onChange([...current, option]);
    }
  };

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold text-ink mb-2">{label}</label>}
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={(values || []).includes(option)}
              onChange={() => toggleOption(option)}
              className="rounded border-sand-dark text-gold focus:ring-gold/30 accent-gold"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

export function RadioGroup({ label, options, value, onChange }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold text-ink mb-2">{label}</label>}
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              checked={value === option}
              onChange={() => onChange(option)}
              className="border-sand-dark text-gold focus:ring-gold/30 accent-gold"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

export function YesNoNA({ label, value, onChange, dateValue, onDateChange }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="flex gap-3">
        {['Yes', 'N/A'].map((opt) => (
          <label key={opt} className="flex items-center gap-1 text-sm cursor-pointer">
            <input
              type="radio"
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="border-sand-dark text-gold focus:ring-gold/30 accent-gold"
            />
            {opt}
          </label>
        ))}
      </div>
      {onDateChange && (
        <input
          type="date"
          value={dateValue || ''}
          onChange={(e) => onDateChange(e.target.value)}
          className="border border-sand-dark rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white"
        />
      )}
    </div>
  );
}
