import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function ModuleCard({ icon: Icon, title, description, cta, onClick }) {
  return (
    <div
      className="bg-mh-paper border border-mh-line rounded-xl p-5 flex flex-col cursor-pointer
                 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,.08)] transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="w-[38px] h-[38px] bg-mh-paper-3 rounded-[9px] flex items-center justify-center mb-4 shrink-0">
        <Icon size={18} className="text-mh-text-2" />
      </div>
      <p className="text-[15px] font-semibold text-mh-text mb-1.5">{title}</p>
      <p className="text-[12.5px] text-mh-text-3 leading-[1.55] flex-1">{description}</p>
      <div className="flex items-center gap-1 mt-4 text-[12.5px] font-medium text-mh-text">
        {cta}
        <ArrowRight size={12} />
      </div>
    </div>
  );
}
