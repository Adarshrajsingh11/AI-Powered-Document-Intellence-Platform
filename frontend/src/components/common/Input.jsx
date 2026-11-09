import { useId } from 'react';

export default function Input({ label, error, id, className = '', ...rest }) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} className={`input ${error ? 'input-error' : ''} ${className}`.trim()} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
