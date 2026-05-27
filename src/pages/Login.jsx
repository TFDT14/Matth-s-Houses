import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from '../components/BrandLogo';

export default function Login() {
  const [code, setCode]       = useState('');
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 350));
    if (login(code)) {
      navigate('/select');
    } else {
      setError('Code incorrect. Veuillez réessayer.');
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
        <span className="font-mono text-[10px] tracking-widest text-mh-text-3 uppercase">
          v2 · Atelier interne
        </span>
      </div>

      {/* Card centrale */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] bg-mh-paper border border-mh-line rounded-2xl
                        shadow-[0_1px_2px_rgba(0,0,0,.02),0_12px_40px_-12px_rgba(0,0,0,.08)]
                        px-9 py-10">

          {/* Logo + titre */}
          <div className="flex flex-col items-center mb-8">
            <BrandLogo size={64} />
            <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.01em] text-mh-text">
              Matth's Houses
            </h1>
            <p className="text-[13px] text-mh-text-3 mt-1">Accès à l'espace de gestion</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Code d'accès</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-mh-text-4 pointer-events-none" />
                <input
                  type={show ? 'text' : 'password'}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="input-field pl-10 pr-4"
                />
              </div>
            </div>

            {error && (
              <p className="text-[12.5px] text-mh-text-2 bg-mh-paper-3 border border-mh-line px-3.5 py-2.5 rounded-mh">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!code || loading}
              className="btn-primary w-full justify-center py-3.5 text-sm"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Accéder à l\'application'
              }
            </button>
          </form>

          {/* Footer card */}
          <div className="flex items-center justify-center gap-1.5 mt-6 text-[11px] text-mh-text-4">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Connexion sécurisée · Notion API
          </div>
        </div>
      </div>

      {/* Footer page */}
      <div className="px-8 py-6 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest text-mh-text-3 uppercase">
          SARL · Martinique · France
        </span>
        <span className="font-mono text-[10px] tracking-widest text-mh-text-3 uppercase">
          © 2026 Matth's Houses
        </span>
      </div>
    </div>
  );
}
