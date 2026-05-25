import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Image, Users, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  { to: '/',        label: 'Tableau de bord',    icon: LayoutDashboard, end: true },
  { to: '/devis',   label: 'Générateur devis',   icon: FileText },
  { to: '/media',   label: 'Médiathèque',         icon: Image },
  { to: '/clients', label: 'Suivi clients',       icon: Users },
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-gray-900 text-white z-30 flex flex-col
        transition-transform duration-300 lg:static lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
              MH
            </div>
            <div className="leading-tight">
              <p className="font-black text-sm">MATTH'S HOUSES</p>
              <p className="text-[10px] text-gray-400">SARL • Martinique</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-700/60">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-colors"
          >
            <LogOut size={17} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
