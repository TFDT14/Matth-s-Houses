import React, { useState } from 'react';
import { Save, RotateCcw, Check, Lock } from 'lucide-react';
import { MODELS, OPTIONS, OPTION_CATS } from '../utils/products';
import { usePrices } from '../contexts/PricesContext';
import Button from '../components/Button';

const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || import.meta.env.VITE_PRO_CODE || 'matths2024';

export default function PriceManager() {
  const { getModelPrice, getModelTransport, getOptionPrice,
          updateModelPrice, updateOptionPrice, resetAll } = usePrices();

  const [unlocked, setUnlocked]   = useState(false);
  const [code, setCode]           = useState('');
  const [codeErr, setCodeErr]     = useState('');
  const [saved, setSaved]         = useState(false);
  const [localVals, setLocalVals] = useState({});

  /* ── Unlock ── */
  const handleUnlock = (e) => {
    e.preventDefault();
    if (code === ADMIN_CODE) { setUnlocked(true); }
    else { setCodeErr('Code incorrect.'); }
  };

  if (!unlocked) {
    return (
      <div className="max-w-sm mx-auto mt-16">
        <div className="card text-center">
          <div className="w-12 h-12 bg-mh-paper-3 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-mh-text-2" />
          </div>
          <h2 className="text-base font-semibold text-mh-text mb-1">Gestion des prix</h2>
          <p className="text-xs text-mh-text-3 mb-5">Entrez le code administrateur pour modifier les prix.</p>
          <form onSubmit={handleUnlock} className="space-y-3">
            <input type="password" value={code} onChange={e => setCode(e.target.value)}
              placeholder="Code administrateur"
              className="input-field text-center" autoFocus />
            {codeErr && <p className="text-xs text-mh-text-2">{codeErr}</p>}
            <Button variant="primary" type="submit" className="w-full justify-center" disabled={!code}>
              Déverrouiller
            </Button>
          </form>
        </div>
      </div>
    );
  }

  /* helpers */
  const getLocal = (key) => localVals[key];
  const setLocal = (key, val) => setLocalVals(prev => ({ ...prev, [key]: val }));

  const saveAll = () => {
    // Models
    MODELS.forEach(m => {
      const pKey = `model_${m.id}_price`;
      const tKey = `model_${m.id}_transport`;
      if (getLocal(pKey) !== undefined) updateModelPrice(m.id, 'price',     getLocal(pKey));
      if (getLocal(tKey) !== undefined) updateModelPrice(m.id, 'transport', getLocal(tKey));
    });
    // Options fixes
    OPTIONS.filter(o => !o.pricesByModel).forEach(o => {
      const key = `opt_${o.id}`;
      if (getLocal(key) !== undefined) updateOptionPrice(o.id, getLocal(key));
    });
    // Panneaux extérieurs (variable par modèle)
    const panneaux = OPTIONS.find(o => o.id === 'panneaux_ext');
    if (panneaux) {
      MODELS.forEach(m => {
        const key = `opt_panneaux_ext_${m.id}`;
        if (getLocal(key) !== undefined) updateOptionPrice('panneaux_ext', getLocal(key), m.id);
      });
    }
    setLocalVals({});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Remettre tous les prix par défaut ?')) { resetAll(); setLocalVals({}); }
  };

  const val = (key, defaultVal) => getLocal(key) !== undefined ? getLocal(key) : defaultVal;

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-mh-text tracking-tight">Gestion des prix</h2>
          <p className="text-sm text-mh-text-3 mt-0.5">Modifications sauvegardées en local sur cet appareil.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleReset}>
            <RotateCcw size={13} /> Défaut
          </Button>
          <Button variant="primary" size="sm" onClick={saveAll}>
            {saved ? <><Check size={13} /> Sauvegardé</> : <><Save size={13} /> Sauvegarder</>}
          </Button>
        </div>
      </div>

      {/* ── MODÈLES ── */}
      <section>
        <h3 className="text-sm font-semibold text-mh-text mb-3">Modèles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODELS.map(m => (
            <div key={m.id} className="card">
              <p className="text-base font-bold text-mh-text mb-3">Maison {m.label}</p>
              <div className="space-y-2.5">
                <PriceField
                  label="Prix de la maison (€ HT)"
                  value={val(`model_${m.id}_price`, getModelPrice(m.id))}
                  onChange={v => setLocal(`model_${m.id}_price`, v)}
                />
                <PriceField
                  label="Transport (€ HT)"
                  value={val(`model_${m.id}_transport`, getModelTransport(m.id))}
                  onChange={v => setLocal(`model_${m.id}_transport`, v)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OPTIONS PAR CATÉGORIE ── */}
      {OPTION_CATS.map(cat => {
        const opts = OPTIONS.filter(o => o.cat === cat.id);
        if (!opts.length) return null;
        return (
          <section key={cat.id}>
            <h3 className="text-sm font-semibold text-mh-text mb-3">{cat.label}</h3>
            <div className="card divide-y divide-mh-line">
              {opts.map(o => (
                <div key={o.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-mh-text mb-2">{o.label}</p>
                  {o.pricesByModel ? (
                    /* Prix par modèle */
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {MODELS.map(m => (
                        <div key={m.id}>
                          <label className="text-[10px] text-mh-text-4 font-mono uppercase tracking-wide block mb-1">{m.label}</label>
                          <PriceField
                            value={val(`opt_${o.id}_${m.id}`, getOptionPrice(o.id, m.id))}
                            onChange={v => setLocal(`opt_${o.id}_${m.id}`, v)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="max-w-[160px]">
                      <PriceField
                        label="Prix unitaire (€ HT)"
                        value={val(`opt_${o.id}`, getOptionPrice(o.id))}
                        onChange={v => setLocal(`opt_${o.id}`, v)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <div className="flex justify-end pt-2">
        <Button variant="primary" onClick={saveAll}>
          {saved ? <><Check size={14} /> Sauvegardé</> : <><Save size={14} /> Sauvegarder tous les prix</>}
        </Button>
      </div>
    </div>
  );
}

function PriceField({ label, value, onChange }) {
  return (
    <div>
      {label && <label className="label text-[11px]">{label}</label>}
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="input-field py-2 text-sm font-mono"
      />
    </div>
  );
}
