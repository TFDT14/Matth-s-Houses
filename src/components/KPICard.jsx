import React from 'react';

export default function KPICard({ label, value, sublabel }) {
  return (
    <div className="bg-mh-paper border border-mh-line rounded-xl p-5">
      <p className="text-xs text-mh-text-3 font-medium mb-1">{label}</p>
      <p className="text-[30px] font-semibold tracking-tight leading-none text-mh-text">
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] text-mh-text-4 mt-2.5">{sublabel}</p>
      )}
    </div>
  );
}
