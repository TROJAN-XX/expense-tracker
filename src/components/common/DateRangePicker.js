import React, { useState } from 'react';
import { DATE_RANGE_PRESETS, getPresetDateRange, getTodayString } from '../../utils/dateUtils';
import './DateRangePicker.css';

function DateRangePicker({ value, onChange }) {
  // value = { preset: 'this_month', start: null, end: null }
  const [showCustom, setShowCustom] = useState(value?.preset === 'custom');

  const handlePreset = (preset) => {
    if (preset === 'custom') {
      setShowCustom(true);
      onChange({ preset: 'custom', start: value?.start || null, end: value?.end || null });
    } else {
      setShowCustom(false);
      const range = getPresetDateRange(preset);
      onChange({ preset, start: range.start, end: range.end });
    }
  };

  const handleCustomStart = (e) => {
    onChange({ preset: 'custom', start: e.target.value, end: value?.end || null });
  };

  const handleCustomEnd = (e) => {
    onChange({ preset: 'custom', start: value?.start || null, end: e.target.value });
  };

  return (
    <div className="date-range-picker">
      <div className="preset-chips">
        {DATE_RANGE_PRESETS.map(p => (
          <button
            key={p.value}
            className={`preset-chip ${value?.preset === p.value ? 'active' : ''}`}
            onClick={() => handlePreset(p.value)}
            type="button"
          >
            {p.label}
          </button>
        ))}
      </div>
      {showCustom && (
        <div className="custom-range">
          <div className="form-group">
            <label className="form-label" htmlFor="date-start">From</label>
            <input
              type="date"
              id="date-start"
              className="form-input"
              value={value?.start || ''}
              max={value?.end || getTodayString()}
              onChange={handleCustomStart}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="date-end">To</label>
            <input
              type="date"
              id="date-end"
              className="form-input"
              value={value?.end || ''}
              min={value?.start || ''}
              max={getTodayString()}
              onChange={handleCustomEnd}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
