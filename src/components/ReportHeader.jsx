import { useRef } from 'react';
import TextField from './TextField.jsx';
import { fromIso, isValidDate, toIso } from '../utils/date.js';

export default function ReportHeader({ date, memberName, teamName, onChange, showErrors, remember, onRememberChange }) {
  const pickerRef = useRef(null);

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    try {
      picker.showPicker();
    } catch {
      picker.focus();
      picker.click();
    }
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title">Report details</h2>
        <label className="switch" title="Remember name and team in this browser">
          <input
            type="checkbox"
            role="switch"
            checked={remember}
            onChange={(e) => onRememberChange(e.target.checked)}
          />
          <span className="switch-track" aria-hidden="true" />
          Remember
        </label>
      </div>
      <div className="grid-3">
        <TextField
          label="Date"
          value={date}
          onChange={(v) => onChange({ date: v })}
          invalid={!isValidDate(date)}
          showErrors={showErrors}
          placeholder="DD-MM-YYYY"
          inputMode="numeric"
          className="date-field"
        >
          <button type="button" className="icon-btn picker-btn" onClick={openPicker} title="Pick a date">
            📅
          </button>
          <input
            ref={pickerRef}
            type="date"
            className="hidden-picker"
            tabIndex={-1}
            aria-hidden="true"
            value={toIso(date)}
            onChange={(e) => e.target.value && onChange({ date: fromIso(e.target.value) })}
          />
        </TextField>
        <TextField
          label="Member name"
          value={memberName}
          onChange={(v) => onChange({ memberName: v })}
          required
          showErrors={showErrors}
          placeholder="e.g. John Doe"
          autoComplete="name"
        />
        <TextField
          label="Team name"
          value={teamName}
          onChange={(v) => onChange({ teamName: v })}
          placeholder="e.g. Team Softvence"
        />
      </div>
    </section>
  );
}
