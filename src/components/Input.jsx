import React from 'react';

export default function Input({ label, prefix, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mh-text-3 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          className={`input-field ${prefix ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
    </div>
  );
}
