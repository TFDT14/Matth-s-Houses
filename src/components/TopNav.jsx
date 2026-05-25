import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

const NAV = [
  { to: '/',        label: 'Tableau de bord', end: true },
  { to: '/devis',   label: 'Devis' },
  { to: '/media',   label: 'Médiathèque' },
  { to: '/clients', label: 'Clients' },
];

export default function TopNav() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  return (
    <nav className="bg-mh-paper border-b border-mh-line px-9 h-[60px] flex items-center justify-between shrink-0 sticky top-0 z-10">
      {/* Gauche — brand */}
      <div className="flex items-center gap-2.5">
        <BrandLogo size={30} />
        <span className="text-sm font-semibold text-mh-text tracking-[-0.01em]">Matth's Houses</span>
      </div>

      {/* Centre — nav pills */}
      <div className="flex items-center gap-1">
        {NAV.map(({ to, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-lg text-[13px] transition-colors duration-150 ${
                isActive
                  ? 'bg-mh-paper-3 text-mh-text font-medium'
                  : 'text-mh-text-3 hover:text-mh-text hover:bg-mh-paper-3'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Droite — statut + avatar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[12px] text-mh-text-3">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Notion
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-8 h-8 bg-mh-paper-3 border border-mh-line rounded-full flex items-center justify-center
                     text-[13px] font-semibold text-mh-text-2 hover:bg-mh-paper-2 transition-colors"
          title="Déconnexion"
        >
          M
        </button>
      </div>
    </nav>
  );
}
