import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { MODELS, fmt } from '../utils/products';

const MODEL_DESC = {
  '20m2': 'Idéal pour un usage individuel ou studio. Compact et optimisé.',
  '37m2': 'Parfait pour un couple ou bureau professionnel. Confort optimal.',
  '56m2': 'Espace familial avec configuration modulable selon vos besoins.',
  '74m2': 'Notre modèle premium. Grande capacité, finitions haut de gamme.',
};

export default function SalesSpace() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mh-paper-2">
      {/* Nav */}
      <nav className="bg-mh-paper border-b border-mh-line px-8 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={30} />
          <span className="text-sm font-semibold text-mh-text">Matth's Houses</span>
        </div>
        <button onClick={() => navigate('/select')}
          className="flex items-center gap-1.5 text-xs text-mh-text-3 hover:text-mh-text transition-colors">
          <ArrowLeft size={13} /> Changer d'espace
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mh-text-4 mb-3">Martinique · Maisons Container</p>
          <h1 className="text-4xl font-semibold tracking-[-0.02em] text-mh-text mb-3">
            Construisez votre espace de vie.
          </h1>
          <p className="text-[15px] text-mh-text-3 max-w-xl mx-auto leading-relaxed">
            Matth's Houses conçoit et livre des maisons containers de qualité en Martinique.
            Choisissez le modèle qui vous correspond.
          </p>
        </div>

        {/* Modèles */}
        <div>
          <h2 className="text-sm font-semibold text-mh-text mb-4">Nos modèles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {MODELS.map(m => (
              <div key={m.id} className="bg-mh-paper border border-mh-line rounded-xl p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-mh-paper-3 rounded-lg flex items-center justify-center">
                    <Home size={18} className="text-mh-text-2" />
                  </div>
                  <span className="font-mono text-[11px] text-mh-text-4 bg-mh-paper-3 px-2 py-1 rounded">
                    {m.label}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-mh-text mb-1">Maison {m.label}</h3>
                <p className="text-[12.5px] text-mh-text-3 mb-4 leading-relaxed">{MODEL_DESC[m.id]}</p>
                <div className="pt-4 border-t border-mh-line space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-mh-text-3">Maison</span>
                    <span className="font-medium text-mh-text">{fmt(m.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-mh-text-3">Transport</span>
                    <span className="font-medium text-mh-text">{fmt(m.transport)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-mh-line">
                    <span className="font-semibold text-mh-text">Total HT</span>
                    <span className="font-semibold text-mh-text">{fmt(m.price + m.transport)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-mh-noir text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Intéressé par un modèle ?</h2>
          <p className="text-sm text-mh-text-4 mb-6">Contactez-nous pour obtenir un devis personnalisé.</p>
          <a href="mailto:matthshouses@gmail.com"
            className="inline-flex items-center gap-2 bg-white text-mh-noir text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-mh-paper-3 transition-colors">
            matthshouses@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
