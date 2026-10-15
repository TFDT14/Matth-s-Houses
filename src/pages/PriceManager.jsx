import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Check, Lock } from 'lucide-react';
import { MODELS, OPTIONS, OPTION_CATS } from '../utils/products';
import { usePrices } from '../contexts/PricesContext';
import Button from '../components/Button';

const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || import.meta.env.VITE_PRO_CODE || 'matths2024';

export default function PriceManager() {
  const { getModelPrice, getModelTransport, getOptionPrice,
          overrides, saveOverrides, refresh, synced } = usePrices();

  const [unlocked, setUnlocked]   = useState(false);
  const [code, setCode]           = useState('');
  const [codeErr, setCodeErr]     = useState('');
  const [saved, setSaved]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveErr, setSaveErr]     = useState('');
  const [localVals, setLocalVals] = useState({});

  useEffect(() => { if (unlocked) refresh(); }, [unlocked, refresh]);

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

  const persist = async (next) => {
    setSaving(true); setSaveErr('');
    try {
      await saveOverrides(next);
      setLocalVals({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveErr("Échec de l'enregistrement — vérifiez la connexion et réessayez.");
    }
    setSaving(false);
  };

  const saveAll = () => {
    const next = {
      models:     structuredClone(overrides.models     || {}),
      options:    { ...(overrides.options || {}) },
      varOptions: structuredClone(overrides.varOptions || {}),
    };
    MODELS.forEach(m => {
      ['price', 'transport'].forEach(field => {
        const v = getLocal(`model_${m.id}_${field}`);
        if (v !== undefined) next.models[m.id] = { ...(next.models[m.id] || {}), [field]: Number(v) };
      });
    });
    OPTIONS.forEach(o => {
      if (o.pricesByModel) {
        MODELS.forEach(m => {
          const v = getLocal(`opt_${o.id}_${m.id}`);
          if (v !== undefined) next.varOptions[o.id] = { ...(next.varOptions[o.id] || {}), [m.id]: Number(v) };
        });
      } else {
        const v = getLocal(`opt_${o.id}`);
        if (v !== undefined) next.options[o.id] = Number(v);
      }
    });
    persist(next);
  };

  const handleReset = () => {
    if (confirm('Remettre tous les prix par défaut sur tous les appareils ?')) persist({});
  };

  const val = (key, defaultVal) => getLocal(key) !== undefined ? getLocal(key) : defaultVal;

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-mh-text tracking-tight">Gestion des prix</h2>
          <p className="text-sm text-mh-text-3 mt-0.5">
            {synced
              ? 'Les prix enregistrés ici s’appliquent sur tous les appareils.'
              : 'Serveur injoignable — prix affichés depuis la dernière copie locale.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleReset} disabled={saving}>
            <RotateCcw size={13} /> Défaut
          </Button>
          <Button variant="primary" size="sm" onClick={saveAll} disabled={saving}>
            {saved ? <><Check size={13} /> Sauvegardé</> : <><Save size={13} /> Sauvegarder</>}
          </Button>
        </div>
      </div>
      {saveErr && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2.5 rounded-mh">{saveErr}</p>
      )}

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
                      {MODELS.filter(m => (!o.proOnly || m.type === 'pro') && (!o.residentialOnly || m.type !== 'pro')).map(m => (
                        <div key={m.id}>
                          <label className="text-[10px] text-mh-text-4 font-mono uppercase tracking-wide block mb-1">{m.label}{m.type === 'pro' && ' pro'}</label>
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
        <Button variant="primary" onClick={saveAll} disabled={saving}>
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
