import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Briefcase, Tag } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../contexts/AuthContext';

export default function SpaceSelector() {
  const { loginPro, logout } = useAuth();
  const navigate = useNavigate();

  const [proCode, setProCode]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPro, setShowPro]   = useState(false);

  const handlePro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 350));
    if (loginPro(proCode)) {
      navigate('/');
    } else {
      setError('Code incorrect.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-mh-paper-2 flex flex-col">
      {/* Top bar */}
      <div className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandLogo size={26} />
          <span className="text-sm font-medium text-mh-text">Matth's Houses</span>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }}
          className="text-xs text-mh-text-3 hover:text-mh-text transition-colors">
          Déconnexion
        </button>
      </div>

      {/* Contenu */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mh-text-4 mb-2">Choisir un espace</p>
        <h1 className="text-2xl font-semibold tracking-tight text-mh-text mb-8">Dans quel espace souhaitez-vous accéder ?</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">

          {/* Espace Pro */}
          <div className={`bg-mh-paper border rounded-xl p-6 transition-all cursor-pointer
            ${showPro ? 'border-mh-noir shadow-[0_0_0_2px_rgba(10,10,10,0.08)]' : 'border-mh-line hover:border-mh-line-2 hover:shadow-sm'}`}
            onClick={() => { setShowPro(true); setError(''); }}>
            <div className="w-10 h-10 bg-mh-noir rounded-lg flex items-center justify-center mb-4">
              <Briefcase size={18} className="text-white" />
            </div>
            <h2 className="text-[15px] font-semibold text-mh-text mb-1">Espace Pro</h2>
            <p className="text-[12.5px] text-mh-text-3 leading-relaxed mb-4">
              Générateur de devis, gestion des prix, suivi clients Notion.
            </p>

            {showPro ? (
              <form onSubmit={handlePro} className="space-y-2" onClick={e => e.stopPropagation()}>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mh-text-4" />
                  <input
                    type="password"
                    value={proCode}
                    onChange={e => setProCode(e.target.value)}
                    placeholder="Code Pro"
                    autoFocus
                    className="input-field pl-8 py-2.5 text-sm"
                  />
                </div>
                {error && <p className="text-xs text-mh-text-2">{error}</p>}
                <button type="submit" disabled={!proCode || loading}
                  className="btn-primary w-full justify-center py-2.5 text-sm">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : 'Accéder'}
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-mh-text-4">
                <Lock size={11} /> Accès protégé
              </div>
            )}
          </div>

          {/* Espace Vente */}
          <div className="bg-mh-paper border border-mh-line rounded-xl p-6 hover:border-mh-line-2 hover:shadow-sm
                          transition-all cursor-pointer flex flex-col"
            onClick={() => navigate('/vente')}>
            <div className="w-10 h-10 bg-mh-paper-3 rounded-lg flex items-center justify-center mb-4">
              <Tag size={18} className="text-mh-text-2" />
            </div>
            <h2 className="text-[15px] font-semibold text-mh-text mb-1">Espace Vente</h2>
            <p className="text-[12.5px] text-mh-text-3 leading-relaxed flex-1">
              Catalogue des modèles, présentation commerciale, supports.
            </p>
            <div className="mt-4 text-xs font-medium text-mh-text-2">
              Accès direct →
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 flex justify-between">
        <span className="font-mono text-[10px] tracking-widest text-mh-text-4 uppercase">SARL · Martinique · France</span>
        <span className="font-mono text-[10px] tracking-widest text-mh-text-4 uppercase">© 2026 Matth's Houses</span>
      </div>
    </div>
  );
}
