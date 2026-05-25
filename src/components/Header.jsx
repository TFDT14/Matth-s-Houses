import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

const TITLES = {
  '/':        'Tableau de bord',
  '/devis':   'Générateur de devis',
  '/media':   'Médiathèque',
  '/clients': 'Suivi clients',
};

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || "Matth's Houses";

  return (
    <header className="bg-white border-b border-gray-200 px-5 lg:px-7 h-14 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-800 p-1">
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        Notion connecté
      </div>
    </header>
  );
}
