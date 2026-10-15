import { useState } from 'react';

/** Labelled input that highlights itself when invalid, once touched or after a copy attempt. */
export default function TextField({
  label,
  value,
  onChange,
  required = false,
  optional = false,
  invalid,
  showErrors = false,
  className = '',
  children,
  ...inputProps
}) {
  const [touched, setTouched] = useState(false);
  const isInvalid = invalid ?? (required && !value.trim());
  const highlight = isInvalid && (touched || showErrors);

  return (
    <label className={`field ${className}`}>
      <span className="field-label">
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
        {optional && <span className="opt"> (optional)</span>}
      </span>
      <span className="field-control">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          className={highlight ? 'invalid' : ''}
          aria-invalid={highlight || undefined}
          required={required}
          {...inputProps}
        />
        {children}
      </span>
    </label>
  );
}
